import { describe, it, expect, vi, beforeEach } from "vitest";
import { rateLimiterMiddleware } from "../src/api/middleware/rate-limiter";
import { HonoRequest } from "hono";

describe("Rate Limiter Middleware", () => {
  let mockEnv: any;
  let mockContext: any;

  beforeEach(() => {
    mockEnv = {
      KV: {
        get: vi.fn().mockResolvedValue(null),
        put: vi.fn().mockResolvedValue(undefined),
      },
    };

    mockContext = {
      env: mockEnv,
      req: {
        header: vi.fn((key) => {
          if (key === "cf-connecting-ip") return "192.168.1.1";
          return null;
        }),
      },
      header: vi.fn(),
      json: vi.fn().mockReturnValue({ status: 429 }),
      set: vi.fn(),
    };
  });

  it("should allow requests under rate limit", async () => {
    const nextFn = vi.fn();

    await rateLimiterMiddleware(mockContext, nextFn);

    expect(nextFn).toHaveBeenCalled();
  });

  it("should set rate limit headers", async () => {
    const nextFn = vi.fn();

    await rateLimiterMiddleware(mockContext, nextFn);

    expect(mockContext.header).toHaveBeenCalledWith(
      "X-RateLimit-Limit",
      "100"
    );
    expect(mockContext.header).toHaveBeenCalledWith(
      "X-RateLimit-Remaining",
      expect.any(String)
    );
    expect(mockContext.header).toHaveBeenCalledWith(
      "X-RateLimit-Reset",
      expect.any(String)
    );
  });

  it("should reject requests over rate limit", async () => {
    mockEnv.KV.get.mockResolvedValue({
      count: 101,
      resetAt: Math.floor(Date.now() / 1000) + 30,
    });

    const nextFn = vi.fn();

    const result = await rateLimiterMiddleware(mockContext, nextFn);

    expect(result).toBeDefined();
    expect(mockContext.json).toHaveBeenCalledWith(
      {
        error: "Too many requests",
        retryAfter: expect.any(Number),
      },
      429
    );
  });

  it("should reset counter after window expires", async () => {
    const now = Math.floor(Date.now() / 1000);
    const pastWindow = {
      count: 150,
      resetAt: now - 1,
    };

    mockEnv.KV.get.mockResolvedValue(pastWindow);
    const nextFn = vi.fn();

    await rateLimiterMiddleware(mockContext, nextFn);

    expect(nextFn).toHaveBeenCalled();
  });

  it("should use default IP when cf-connecting-ip is missing", async () => {
    mockContext.req.header.mockReturnValue(null);
    const nextFn = vi.fn();

    await rateLimiterMiddleware(mockContext, nextFn);

    expect(mockEnv.KV.get).toHaveBeenCalledWith(
      expect.stringContaining("ratelimit:"),
      "json"
    );
  });
});
