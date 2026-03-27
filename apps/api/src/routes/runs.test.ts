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
const EXEC_CTX = { waitUntil: vi.fn(), passThroughOnException: vi.fn() };

describe('POST /runs', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates a run for existing flow', async () => {
    mockQ1.mockResolvedValueOnce({ id: 'flow-1', current_version: 2 } as any);
    mockQ.mockResolvedValueOnce({ results: [] } as any);
    const res = await runs.request(
      '/',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flowId: 'flow-1' }),
      },
      ENV,
      EXEC_CTX
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.runId).toBe('run-new-1');
    expect(mockEnqueue).toHaveBeenCalledWith(expect.anything(), EXEC_CTX, 'run-new-1');
  });

  it('returns 404 when flow not found', async () => {
    mockQ1.mockResolvedValueOnce(null);
    const res = await runs.request(
      '/',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flowId: 'missing-flow' }),
      },
      ENV
    );
    expect(res.status).toBe(404);
    const body = (await res.json()) as any;
    expect(body.error).toBe('flow_not_found');
  });

  it('returns error for missing flowId', async () => {
    const res = await runs.request(
      '/',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ params: {} }),
      },
      ENV,
      EXEC_CTX
    );
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('skips enqueue when ?external=true', async () => {
    mockQ1.mockResolvedValueOnce({ id: 'flow-1', current_version: 1 } as any);
    mockQ.mockResolvedValueOnce({ results: [] } as any);
    const res = await runs.request(
      '/?external=true',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flowId: 'flow-1' }),
      },
      ENV,
      EXEC_CTX
    );
    expect(res.status).toBe(200);
    expect(mockEnqueue).not.toHaveBeenCalled();
  });
});

describe('GET /runs', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns run list', async () => {
    mockQ.mockResolvedValueOnce({
      results: [{ id: 'r-1', flow_name: 'My Flow', status: 'succeeded', created_at: '2024-01-01' }],
    } as any);
    const res = await runs.request('/', {}, ENV);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.runs).toHaveLength(1);
    expect(body.runs[0].id).toBe('r-1');
  });

  it('returns empty list', async () => {
    mockQ.mockResolvedValueOnce({ results: [] } as any);
    const res = await runs.request('/', {}, ENV);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.runs).toHaveLength(0);
  });
});

describe('GET /runs/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns run detail with artifacts', async () => {
    mockQ1.mockResolvedValueOnce({ id: 'r-1', status: 'succeeded', flow_name: 'F' } as any);
    mockQ.mockResolvedValueOnce({ results: [{ id: 'a-1', kind: 'screenshot' }] } as any);
    const res = await runs.request('/r-1', {}, ENV);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.run.id).toBe('r-1');
    expect(body.artifacts).toHaveLength(1);
  });

  it('returns 404 when run not found', async () => {
    mockQ1.mockResolvedValueOnce(null);
    const res = await runs.request('/missing', {}, ENV);
    expect(res.status).toBe(404);
    const body = (await res.json()) as any;
    expect(body.error).toBe('run_not_found');
  });
});

describe('GET /runs/:id/progress', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns complete:true for succeeded run', async () => {
    mockQ1.mockResolvedValueOnce({ id: 'r-1', status: 'succeeded' } as any);
    const res = await runs.request('/r-1/progress', {}, ENV);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.complete).toBe(true);
    expect(body.status).toBe('succeeded');
  });

  it('returns complete:true for failed run', async () => {
    mockQ1.mockResolvedValueOnce({ id: 'r-2', status: 'failed' } as any);
    const res = await runs.request('/r-2/progress', {}, ENV);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.complete).toBe(true);
    expect(body.status).toBe('failed');
  });

  it('returns complete:false for running run', async () => {
    mockQ1.mockResolvedValueOnce({ id: 'r-3', status: 'running' } as any);
    const res = await runs.request('/r-3/progress', {}, ENV);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.complete).toBe(false);
  });

  it('returns 404 for unknown run', async () => {
    mockQ1.mockResolvedValueOnce(null);
    const res = await runs.request('/nope/progress', {}, ENV);
    expect(res.status).toBe(404);
  });
});
