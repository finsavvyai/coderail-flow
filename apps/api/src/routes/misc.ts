/**
 * Miscellaneous route handlers: waitlist, internal dev endpoints.
 */

import { Hono } from 'hono';
import type { Env } from '../env';
import { q } from '../db';
import { uuid } from '../ids';
import { requireAuth } from '../auth';
import { rateLimit } from '../ratelimit';
import { listAuditLogs } from '../security/audit-log';
import { isProductionLikeEnv } from '../runtime-config';
import { buildAnalyticsPayload } from './analytics';

type Variables = { userId: string; userEmail?: string };
const misc = new Hono<{ Bindings: Env; Variables: Variables }>();
const auth = requireAuth();
const readLimit = rateLimit(120, 60_000);

// ---- Waitlist ----
misc.post('/waitlist', async (c) => {
  const body = await c.req.json<{ email: string; source?: string }>();
  if (!body.email || !body.email.includes('@')) {
    return c.json({ error: 'invalid_email' }, 400);
  }

  const id = uuid();
  const now = new Date().toISOString();
  try {
    await q(c.env, `INSERT INTO waitlist (id, email, source, created_at) VALUES (?, ?, ?, ?)`, [
      id,
      body.email.toLowerCase().trim(),
      body.source ?? 'website',
      now,
    ]);
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('UNIQUE')) {
      return c.json({ ok: true, message: 'already_subscribed' });
    }
    throw e;
  }
  return c.json({ ok: true, id });
});

// ---- Internal: artifact upload from local runner (dev only) ----
misc.post('/internal/artifacts', async (c) => {
  if (isProductionLikeEnv(c.env.APP_ENV)) return c.json({ error: 'forbidden' }, 403);
  const body = await c.req.json<{
    runId: string;
    kind: string;
    contentType: string;
    content: string;
  }>();
  const artifactId = uuid();
  await q(
    c.env,
    `INSERT INTO artifact (id, run_id, kind, content_type, bytes, inline_content, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      artifactId,
      body.runId,
      body.kind,
      body.contentType,
      body.content.length,
      body.content,
      new Date().toISOString(),
    ]
  );
  return c.json({ artifactId });
});

// ---- Internal: mark run complete from local runner (dev only) ----
misc.post('/internal/runs/:id/complete', async (c) => {
  if (isProductionLikeEnv(c.env.APP_ENV)) return c.json({ error: 'forbidden' }, 403);
  const runId = c.req.param('id');
  const body = await c.req.json<{ status: 'succeeded' | 'failed'; errorMessage?: string }>();

  if (body.status === 'failed') {
    await q(
      c.env,
      "UPDATE run SET status='failed', finished_at=?, error_code='EXECUTION_ERROR', error_message=? WHERE id=?",
      [new Date().toISOString(), body.errorMessage ?? 'Unknown', runId]
    );
  } else {
    await q(c.env, "UPDATE run SET status='succeeded', finished_at=? WHERE id=?", [
      new Date().toISOString(),
      runId,
    ]);
  }
  return c.json({ ok: true });
});

// ---- Audit log viewer ----
misc.get('/audit-logs', auth, readLimit, async (c) => {
  const orgId = c.req.query('orgId');
  if (!orgId) return c.json({ error: 'orgId_required' }, 400);
  const limit = Number(c.req.query('limit') || '100');
  const offset = Number(c.req.query('offset') || '0');
  const logs = await listAuditLogs(c.env, orgId, limit, offset);
  return c.json({
    logs,
    limit: Math.min(200, Math.max(1, limit)),
    offset: Math.max(0, offset),
  });
});

// ---- Stats (alias for analytics) ----
misc.get('/stats', auth, readLimit, async (c) => {
  const payload = await buildAnalyticsPayload(
    c.env,
    c.req.query('timeRange'),
    c.req.query('projectId')
  );
  return c.json(payload);
});

export { misc };
