/**
 * User flow E2E tests against production.
 *
 * Tests the critical paths a real user takes:
 * 1. Landing → Sign-in gate → Auth redirect
 * 2. Skills marketplace browsing (public)
 * 3. Protected route enforcement
 * 4. Proxy SSRF protection
 * 5. API new feature endpoints
 * 6. Rate limiting headers
 * 7. Visual regression endpoints (auth-gated)
 * 8. SSE streaming endpoint (auth-gated)
 */

import { test, expect } from '@playwright/test';

const API = process.env.E2E_API_URL ?? 'https://api.coderail.dev';
const WEB = process.env.E2E_BASE_URL ?? 'https://flow.coderail.dev';

let apiAvailable = false;

test.beforeAll(async ({ request }) => {
  try {
    const res = await request.get(`${API}/health`, { timeout: 5_000 });
    apiAvailable = res.ok();
  } catch {
    apiAvailable = false;
  }
});

// ── Flow 1: Landing page → CTA → Auth gate ─────────────────

test.describe('User Flow: Landing → Auth', () => {
  test('landing page loads with title and CTA', async ({ page }) => {
    await page.goto(WEB);
    await expect(page).toHaveTitle(/CodeRail Flow/i);
    const cta = page.locator('a, button').first();
    await expect(cta).toBeVisible({ timeout: 10_000 });
  });

  test('clicking CTA leads to app or auth gate', async ({ page }) => {
    await page.goto(WEB);
    const appLink = page.locator("a[href*='app']").first();
    const count = await appLink.count();
    if (count > 0) {
      await appLink.click();
      await page.waitForURL(/(\/app|\/auth|oauth|login)/i, { timeout: 15_000 });
    }
  });

  test('/app shows auth gate or dashboard', async ({ page }) => {
    await page.goto(`${WEB}/app`);
    await page.waitForSelector('.auth-gate, .container, .app-topbar', { timeout: 30_000 }).catch(() => {});
    const signIn = page.getByText(/Sign in|CodeRail Flow/i).first();
    await expect(signIn).toBeVisible({ timeout: 10_000 });
  });
});

// ── Flow 2: Skills marketplace (public browsing) ────────────

test.describe('User Flow: Skills Marketplace', () => {
  test.beforeEach(() => { test.skip(!apiAvailable, 'API not reachable'); });

  test('GET /skills returns empty marketplace', async ({ request }) => {
    const res = await request.get(`${API}/skills`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.skills).toBeDefined();
    expect(Array.isArray(body.skills)).toBe(true);
  });

  test('GET /skills/:id returns 404 for non-existent skill', async ({ request }) => {
    const res = await request.get(`${API}/skills/non-existent-id`);
    expect(res.status()).toBe(404);
  });

  test('POST /skills requires authentication', async ({ request }) => {
    const res = await request.post(`${API}/skills`, {
      data: { name: 'test', version: '1.0.0', description: 'test', manifest: {} },
    });
    expect(res.status()).toBe(401);
  });

  test('POST /skills/:id/install requires authentication', async ({ request }) => {
    const res = await request.post(`${API}/skills/some-id/install`);
    expect(res.status()).toBe(401);
  });
});

// ── Flow 3: Visual regression (auth-gated) ──────────────────

test.describe('User Flow: Visual Regression', () => {
  test.beforeEach(() => { test.skip(!apiAvailable, 'API not reachable'); });

  test('GET /visual-regression/baselines requires auth', async ({ request }) => {
    const res = await request.get(`${API}/visual-regression/baselines?flowId=test`);
    expect(res.status()).toBe(401);
  });

  test('POST /visual-regression/baselines requires auth', async ({ request }) => {
    const res = await request.post(`${API}/visual-regression/baselines`, {
      data: { flowId: 'f1', stepIndex: 0, runId: 'r1' },
    });
    expect(res.status()).toBe(401);
  });

  test('POST /visual-regression/diffs/:id/approve requires auth', async ({ request }) => {
    const res = await request.post(`${API}/visual-regression/diffs/some-id/approve`);
    expect(res.status()).toBe(401);
  });
});

// ── Flow 4: SSE streaming (auth-gated) ──────────────────────

test.describe('User Flow: Run Events SSE', () => {
  test.beforeEach(() => { test.skip(!apiAvailable, 'API not reachable'); });

  test('GET /runs/:id/events requires auth', async ({ request }) => {
    const res = await request.get(`${API}/runs/test-run/events`);
    expect(res.status()).toBe(401);
  });
});

// ── Flow 5: Security — proxy SSRF protection ────────────────

test.describe('User Flow: Proxy Security', () => {
  test.beforeEach(() => { test.skip(!apiAvailable, 'API not reachable'); });

  test('proxy requires authentication', async ({ request }) => {
    const b64 = btoa('https://example.com');
    const res = await request.get(`${API}/proxy/${b64}`);
    expect(res.status()).toBe(401);
  });

  test('proxy rejects requests without Bearer token', async ({ request }) => {
    const b64 = btoa('https://example.com');
    const res = await request.get(`${API}/proxy/${b64}/index.html`);
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBe('unauthorized');
  });
});

// ── Flow 6: Rate limiting ───────────────────────────────────

test.describe('User Flow: Rate Limiting', () => {
  test.beforeEach(() => { test.skip(!apiAvailable, 'API not reachable'); });

  test('rate limit headers are present on responses', async ({ request }) => {
    const res = await request.get(`${API}/skills`);
    expect(res.headers()['x-ratelimit-limit']).toBeTruthy();
    expect(res.headers()['x-ratelimit-remaining']).toBeTruthy();
    expect(res.headers()['x-ratelimit-reset']).toBeTruthy();
  });

  test('rate limit remaining decreases with requests', async ({ request }) => {
    const res1 = await request.get(`${API}/skills`);
    const remaining1 = Number(res1.headers()['x-ratelimit-remaining']);
    const res2 = await request.get(`${API}/skills`);
    const remaining2 = Number(res2.headers()['x-ratelimit-remaining']);
    expect(remaining2).toBeLessThanOrEqual(remaining1);
  });
});

// ── Flow 7: Protected routes enforcement ────────────────────

test.describe('User Flow: Auth Enforcement', () => {
  test.beforeEach(() => { test.skip(!apiAvailable, 'API not reachable'); });

  const protectedRoutes = [
    '/flows', '/runs', '/analytics', '/schedules',
    '/auth-profiles', '/elements', '/api-keys', '/integrations',
  ];

  for (const route of protectedRoutes) {
    test(`${route} returns 401 without auth`, async ({ request }) => {
      const res = await request.get(`${API}${route}`);
      expect(res.status()).toBe(401);
    });
  }
});

// ── Flow 8: Security headers ────────────────────────────────

test.describe('User Flow: Security Headers', () => {
  test.beforeEach(() => { test.skip(!apiAvailable, 'API not reachable'); });

  test('HSTS header is set', async ({ request }) => {
    const res = await request.get(`${API}/health`);
    const hsts = res.headers()['strict-transport-security'];
    expect(hsts).toContain('max-age=');
    expect(hsts).toContain('includeSubDomains');
  });

  test('CSP header blocks framing', async ({ request }) => {
    const res = await request.get(`${API}/health`);
    const csp = res.headers()['content-security-policy'];
    expect(csp).toContain("frame-ancestors 'none'");
  });

  test('X-Frame-Options is DENY', async ({ request }) => {
    const res = await request.get(`${API}/health`);
    expect(res.headers()['x-frame-options']).toBe('DENY');
  });

  test('nosniff is set', async ({ request }) => {
    const res = await request.get(`${API}/health`);
    expect(res.headers()['x-content-type-options']).toBe('nosniff');
  });
});

// ── Flow 9: Error handling ──────────────────────────────────

test.describe('User Flow: Error Handling', () => {
  test.beforeEach(() => { test.skip(!apiAvailable, 'API not reachable'); });

  test('404 returns structured error with requestId', async ({ request }) => {
    const res = await request.get(`${API}/nonexistent-route-xyz`);
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.error).toBe('not_found');
    expect(body.requestId).toBeTruthy();
  });

  test('413 on oversized payload', async ({ request }) => {
    const largeBody = JSON.stringify({ data: 'x'.repeat(1_100_000) });
    const res = await request.post(`${API}/flows`, {
      data: largeBody,
      headers: { 'Content-Type': 'application/json', 'Content-Length': String(largeBody.length) },
    });
    expect(res.status()).toBe(413);
  });
});

// ── Flow 10: Web app critical pages ─────────────────────────

test.describe('User Flow: Web Pages', () => {
  const pages = [
    { path: '/', expect: /CodeRail Flow/i },
    { path: '/app', expect: /Sign in|CodeRail|Dashboard/i },
    { path: '/projects', expect: /Projects|Sign in/i },
    { path: '/billing', expect: /plan|billing|Sign in|Loading/i },
  ];

  for (const p of pages) {
    test(`${p.path} renders without crash`, async ({ page }) => {
      await page.goto(`${WEB}${p.path}`);
      await page.waitForLoadState('domcontentloaded');
      const text = page.getByText(p.expect).first();
      await expect(text).toBeVisible({ timeout: 15_000 });
    });
  }

  test('no console errors on landing page', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto(WEB);
    await page.waitForLoadState('networkidle');
    const critical = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('404') && !e.includes('Failed to fetch')
    );
    expect(critical).toHaveLength(0);
  });
});
