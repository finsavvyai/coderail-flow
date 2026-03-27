/**
 * Auth profile route handler tests.
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

import { authProfiles } from './auth-profiles.js';
import { q } from '../db.js';

const mockQ = vi.mocked(q);
const ENV = { DB: {}, APP_ENV: 'test', PUBLIC_BASE_URL: 'http://localhost' };

describe('GET /auth-profiles', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns auth profile list', async () => {
    mockQ
      .mockResolvedValueOnce({
        results: [{ name: 'id' }, { name: 'project_id' }, { name: 'encrypted_payload' }],
      } as any)
      .mockResolvedValueOnce({
        results: [
          {
            id: 'ap-1',
            project_id: 'proj-1',
            name: 'Test Profile',
            encrypted_payload: '{"cookies":[],"localStorage":{},"sessionStorage":{}}',
            type: 'cookies',
            created_at: '2024-01-01',
          },
        ],
      } as any);
    const res = await authProfiles.request('/?projectId=proj-1', {}, ENV);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.profiles).toHaveLength(1);
  });

  it('returns empty array when no profiles exist', async () => {
    mockQ
      .mockResolvedValueOnce({
        results: [{ name: 'id' }, { name: 'project_id' }, { name: 'encrypted_payload' }],
      } as any)
      .mockResolvedValueOnce({ results: [] } as any);
    const res = await authProfiles.request('/?projectId=proj-1', {}, ENV);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.profiles).toHaveLength(0);
  });
});
