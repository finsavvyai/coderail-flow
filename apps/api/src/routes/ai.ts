/**
 * AI-powered routes backed by the Claw Gateway.
 *
 * Endpoints:
 *   POST /ai/generate-flow   — generate flow steps from natural language
 *   POST /ai/analyze-screenshot — describe what is visible in a screenshot
 *   POST /ai/smart-narration — narrate flow execution results
 */

import { Hono } from 'hono';
import type { Env } from '../env';
import { requireAuth } from '../auth';
import { clawPrompt, isClawConfigured } from '../claw-client';

type Variables = { userId: string; userEmail?: string };
const aiRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();
const auth = requireAuth();

const FLOW_SYSTEM_PROMPT = [
  'You are a browser automation expert.',
  'Given a description, generate a JSON array of flow steps.',
  'Each step has: type (goto/click/fill/caption/screenshot/waitFor/assertText),',
  'and type-specific fields (url, selector, value, text, duration).',
  'Return ONLY the JSON array, no markdown fences.',
].join(' ');

// ── POST /generate-flow ────────────────────────────────────

aiRoutes.post('/generate-flow', auth, async (c) => {
  if (!isClawConfigured(c.env)) {
    return c.json({ error: 'service_unavailable', message: 'AI not configured' }, 503);
  }

  const body = await c.req.json<{ description: string; baseUrl?: string }>();
  if (!body.description) {
    return c.json({ error: 'validation_error', message: 'description is required' }, 400);
  }

  const prompt = body.baseUrl
    ? `Base URL: ${body.baseUrl}\n\nDescription: ${body.description}`
    : body.description;

  const text = await clawPrompt(c.env, prompt, { system: FLOW_SYSTEM_PROMPT });

  try {
    const steps = JSON.parse(text);
    return c.json({ steps });
  } catch {
    return c.json({ steps: [], raw: text });
  }
});

// ── POST /analyze-screenshot ───────────────────────────────

aiRoutes.post('/analyze-screenshot', auth, async (c) => {
  if (!isClawConfigured(c.env)) {
    return c.json({ error: 'service_unavailable', message: 'AI not configured' }, 503);
  }

  const body = await c.req.json<{ screenshotUrl: string; question: string }>();
  if (!body.screenshotUrl || !body.question) {
    return c.json(
      { error: 'validation_error', message: 'screenshotUrl and question required' },
      400
    );
  }

  const prompt = `Screenshot URL: ${body.screenshotUrl}\n\nQuestion: ${body.question}`;
  const system = 'Analyze the screenshot at the given URL and answer the question.';
  const analysis = await clawPrompt(c.env, prompt, { system });
  return c.json({ analysis });
});

// ── POST /smart-narration ──────────────────────────────────

interface StepResult {
  type: string;
  status: string;
  durationMs?: number;
  error?: string;
  [key: string]: unknown;
}

aiRoutes.post('/smart-narration', auth, async (c) => {
  if (!isClawConfigured(c.env)) {
    return c.json({ error: 'service_unavailable', message: 'AI not configured' }, 503);
  }

  const body = await c.req.json<{ steps: StepResult[] }>();
  if (!body.steps?.length) {
    return c.json({ error: 'validation_error', message: 'steps array required' }, 400);
  }

  const prompt = `Flow execution results:\n${JSON.stringify(body.steps, null, 2)}`;
  const system =
    'Generate a concise, human-readable narration of this browser automation flow execution. ' +
    'Mention successes, failures, and timing. Use plain English.';

  const narration = await clawPrompt(c.env, prompt, { system });
  return c.json({ narration });
});

export { aiRoutes };
