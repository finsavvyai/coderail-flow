/**
 * Auth profile CRUD route handlers.
 */

import { Hono } from 'hono';
import type { Env } from '../env';
import { q, q1 } from '../db';
import { uuid } from '../ids';
import { requireAuth } from '../auth';
import { readAuthProfilePayloadFromRow, toAuthProfileStorage } from '../auth_profiles';
import { getAuthProfileStorageMode } from './helpers';

type Variables = { userId: string; userEmail?: string };
const authProfiles = new Hono<{ Bindings: Env; Variables: Variables }>();
const auth = requireAuth();

authProfiles.get('/', auth, async (c) => {
  const env = c.env;
  const projectId = c.req.query('projectId');
  if (!projectId) return c.json({ error: 'projectId required' }, 400);

  const storageMode = await getAuthProfileStorageMode(env);
  const { results } = await q(
    env,
    'SELECT * FROM auth_profile WHERE project_id = ? ORDER BY created_at DESC',
    [projectId]
  );
  const profiles = await Promise.all(
    (results || []).map(async (p: any) => {
      const payload = await readAuthProfilePayloadFromRow(p, env);
      return {
        id: p.id,
        projectId: p.project_id,
        name: p.name,
        cookies: payload.cookies,
        localStorage: payload.localStorage,
        sessionStorage: payload.sessionStorage,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        type: p.type ?? 'cookies',
        storageMode,
      };
    })
  );
  return c.json({ profiles });
});

authProfiles.post('/', auth, async (c) => {
  const env = c.env;
  const body = await c.req.json<{
    projectId: string;
    name: string;
    cookies?: any[];
    localStorage?: Record<string, string>;
    sessionStorage?: Record<string, string>;
  }>();

  if (!body.projectId || !body.name) {
    return c.json({ error: 'projectId and name required' }, 400);
  }

  const id = uuid();
  const now = new Date().toISOString();
  const storageMode = await getAuthProfileStorageMode(env);
  const payload = {
    cookies: body.cookies || [],
    localStorage: body.localStorage || {},
    sessionStorage: body.sessionStorage || {},
  };
  const storage = await toAuthProfileStorage(payload, env, storageMode);

  if (storageMode === 'encrypted_payload') {
    await q(
      env,
      `INSERT INTO auth_profile (id, project_id, name, type, encrypted_payload, created_at, updated_at)
       VALUES (?, ?, ?, 'cookies', ?, ?, ?)`,
      [id, body.projectId, body.name, storage.encrypted_payload, now, now]
    );
  } else {
    await q(
      env,
      `INSERT INTO auth_profile (id, project_id, name, cookies, local_storage, session_storage, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        body.projectId,
        body.name,
        storage.cookies,
        storage.local_storage,
        storage.session_storage,
        now,
        now,
      ]
    );
  }

  return c.json({
    profile: {
      id,
      projectId: body.projectId,
      name: body.name,
      cookies: body.cookies || [],
      localStorage: body.localStorage || {},
      sessionStorage: body.sessionStorage || {},
      createdAt: now,
      updatedAt: now,
    },
  });
});

authProfiles.put('/:id', auth, async (c) => {
  const env = c.env;
  const id = c.req.param('id');
  const body = await c.req.json<{
    name?: string;
    cookies?: any[];
    localStorage?: Record<string, string>;
    sessionStorage?: Record<string, string>;
  }>();

  const now = new Date().toISOString();
  const existing = await q1<any>(env, 'SELECT * FROM auth_profile WHERE id = ?', [id]);
  if (!existing) return c.json({ error: 'auth_profile_not_found' }, 404);
  const storageMode = await getAuthProfileStorageMode(env);

  const currentPayload = await readAuthProfilePayloadFromRow(existing, env);
  const mergedPayload = {
    cookies: body.cookies ?? currentPayload.cookies,
    localStorage: body.localStorage ?? currentPayload.localStorage,
    sessionStorage: body.sessionStorage ?? currentPayload.sessionStorage,
  };
  const storage = await toAuthProfileStorage(mergedPayload, env, storageMode);

  const updates: string[] = ['updated_at = ?'];
  const params: any[] = [now];
  if (storageMode === 'encrypted_payload') {
    updates.push('encrypted_payload = ?');
    params.push(storage.encrypted_payload);
  } else {
    updates.push('cookies = ?', 'local_storage = ?', 'session_storage = ?');
    params.push(storage.cookies, storage.local_storage, storage.session_storage);
  }
  if (body.name !== undefined) {
    updates.push('name = ?');
    params.push(body.name);
  }
  params.push(id);
  await q(env, `UPDATE auth_profile SET ${updates.join(', ')} WHERE id = ?`, params);

  const profile = await q1<any>(env, 'SELECT * FROM auth_profile WHERE id = ?', [id]);
  const payloadOut = profile ? await readAuthProfilePayloadFromRow(profile, env) : null;

  return c.json({
    profile: profile
      ? {
          id: profile.id,
          projectId: profile.project_id,
          name: profile.name,
          cookies: payloadOut?.cookies ?? [],
          localStorage: payloadOut?.localStorage ?? {},
          sessionStorage: payloadOut?.sessionStorage ?? {},
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
          type: profile.type ?? 'cookies',
          storageMode,
        }
      : null,
  });
});

authProfiles.delete('/:id', auth, async (c) => {
  await q(c.env, 'DELETE FROM auth_profile WHERE id = ?', [c.req.param('id')]);
  return c.json({ ok: true });
});

export { authProfiles };
