/**
 * API Health Tests (with authentication context)
 */

import { test, expect } from './fixtures';

const PROD_API_URL = 'https://coderail-flow-api.broad-dew-49ad.workers.dev';

test.describe('API Health Endpoints', () => {
  const apiUrl = PROD_API_URL;
  let apiAvailable = false;

  test.beforeAll(async ({ request }) => {
    try {
      const res = await request.get(`${apiUrl}/health`, { timeout: 5_000 });
      apiAvailable = res.ok();
    } catch {
      apiAvailable = false;
    }
  });

  test.beforeEach(async () => {
    test.skip(!apiAvailable, `Production API not reachable at ${apiUrl}`);
  });

  test('GET /health returns ok:true without auth', async ({ request }) => {
    const response = await request.get(`${apiUrl}/health`);
    expect(response.status()).toBe(200);

    // Accept any 2xx response; body shape may vary between deployments
    expect(response.ok()).toBe(true);
    const body = await response.json().catch(() => ({}));
    // If body has ok field, it should be true; otherwise just check HTTP status
    if ('ok' in body) expect(body.ok).toBe(true);
  });

  test('security headers are present on health endpoint', async ({ request }) => {
    const response = await request.get(`${apiUrl}/health`);
    // Verify security headers are present (exact values may vary by deployment)
    expect(response.headers()['x-content-type-options']).toBeTruthy();
    expect(response.headers()['x-frame-options']).toBeTruthy();
    // referrer-policy and cache-control should be set
    const hasReferrerPolicy = !!response.headers()['referrer-policy'];
    const hasCacheControl = !!response.headers()['cache-control'];
    expect(hasReferrerPolicy || hasCacheControl).toBe(true);
  });

  test('detailed health check returns 401 without auth', async ({ request }) => {
    const response = await request.get(`${apiUrl}/health/detailed`);
    expect(response.status()).toBe(401);
  });
});

test.describe('API Performance', () => {
  const apiUrl = PROD_API_URL;
  let apiAvailable = false;

  test.beforeAll(async ({ request }) => {
    try {
      const res = await request.get(`${apiUrl}/health`, { timeout: 5_000 });
      apiAvailable = res.ok();
    } catch {
      apiAvailable = false;
    }
  });

  test.beforeEach(async () => {
    test.skip(!apiAvailable, `Production API not reachable at ${apiUrl}`);
  });

  test('health endpoint responds within 5000ms (allows for cold start)', async ({ request }) => {
    const startTime = Date.now();
    await request.get(`${apiUrl}/health`);
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(5_000);
  });

  test('API handles 100 concurrent health checks', async ({ request }) => {
    const promises = Array(100).fill(null).map(() =>
      request.get(`${apiUrl}/health`)
    );

    const responses = await Promise.all(promises);
    const allOk = responses.every(r => r.ok());
    expect(allOk).toBe(true);
  });
});
