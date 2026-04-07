/**
 * Schedule route handler tests.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../db.js', () => ({ q: vi.fn(), q1: vi.fn() }));
vi.mock('../ids.js', () => ({ uuid: vi.fn().mockReturnValue('schedule-1') }));
vi.mock('../auth.js', () => ({
  requireAuth: () => async (c: any, next: any) => {
    c.set('userId', 'test-user');
    await next();
  },
}));
vi.mock('../ratelimit.js', () => ({
  rateLimit: () => async (_c: any, next: any) => next(),
}));
vi.mock('../scheduler.js', () => ({
  createSchedule: vi.fn().mockResolvedValue({ id: 'schedule-1' }),
}));

import { schedules } from './schedules.js';
import { q, q1 } from '../db.js';

const mockQ = vi.mocked(q);
const mockQ1 = vi.mocked(q1);
const ENV = { DB: {}, APP_ENV: 'test', PUBLIC_BASE_URL: 'http://localhost' };

describe('GET /schedules', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns schedule list', async () => {
    mockQ.mockResolvedValueOnce({
      results: [
        {
          id: 'sched-1',
          flow_id: 'flow-1',
          cron: '0 * * * *',
          enabled: true,
          created_at: '2024-01-01',
        },
      ],
    } as any);
    const res = await schedules.request('/', {}, ENV);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.schedules).toHaveLength(1);
  });

  it('returns empty array when no schedules exist', async () => {
    mockQ.mockResolvedValueOnce({ results: [] } as any);
    const res = await schedules.request('/', {}, ENV);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.schedules).toHaveLength(0);
  });
});

describe('POST /schedules', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates a schedule', async () => {
    mockQ1.mockResolvedValueOnce({ id: 'flow-1' } as any);
    mockQ.mockResolvedValueOnce({ results: [] } as any);
    const res = await schedules.request(
      '/',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flowId: 'flow-1',
          cronExpression: '0 * * * *',
        }),
      },
      ENV
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.schedule).toBeTruthy();
  });

  it('validates required fields', async () => {
    const res = await schedules.request(
      '/',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cronExpression: '0 * * * *' }),
      },
      ENV
    );
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
