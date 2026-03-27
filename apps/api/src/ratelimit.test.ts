import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { rateLimit } from './ratelimit.js';

// Use unique paths per test to avoid shared bucket state between tests
let counter = 0;
function uniquePath() {
  return `/test-${counter++}`;
}

function makeApp(max: number, windowMs: number) {
  const path = uniquePath();
  const app = new Hono<{ Bindings: any }>();
  app.use(path, rateLimit(max, windowMs));
  app.get(path, (c) => c.json({ ok: true }));
  return { app, path };
}

async function req(app: Hono<any>, path: string, ip = '1.2.3.4') {
  return app.request(path, { headers: { 'cf-connecting-ip': ip } }, {});
}

describe('rateLimit middleware', () => {
  it('allows requests under the limit', async () => {
    const { app, path } = makeApp(5, 60_000);
    const res = await req(app, path);
    expect(res.status).toBe(200);
  });

  it('sets X-RateLimit-Limit header', async () => {
    const { app, path } = makeApp(10, 60_000);
    const res = await req(app, path);
    expect(res.headers.get('X-RateLimit-Limit')).toBe('10');
  });

  it('sets X-RateLimit-Remaining header and decrements correctly', async () => {
    const { app, path } = makeApp(5, 60_000);
    const r1 = await req(app, path);
    expect(r1.headers.get('X-RateLimit-Remaining')).toBe('4');
    const r2 = await req(app, path);
    expect(r2.headers.get('X-RateLimit-Remaining')).toBe('3');
  });

  it('sets X-RateLimit-Reset header as a future timestamp', async () => {
    const before = Math.ceil(Date.now() / 1000);
    const { app, path } = makeApp(5, 60_000);
    const res = await req(app, path);
    const reset = Number(res.headers.get('X-RateLimit-Reset'));
    expect(reset).toBeGreaterThanOrEqual(before);
    expect(reset).toBeLessThanOrEqual(Math.ceil((Date.now() + 60_000) / 1000) + 1);
  });

  it('returns 429 when limit is exceeded', async () => {
    const { app, path } = makeApp(2, 60_000);
    await req(app, path); // 1
    await req(app, path); // 2
    const res = await req(app, path); // 3 — over limit
    expect(res.status).toBe(429);
    const json = (await res.json()) as any;
    expect(json.error).toBe('rate_limit_exceeded');
    expect(json.message).toContain('Too many requests');
  });

  it('clamps X-RateLimit-Remaining to 0 when exceeded', async () => {
    const { app, path } = makeApp(1, 60_000);
    await req(app, path); // 1 — at limit
    const res = await req(app, path); // 2 — over
    expect(res.status).toBe(429);
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('0');
  });

  it('uses different buckets for different IPs', async () => {
    const { app, path } = makeApp(1, 60_000);
    const r1 = await req(app, path, '10.0.0.1');
    const r2 = await req(app, path, '10.0.0.2');
    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
  });

  it('falls back to x-forwarded-for when cf-connecting-ip absent', async () => {
    const { app, path } = makeApp(1, 60_000);
    const res = await app.request(path, { headers: { 'x-forwarded-for': '5.5.5.5' } }, {});
    expect(res.status).toBe(200);
  });

  it('uses "unknown" key when no IP header present', async () => {
    const { app, path } = makeApp(1, 60_000);
    const r1 = await app.request(path, {}, {});
    const r2 = await app.request(path, {}, {});
    expect(r1.status).toBe(200);
    expect(r2.status).toBe(429); // same "unknown" bucket
  });

  it('allows requests again after window resets', async () => {
    const now = Date.now();
    vi.spyOn(Date, 'now')
      .mockReturnValueOnce(now) // first req: bucket creation
      .mockReturnValueOnce(now) // header timestamp
      .mockReturnValueOnce(now) // second req: bucket check
      .mockReturnValueOnce(now) // header timestamp
      .mockReturnValue(now + 2_000); // third req: window expired (2s > 1s window)

    const { app, path } = makeApp(1, 1_000);
    await req(app, path); // 1 — at limit
    const blocked = await req(app, path); // 2 — blocked
    expect(blocked.status).toBe(429);

    const allowed = await req(app, path); // 3 — window expired, new bucket
    expect(allowed.status).toBe(200);

    vi.restoreAllMocks();
  });
});
