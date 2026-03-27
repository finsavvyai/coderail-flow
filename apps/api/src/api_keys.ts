/**
 * API key management routes and authentication middleware.
 */
import { Hono } from 'hono';
import type { Env } from './env';
import { q, q1 } from './db';
import { uuid } from './ids';

function generateRandomKey(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => chars[b % chars.length])
    .join('');
}

async function hashKey(raw: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(raw));
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ── API Key CRUD routes ─────────────────────────────────────
export function apiKeyRoutes() {
  type Variables = { userId: string };
  const router = new Hono<{ Bindings: Env; Variables: Variables }>();

  // List API keys for current user
  router.get('/', async (c) => {
    const userId = c.get('userId');
    const { results } = await q(
      c.env,
      'SELECT id, name, key_prefix, scopes, last_used_at, expires_at, created_at FROM api_key WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return c.json({ keys: results || [] });
  });

  // Create API key
  router.post('/', async (c) => {
    const userId = c.get('userId');
    const body = await c.req.json<{
      name: string;
      scopes?: string[];
      expiresInDays?: number;
    }>();

    if (!body.name) return c.json({ error: 'name required' }, 400);

    const rawKey = `crf_${generateRandomKey(32)}`;
    const keyPrefix = rawKey.slice(0, 12);
    const keyHash = await hashKey(rawKey);

    const id = uuid();
    const now = new Date().toISOString();
    const expiresAt = body.expiresInDays
      ? new Date(Date.now() + body.expiresInDays * 86400000).toISOString()
      : null;

    await q(
      c.env,
      `INSERT INTO api_key (id, user_id, name, key_hash, key_prefix, scopes, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        userId,
        body.name,
        keyHash,
        keyPrefix,
        JSON.stringify(body.scopes || ['runs:write', 'flows:read']),
        expiresAt,
        now,
      ]
    );

    return c.json({
      key: { id, name: body.name, key: rawKey, prefix: keyPrefix, expiresAt, createdAt: now },
    });
  });

  // Delete API key
  router.delete('/:id', async (c) => {
    const userId = c.get('userId');
    const id = c.req.param('id');
    await q(c.env, 'DELETE FROM api_key WHERE id = ? AND user_id = ?', [id, userId]);
    return c.json({ ok: true });
  });

  return router;
}

// ── API key auth middleware ──────────────────────────────────
export function apiKeyAuth() {
  return async (c: any, next: any) => {
    const authHeader = c.req.header('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');

    if (!token.startsWith('crf_')) {
      return next(); // Not an API key, fall through to normal auth
    }

    const keyHash = await hashKey(token);
    const apiKey = await q1<any>(c.env, 'SELECT * FROM api_key WHERE key_hash = ?', [keyHash]);
    if (!apiKey) return c.json({ error: 'invalid_api_key' }, 401);

    if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
      return c.json({ error: 'api_key_expired' }, 401);
    }

    await q(c.env, 'UPDATE api_key SET last_used_at = ? WHERE id = ?', [
      new Date().toISOString(),
      apiKey.id,
    ]);

    c.set('userId', apiKey.user_id);
    await next();
  };
}
