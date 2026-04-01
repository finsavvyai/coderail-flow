import { Hono } from 'hono';
import { z } from 'zod';
import { requireAuth } from '../auth';
import {
  encryptCookies,
  decryptCookies,
  validateCookieFormat,
  areCookiesExpired,
  getCookiesExpiry,
  formatCookiesForDisplay,
  type EncryptedData,
} from '../cookie-encryption';
import {
  AuthProfileSchema,
  verifyProjectAccess,
  verifyOrgAccess,
  getProfileWithOrg,
} from './auth-profiles-validation';
import type { Env } from '../env';

export const authProfileRoutes = new Hono<{ Bindings: Env; Variables: { userId: string } }>();
authProfileRoutes.use('*', requireAuth());

// POST /auth-profiles - Create auth profile with encrypted cookies
authProfileRoutes.post('/', async (c) => {
  const userId = c.get('userId');

  try {
    const body = await c.req.json();
    const data = AuthProfileSchema.parse(body);

    if (!(await verifyProjectAccess(c.env.DB, data.project_id, userId))) {
      return c.json({ error: 'forbidden' }, 403);
    }
    if (!validateCookieFormat(data.cookies)) {
      return c.json({ error: 'invalid_cookie_format' }, 400);
    }

    const project = await c.env.DB.prepare('SELECT org_id FROM projects WHERE id = ?')
      .bind(data.project_id)
      .first();
    if (!project) return c.json({ error: 'project_not_found' }, 404);

    const orgId = (project as any).org_id;
    const masterSecret = c.env.COOKIE_ENCRYPTION_KEY || 'default-secret-key';
    const encrypted = await encryptCookies(data.cookies, orgId, masterSecret);

    const result = await c.env.DB.prepare(
      'INSERT INTO auth_profiles (project_id, name, cookies) VALUES (?, ?, ?)'
    )
      .bind(data.project_id, data.name, JSON.stringify(encrypted))
      .run();

    const expiry = getCookiesExpiry(data.cookies);
    return c.json(
      {
        id: result.meta.last_row_id.toString(),
        project_id: data.project_id,
        name: data.name,
        cookies_count: data.cookies.length,
        expires_at: expiry ? expiry.toISOString() : null,
        created_at: new Date().toISOString(),
      },
      201
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'validation_error', details: error.errors }, 400);
    }
    console.error('Error creating auth profile:', error);
    return c.json({ error: 'internal_error' }, 500);
  }
});

// GET /auth-profiles - List auth profiles for a project
authProfileRoutes.get('/', async (c) => {
  const userId = c.get('userId');

  const projectId = c.req.query('projectId');
  if (!projectId) return c.json({ error: 'project_id_required' }, 400);

  try {
    if (!(await verifyProjectAccess(c.env.DB, projectId, userId))) {
      return c.json({ error: 'forbidden' }, 403);
    }

    const profiles = await c.env.DB.prepare(
      'SELECT * FROM auth_profiles WHERE project_id = ? ORDER BY created_at DESC'
    )
      .bind(projectId)
      .all();

    const masterSecret = c.env.COOKIE_ENCRYPTION_KEY || 'default-secret-key';
    const formatted = await Promise.all(
      profiles.results.map(async (profile: any) => {
        const encrypted = JSON.parse(profile.cookies) as EncryptedData;
        const cookies = await decryptCookies(encrypted, profile.project_id, masterSecret);
        return {
          id: profile.id,
          project_id: profile.project_id,
          name: profile.name,
          cookies_count: cookies.length,
          cookies_preview: formatCookiesForDisplay(cookies).slice(0, 5),
          expires_at: getCookiesExpiry(cookies)?.toISOString() || null,
          is_expired: areCookiesExpired(cookies),
          created_at: profile.created_at,
          updated_at: profile.updated_at,
        };
      })
    );

    return c.json({ profiles: formatted });
  } catch (error) {
    console.error('Error listing auth profiles:', error);
    return c.json({ error: 'internal_error' }, 500);
  }
});

// GET /auth-profiles/:id - Get auth profile details
authProfileRoutes.get('/:id', async (c) => {
  const userId = c.get('userId');

  try {
    const profile = await getProfileWithOrg(c.env.DB, c.req.param('id'));
    if (!profile) return c.json({ error: 'auth_profile_not_found' }, 404);
    if (!(await verifyOrgAccess(c.env.DB, profile.org_id, userId))) {
      return c.json({ error: 'forbidden' }, 403);
    }

    const masterSecret = c.env.COOKIE_ENCRYPTION_KEY || 'default-secret-key';
    const cookies = await decryptCookies(
      JSON.parse(profile.cookies) as EncryptedData,
      profile.project_id,
      masterSecret
    );

    return c.json({
      id: profile.id,
      project_id: profile.project_id,
      name: profile.name,
      cookies_count: cookies.length,
      cookies: formatCookiesForDisplay(cookies),
      expires_at: getCookiesExpiry(cookies)?.toISOString() || null,
      is_expired: areCookiesExpired(cookies),
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    });
  } catch (error) {
    console.error('Error getting auth profile:', error);
    return c.json({ error: 'internal_error' }, 500);
  }
});

// PUT /auth-profiles/:id - Update auth profile
authProfileRoutes.put('/:id', async (c) => {
  const userId = c.get('userId');

  try {
    const updates = AuthProfileSchema.partial().parse(await c.req.json());
    const profile = await getProfileWithOrg(c.env.DB, c.req.param('id'));
    if (!profile) return c.json({ error: 'auth_profile_not_found' }, 404);
    if (!(await verifyOrgAccess(c.env.DB, profile.org_id, userId))) {
      return c.json({ error: 'forbidden' }, 403);
    }

    const fields: string[] = [];
    const values: any[] = [];
    if (updates.name) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.cookies) {
      if (!validateCookieFormat(updates.cookies)) {
        return c.json({ error: 'invalid_cookie_format' }, 400);
      }
      const masterSecret = c.env.COOKIE_ENCRYPTION_KEY || 'default-secret-key';
      const encrypted = await encryptCookies(updates.cookies, profile.org_id, masterSecret);
      fields.push('cookies = ?');
      values.push(JSON.stringify(encrypted));
    }
    if (fields.length === 0) return c.json({ error: 'no_updates' }, 400);

    values.push(c.req.param('id'));
    await c.env.DB.prepare(`UPDATE auth_profiles SET ${fields.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run();

    return c.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'validation_error', details: error.errors }, 400);
    }
    console.error('Error updating auth profile:', error);
    return c.json({ error: 'internal_error' }, 500);
  }
});

// DELETE /auth-profiles/:id - Delete auth profile
authProfileRoutes.delete('/:id', async (c) => {
  const userId = c.get('userId');

  try {
    const profile = await getProfileWithOrg(c.env.DB, c.req.param('id'));
    if (!profile) return c.json({ error: 'auth_profile_not_found' }, 404);
    if (!(await verifyOrgAccess(c.env.DB, profile.org_id, userId))) {
      return c.json({ error: 'forbidden' }, 403);
    }

    await c.env.DB.prepare('DELETE FROM auth_profiles WHERE id = ?').bind(c.req.param('id')).run();
    return c.json({ success: true });
  } catch (error) {
    console.error('Error deleting auth profile:', error);
    return c.json({ error: 'internal_error' }, 500);
  }
});
