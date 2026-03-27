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
import { q } from '../db.js';

const mockQ = vi.mocked(q);
const ENV = { DB: {}, APP_ENV: 'test', PUBLIC_BASE_URL: 'http://localhost' };

// ── Elements ──────────────────────────────────────────────

describe('GET /elements', () => {
  beforeEach(() => vi.clearAllMocks());

  it('requires screenId query param', async () => {
    const res = await resources.request('/elements', {}, ENV);
    expect(res.status).toBe(400);
    const body = (await res.json()) as any;
    expect(body.error).toContain('screenId');
  });

  it('returns element list for screen', async () => {
    mockQ.mockResolvedValueOnce({ results: [{ id: 'e-1', name: 'Submit' }] } as any);
    const res = await resources.request('/elements?screenId=s-1', {}, ENV);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.elements).toHaveLength(1);
  });
});

describe('POST /elements', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates element with testid locator and auto-scores 1.0', async () => {
    mockQ.mockResolvedValueOnce({ results: [] } as any);
    const res = await resources.request(
      '/elements',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          screenId: 's-1',
          name: 'Submit Button',
          locatorPrimary: { type: 'testid', value: 'submit-btn' },
        }),
      },
      ENV
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.elementId).toBe('new-resource-id');
    expect(mockQ).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(String),
      expect.arrayContaining([1.0])
    );
  });

  it('creates element with xpath locator and auto-scores 0.2', async () => {
    mockQ.mockResolvedValueOnce({ results: [] } as any);
    const res = await resources.request(
      '/elements',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          screenId: 's-1',
          name: 'Footer Link',
          locatorPrimary: { type: 'xpath', value: '//footer/a[1]' },
        }),
      },
      ENV
    );
    expect(res.status).toBe(200);
    expect(mockQ).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(String),
      expect.arrayContaining([0.2])
    );
  });

  it('rejects invalid locator type', async () => {
    const res = await resources.request(
      '/elements',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          screenId: 's-1',
          name: 'El',
          locatorPrimary: { type: 'invalid', value: 'x' },
        }),
      },
      ENV
    );
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
