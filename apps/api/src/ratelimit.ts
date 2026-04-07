import { MiddlewareHandler } from 'hono';
import type { Env } from './env';

/**
 * Simple in-memory sliding-window rate limiter.
 * Uses a Map keyed by IP. Resets per-isolate (good enough for Workers).
 * For heavier traffic, migrate to Durable Objects or Cloudflare Rate Limiting rules.
 */

type BucketEntry = { count: number; resetAt: number };
const buckets = new Map<string, BucketEntry>();

const CLEANUP_INTERVAL = 60_000; // 1 min
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of buckets) {
    if (entry.resetAt < now) buckets.delete(key);
  }
}

/**
 * Rate limit middleware.
 * @param max   Maximum requests per window
 * @param windowMs  Window size in milliseconds
 */
type RateLimitContextVariables = object;

export function rateLimit<V extends RateLimitContextVariables = RateLimitContextVariables>(
  max: number,
  windowMs: number
): MiddlewareHandler<{ Bindings: Env; Variables: V }> {
  return async (c, next) => {
    cleanup();

    const ip = c.req.header('cf-connecting-ip') ?? c.req.header('x-forwarded-for') ?? 'unknown';
    const key = `${ip}:${c.req.path}`;
    const now = Date.now();

    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt < now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }

    bucket.count++;

    // Set standard rate-limit headers
    c.header('X-RateLimit-Limit', String(max));
    c.header('X-RateLimit-Remaining', String(Math.max(0, max - bucket.count)));
    c.header('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > max) {
      return c.json(
        {
          error: 'rate_limit_exceeded',
          message: `Too many requests. Try again in ${Math.ceil((bucket.resetAt - now) / 1000)}s.`,
        },
        429
      );
    }

    return next();
  };
}

/**
 * Rate limit by authenticated user ID.
 * Falls back to IP-based limiting if userId is not set.
 */
export function rateLimitByUser<V extends { userId?: string }>(
  max: number,
  windowMs: number
): MiddlewareHandler<{ Bindings: Env; Variables: V }> {
  return async (c, next) => {
    cleanup();

    const userId =
      (c.get('userId') || c.req.header('cf-connecting-ip')) ??
      c.req.header('x-forwarded-for') ??
      'unknown';
    const key = `user:${userId}:${c.req.path}`;
    const now = Date.now();

    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt < now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }

    bucket.count++;

    c.header('X-RateLimit-Limit', String(max));
    c.header('X-RateLimit-Remaining', String(Math.max(0, max - bucket.count)));
    c.header('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > max) {
      return c.json(
        {
          error: 'rate_limit_exceeded',
          message: `Too many requests. Try again in ${Math.ceil((bucket.resetAt - now) / 1000)}s.`,
        },
        429
      );
    }

    return next();
  };
}
