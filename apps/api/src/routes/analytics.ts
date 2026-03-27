/** Analytics route handlers. */

import { Hono } from 'hono';
import type { Env } from '../env';
import { requireAuth } from '../auth';
import { rateLimit } from '../ratelimit';
import {
  buildAnalyticsPayload,
  buildStepAnalyticsPayload,
  buildElementReliabilityPayload,
} from './analytics-queries';

type Variables = { userId: string; userEmail?: string };
const analytics = new Hono<{ Bindings: Env; Variables: Variables }>();
const auth = requireAuth();
const readLimit = rateLimit(120, 60_000);

analytics.get('/', auth, readLimit, async (c) => {
  const payload = await buildAnalyticsPayload(
    c.env,
    c.req.query('timeRange'),
    c.req.query('projectId')
  );
  return c.json(payload);
});

// Alias for dashboard compatibility
analytics.get('/stats', auth, readLimit, async (c) => {
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

analytics.get('/steps', auth, readLimit, async (c) => {
  const payload = await buildStepAnalyticsPayload(
    c.env,
    c.req.query('timeRange'),
    c.req.query('projectId')
  );
  return c.json(payload);
});

analytics.get('/element-reliability', auth, readLimit, async (c) => {
  const payload = await buildElementReliabilityPayload(c.env, c.req.query('projectId'));
  return c.json(payload);
});

export { analytics, buildAnalyticsPayload };
