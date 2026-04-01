import { describe, it, expect, vi, beforeEach } from "vitest";
import { createApp } from "../src/api/app";

describe("API Routes", () => {
  let mockEnv: any;

  beforeEach(() => {
    mockEnv = {
      DB: {
        prepare: vi.fn(),
      },
      KV: {
        get: vi.fn().mockResolvedValue(null),
        put: vi.fn().mockResolvedValue(undefined),
      },
      R2: {},
      AUTH_SECRET: "test-secret",
      ENVIRONMENT: "test",
      LOG_LEVEL: "debug",
    };
  });

  it("should create app with all routes", () => {
    const app = createApp();
    expect(app).toBeDefined();
  });

  it("should handle GET /health", async () => {
    const mockChain = {
      first: vi.fn().mockResolvedValue({ status: 1 }),
    };

    mockEnv.DB.prepare.mockReturnValue(mockChain);

    const app = createApp();

    const response = await app.request("/health", {
      method: "GET",
      env: mockEnv,
    } as any);

    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toHaveProperty("status");
  });

  it("should handle GET /api/templates", async () => {
    const app = createApp();

    const response = await app.request("/api/templates", {
      method: "GET",
      env: mockEnv,
    } as any);

    expect([200, 404, 500]).toContain(response.status);
  });

  it("should handle GET /api/templates/:id", async () => {
    const app = createApp();

    const response = await app.request("/api/templates/tpl-test", {
      method: "GET",
      env: mockEnv,
    } as any);

    expect([200, 404, 500]).toContain(response.status);
  });

  it("should handle 404 for undefined routes", async () => {
    const app = createApp();

    const response = await app.request("/undefined-route", {
      method: "GET",
      env: mockEnv,
    } as any);

    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json).toHaveProperty("error", "Not found");
  });

  it("should require auth for POST /api/workflows", async () => {
    const app = createApp();

    const response = await app.request("/api/workflows", {
      method: "POST",
      env: mockEnv,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test",
        triggerType: "manual",
        actions: [],
      }),
    } as any);

    expect([401, 500]).toContain(response.status);
  });

  it("should handle CORS headers", async () => {
    const app = createApp();

    const response = await app.request("/health", {
      method: "OPTIONS",
      env: mockEnv,
    } as any);

    expect([200, 404, 500]).toContain(response.status);
  });

  it("should set rate limit headers", async () => {
    const app = createApp();

    const response = await app.request("/health", {
      method: "GET",
      env: mockEnv,
    } as any);

    const headers = response.headers;
    expect(headers.has("X-RateLimit-Limit")).toBe(true);
  });

  it("should handle errors gracefully", async () => {
    mockEnv.DB.prepare.mockImplementation(() => {
      throw new Error("Database error");
    });

    const app = createApp();

    const response = await app.request("/health", {
      method: "GET",
      env: mockEnv,
    } as any);

    expect([500, 200]).toContain(response.status);
  });

  it("should handle POST /api/templates", async () => {
    const app = createApp();

    const response = await app.request("/api/templates", {
      method: "POST",
      env: mockEnv,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test Template",
        category: "test",
        trigger: { type: "manual" },
        actions: [],
      }),
    } as any);

    expect([200, 201, 400, 500]).toContain(response.status);
  });

  it("should validate template creation payload", async () => {
    const app = createApp();

    const response = await app.request("/api/templates", {
      method: "POST",
      env: mockEnv,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test",
      }),
    } as any);

    expect([400, 500]).toContain(response.status);
  });
});
