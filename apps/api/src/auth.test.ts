import { describe, it, expect, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { encodeApiToken } from './auth-token.js';

const AUTH_SECRET = 'test-auth-secret';
const now = () => Math.floor(Date.now() / 1000);

function base64url(input: string | Uint8Array): string {
  const value = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  let binary = '';
  for (const byte of value) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function mintToken(payload: Record<string, unknown>, secret = AUTH_SECRET) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify(payload));
  const signingInput = `${header}.${body}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signingInput));
  return `${signingInput}.${base64url(new Uint8Array(signature))}`;
}

describe('requireAuth middleware', () => {
  beforeEach(() => {
    // Force a fresh module for each test.
  });

  it('bypasses auth when AUTH_SECRET is not set in development', async () => {
    const { requireAuth } = await import('./auth.js');
    const app = new Hono<{ Bindings: any; Variables: any }>();
    app.use('*', requireAuth());
    app.get('/', (c) => c.json({ userId: c.get('userId') }));

    const res = await app.request('/', {}, { APP_ENV: 'development' });
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.userId).toBe('dev-user');
  });

  it('returns 503 when AUTH_SECRET is missing in production', async () => {
    const { requireAuth } = await import('./auth.js');
    const app = new Hono<{ Bindings: any; Variables: any }>();
    app.use('*', requireAuth());
    app.get('/', (c) => c.json({ ok: true }));

    const res = await app.request('/', {}, { APP_ENV: 'production' });
    expect(res.status).toBe(503);
    const json = (await res.json()) as any;
    expect(json.error).toBe('service_unavailable');
  });

  it('returns 401 when Authorization header is missing', async () => {
    const { requireAuth } = await import('./auth.js');
    const app = new Hono<{ Bindings: any; Variables: any }>();
    app.use('*', requireAuth());
    app.get('/', (c) => c.json({ ok: true }));

    const res = await app.request('/', {}, { AUTH_SECRET });
    expect(res.status).toBe(401);
    const json = (await res.json()) as any;
    expect(json.error).toBe('unauthorized');
  });

  it('returns 401 when Authorization header lacks Bearer prefix', async () => {
    const { requireAuth } = await import('./auth.js');
    const app = new Hono<{ Bindings: any; Variables: any }>();
    app.use('*', requireAuth());
    app.get('/', (c) => c.json({ ok: true }));

    const res = await app.request(
      '/',
      { headers: { Authorization: 'Basic abc123' } },
      { AUTH_SECRET }
    );
    expect(res.status).toBe(401);
  });

  it('returns 401 for malformed JWTs', async () => {
    const { requireAuth } = await import('./auth.js');
    const app = new Hono<{ Bindings: any; Variables: any }>();
    app.use('*', requireAuth());
    app.get('/', (c) => c.json({ ok: true }));

    const res = await app.request(
      '/',
      { headers: { Authorization: 'Bearer notavalidjwt' } },
      { AUTH_SECRET }
    );
    expect(res.status).toBe(401);
    const json = (await res.json()) as any;
    expect(json.message).toContain('Invalid JWT format');
  });

  it('returns 401 for expired JWTs', async () => {
    const expiredToken = await mintToken({
      sub: 'user-123',
      exp: now() - 3600,
    });

    const { requireAuth } = await import('./auth.js');
    const app = new Hono<{ Bindings: any; Variables: any }>();
    app.use('*', requireAuth());
    app.get('/', (c) => c.json({ ok: true }));

    const res = await app.request(
      '/',
      { headers: { Authorization: `Bearer ${expiredToken}` } },
      { AUTH_SECRET }
    );
    expect(res.status).toBe(401);
    const json = (await res.json()) as any;
    expect(json.message).toContain('expired');
  });

  it('returns 401 for tokens signed with a different secret', async () => {
    const token = await mintToken(
      { sub: 'u-1', email: 'test@example.com', exp: now() + 3600 },
      'different-secret'
    );

    const { requireAuth } = await import('./auth.js');
    const app = new Hono<{ Bindings: any; Variables: any }>();
    app.use('*', requireAuth());
    app.get('/', (c) => c.json({ ok: true }));

    const res = await app.request(
      '/',
      { headers: { Authorization: `Bearer ${token}` } },
      { AUTH_SECRET }
    );
    expect(res.status).toBe(401);
    const json = (await res.json()) as any;
    expect(json.message).toContain('signature');
  });

  it('authenticates valid signed tokens and sets the user context', async () => {
    const token = await encodeApiToken('user-abc', 'test@example.com', AUTH_SECRET);

    const { requireAuth } = await import('./auth.js');
    const app = new Hono<{ Bindings: any; Variables: any }>();
    app.use('*', requireAuth());
    app.get('/', (c) => c.json({ userId: c.get('userId'), email: c.get('userEmail') }));

    const res = await app.request(
      '/',
      { headers: { Authorization: `Bearer ${token}` } },
      { AUTH_SECRET }
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.userId).toBe('user-abc');
    expect(json.email).toBe('test@example.com');
  });
});
