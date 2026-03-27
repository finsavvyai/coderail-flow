import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../db.js', () => ({ q: vi.fn(), q1: vi.fn() }));
vi.mock('../ids.js', () => ({ uuid: vi.fn().mockReturnValue('new-resource-id') }));
vi.mock('../auth.js', () => ({
  requireAuth: () => async (c: any, next: any) => {
    c.set('userId', 'test-user');
    await next();
  },
}));
vi.mock('../ratelimit.js', () => ({
  rateLimit: () => async (_c: any, next: any) => next(),
}));

import { resources } from './resources.js';
import { q, q1 } from '../db.js';

const mockQ = vi.mocked(q);
const mockQ1 = vi.mocked(q1);
const ENV = { DB: {}, APP_ENV: 'test', PUBLIC_BASE_URL: 'http://localhost' };

// ── Screens ──────────────────────────────────────────────

describe('GET /screens', () => {
  beforeEach(() => vi.clearAllMocks());

  it('requires projectId query param', async () => {
    const res = await resources.request('/screens', {}, ENV);
    expect(res.status).toBe(400);
    const body = (await res.json()) as any;
    expect(body.error).toContain('projectId');
  });

  it('returns screen list for project', async () => {
    mockQ.mockResolvedValueOnce({ results: [{ id: 's-1', name: 'Home' }] } as any);
    const res = await resources.request('/screens?projectId=p-1', {}, ENV);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.screens).toHaveLength(1);
    expect(body.screens[0].name).toBe('Home');
  });
});

describe('GET /screens/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns screen detail', async () => {
    mockQ1.mockResolvedValueOnce({ id: 's-1', name: 'Home', url_path: '/' } as any);
    const res = await resources.request('/screens/s-1', {}, ENV);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.screen.id).toBe('s-1');
  });

  it('returns 404 for unknown screen', async () => {
    mockQ1.mockResolvedValueOnce(null);
    const res = await resources.request('/screens/missing', {}, ENV);
    expect(res.status).toBe(404);
    const body = (await res.json()) as any;
    expect(body.error).toBe('screen_not_found');
  });
});

describe('POST /screens', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates screen and returns ID', async () => {
    mockQ.mockResolvedValueOnce({ results: [] } as any);
    const res = await resources.request(
      '/screens',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: 'p-1', name: 'Login', urlPath: '/login' }),
      },
      ENV
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.screenId).toBe('new-resource-id');
  });

  it('rejects missing projectId', async () => {
    const res = await resources.request(
      '/screens',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Login', urlPath: '/login' }),
      },
      ENV
    );
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
