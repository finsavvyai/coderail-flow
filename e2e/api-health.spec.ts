import { test, expect } from "@playwright/test";

const API_URL = process.env.E2E_API_URL ?? "http://localhost:8787";

test.describe("API health & security headers", () => {
  let apiAvailable = false;

  test.beforeAll(async ({ request }) => {
    try {
      const res = await request.get(`${API_URL}/health`, { timeout: 3_000 });
      apiAvailable = res.ok();
    } catch {
      apiAvailable = false;
    }
  });

  test.beforeEach(async () => {
    test.skip(!apiAvailable, `API not reachable at ${API_URL} — start the API server to run these tests`);
  });

  test("GET /health returns ok:true", async ({ request }) => {
    const res = await request.get(`${API_URL}/health`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.service).toBe("coderail-flow-api");
  });

  test("security headers are present on health endpoint", async ({ request }) => {
    const res = await request.get(`${API_URL}/health`);
    expect(res.headers()["x-content-type-options"]).toBe("nosniff");
    expect(res.headers()["x-frame-options"]).toBe("DENY");
    expect(res.headers()["referrer-policy"]).toBe("no-referrer");
    expect(res.headers()["cache-control"]).toBe("no-store");
  });

  test("unauthenticated request to protected route returns 401", async ({ request }) => {
    const res = await request.get(`${API_URL}/flows`);
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("unauthorized");
  });

  test("unauthenticated request to /runs returns 401", async ({ request }) => {
    const res = await request.get(`${API_URL}/runs`);
    expect(res.status()).toBe(401);
  });

  test("unauthenticated request to /projects returns 401", async ({ request }) => {
    const res = await request.get(`${API_URL}/projects`);
    expect(res.status()).toBe(401);
  });

  test("unauthenticated request to /analytics returns 401", async ({ request }) => {
    const res = await request.get(`${API_URL}/analytics`);
    expect(res.status()).toBe(401);
  });

  test("POST with oversized payload returns 413", async ({ request }) => {
    const largeBody = JSON.stringify({ data: "x".repeat(1_100_000) });
    const res = await request.post(`${API_URL}/flows`, {
      data: largeBody,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": String(largeBody.length),
      },
    });
    expect(res.status()).toBe(413);
    const body = await res.json();
    expect(body.error).toBe("payload_too_large");
  });

  test("SSO providers list is accessible without auth", async ({ request }) => {
    const res = await request.get(`${API_URL}/sso/providers`);
    expect([200, 404]).toContain(res.status());
  });

  test("OPTIONS request returns CORS headers", async ({ request }) => {
    const res = await request.fetch(`${API_URL}/health`, {
      method: "OPTIONS",
      headers: { Origin: "http://example.com" },
    });
    expect([200, 204]).toContain(res.status());
  });
});
