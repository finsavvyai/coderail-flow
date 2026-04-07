/**
 * CodeRail Flow API - Main entry point.
 *
 * Mounts middleware and all route modules.
 */

import { Hono } from 'hono';
import { authHandler, getAuthUser } from '@hono/auth-js';
import * as Sentry from '@sentry/cloudflare';
import type { Env } from './env';
import type { ExecutionContext } from '@cloudflare/workers-types';
import { billing } from './billing';
import { requireAuth } from './auth';
import { getSessionUserProfile } from './auth-config';
import { encodeApiToken } from './auth-token';
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
import { visualRegression } from './routes/visual-regression';
import { runEvents } from './routes/run-events';
import { skills } from './routes/skills';
import { misc } from './routes/misc';
import { health } from './routes/health';
import { captureException, flushSentry, getSentryOptions, initSentry } from './monitoring/sentry';
import { getLogger } from './monitoring/logger';
import { applyMiddlewareStack } from './middleware/stack';

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

applyMiddlewareStack(app);

app.onError((err, c) => {
  const requestId = c.get('requestId') || globalThis.crypto.randomUUID();
  const logger = c.get('logger') || getLogger(requestId);
  const error = err instanceof Error ? err : new Error(String(err));
  const userId = c.get('userId');

  logger.error('Unhandled request error', error, {
    method: c.req.method,
    path: c.req.path,
    userId: c.get('userId'),
  });

  captureException(error, {
    requestId,
    method: c.req.method,
    path: c.req.path,
    user: userId ? { id: userId } : undefined,
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
  const requestId = c.get('requestId') || globalThis.crypto.randomUUID();
  c.header('X-Request-Id', requestId);
  return c.json({ error: 'not_found', message: 'Route not found.', requestId }, 404);
});

app.route('/health', health);

app.get('/auth/token', async (c) => {
  const authUser = await getAuthUser(c);
  const user = getSessionUserProfile(authUser);
  if (!user) return c.json({ error: 'unauthorized', message: 'No active session.' }, 401);
  if (!c.env.AUTH_SECRET) {
    return c.json(
      { error: 'service_unavailable', message: 'Authentication is not configured.' },
      503
    );
  }
  c.header('Cache-Control', 'no-store');
  return c.json({ token: await encodeApiToken(user.id, user.email, c.env.AUTH_SECRET), user });
});

app.use('/auth/*', authHandler());

app.get('/stats', async (c) => {
  const { buildAnalyticsPayload } = await import('./routes/analytics.js');
  const authMiddleware = requireAuth<Variables>();
  const authResult = await authMiddleware(c, async () => {});
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
    runs_by_flow: payload.byFlow.map((f) => ({ flow_name: f.flowName, count: f.count })),
    runs_over_time: payload.byDay.map((d) => ({ date: d.date, count: d.count })),
  });
});

app.use('*', auditMutationMiddleware());

app.route('/analytics', analytics);
app.route('/runs', runs);
app.route('/runs', runEvents);
app.route('/flows', flows);
app.route('/artifacts', artifacts);
app.route('/auth-profiles', authProfiles);
app.route('/elements', elementRoutes);
app.route('/schedules', schedules);
app.route('/visual-regression', visualRegression);
app.route('/skills', skills);
app.route('/proxy', proxy);
app.route('/billing', billing);
app.route('/', resources);
app.route('/', misc);

// Auth-wrapped sub-apps
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
  fetch(request: Parameters<typeof app.fetch>[0], env: Env, executionCtx: ExecutionContext) {
    return app.fetch(request, env, executionCtx);
  },
  scheduled,
};

const withSentry = Sentry.withSentry as unknown as (options: unknown, handler: unknown) => unknown;
export default withSentry(getSentryOptions, handler);
