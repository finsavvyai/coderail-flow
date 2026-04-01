import { createMiddleware } from "hono/factory";
import type { Env } from "../bindings";

const RATE_LIMIT_WINDOW = 60; // seconds
const RATE_LIMIT_MAX_REQUESTS = 100;

interface RateLimitData {
  count: number;
  resetAt: number;
}

export const rateLimiterMiddleware = createMiddleware<{ Bindings: Env }>(
  async (c, next) => {
    const clientIp =
      c.req.header("cf-connecting-ip") ||
      c.req.header("x-forwarded-for") ||
      "unknown";

    const key = `ratelimit:${clientIp}`;
    const now = Math.floor(Date.now() / 1000);

    try {
      const stored = await c.env.KV.get(key, "json");
      let rateLimitData: RateLimitData = {
        count: 0,
        resetAt: now + RATE_LIMIT_WINDOW,
      };

      if (stored) {
        rateLimitData = stored as RateLimitData;

        if (now > rateLimitData.resetAt) {
          rateLimitData.count = 0;
          rateLimitData.resetAt = now + RATE_LIMIT_WINDOW;
        }
      }

      rateLimitData.count += 1;

      if (rateLimitData.count > RATE_LIMIT_MAX_REQUESTS) {
        return c.json(
          {
            error: "Too many requests",
            retryAfter: rateLimitData.resetAt - now,
          },
          429
        );
      }

      const ttl = rateLimitData.resetAt - now;
      await c.env.KV.put(key, JSON.stringify(rateLimitData), { expirationTtl: ttl });

      c.header("X-RateLimit-Limit", String(RATE_LIMIT_MAX_REQUESTS));
      c.header(
        "X-RateLimit-Remaining",
        String(Math.max(0, RATE_LIMIT_MAX_REQUESTS - rateLimitData.count))
      );
      c.header("X-RateLimit-Reset", String(rateLimitData.resetAt));

      await next();
    } catch (error) {
      console.error("Rate limiter error:", error);
      await next();
    }
  }
);
