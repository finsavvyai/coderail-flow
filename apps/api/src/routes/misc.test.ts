import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../db.js', () => ({ q: vi.fn() }));
vi.mock('../ids.js', () => ({ uuid: vi.fn().mockReturnValue('artifact-1') }));
vi.mock('../auth.js', () => ({
  requireAuth: () => async (_c: any, next: any) => next(),
}));
vi.mock('../ratelimit.js', () => ({
  rateLimit: () => async (_c: any, next: any) => next(),
}));
vi.mock('../security/audit-log', () => ({
  listAuditLogs: vi.fn().mockResolvedValue([]),
}));
vi.mock('./analytics.js', () => ({
  buildAnalyticsPayload: vi.fn().mockResolvedValue({}),
}));

import { q } from '../db.js';
import { misc } from './misc.js';

const mockQ = vi.mocked(q);

describe('misc internal routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('forbids local artifact uploads in staging', async () => {
    const res = await misc.request(
      '/internal/artifacts',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runId: 'run-1',
          kind: 'report',
          contentType: 'application/json',
          content: '{}',
        }),
      },
      { APP_ENV: 'staging' } as any
    );

    expect(res.status).toBe(403);
    expect(mockQ).not.toHaveBeenCalled();
  });

  it('allows local artifact uploads in development', async () => {
    mockQ.mockResolvedValueOnce({ results: [] } as any);

    const res = await misc.request(
      '/internal/artifacts',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          runId: 'run-1',
          kind: 'report',
          contentType: 'application/json',
          content: '{}',
        }),
      },
      { APP_ENV: 'development' } as any
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ artifactId: 'artifact-1' });
  });

  it('forbids local run completion in staging', async () => {
    const res = await misc.request(
      '/internal/runs/run-1/complete',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'succeeded' }),
      },
      { APP_ENV: 'staging' } as any
    );

    expect(res.status).toBe(403);
    expect(mockQ).not.toHaveBeenCalled();
  });
});
