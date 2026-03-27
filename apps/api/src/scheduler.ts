/**
 * Flow Scheduler - Cron-based scheduled flow execution
 */

import type { Env } from './env';
import { q, q1 } from './db';
import { uuid } from './ids';
import { runFlow } from './runner';

export interface Schedule {
  id: string;
  flow_id: string;
  cron_expression: string;
  enabled: boolean;
  params: string;
  last_run_at: string | null;
  next_run_at: string | null;
  created_at: string;
}

/**
 * Parse cron expression and check if it should run now
 */
export function shouldRunNow(cronExpression: string, lastRunAt: string | null): boolean {
  const now = new Date();
  const parts = cronExpression.split(' ');

  if (parts.length !== 5) return false;

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  const matches = (value: string, current: number, max: number): boolean => {
    if (value === '*') return true;
    if (value.includes('/')) {
      const [, interval] = value.split('/');
      return current % parseInt(interval) === 0;
    }
    if (value.includes(',')) {
      return value.split(',').map(Number).includes(current);
    }
    if (value.includes('-')) {
      const [start, end] = value.split('-').map(Number);
      return current >= start && current <= end;
    }
    return parseInt(value) === current;
  };

  const minuteMatch = matches(minute, now.getMinutes(), 59);
  const hourMatch = matches(hour, now.getHours(), 23);
  const dayMatch = matches(dayOfMonth, now.getDate(), 31);
  const monthMatch = matches(month, now.getMonth() + 1, 12);
  const dowMatch = matches(dayOfWeek, now.getDay(), 6);

  if (!minuteMatch || !hourMatch || !dayMatch || !monthMatch || !dowMatch) {
    return false;
  }

  // Check if we already ran in this minute
  if (lastRunAt) {
    const lastRun = new Date(lastRunAt);
    if (
      lastRun.getFullYear() === now.getFullYear() &&
      lastRun.getMonth() === now.getMonth() &&
      lastRun.getDate() === now.getDate() &&
      lastRun.getHours() === now.getHours() &&
      lastRun.getMinutes() === now.getMinutes()
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Calculate next run time from cron expression
 */
export function getNextRunTime(cronExpression: string): Date {
  const now = new Date();
  const next = new Date(now);
  next.setSeconds(0);
  next.setMilliseconds(0);

  // Simple implementation: add 1 minute and check
  for (let i = 0; i < 60 * 24 * 7; i++) {
    // Max 1 week ahead
    next.setMinutes(next.getMinutes() + 1);
    if (shouldRunNow(cronExpression, null)) {
      return next;
    }
  }

  // Fallback: 1 hour from now
  next.setHours(next.getHours() + 1);
  return next;
}

/**
 * Process all scheduled flows (called by cron trigger)
 */
export async function processScheduledFlows(
  env: Env
): Promise<{ processed: number; errors: string[] }> {
  const errors: string[] = [];
  let processed = 0;

  // Get all enabled schedules
  const schedules = await q(
    env,
    `
    SELECT s.*, f.project_id, p.org_id
    FROM schedule s
    JOIN flow f ON s.flow_id = f.id
    JOIN project p ON f.project_id = p.id
    WHERE s.enabled = 1
  `
  );

  for (const schedule of (schedules.results || []) as any[]) {
    try {
      if (shouldRunNow(schedule.cron_expression, schedule.last_run_at)) {
        // Create a run
        const runId = uuid();
        const params = schedule.params ? JSON.parse(schedule.params) : {};

        await q(
          env,
          `
          INSERT INTO run (id, flow_id, status, params, created_at)
          VALUES (?, ?, 'pending', ?, ?)
        `,
          [runId, schedule.flow_id, JSON.stringify(params), new Date().toISOString()]
        );

        // Execute the flow
        await runFlow(env, runId);

        // Update schedule
        const nextRun = getNextRunTime(schedule.cron_expression);
        await q(
          env,
          `
          UPDATE schedule 
          SET last_run_at = ?, next_run_at = ?
          WHERE id = ?
        `,
          [new Date().toISOString(), nextRun.toISOString(), schedule.id]
        );

        processed++;
      }
    } catch (err: any) {
      errors.push(`Schedule ${schedule.id}: ${err.message}`);
    }
  }

  return { processed, errors };
}

/**
 * Create a new schedule
 */
export async function createSchedule(
  env: Env,
  flowId: string,
  cronExpression: string,
  params: Record<string, any> = {}
): Promise<Schedule> {
  const id = uuid();
  const nextRun = getNextRunTime(cronExpression);

  await q(
    env,
    `
    INSERT INTO schedule (id, flow_id, cron_expression, enabled, params, next_run_at, created_at)
    VALUES (?, ?, ?, 1, ?, ?, ?)
  `,
    [
      id,
      flowId,
      cronExpression,
      JSON.stringify(params),
      nextRun.toISOString(),
      new Date().toISOString(),
    ]
  );

  return {
    id,
    flow_id: flowId,
    cron_expression: cronExpression,
    enabled: true,
    params: JSON.stringify(params),
    last_run_at: null,
    next_run_at: nextRun.toISOString(),
    created_at: new Date().toISOString(),
  };
}
