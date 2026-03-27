import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../db.js', () => ({ q: vi.fn(), q1: vi.fn() }));
vi.mock('../auth.js', () => ({
  requireAuth: () => async (c: any, next: any) => {
    c.set('userId', 'test-user');
    await next();
  },
}));
vi.mock('../ratelimit.js', () => ({
  rateLimit: () => async (_c: any, next: any) => next(),
}));
vi.mock('../security/audit-log.js', () => ({
  listAuditLogs: vi.fn().mockResolvedValue([]),
}));

import { analytics } from './analytics.js';
import { q } from '../db.js';

const mockQ = vi.mocked(q);
const ENV = { DB: {}, APP_ENV: 'test', PUBLIC_BASE_URL: 'http://localhost' };

const emptySummary = [{ total: 0, succeeded: 0, failed: 0, avg_duration: 0 }];
const emptyByDay: any[] = [];
const emptyByFlow: any[] = [];

describe('GET /analytics', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns analytics payload with zero counts when empty', async () => {
    mockQ
      .mockResolvedValueOnce({ results: emptySummary } as any)
      .mockResolvedValueOnce({ results: emptyByDay } as any)
      .mockResolvedValueOnce({ results: emptyByFlow } as any);
    const res = await analytics.request('/', {}, ENV);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.total).toBe(0);
    expect(body.succeeded).toBe(0);
    expect(body.failed).toBe(0);
    expect(body.byDay).toEqual([]);
    expect(body.byFlow).toEqual([]);
  });

  it('returns correct totals from summary row', async () => {
    mockQ
      .mockResolvedValueOnce({
        results: [{ total: 42, succeeded: 35, failed: 7, avg_duration: 5000 }],
      } as any)
      .mockResolvedValueOnce({ results: [] } as any)
      .mockResolvedValueOnce({ results: [] } as any);
    const res = await analytics.request('/', {}, ENV);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.total).toBe(42);
    expect(body.succeeded).toBe(35);
    expect(body.failed).toBe(7);
    expect(body.avgDuration).toBe(5000);
  });

  it('returns byDay time-series data', async () => {
    mockQ
      .mockResolvedValueOnce({
        results: [{ total: 3, succeeded: 2, failed: 1, avg_duration: 0 }],
      } as any)
      .mockResolvedValueOnce({
        results: [
          { date: '2024-01-01', count: 2, succeeded: 1, failed: 1 },
          { date: '2024-01-02', count: 1, succeeded: 1, failed: 0 },
        ],
      } as any)
      .mockResolvedValueOnce({ results: [] } as any);
    const res = await analytics.request('/', {}, ENV);
    const body = (await res.json()) as any;
    expect(body.byDay).toHaveLength(2);
    expect(body.byDay[0].date).toBe('2024-01-01');
    expect(body.byDay[0].count).toBe(2);
  });

  it('accepts timeRange query param', async () => {
    mockQ.mockResolvedValue({ results: [] } as any);
    const res = await analytics.request('/?timeRange=7d', {}, ENV);
    expect(res.status).toBe(200);
  });

  it('accepts projectId query param', async () => {
    mockQ.mockResolvedValue({ results: [] } as any);
    const res = await analytics.request('/?projectId=proj-1', {}, ENV);
    expect(res.status).toBe(200);
    expect(mockQ).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(String),
      expect.arrayContaining(['proj-1'])
    );
  });
});

describe('GET /analytics/steps', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns step analytics payload', async () => {
    mockQ
      .mockResolvedValueOnce({
        results: [{ type: 'click', count: 10, failed: 1, avg_duration: 200 }],
      } as any)
      .mockResolvedValueOnce({
        results: [{ type: 'click', avg_duration: 200, samples: 10 }],
      } as any);
    const res = await analytics.request('/steps', {}, ENV);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.byType).toHaveLength(1);
    expect(body.byType[0].type).toBe('click');
    expect(body.byType[0].count).toBe(10);
    expect(body.byType[0].failed).toBe(1);
    expect(body.slowestTypes).toHaveLength(1);
  });

  it('returns empty step analytics when no data', async () => {
    mockQ.mockResolvedValue({ results: [] } as any);
    const res = await analytics.request('/steps', {}, ENV);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.byType).toHaveLength(0);
    expect(body.slowestTypes).toHaveLength(0);
  });
});

describe('GET /analytics/element-reliability', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns reliability summary', async () => {
    mockQ
      .mockResolvedValueOnce({ results: [{ high: 5, medium: 3, low: 2 }] } as any)
      .mockResolvedValueOnce({ results: [] } as any);
    const res = await analytics.request('/element-reliability', {}, ENV);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.summary.high).toBe(5);
    expect(body.summary.medium).toBe(3);
    expect(body.summary.low).toBe(2);
    expect(body.lowest).toEqual([]);
  });

  it('returns lowest-reliability elements', async () => {
    mockQ
      .mockResolvedValueOnce({ results: [{ high: 0, medium: 0, low: 1 }] } as any)
      .mockResolvedValueOnce({
        results: [
          { elementId: 'e-1', name: 'Fragile Button', reliabilityScore: 0.1, screenId: 's-1' },
        ],
      } as any);
    const res = await analytics.request('/element-reliability', {}, ENV);
    const body = (await res.json()) as any;
    expect(body.lowest).toHaveLength(1);
    expect(body.lowest[0].reliabilityScore).toBe(0.1);
  });

  it('returns zeroed summary when no elements', async () => {
    mockQ.mockResolvedValue({ results: [{}] } as any);
    const res = await analytics.request('/element-reliability', {}, ENV);
    const body = (await res.json()) as any;
    expect(body.summary.high).toBe(0);
    expect(body.summary.medium).toBe(0);
    expect(body.summary.low).toBe(0);
  });
});
