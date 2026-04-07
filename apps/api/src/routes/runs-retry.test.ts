import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../db.js', () => ({ q: vi.fn(), q1: vi.fn() }));
vi.mock('../ids.js', () => ({ uuid: vi.fn().mockReturnValue('run-new-1') }));
vi.mock('../auth.js', () => ({
  requireAuth: () => async (c: any, next: any) => {
    c.set('userId', 'test-user');
    await next();
  },
}));
vi.mock('../ratelimit.js', () => ({
  rateLimit: () => async (_c: any, next: any) => next(),
}));
vi.mock('../runner.js', () => ({
  enqueueRunExecution: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../workflow_client.js', () => ({
  getWorkflowStatus: vi.fn().mockResolvedValue(null),
}));

import { runs } from './runs.js';
import { q, q1 } from '../db.js';
import { enqueueRunExecution } from '../runner.js';

const mockQ = vi.mocked(q);
const mockQ1 = vi.mocked(q1);
const mockEnqueue = vi.mocked(enqueueRunExecution);
const ENV = { DB: {}, APP_ENV: 'test', PUBLIC_BASE_URL: 'http://localhost' };
const EXEC_CTX = { waitUntil: vi.fn(), passThroughOnException: vi.fn(), props: {} } as any;

describe('POST /runs/:id/retry', () => {
  beforeEach(() => vi.clearAllMocks());

  it('retries a failed run', async () => {
    mockQ1.mockResolvedValueOnce({ id: 'r-1', status: 'failed' } as any);
    mockQ.mockResolvedValueOnce({ results: [] } as any);
    const res = await runs.request('/r-1/retry', { method: 'POST' }, ENV, EXEC_CTX);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.success).toBe(true);
    expect(body.runId).toBe('r-1');
    expect(mockEnqueue).toHaveBeenCalled();
  });

  it('returns 400 when trying to retry a succeeded run', async () => {
    mockQ1.mockResolvedValueOnce({ id: 'r-2', status: 'succeeded' } as any);
    const res = await runs.request('/r-2/retry', { method: 'POST' }, ENV);
    expect(res.status).toBe(400);
    const body = (await res.json()) as any;
    expect(body.error).toBe('only_failed_runs_can_be_retried');
  });

  it('returns 404 for unknown run', async () => {
    mockQ1.mockResolvedValueOnce(null);
    const res = await runs.request('/missing/retry', { method: 'POST' }, ENV);
    expect(res.status).toBe(404);
  });
});

describe('GET /runs/:id/workflow-status', () => {
  beforeEach(() => vi.clearAllMocks());

  it('reports workflow not enabled when binding not configured', async () => {
    mockQ1.mockResolvedValueOnce({ id: 'r-1' } as any);
    const res = await runs.request('/r-1/workflow-status', {}, ENV);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.workflowEnabled).toBe(false);
  });

  it('returns 404 for unknown run', async () => {
    mockQ1.mockResolvedValueOnce(null);
    const res = await runs.request('/missing/workflow-status', {}, ENV);
    expect(res.status).toBe(404);
  });
});
