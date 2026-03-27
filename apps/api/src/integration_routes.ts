/**
 * Integration CRUD routes and delivery log endpoint.
 */
import { Hono } from 'hono';
import type { Env } from './env';
import { q, q1 } from './db';
import { uuid } from './ids';
import type { Integration } from './integration_types';
import {
  VALID_INTEGRATION_TYPES,
  decryptIntegrationConfig,
  encryptIntegrationConfig,
} from './integration_types';
import { deliverIntegration } from './webhook_delivery';
import type { RunEvent } from './integration_types';

export function integrationRoutes() {
  type Variables = { userId: string };
  const router = new Hono<{ Bindings: Env; Variables: Variables }>();

  // List integrations for a project
  router.get('/', async (c) => {
    const projectId = c.req.query('projectId');
    if (!projectId) return c.json({ error: 'projectId required' }, 400);

    const { results } = await q(
      c.env,
      'SELECT * FROM integration WHERE project_id = ? ORDER BY created_at DESC',
      [projectId]
    );
    const integrations = await Promise.all(
      (results || []).map(async (r: any) => ({
        ...r,
        config: await decryptIntegrationConfig(c.env, r.config || '{}'),
      }))
    );
    return c.json({ integrations });
  });

  // Create integration
  router.post('/', async (c) => {
    const body = await c.req.json<{
      projectId: string;
      type: string;
      name: string;
      config: Record<string, any>;
    }>();

    if (!body.projectId || !body.type || !body.name) {
      return c.json({ error: 'projectId, type, and name required' }, 400);
    }

    if (!VALID_INTEGRATION_TYPES.includes(body.type as any)) {
      return c.json(
        { error: `Invalid type. Must be one of: ${VALID_INTEGRATION_TYPES.join(', ')}` },
        400
      );
    }

    const id = uuid();
    const now = new Date().toISOString();
    const encryptedConfig = await encryptIntegrationConfig(c.env, body.config || {});
    await q(
      c.env,
      `INSERT INTO integration (id, project_id, type, name, config, enabled, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
      [id, body.projectId, body.type, body.name, encryptedConfig, now, now]
    );

    return c.json({
      integration: {
        id,
        project_id: body.projectId,
        type: body.type,
        name: body.name,
        config: body.config || {},
        enabled: 1,
      },
    });
  });

  // Update integration
  router.put('/:id', async (c) => {
    const id = c.req.param('id');
    const body = await c.req.json<{
      name?: string;
      config?: Record<string, any>;
      enabled?: boolean;
    }>();

    const updates: string[] = ['updated_at = ?'];
    const params: any[] = [new Date().toISOString()];

    if (body.name !== undefined) {
      updates.push('name = ?');
      params.push(body.name);
    }
    if (body.config !== undefined) {
      updates.push('config = ?');
      params.push(await encryptIntegrationConfig(c.env, body.config));
    }
    if (body.enabled !== undefined) {
      updates.push('enabled = ?');
      params.push(body.enabled ? 1 : 0);
    }

    params.push(id);
    await q(c.env, `UPDATE integration SET ${updates.join(', ')} WHERE id = ?`, params);

    const integration = await q1<any>(c.env, 'SELECT * FROM integration WHERE id = ?', [id]);
    const decryptedConfig = integration
      ? await decryptIntegrationConfig(c.env, integration.config || '{}')
      : null;
    return c.json({
      integration: integration ? { ...integration, config: decryptedConfig } : null,
    });
  });

  // Delete integration
  router.delete('/:id', async (c) => {
    const id = c.req.param('id');
    await q(c.env, 'DELETE FROM webhook_delivery WHERE integration_id = ?', [id]);
    await q(c.env, 'DELETE FROM integration WHERE id = ?', [id]);
    return c.json({ ok: true });
  });

  // Test integration (send a test event)
  router.post('/:id/test', async (c) => {
    const id = c.req.param('id');
    const integration = await q1<Integration>(c.env, 'SELECT * FROM integration WHERE id = ?', [
      id,
    ]);
    if (!integration) return c.json({ error: 'not_found' }, 404);

    const testEvent: RunEvent = {
      runId: 'test-' + uuid().slice(0, 8),
      flowId: 'test-flow',
      flowName: 'Test Flow',
      status: 'succeeded',
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      artifactCount: 3,
    };

    const config = await decryptIntegrationConfig(c.env, integration.config || '{}');
    await deliverIntegration(c.env, integration, config, 'run.completed', testEvent);
    return c.json({ ok: true, message: 'Test event sent' });
  });

  // Get delivery log for an integration
  router.get('/:id/deliveries', async (c) => {
    const id = c.req.param('id');
    const { results } = await q(
      c.env,
      'SELECT * FROM webhook_delivery WHERE integration_id = ? ORDER BY attempted_at DESC LIMIT 50',
      [id]
    );
    return c.json({ deliveries: results || [] });
  });

  return router;
}
