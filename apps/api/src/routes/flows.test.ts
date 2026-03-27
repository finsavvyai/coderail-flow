import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../db.js', () => ({ q: vi.fn(), q1: vi.fn() }));
vi.mock('../ids.js', () => ({ uuid: vi.fn().mockReturnValue('new-id-1') }));
vi.mock('../auth.js', () => ({
  requireAuth: () => async (c: any, next: any) => {
    c.set('userId', 'test-user');
    await next();
  },
}));
vi.mock('../ratelimit.js', () => ({
  rateLimit: () => async (_c: any, next: any) => next(),
}));
vi.mock('../templates.js', () => ({
  templates: [
    {
      id: 'tmpl-1',
      name: 'Demo Template',
      description: 'A demo',
      category: 'testing',
      tags: ['demo'],
      flow: { params: [{ name: 'url', required: true }] },
      steps: [],
    },
  ],
  getTemplateById: vi.fn((id: string) =>
    id === 'tmpl-1'
      ? {
          id: 'tmpl-1',
          name: 'Demo Template',
          description: 'A demo',
          category: 'testing',
          tags: [],
          flow: { params: [] },
          steps: [],
        }
      : undefined
  ),
  applyTemplateParams: vi.fn(() => ({ steps: [], params: [] })),
}));
vi.mock('./helpers.js', () => ({
  flowSupportsAuthProfile: vi.fn().mockResolvedValue(false),
}));

import { flows } from './flows.js';
import { q, q1 } from '../db.js';

const mockQ = vi.mocked(q);
const mockQ1 = vi.mocked(q1);
const ENV = { DB: {}, APP_ENV: 'test', PUBLIC_BASE_URL: 'http://localhost' };

describe('GET /flows', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns flow list', async () => {
    mockQ.mockResolvedValueOnce({ results: [{ id: 'f-1', name: 'My Flow' }] } as any);
    const res = await flows.request('/', {}, ENV);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.flows).toHaveLength(1);
    expect(body.flows[0].id).toBe('f-1');
  });

  it('returns empty array when no flows exist', async () => {
    mockQ.mockResolvedValueOnce({ results: [] } as any);
    const res = await flows.request('/', {}, ENV);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.flows).toHaveLength(0);
  });
});

describe('GET /flows/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns flow detail', async () => {
    mockQ1.mockResolvedValueOnce({ id: 'f-1', name: 'Flow', definition: '{}' } as any);
    const res = await flows.request('/f-1', {}, ENV);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.flow.id).toBe('f-1');
  });

  it('returns 404 when flow not found', async () => {
    mockQ1.mockResolvedValueOnce(null);
    const res = await flows.request('/missing', {}, ENV);
    expect(res.status).toBe(404);
    const body = (await res.json()) as any;
    expect(body.error).toBe('flow_not_found');
  });
});

describe('POST /flows', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates a flow and returns IDs', async () => {
    mockQ.mockResolvedValue({ results: [] } as any);
    const res = await flows.request(
      '/',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: 'proj-1',
          name: 'New Flow',
          definition: { steps: [{ type: 'navigate', params: { url: 'https://example.com' } }] },
        }),
      },
      ENV
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.flowId).toBe('new-id-1');
    expect(body.versionId).toBe('new-id-1');
  });

  it('returns error for missing required fields', async () => {
    const res = await flows.request(
      '/',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'No project' }),
      },
      ENV
    );
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

describe('PUT /flows/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updates flow and bumps version', async () => {
    mockQ1.mockResolvedValueOnce({ id: 'f-1', current_version: 1 } as any);
    mockQ.mockResolvedValue({ results: [] } as any);
    const res = await flows.request(
      '/f-1',
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Updated', definition: { steps: [{ type: 'navigate' }] } }),
      },
      ENV
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.version).toBe(2);
  });

  it('returns 404 when flow not found', async () => {
    mockQ1.mockResolvedValueOnce(null);
    const res = await flows.request(
      '/missing',
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ definition: {} }),
      },
      ENV
    );
    expect(res.status).toBe(404);
  });
});

describe('DELETE /flows/:id', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deletes flow and returns ok', async () => {
    mockQ.mockResolvedValue({ results: [] } as any);
    const res = await flows.request('/f-1', { method: 'DELETE' }, ENV);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.ok).toBe(true);
  });
});
