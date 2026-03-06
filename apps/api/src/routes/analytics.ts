/**
 * Analytics route handlers and query builders.
 */

import { Hono } from 'hono';
import type { Env } from '../env';
import { q } from '../db';
import { requireAuth } from '../auth';
import { rateLimit } from '../ratelimit';
import { listAuditLogs } from '../security/audit-log';
import { toNumber, normalizeTimeRangeToDays } from './helpers';

type Variables = { userId: string; userEmail?: string };
const analytics = new Hono<{ Bindings: Env; Variables: Variables }>();
const auth = requireAuth();
const readLimit = rateLimit(120, 60_000);

async function buildStepAnalyticsPayload(env: Env, timeRange?: string, projectId?: string) {
  const days = normalizeTimeRangeToDays(timeRange);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  let whereClause = 'WHERE r.created_at >= ?';
  const params: any[] = [since];
  if (projectId) {
    whereClause += ' AND f.project_id = ?';
    params.push(projectId);
  }

  const byType = await q(
    env,
    `
    SELECT rs.type as type, COUNT(*) as count,
      SUM(CASE WHEN rs.status = 'failed' THEN 1 ELSE 0 END) as failed,
      AVG(COALESCE(CAST(json_extract(rs.detail, '$.durationMs') AS REAL), 0)) as avg_duration
    FROM run_step rs JOIN run r ON r.id = rs.run_id JOIN flow f ON f.id = r.flow_id
    ${whereClause} GROUP BY rs.type ORDER BY count DESC
  `,
    params
  );

  const slowestTypes = await q(
    env,
    `
    SELECT rs.type as type,
      AVG(COALESCE(CAST(json_extract(rs.detail, '$.durationMs') AS REAL), 0)) as avg_duration,
      COUNT(*) as samples
    FROM run_step rs JOIN run r ON r.id = rs.run_id JOIN flow f ON f.id = r.flow_id
    ${whereClause} GROUP BY rs.type HAVING samples >= 2 ORDER BY avg_duration DESC LIMIT 5
  `,
    params
  );

  return {
    byType: ((byType.results ?? []) as any[]).map((row) => ({
      type: String(row.type),
      count: toNumber(row.count),
      failed: toNumber(row.failed),
      avgDurationMs: Math.round(toNumber(row.avg_duration)),
    })),
    slowestTypes: ((slowestTypes.results ?? []) as any[]).map((row) => ({
      type: String(row.type),
      avgDurationMs: Math.round(toNumber(row.avg_duration)),
      samples: toNumber(row.samples),
    })),
  };
}

async function buildElementReliabilityPayload(env: Env, projectId?: string) {
  let whereClause = '';
  const params: any[] = [];
  if (projectId) {
    whereClause = 'WHERE s.project_id = ?';
    params.push(projectId);
  }

  const summary = await q(
    env,
    `
    SELECT
      SUM(CASE WHEN COALESCE(e.reliability_score, 0) >= 0.8 THEN 1 ELSE 0 END) as high,
      SUM(CASE WHEN COALESCE(e.reliability_score, 0) >= 0.5 AND COALESCE(e.reliability_score, 0) < 0.8 THEN 1 ELSE 0 END) as medium,
      SUM(CASE WHEN COALESCE(e.reliability_score, 0) < 0.5 THEN 1 ELSE 0 END) as low
    FROM element e JOIN screen s ON s.id = e.screen_id ${whereClause}
  `,
    params
  );

  const lowest = await q(
    env,
    `
    SELECT e.id as elementId, e.name as name, e.reliability_score as reliabilityScore, e.screen_id as screenId
    FROM element e JOIN screen s ON s.id = e.screen_id ${whereClause}
    ORDER BY COALESCE(e.reliability_score, 0) ASC LIMIT 10
  `,
    params
  );

  const row = (summary.results?.[0] as any) ?? {};
  return {
    summary: { high: toNumber(row.high), medium: toNumber(row.medium), low: toNumber(row.low) },
    lowest: ((lowest.results ?? []) as any[]).map((item) => ({
      elementId: String(item.elementId),
      name: String(item.name),
      reliabilityScore: toNumber(item.reliabilityScore),
      screenId: String(item.screenId),
    })),
  };
}

async function buildAnalyticsPayload(env: Env, timeRange?: string, projectId?: string) {
  const days = normalizeTimeRangeToDays(timeRange);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  let whereClause = 'WHERE r.created_at >= ?';
  const params: any[] = [since];
  if (projectId) {
    whereClause += ' AND f.project_id = ?';
    params.push(projectId);
  }

  const summary = await q(
    env,
    `
    SELECT COUNT(*) as total,
      SUM(CASE WHEN r.status = 'succeeded' THEN 1 ELSE 0 END) as succeeded,
      SUM(CASE WHEN r.status = 'failed' THEN 1 ELSE 0 END) as failed,
      AVG(CASE WHEN r.started_at IS NOT NULL AND r.finished_at IS NOT NULL
        THEN (julianday(r.finished_at) - julianday(r.started_at)) * 86400000 ELSE NULL END) as avg_duration
    FROM run r JOIN flow f ON f.id = r.flow_id ${whereClause}
  `,
    params
  );

  const byDay = await q(
    env,
    `
    SELECT SUBSTR(r.created_at, 1, 10) as date, COUNT(*) as count,
      SUM(CASE WHEN r.status = 'succeeded' THEN 1 ELSE 0 END) as succeeded,
      SUM(CASE WHEN r.status = 'failed' THEN 1 ELSE 0 END) as failed
    FROM run r JOIN flow f ON f.id = r.flow_id ${whereClause}
    GROUP BY SUBSTR(r.created_at, 1, 10) ORDER BY date ASC
  `,
    params
  );

  const byFlow = await q(
    env,
    `
    SELECT r.flow_id as flowId, f.name as flowName, COUNT(*) as count,
      ROUND(100.0 * SUM(CASE WHEN r.status = 'succeeded' THEN 1 ELSE 0 END) / COUNT(*), 1) as successRate
    FROM run r JOIN flow f ON f.id = r.flow_id ${whereClause}
    GROUP BY r.flow_id, f.name ORDER BY count DESC LIMIT 5
  `,
    params
  );

  const row = (summary.results?.[0] as any) ?? {};
  return {
    total: toNumber(row.total),
    succeeded: toNumber(row.succeeded),
    failed: toNumber(row.failed),
    avgDuration: Math.round(toNumber(row.avg_duration)),
    byDay: ((byDay.results ?? []) as any[]).map((d) => ({
      date: String(d.date),
      count: toNumber(d.count),
      succeeded: toNumber(d.succeeded),
      failed: toNumber(d.failed),
    })),
    byFlow: ((byFlow.results ?? []) as any[]).map((f) => ({
      flowId: String(f.flowId),
      flowName: String(f.flowName),
      count: toNumber(f.count),
      successRate: toNumber(f.successRate),
    })),
  };
}

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
    runs_by_flow: payload.byFlow.map(f => ({
      flow_name: f.flowName,
      count: f.count,
    })),
    runs_over_time: payload.byDay.map(d => ({
      date: d.date,
      count: d.count,
    })),
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
