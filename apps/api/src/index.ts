/**
 * CodeRail Flow API - Main entry point.
 *
 * Mounts middleware and all route modules.
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import * as Sentry from '@sentry/cloudflare';
import type { Env } from './env';
import { billing } from './billing';
import { requireAuth } from './auth';
import { proxy } from './proxy';
import { integrationRoutes, apiKeyRoutes, apiKeyAuth } from './integrations';
import { triggerRoutes } from './triggers';
import { auditMutationMiddleware } from './security/audit-log';
import { ssoRoutes } from './security/sso';
import { complianceRoutes } from './security/compliance';
import { elementRoutes } from './routes/elements';
import { analytics } from './routes/analytics';
import { runs } from './routes/runs';
import { flows } from './routes/flows';
import { resources } from './routes/resources';
import { artifacts } from './routes/artifacts';
import { authProfiles } from './routes/auth-profiles';
import { schedules, scheduled } from './routes/schedules';
import { misc } from './routes/misc';
import { health } from './routes/health';
import { captureException, flushSentry, getSentryOptions, initSentry } from './monitoring/sentry';
import { getLogger, loggerMiddleware } from './monitoring/logger';
import { cspHeaders, requestTimeout } from './middleware/security';
import { validationErrorHandler } from './middleware/validation';
import { getRuntimeConfig, isProductionLikeEnv, resolveCorsOrigin } from './runtime-config';

export { FlowExecutionWorkflow } from './workflow';
export { scheduled };
export { initSentry, flushSentry };

export type Variables = {
  userId?: string;
  userEmail?: string;
  requestId: string;
  logger: ReturnType<typeof getLogger>;
};
const app = new Hono<{ Bindings: Env; Variables: Variables }>();
app.use('*', loggerMiddleware());
app.use('*', validationErrorHandler);

// Security headers
app.use('*', cspHeaders);
app.use('*', requestTimeout(30000)); // 30 second timeout

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
      const env = (c as any).env as Env;
      return resolveCorsOrigin(origin, env);
    },
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    exposeHeaders: [
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'X-Request-Id',
      'Server-Timing',
    ],
  })
);

app.use('*', async (c, next) => {
  if (
    !isProductionLikeEnv(c.env.APP_ENV) ||
    c.req.path === '/health' ||
    c.req.path.startsWith('/health/')
  ) {
    return next();
  }

  const config = getRuntimeConfig(c.env);
  if (config.ok) {
    return next();
  }

  const requestId = c.get('requestId') || crypto.randomUUID();
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

app.onError((err, c) => {
  const requestId = c.get('requestId') || crypto.randomUUID();
  const logger = c.get('logger') || getLogger(requestId);
  const error = err instanceof Error ? err : new Error(String(err));

  logger.error('Unhandled request error', error, {
    method: c.req.method,
    path: c.req.path,
    userId: c.get('userId'),
  });

  captureException(error, {
    requestId,
    method: c.req.method,
    path: c.req.path,
    user: c.get('userId') ? { id: c.get('userId') } : undefined,
  });

  c.header('X-Request-Id', requestId);

  return c.json(
    {
      error: 'internal_error',
      message: 'An unexpected error occurred. Retry with the provided request ID.',
      requestId,
    },
    500
  );
});

app.notFound((c) => {
  const requestId = c.get('requestId') || crypto.randomUUID();
  c.header('X-Request-Id', requestId);
  return c.json(
    {
      error: 'not_found',
      message: 'Route not found.',
      requestId,
    },
    404
  );
});

// Health check
app.route('/health', health);

// Stats endpoint for dashboard (alias to /analytics/stats)
app.get('/stats', async (c) => {
  const { buildAnalyticsPayload } = await import('./routes/analytics.js');
  const auth = requireAuth();
  // Apply auth middleware inline
  const authResult = await auth(c, async () => {});
  if (authResult) return authResult;

  const payload = await buildAnalyticsPayload(
    c.env,
    c.req.query('dateRange'),
    c.req.query('projectId')
  );
  return c.json({
    total_runs: payload.total,
    succeeded_runs: payload.succeeded,
    failed_runs: payload.failed,
    avg_duration: payload.avgDuration,
    runs_by_flow: payload.byFlow.map((f) => ({
      flow_name: f.flowName,
      count: f.count,
    })),
    runs_over_time: payload.byDay.map((d) => ({
      date: d.date,
      count: d.count,
    })),
  });
});

// Audit logging for mutations
app.use('*', auditMutationMiddleware());

// Mount route modules
app.route('/analytics', analytics);
app.route('/runs', runs);
app.route('/flows', flows);
app.route('/artifacts', artifacts);
app.route('/auth-profiles', authProfiles);
app.route('/elements', elementRoutes);
app.route('/schedules', schedules);
app.route('/proxy', proxy);
app.route('/billing', billing);
app.route('/', resources);
app.route('/', misc);

// Sub-apps with auth wrappers
const auth = requireAuth();

app.route(
  '/integrations',
  (() => {
    const r = new Hono<{ Bindings: Env; Variables: Variables }>();
    r.use('*', auth);
    r.route('/', integrationRoutes());
    return r;
  })()
);

app.route(
  '/api-keys',
  (() => {
    const r = new Hono<{ Bindings: Env; Variables: Variables }>();
    r.use('*', auth);
    r.route('/', apiKeyRoutes());
    return r;
  })()
);

app.route('/sso', ssoRoutes());

app.route(
  '/compliance',
  (() => {
    const r = new Hono<{ Bindings: Env; Variables: Variables }>();
    r.use('*', auth);
    r.route('/', complianceRoutes());
    return r;
  })()
);

app.route(
  '/triggers',
  (() => {
    const r = new Hono<{ Bindings: Env; Variables: Variables }>();
    r.use('*', apiKeyAuth());
    r.use('*', auth);
    r.route('/', triggerRoutes());
    return r;
  })()
);

const handler = {
  fetch(request, env, executionCtx) {
    return app.fetch(request, env, executionCtx);
  },
  scheduled,
} satisfies ExportedHandler<Env>;

export default Sentry.withSentry<Env>(getSentryOptions, handler);
