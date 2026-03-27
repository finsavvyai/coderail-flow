/**
 * Schedule CRUD and cron trigger route handlers.
 */

import { Hono } from 'hono';
import type { Env } from '../env';
import { q, q1 } from '../db';
import { requireAuth } from '../auth';
import { createSchedule, processScheduledFlows } from '../scheduler';

type Variables = { userId: string; userEmail?: string };
const schedules = new Hono<{ Bindings: Env; Variables: Variables }>();
const auth = requireAuth();

schedules.get('/', auth, async (c) => {
  const flowId = c.req.query('flowId');
  let sql = 'SELECT * FROM schedule';
  const params: any[] = [];
  if (flowId) {
    sql += ' WHERE flow_id = ?';
    params.push(flowId);
  }
  sql += ' ORDER BY created_at DESC';
  const result = await q(c.env, sql, params);
  return c.json({ schedules: result.results || [] });
});

schedules.post('/', auth, async (c) => {
  const body = await c.req.json<{
    flowId: string;
    cronExpression: string;
    params?: Record<string, any>;
  }>();
  if (!body.flowId || !body.cronExpression) {
    return c.json({ error: 'flowId and cronExpression required' }, 400);
  }
  const schedule = await createSchedule(c.env, body.flowId, body.cronExpression, body.params || {});
  return c.json({ schedule });
});

schedules.put('/:id', auth, async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<{
    enabled?: boolean;
    cronExpression?: string;
    params?: Record<string, any>;
  }>();
  const updates: string[] = [];
  const params: any[] = [];

  if (body.enabled !== undefined) {
    updates.push('enabled = ?');
    params.push(body.enabled ? 1 : 0);
  }
  if (body.cronExpression) {
    updates.push('cron_expression = ?');
    params.push(body.cronExpression);
  }
  if (body.params) {
    updates.push('params = ?');
    params.push(JSON.stringify(body.params));
  }

  if (updates.length > 0) {
    updates.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(id);
    await q(c.env, `UPDATE schedule SET ${updates.join(', ')} WHERE id = ?`, params);
  }

  const schedule = await q1(c.env, 'SELECT * FROM schedule WHERE id = ?', [id]);
  return c.json({ schedule });
});

schedules.delete('/:id', auth, async (c) => {
  await q(c.env, 'DELETE FROM schedule WHERE id = ?', [c.req.param('id')]);
  return c.json({ ok: true });
});

export async function scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
  ctx.waitUntil(processScheduledFlows(env));
}

export { schedules };
