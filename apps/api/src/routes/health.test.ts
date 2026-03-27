import { describe, it, expect, vi } from 'vitest';
import { health } from './health.js';

function createEnv(overrides: Record<string, unknown> = {}) {
  return {
    APP_ENV: 'production',
    PUBLIC_BASE_URL: 'https://coderail-flow.example.com',
    CLERK_ISSUER: 'https://clerk.example.com',
    AUTH_ENCRYPTION_KEY: 'super-secret-key',
    DB: {
      prepare: vi.fn(() => ({
        first: vi.fn().mockResolvedValue({ ok: 1 }),
      })),
    },
    ARTIFACTS: {
      list: vi.fn().mockResolvedValue({ objects: [] }),
    },
    BROWSER: {
      fetch: vi.fn(),
    },
    ...overrides,
  };
}

describe('health routes', () => {
  it('returns liveness data with readiness summary', async () => {
    const res = await health.request('/', {}, createEnv());

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.service).toBe('coderail-flow-api');
    expect(body.readiness.ok).toBe(true);
  });

  it('returns 503 from /health/ready when production config is incomplete', async () => {
    const res = await health.request('/ready', {}, createEnv({ CLERK_ISSUER: undefined }));

    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(
      body.issues.some((issue: { code: string }) => issue.code === 'clerk_issuer_missing')
    ).toBe(true);
  });

  it('returns 200 from /health/ready when required config is present', async () => {
    const res = await health.request('/ready', {}, createEnv());

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.features.auth).toBe(true);
    expect(body.features.browser).toBe(true);
  });
});
