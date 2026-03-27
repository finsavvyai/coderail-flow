/**
 * Artifact route handler tests.
 */

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

import { artifacts } from './artifacts.js';
import { q } from '../db.js';

const mockQ = vi.mocked(q);
const ENV = { DB: {}, APP_ENV: 'test', PUBLIC_BASE_URL: 'http://localhost' };

describe('GET /runs/:runId/artifacts', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns all artifacts for a run', async () => {
    mockQ.mockResolvedValueOnce({
      results: [
        { id: 'art-1', kind: 'screenshot', content_type: 'image/png' },
        { id: 'art-2', kind: 'video', content_type: 'video/webm' },
      ],
    } as any);
    const res = await artifacts.request('/run-1', {}, ENV);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.artifacts).toHaveLength(2);
  });

  it('returns empty array when no artifacts exist', async () => {
    mockQ.mockResolvedValueOnce({ results: [] } as any);
    const res = await artifacts.request('/run-1', {}, ENV);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.artifacts).toHaveLength(0);
  });
});
