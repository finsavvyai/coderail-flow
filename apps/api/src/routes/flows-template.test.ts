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
import { q } from '../db.js';

const mockQ = vi.mocked(q);
const ENV = { DB: {}, APP_ENV: 'test', PUBLIC_BASE_URL: 'http://localhost' };

describe('GET /flows/templates', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns template list', async () => {
    const res = await flows.request('/templates', {}, ENV);
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.templates).toHaveLength(1);
    expect(body.templates[0].id).toBe('tmpl-1');
  });
});

describe('POST /flows/from-template', () => {
  beforeEach(() => vi.clearAllMocks());

  it('creates flow from template', async () => {
    mockQ.mockResolvedValue({ results: [] } as any);
    const res = await flows.request(
      '/from-template',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: 'tmpl-1', projectId: 'proj-1', params: {} }),
      },
      ENV
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as any;
    expect(body.flowId).toBeTruthy();
    expect(body.templateId).toBe('tmpl-1');
  });

  it('returns 404 for unknown template', async () => {
    const res = await flows.request(
      '/from-template',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: 'nonexistent', projectId: 'proj-1' }),
      },
      ENV
    );
    expect(res.status).toBe(404);
    const body = (await res.json()) as any;
    expect(body.error).toBe('template_not_found');
  });
});
