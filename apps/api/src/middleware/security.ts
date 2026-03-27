/**
 * Security middleware for production hardening.
 */

import type { MiddlewareHandler } from 'hono';

/**
 * Add Content Security Policy headers.
 */
export const cspHeaders: MiddlewareHandler = async (c, next) => {
  await next();

  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval needed for some browser automation
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; ');

  c.header('Content-Security-Policy', csp);
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'no-referrer');
  c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  c.header('Cross-Origin-Opener-Policy', 'same-origin');
  c.header('Cross-Origin-Resource-Policy', 'same-origin');
  c.header('Origin-Agent-Cluster', '?1');
  if (!c.res.headers.get('Cache-Control')) {
    c.header('Cache-Control', 'no-store');
  }
  if (c.req.url.startsWith('https://')) {
    c.header('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
};

/**
 * Request timeout middleware.
 */
export function requestTimeout(ms: number): MiddlewareHandler {
  return async (c, next) => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const didTimeout = await Promise.race([
      (async () => {
        await next();
        return false;
      })(),
      new Promise<boolean>((resolve) => {
        timeoutId = setTimeout(() => resolve(true), ms);
      }),
    ]);

    if (timeoutId) clearTimeout(timeoutId);

    if (didTimeout) {
      c.header('Retry-After', '1');
      return c.json(
        {
          error: 'request_timeout',
          message: `Request exceeded ${ms}ms timeout.`,
          requestId: c.get('requestId'),
        },
        504
      );
    }
  };
}

/**
 * Rate limit per user (enhanced version).
 */
export function perUserRateLimit(maxRequests: number, windowMs: number): MiddlewareHandler {
  return async (c, next) => {
    const userId = c.get('userId') || c.req.header('x-forwarded-for') || 'anonymous';
    const key = `ratelimit:${userId}`;

    // This is a simple in-memory implementation
    // For production, use Cloudflare Workers KV or Durable Objects
    let count = 0;
    try {
      const stored = await c.env.CACHE?.get(key);
      count = stored ? parseInt(stored, 10) : 0;
    } catch {}

    if (count >= maxRequests) {
      return c.json(
        {
          error: 'rate_limit_exceeded',
          message: `Too many requests. Maximum ${maxRequests} requests per ${windowMs}ms.`,
        },
        429
      );
    }

    await next();

    // Increment counter
    try {
      await c.env.CACHE?.put(key, String(count + 1), {
        expirationTtl: Math.floor(windowMs / 1000),
      });
    } catch {}
  };
}

/**
 * Validate webhook signature for Lemon Squeezy.
 */
export function validateWebhookSignature(secret: string): MiddlewareHandler {
  return async (c, next) => {
    const signature = c.req.header('X-Signature');
    const body = await c.req.raw.text();

    if (!signature) {
      return c.json({ error: 'missing_signature' }, 401);
    }

    // HMAC verification
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBytes = hexToBytes(signature.replace('sha256=', ''));
    const bodyBytes = new TextEncoder().encode(body);

    const isValid = await crypto.subtle.verify('HMAC', cryptoKey, signatureBytes, bodyBytes);

    if (!isValid) {
      return c.json({ error: 'invalid_signature' }, 401);
    }

    // Store raw body for handlers
    c.set('rawBody', body);
    await next();
  };
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}
