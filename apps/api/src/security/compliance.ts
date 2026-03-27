import { Hono } from 'hono';
import type { Env } from '../env';
import {
  parseBoolean,
  toNumber,
  exportOrgData,
  deleteOrgData,
  applyRetentionPolicy,
} from './compliance-data';

type Variables = { userId: string; userEmail?: string };

export function complianceRoutes() {
  const router = new Hono<{ Bindings: Env; Variables: Variables }>();

  router.get('/export', async (c) => {
    const orgId = c.req.query('orgId');
    if (!orgId) return c.json({ error: 'orgId_required' }, 400);

    const payload = await exportOrgData(c.env, orgId);
    return c.json({ export: payload });
  });

  router.post('/orgs/:orgId/delete', async (c) => {
    const orgId = c.req.param('orgId');
    const body = await c.req.json<{ dryRun?: boolean }>().catch((): { dryRun?: boolean } => ({}));
    const dryRun = parseBoolean(body?.dryRun, true);

    const result = await deleteOrgData(c.env, orgId, dryRun);
    return c.json({ dryRun, result });
  });

  router.post('/retention/apply', async (c) => {
    const body = await c.req
      .json<{ days?: number; dryRun?: boolean }>()
      .catch((): { days?: number; dryRun?: boolean } => ({}));
    const daysFromEnv = toNumber(c.env.DATA_RETENTION_DAYS, 90);
    const days = toNumber(body.days, daysFromEnv);
    const dryRun = parseBoolean(body.dryRun, true);

    const result = await applyRetentionPolicy(c.env, days, dryRun);
    return c.json({ retention: result });
  });

  return router;
}
