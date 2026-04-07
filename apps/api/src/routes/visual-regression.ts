/**
 * Visual regression API routes.
 *
 * Manages baselines and visual diffs for screenshot comparison.
 */

import { Hono } from 'hono';
import type { Env } from '../env';
import { q, q1 } from '../db';
import { requireAuth } from '../auth';

type Variables = { userId: string; userEmail?: string };
const visualRegression = new Hono<{ Bindings: Env; Variables: Variables }>();
const auth = requireAuth();

// ── Baselines ───────────────────────────────────────────────

visualRegression.get('/baselines', auth, async (c) => {
  const flowId = c.req.query('flowId');
  if (!flowId) {
    return c.json({ error: 'validation_error', message: 'flowId query param required' }, 400);
  }
  const result = await q(
    c.env,
    'SELECT * FROM baseline WHERE flow_id = ? ORDER BY step_index ASC',
    [flowId]
  );
  return c.json({ baselines: result.results || [] });
});

visualRegression.get('/baselines/:id', auth, async (c) => {
  const row = await q1(c.env, 'SELECT * FROM baseline WHERE id = ?', [c.req.param('id')]);
  if (!row) return c.json({ error: 'not_found', message: 'Baseline not found' }, 404);
  return c.json({ baseline: row });
});

visualRegression.post('/baselines', auth, async (c) => {
  const body = await c.req.json<{
    flowId: string;
    stepIndex: number;
    runId: string;
  }>();

  if (!body.flowId || body.stepIndex === undefined || !body.runId) {
    return c.json({ error: 'validation_error', message: 'flowId, stepIndex, runId required' }, 400);
  }

  const artifact = await q1(
    c.env,
    `SELECT * FROM artifact WHERE run_id = ? AND kind = 'screenshot'
     ORDER BY created_at ASC LIMIT 1 OFFSET ?`,
    [body.runId, body.stepIndex]
  );

  if (!artifact) {
    return c.json(
      { error: 'not_found', message: 'Screenshot artifact not found for this step' },
      404
    );
  }

  const row = artifact as Record<string, unknown>;
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await q(
    c.env,
    `INSERT OR REPLACE INTO baseline (id, flow_id, step_index, r2_key, sha256, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, body.flowId, body.stepIndex, row.r2_key, row.sha256, now]
  );

  const baseline = await q1(c.env, 'SELECT * FROM baseline WHERE id = ?', [id]);
  return c.json({ baseline }, 201);
});

visualRegression.delete('/baselines/:id', auth, async (c) => {
  await q(c.env, 'DELETE FROM baseline WHERE id = ?', [c.req.param('id')]);
  return c.json({ ok: true });
});

// ── Diffs ───────────────────────────────────────────────────

visualRegression.get('/diffs', auth, async (c) => {
  const runId = c.req.query('runId');
  if (!runId) {
    return c.json({ error: 'validation_error', message: 'runId query param required' }, 400);
  }
  const result = await q(
    c.env,
    'SELECT * FROM visual_diff WHERE run_id = ? ORDER BY step_index ASC',
    [runId]
  );
  return c.json({ diffs: result.results || [] });
});

visualRegression.post('/diffs/:id/approve', auth, async (c) => {
  const diffId = c.req.param('id');
  const userId = c.get('userId');
  const now = new Date().toISOString();

  const diff = await q1(c.env, 'SELECT * FROM visual_diff WHERE id = ?', [diffId]);
  if (!diff) return c.json({ error: 'not_found', message: 'Diff not found' }, 404);

  const diffRow = diff as Record<string, unknown>;

  // Update diff status
  await q(c.env, "UPDATE visual_diff SET status = 'approved' WHERE id = ?", [diffId]);

  // Update baseline with new screenshot from this run
  const artifact = await q1(
    c.env,
    `SELECT * FROM artifact WHERE run_id = ? AND kind = 'screenshot'
     ORDER BY created_at ASC LIMIT 1 OFFSET ?`,
    [diffRow.run_id, diffRow.step_index]
  );

  if (artifact) {
    const artRow = artifact as Record<string, unknown>;
    await q(
      c.env,
      `UPDATE baseline SET r2_key = ?, sha256 = ?, approved_by = ?, approved_at = ?
       WHERE id = ?`,
      [artRow.r2_key, artRow.sha256, userId, now, diffRow.baseline_id]
    );
  }

  return c.json({ ok: true, status: 'approved' });
});

visualRegression.post('/diffs/:id/reject', auth, async (c) => {
  const diffId = c.req.param('id');
  const diff = await q1(c.env, 'SELECT * FROM visual_diff WHERE id = ?', [diffId]);
  if (!diff) return c.json({ error: 'not_found', message: 'Diff not found' }, 404);

  await q(c.env, "UPDATE visual_diff SET status = 'rejected' WHERE id = ?", [diffId]);
  return c.json({ ok: true, status: 'rejected' });
});

export { visualRegression };
