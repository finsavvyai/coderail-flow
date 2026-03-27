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

// ── Projects ──────────────────────────────────────────────

describe('GET /projects', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns project list', async () => {
    mockQ.mockResolvedValueOnce({ results: [{ id: 'p-1', name: 'My App' }] } as any);
    const res = await resources.request('/projects', {}, ENV);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.projects).toHaveLength(1);
    expect(body.projects[0].id).toBe('p-1');
  });

  it('returns empty list', async () => {
    mockQ.mockResolvedValueOnce({ results: [] } as any);
    const res = await resources.request('/projects', {}, ENV);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.projects).toHaveLength(0);
  });

  it('filters by orgId when provided', async () => {
    mockQ.mockResolvedValueOnce({ results: [] } as any);
    const res = await resources.request('/projects?orgId=org-1', {}, ENV);
    expect(res.status).toBe(200);
    expect(mockQ).toHaveBeenCalledWith(
      expect.anything(),
      expect.stringContaining('org_id'),
      expect.arrayContaining(['org-1'])
    );
  });
});

describe('GET /projects/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns project detail', async () => {
    mockQ1.mockResolvedValueOnce({ id: 'p-1', name: 'App', base_url: 'https://app.com' } as any);
    const res = await resources.request('/projects/p-1', {}, ENV);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.project.id).toBe('p-1');
  });

  it('returns 404 for unknown project', async () => {
    mockQ1.mockResolvedValueOnce(null);
    const res = await resources.request('/projects/missing', {}, ENV);
    expect(res.status).toBe(404);
    const body = (await res.json()) as any;
    expect(body.error).toBe('project_not_found');
  });
});

describe('POST /projects', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates project and returns ID', async () => {
    mockQ.mockResolvedValueOnce({ results: [] } as any);
    const res = await resources.request(
      '/projects',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'My App', baseUrl: 'https://myapp.com' }),
      },
      ENV
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.projectId).toBe('new-resource-id');
  });

  it('rejects invalid URL in baseUrl', async () => {
    const res = await resources.request(
      '/projects',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'App', baseUrl: 'not-a-url' }),
      },
      ENV
    );
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it('rejects empty name', async () => {
    const res = await resources.request(
      '/projects',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '', baseUrl: 'https://x.com' }),
      },
      ENV
    );
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

describe('DELETE /projects/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deletes project and related data', async () => {
    mockQ.mockResolvedValue({ results: [] } as any);
    const res = await resources.request('/projects/p-1', { method: 'DELETE' }, ENV);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.ok).toBe(true);
  });
});
