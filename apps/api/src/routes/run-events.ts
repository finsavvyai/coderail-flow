/**
 * SSE streaming endpoint for real-time run execution updates.
 *
 * Adapted from Claw-Code's server SSE broadcast pattern.
 * Clients connect via EventSource to receive step-by-step progress.
 *
 * Usage: GET /runs/:id/events → text/event-stream
 */

import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import type { Env } from '../env';
import { q1 } from '../db';
import { requireAuth } from '../auth';

type Variables = { userId: string; userEmail?: string };
const runEvents = new Hono<{ Bindings: Env; Variables: Variables }>();
const auth = requireAuth();

/** In-memory broadcast channels keyed by runId. */
const channels = new Map<string, Set<(event: RunEvent) => void>>();

export interface RunEvent {
  type: 'step_started' | 'step_completed' | 'step_failed' | 'run_completed' | 'run_failed';
  runId: string;
  stepIndex?: number;
  stepType?: string;
  description?: string;
  durationMs?: number;
  status?: string;
  error?: string;
  timestamp: number;
}

/** Publish an event to all subscribers of a run. */
export function publishRunEvent(runId: string, event: RunEvent): void {
  const listeners = channels.get(runId);
  if (!listeners) return;
  for (const listener of listeners) {
    try {
      listener(event);
    } catch {
      /* ignore dead listeners */
    }
  }
}

/** Clean up channel when run completes. */
export function closeRunChannel(runId: string): void {
  channels.delete(runId);
}

function subscribe(runId: string): {
  listener: (event: RunEvent) => void;
  queue: RunEvent[];
  unsubscribe: () => void;
} {
  if (!channels.has(runId)) {
    channels.set(runId, new Set());
  }
  const queue: RunEvent[] = [];
  const listener = (event: RunEvent) => queue.push(event);
  channels.get(runId)!.add(listener);

  return {
    listener,
    queue,
    unsubscribe: () => {
      const set = channels.get(runId);
      if (set) {
        set.delete(listener);
        if (set.size === 0) channels.delete(runId);
      }
    },
  };
}

/**
 * SSE endpoint: streams run execution events in real-time.
 *
 * Events:
 *   step_started   { stepIndex, stepType, description }
 *   step_completed { stepIndex, stepType, durationMs }
 *   step_failed    { stepIndex, stepType, error }
 *   run_completed  { status, durationMs }
 *   run_failed     { error }
 */
runEvents.get('/:id/events', auth, async (c) => {
  const runId = c.req.param('id');
  const run = await q1<any>(c.env, 'SELECT id, status FROM run WHERE id = ?', [runId]);
  if (!run) return c.json({ error: 'run_not_found' }, 404);

  // If already finished, return final status as single event
  if (run.status === 'succeeded' || run.status === 'failed') {
    return streamSSE(c, async (stream) => {
      await stream.writeSSE({
        event: run.status === 'succeeded' ? 'run_completed' : 'run_failed',
        data: JSON.stringify({ runId, status: run.status, timestamp: Date.now() }),
      });
    });
  }

  return streamSSE(c, async (stream) => {
    const sub = subscribe(runId);
    let closed = false;

    // Send snapshot
    await stream.writeSSE({
      event: 'snapshot',
      data: JSON.stringify({ runId, status: run.status, timestamp: Date.now() }),
    });

    // Poll queue for events (Workers don't support true push)
    const interval = setInterval(() => {
      void (async () => {
        while (sub.queue.length > 0) {
          const event = sub.queue.shift()!;
          try {
            await stream.writeSSE({ event: event.type, data: JSON.stringify(event) });
          } catch {
            closed = true;
          }
          // Close after terminal events
          if (event.type === 'run_completed' || event.type === 'run_failed') {
            closed = true;
          }
        }
        if (closed) {
          clearInterval(interval);
          sub.unsubscribe();
        }
      })();
    }, 200);

    // Keep alive — send comment every 15s
    const keepAlive = setInterval(() => {
      void (async () => {
        if (closed) {
          clearInterval(keepAlive);
          return;
        }
        try {
          await stream.writeSSE({ event: 'ping', data: '' });
        } catch {
          closed = true;
          clearInterval(keepAlive);
          sub.unsubscribe();
        }
      })();
    }, 15_000);

    // Wait until closed
    await new Promise<void>((resolve) => {
      const check = setInterval(() => {
        if (closed) {
          clearInterval(check);
          clearInterval(interval);
          clearInterval(keepAlive);
          sub.unsubscribe();
          resolve();
        }
      }, 500);
    });
  });
});

export { runEvents };
