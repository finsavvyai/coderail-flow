/**
 * Middleware stack: CORS, rate limiting, payload guard, readiness check.
 *
 * Extracted from index.ts to keep the entry point under 200 lines.
 */

import type { Hono } from 'hono';
import { cors } from 'hono/cors';
import { initAuthConfig } from '@hono/auth-js';
import type { Env } from '../env';
import type { Variables } from '../index';
import { getAuthConfig } from '../auth-config';
import { loggerMiddleware } from '../monitoring/logger';
import { cspHeaders, requestTimeout } from './security';
import { validationErrorHandler } from './validation';
import { getRuntimeConfig, isProductionLikeEnv, resolveCorsOrigin } from '../runtime-config';
import { rateLimit } from '../ratelimit';

export function applyMiddlewareStack(app: Hono<{ Bindings: Env; Variables: Variables }>) {
  app.use('*', loggerMiddleware());
  app.use('*', validationErrorHandler);
  app.use('*', initAuthConfig((c) => getAuthConfig(c.env)));

  app.use('*', cspHeaders);
  app.use('*', requestTimeout(30000));

  // Payload size guard (1MB limit)
  app.use('*', async (c, next) => {
    const method = c.req.method.toUpperCase();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const lengthHeader = c.req.header('content-length');
      const contentLength = lengthHeader ? Number(lengthHeader) : 0;
      if (contentLength > 1_000_000) {
        return c.json(
          { error: 'payload_too_large', message: 'Request payload exceeds 1MB limit.' },
          413
        );
      }
    }
    await next();
  });

  // CORS
  app.use(
    '*',
    cors({
      origin: (origin, c) => {
        const env = c.env as Env;
        return resolveCorsOrigin(origin, env);
      },
      allowHeaders: ['Content-Type', 'Authorization', 'X-Auth-Return-Redirect'],
      allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
      exposeHeaders: [
        'X-RateLimit-Limit',
        'X-RateLimit-Remaining',
        'X-RateLimit-Reset',
        'X-Request-Id',
        'Server-Timing',
      ],
    })
  );

  // Rate limiting (skip health endpoints)
  app.use('*', async (c, next) => {
    if (c.req.path === '/health' || c.req.path.startsWith('/health/')) {
      return next();
    }
    const middleware = rateLimit<Variables>(120, 60_000);
    return middleware(c, next);
  });

  // Runtime readiness check
  app.use('*', async (c, next) => {
    if (
      !isProductionLikeEnv(c.env.APP_ENV) ||
      c.req.path === '/health' ||
      c.req.path.startsWith('/health/')
    ) {
      return next();
    }
    const config = getRuntimeConfig(c.env);
    if (config.ok) return next();

    const requestId = c.get('requestId') || globalThis.crypto.randomUUID();
    c.header('X-Request-Id', requestId);
    return c.json(
      {
        error: 'service_unavailable',
        message: 'Service is not ready to receive traffic. Check /health/ready for details.',
        requestId,
      },
      503
    );
  });
}
