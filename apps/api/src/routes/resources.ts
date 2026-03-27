/**
 * Project, Screen, and Element CRUD route handlers.
 */

import { Hono } from 'hono';
import type { Env } from '../env';
import { q, q1 } from '../db';
import { uuid } from '../ids';
import { requireAuth } from '../auth';
import { rateLimit } from '../ratelimit';
import { CreateProjectSchema, CreateScreenSchema, CreateElementSchema } from '../schemas';

type Variables = { userId: string; userEmail?: string };
const resources = new Hono<{ Bindings: Env; Variables: Variables }>();
const auth = requireAuth();
const readLimit = rateLimit(120, 60_000);
const writeLimit = rateLimit(30, 60_000);

// ---- Projects ----
resources.get('/projects', auth, readLimit, async (c) => {
  const orgId = c.req.query('orgId');
  const query = orgId
    ? 'SELECT * FROM project WHERE org_id = ? ORDER BY created_at DESC'
    : 'SELECT * FROM project ORDER BY created_at DESC';
  const res = await q(c.env, query, orgId ? [orgId] : []);
  return c.json({ projects: res.results ?? [] });
});

resources.get('/projects/:id', auth, readLimit, async (c) => {
  const project = await q1<any>(c.env, 'SELECT * FROM project WHERE id = ?', [c.req.param('id')]);
  if (!project) return c.json({ error: 'project_not_found' }, 404);
  return c.json({ project });
});

resources.post('/projects', auth, writeLimit, async (c) => {
  let body;
  try {
    body = CreateProjectSchema.parse(await c.req.json());
  } catch (err: any) {
    return c.json(
      { error: 'validation_error', message: err.errors?.[0]?.message || 'Invalid input' },
      400
    );
  }
  const id = uuid();
  const now = new Date().toISOString();
  try {
    await q(
      c.env,
      `INSERT INTO project (id, org_id, name, base_url, env, created_at)
                 VALUES (?, ?, ?, ?, ?, ?)`,
      [id, body.orgId, body.name, body.baseUrl, body.env, now]
    );
  } catch (err: any) {
    return c.json({ error: 'db_error', message: err.message || 'Failed to create project' }, 500);
  }
  return c.json({
    project: {
      id,
      org_id: body.orgId,
      name: body.name,
      base_url: body.baseUrl,
      env: body.env,
      created_at: now,
    },
    projectId: id,
  });
});

resources.put('/projects/:id', auth, writeLimit, async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<{ name?: string; base_url?: string }>();
  const updates: string[] = [];
  const params: any[] = [];
  if (body.name) {
    updates.push('name = ?');
    params.push(body.name);
  }
  if (body.base_url) {
    updates.push('base_url = ?');
    params.push(body.base_url);
  }
  if (updates.length > 0) {
    params.push(id);
    await q(c.env, `UPDATE project SET ${updates.join(', ')} WHERE id = ?`, params);
  }
  const project = await q1(c.env, 'SELECT * FROM project WHERE id = ?', [id]);
  return c.json({ project });
});

resources.delete('/projects/:id', auth, writeLimit, async (c) => {
  const env = c.env;
  const id = c.req.param('id');
  const flowsRes = await q(env, 'SELECT id FROM flow WHERE project_id = ?', [id]);
  for (const f of (flowsRes.results || []) as any[]) {
    await q(env, 'DELETE FROM flow_version WHERE flow_id = ?', [f.id]);
  }
  await q(env, 'DELETE FROM flow WHERE project_id = ?', [id]);
  await q(env, 'DELETE FROM integration WHERE project_id = ?', [id]);
  await q(env, 'DELETE FROM screen WHERE project_id = ?', [id]);
  await q(env, 'DELETE FROM project WHERE id = ?', [id]);
  return c.json({ ok: true });
});

// ---- Screens ----
resources.get('/screens', auth, readLimit, async (c) => {
  const projectId = c.req.query('projectId');
  if (!projectId) return c.json({ error: 'projectId required' }, 400);
  const res = await q(c.env, 'SELECT * FROM screen WHERE project_id = ? ORDER BY name ASC', [
    projectId,
  ]);
  return c.json({ screens: res.results ?? [] });
});

resources.get('/screens/:id', auth, readLimit, async (c) => {
  const screen = await q1<any>(c.env, 'SELECT * FROM screen WHERE id = ?', [c.req.param('id')]);
  if (!screen) return c.json({ error: 'screen_not_found' }, 404);
  return c.json({ screen });
});

resources.post('/screens', auth, writeLimit, async (c) => {
  const body = CreateScreenSchema.parse(await c.req.json());
  const id = uuid();
  const now = new Date().toISOString();
  await q(
    c.env,
    `INSERT INTO screen (id, project_id, name, url_path, created_at)
               VALUES (?, ?, ?, ?, ?)`,
    [id, body.projectId, body.name, body.urlPath, now]
  );
  return c.json({ screenId: id });
});

// ---- Elements ----
resources.get('/elements', auth, readLimit, async (c) => {
  const screenId = c.req.query('screenId');
  if (!screenId) return c.json({ error: 'screenId required' }, 400);
  const res = await q(c.env, 'SELECT * FROM element WHERE screen_id = ? ORDER BY name ASC', [
    screenId,
  ]);
  return c.json({ elements: res.results ?? [] });
});

resources.get('/elements/:id', auth, readLimit, async (c) => {
  const element = await q1<any>(c.env, 'SELECT * FROM element WHERE id = ?', [c.req.param('id')]);
  if (!element) return c.json({ error: 'element_not_found' }, 404);
  return c.json({ element });
});

resources.post('/elements', auth, writeLimit, async (c) => {
  const body = CreateElementSchema.parse(await c.req.json());
  const id = uuid();
  const now = new Date().toISOString();
  const reliabilityScores: Record<string, number> = {
    testid: 1.0,
    role: 0.8,
    label: 0.7,
    css: 0.4,
    xpath: 0.2,
  };
  const score = body.reliabilityScore ?? reliabilityScores[body.locatorPrimary.type] ?? 0.5;
  await q(
    c.env,
    `INSERT INTO element (id, screen_id, name, locator_primary, locator_fallbacks, reliability_score, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      body.screenId,
      body.name,
      JSON.stringify(body.locatorPrimary),
      JSON.stringify(body.locatorFallbacks ?? []),
      score,
      now,
      now,
    ]
  );
  return c.json({ elementId: id });
});

export { resources };
