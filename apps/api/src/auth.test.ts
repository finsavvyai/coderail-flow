import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';

// Helpers to generate real RS256 JWTs for testing

async function generateKeyPair(kid = 'test-kid') {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSASSA-PKCS1-v1_5',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true,
    ['sign', 'verify']
  );
  const jwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
  return { privateKey: keyPair.privateKey, jwk: { ...jwk, kid } };
}

function b64url(input: string | Uint8Array): string {
  const str = typeof input === 'string' ? input : String.fromCharCode(...input);
  return btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function mintJWT(privateKey: CryptoKey, payload: Record<string, any>, kid = 'test-kid') {
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid }));
  const body = b64url(JSON.stringify(payload));
  const signingInput = `${header}.${body}`;
  const sig = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(signingInput)
  );
  return `${signingInput}.${b64url(new Uint8Array(sig))}`;
}

function makeApp(env: Record<string, any>) {
  // Dynamic import inside each test to get a fresh module (clean jwksCache)
  return env;
}

const ISSUER = 'https://clerk.test';
const now = () => Math.floor(Date.now() / 1000);

describe('requireAuth middleware', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('bypasses auth when CLERK_ISSUER is not set in development', async () => {
    const { requireAuth } = await import('./auth.js');
    const app = new Hono<{ Bindings: any; Variables: any }>();
    app.use('*', requireAuth());
    app.get('/', (c) => c.json({ userId: c.get('userId') }));

    const res = await app.request('/', {}, { APP_ENV: 'development' });
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.userId).toBe('dev-user');
  });

  it('returns 503 when CLERK_ISSUER is missing in production', async () => {
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

    const res = await app.request('/', {}, { CLERK_ISSUER: ISSUER });
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
      { CLERK_ISSUER: ISSUER }
    );
    expect(res.status).toBe(401);
  });

  it('returns 401 for malformed JWT (wrong number of parts)', async () => {
    const { requireAuth } = await import('./auth.js');
    const app = new Hono<{ Bindings: any; Variables: any }>();
    app.use('*', requireAuth());
    app.get('/', (c) => c.json({ ok: true }));

    const res = await app.request(
      '/',
      { headers: { Authorization: 'Bearer notavalidjwt' } },
      { CLERK_ISSUER: ISSUER }
    );
    expect(res.status).toBe(401);
    const json = (await res.json()) as any;
    expect(json.message).toContain('Invalid JWT format');
  });

  it('returns 401 for expired JWT', async () => {
    const { privateKey, jwk } = await generateKeyPair();
    const expiredToken = await mintJWT(privateKey, {
      sub: 'user-123',
      iss: ISSUER,
      exp: now() - 3600, // expired 1 hour ago
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ keys: [jwk] }), { status: 200 })
    );

    const { requireAuth } = await import('./auth.js');
    const app = new Hono<{ Bindings: any; Variables: any }>();
    app.use('*', requireAuth());
    app.get('/', (c) => c.json({ ok: true }));

    const res = await app.request(
      '/',
      { headers: { Authorization: `Bearer ${expiredToken}` } },
      { CLERK_ISSUER: ISSUER }
    );
    expect(res.status).toBe(401);
    const json = (await res.json()) as any;
    expect(json.message).toContain('expired');
  });

  it('returns 401 when JWT key ID not found in JWKS', async () => {
    const { privateKey } = await generateKeyPair('real-kid');
    const token = await mintJWT(
      privateKey,
      { sub: 'u-1', iss: ISSUER, exp: now() + 3600 },
      'real-kid'
    );

    // Return JWKS with a different kid
    const { jwk: otherJwk } = await generateKeyPair('different-kid');
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ keys: [otherJwk] }), { status: 200 })
    );

    const { requireAuth } = await import('./auth.js');
    const app = new Hono<{ Bindings: any; Variables: any }>();
    app.use('*', requireAuth());
    app.get('/', (c) => c.json({ ok: true }));

    const res = await app.request(
      '/',
      { headers: { Authorization: `Bearer ${token}` } },
      { CLERK_ISSUER: ISSUER }
    );
    expect(res.status).toBe(401);
    const json = (await res.json()) as any;
    expect(json.message).toContain('No matching key');
  });

  it('authenticates valid RS256 JWT and sets userId', async () => {
    const { privateKey, jwk } = await generateKeyPair();
    const token = await mintJWT(privateKey, {
      sub: 'user-abc',
      email: 'test@example.com',
      iss: ISSUER,
      exp: now() + 3600,
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ keys: [jwk] }), { status: 200 })
    );

    const { requireAuth } = await import('./auth.js');
    const app = new Hono<{ Bindings: any; Variables: any }>();
    app.use('*', requireAuth());
    app.get('/', (c) => c.json({ userId: c.get('userId'), email: c.get('userEmail') }));

    const res = await app.request(
      '/',
      { headers: { Authorization: `Bearer ${token}` } },
      { CLERK_ISSUER: ISSUER }
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.userId).toBe('user-abc');
    expect(json.email).toBe('test@example.com');
  });
});
