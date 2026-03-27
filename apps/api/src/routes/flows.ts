/**
 * Flow and template route handlers.
 */

import { Hono } from 'hono';
import type { Env } from '../env';
import { q, q1 } from '../db';
import { uuid } from '../ids';
import { requireAuth } from '../auth';
import { rateLimit } from '../ratelimit';
import { CreateFlowSchema, CreateFlowFromTemplateSchema } from '../schemas';
import { templates, getTemplateById, applyTemplateParams } from '../templates';
import { flowSupportsAuthProfile } from './helpers';
import { validationErrorHandler } from '../middleware/validation';

type Variables = { userId: string; userEmail?: string };
const flows = new Hono<{ Bindings: Env; Variables: Variables }>();
const auth = requireAuth();
const readLimit = rateLimit(120, 60_000);
const writeLimit = rateLimit(30, 60_000);

flows.use('*', validationErrorHandler);

flows.get('/', auth, readLimit, async (c) => {
  const res = await q(
    c.env,
    `
    SELECT f.id, f.project_id, f.name, f.description, f.current_version, fv.definition
    FROM flow f JOIN flow_version fv ON fv.flow_id = f.id AND fv.version = f.current_version
    ORDER BY f.created_at DESC
  `
  );
  return c.json({ flows: res.results ?? [] });
});

flows.get('/templates', auth, readLimit, async (c) => {
  return c.json({
    templates: templates.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      category: t.category,
      tags: t.tags,
      params: t.flow.params,
    })),
  });
});

flows.post('/from-template', auth, writeLimit, async (c) => {
  const env = c.env;
  const body = CreateFlowFromTemplateSchema.parse(await c.req.json());
  const template = getTemplateById(body.templateId);
  if (!template) return c.json({ error: 'template_not_found' }, 404);

  const supportsAuthProfile = await flowSupportsAuthProfile(env);
  const flowId = uuid();
  const versionId = uuid();
  const now = new Date().toISOString();
  const templateDefinition = applyTemplateParams(template, body.params ?? {});

  if (supportsAuthProfile) {
    await q(
      env,
      `INSERT INTO flow (id, project_id, name, description, auth_profile_id, status, current_version, created_at)
                 VALUES (?, ?, ?, ?, ?, 'active', 1, ?)`,
      [
        flowId,
        body.projectId,
        body.name ?? template.name,
        template.description,
        body.authProfileId ?? null,
        now,
      ]
    );
  } else {
    await q(
      env,
      `INSERT INTO flow (id, project_id, name, description, status, current_version, created_at)
                 VALUES (?, ?, ?, ?, 'active', 1, ?)`,
      [flowId, body.projectId, body.name ?? template.name, template.description, now]
    );
  }

  await q(
    env,
    `INSERT INTO flow_version (id, flow_id, version, definition, changelog, created_at)
               VALUES (?, ?, 1, ?, 'Created from template', ?)`,
    [versionId, flowId, JSON.stringify(templateDefinition), now]
  );
  return c.json({ flowId, versionId, templateId: template.id });
});

flows.post('/', auth, writeLimit, async (c) => {
  const env = c.env;
  const body = CreateFlowSchema.parse(await c.req.json());
  const flowId = uuid();
  const versionId = uuid();
  const now = new Date().toISOString();
  const supportsAuthProfile = await flowSupportsAuthProfile(env);

  if (supportsAuthProfile) {
    await q(
      env,
      `INSERT INTO flow (id, project_id, name, description, auth_profile_id, status, current_version, created_at)
                 VALUES (?, ?, ?, ?, ?, 'active', 1, ?)`,
      [flowId, body.projectId, body.name, body.description ?? '', body.authProfileId ?? null, now]
    );
  } else {
    await q(
      env,
      `INSERT INTO flow (id, project_id, name, description, status, current_version, created_at)
                 VALUES (?, ?, ?, ?, 'active', 1, ?)`,
      [flowId, body.projectId, body.name, body.description ?? '', now]
    );
  }

  await q(
    env,
    `INSERT INTO flow_version (id, flow_id, version, definition, changelog, created_at)
               VALUES (?, ?, 1, ?, 'Initial version', ?)`,
    [versionId, flowId, JSON.stringify(body.definition), now]
  );
  return c.json({ flowId, versionId });
});

flows.get('/:id', auth, readLimit, async (c) => {
  const id = c.req.param('id');
  const flow = await q1<any>(
    c.env,
    `
    SELECT f.*, fv.definition FROM flow f
    JOIN flow_version fv ON fv.flow_id = f.id AND fv.version = f.current_version WHERE f.id = ?
  `,
    [id]
  );
  if (!flow) return c.json({ error: 'flow_not_found' }, 404);
  return c.json({ flow });
});

flows.put('/:id', auth, writeLimit, async (c) => {
  const env = c.env;
  const id = c.req.param('id');
  const body = await c.req.json();
  const flow = await q1<any>(env, 'SELECT * FROM flow WHERE id = ?', [id]);
  if (!flow) return c.json({ error: 'flow_not_found' }, 404);

  const newVersion = flow.current_version + 1;
  const versionId = uuid();
  const now = new Date().toISOString();

  await q(
    env,
    `INSERT INTO flow_version (id, flow_id, version, definition, changelog, created_at)
               VALUES (?, ?, ?, ?, ?, ?)`,
    [versionId, id, newVersion, JSON.stringify(body.definition), body.changelog ?? '', now]
  );
  await q(
    env,
    `UPDATE flow SET current_version = ?, name = COALESCE(?, name), description = COALESCE(?, description) WHERE id = ?`,
    [newVersion, body.name, body.description, id]
  );

  if (
    Object.prototype.hasOwnProperty.call(body, 'authProfileId') &&
    (await flowSupportsAuthProfile(env))
  ) {
    await q(env, `UPDATE flow SET auth_profile_id = ? WHERE id = ?`, [
      body.authProfileId ?? null,
      id,
    ]);
  }
  return c.json({ flowId: id, version: newVersion, versionId });
});

flows.delete('/:id', auth, writeLimit, async (c) => {
  const id = c.req.param('id');
  await q(c.env, 'DELETE FROM flow_version WHERE flow_id = ?', [id]);
  await q(c.env, 'DELETE FROM flow WHERE id = ?', [id]);
  return c.json({ ok: true });
});

export { flows };
