/**
 * External trigger endpoints — GitLab CI, GitHub Actions, generic webhooks
 * These use API key auth (Bearer crf_...) instead of session-backed user auth
 */
import { Hono } from 'hono';
import type { Env } from './env';
import { q, q1 } from './db';
import { uuid } from './ids';
import { enqueueRunExecution } from './runner';

export function triggerRoutes() {
  const router = new Hono<{ Bindings: Env }>();

  // POST /triggers/run — trigger a flow run via API key
  // Body: { flowId, params? }
  // Auth: Bearer crf_... API key
  router.post('/run', async (c) => {
    const body = await c.req.json<{ flowId: string; params?: Record<string, any> }>();

    if (!body.flowId) return c.json({ error: 'flowId required' }, 400);

    const flow = await q1<{ id: string; current_version: number; name: string }>(
      c.env,
      'SELECT id, current_version, name FROM flow WHERE id = ?',
      [body.flowId]
    );
    if (!flow) return c.json({ error: 'flow_not_found' }, 404);

    const runId = uuid();
    await q(
      c.env,
      `INSERT INTO run (id, flow_id, flow_version, status, params, runner_version, created_at)
       VALUES (?, ?, ?, 'queued', ?, 'runner-0.2', ?)`,
      [
        runId,
        body.flowId,
        flow.current_version,
        JSON.stringify(body.params ?? {}),
        new Date().toISOString(),
      ]
    );

    await enqueueRunExecution(c.env, c.executionCtx, runId);

    return c.json({ runId, flowId: body.flowId, flowName: flow.name, status: 'queued' });
  });

  // POST /triggers/gitlab — GitLab webhook receiver
  // Triggers a flow when a pipeline/push event is received
  router.post('/gitlab', async (c) => {
    const gitlabToken = c.req.header('X-Gitlab-Token');
    const body = await c.req.json<any>();

    // Look up integration by token
    const { results } = await q(
      c.env,
      "SELECT * FROM integration WHERE type = 'gitlab' AND enabled = 1"
    );

    let matchedIntegration: any = null;
    for (const integ of (results || []) as any[]) {
      const config = JSON.parse(integ.config || '{}');
      if (config.secret_token && config.secret_token === gitlabToken) {
        matchedIntegration = { ...integ, config };
        break;
      }
    }

    if (!matchedIntegration) {
      return c.json({ error: 'invalid_token' }, 401);
    }

    const flowId = matchedIntegration.config.trigger_flow_id;
    if (!flowId) return c.json({ ok: true, message: 'no trigger_flow_id configured' });

    const flow = await q1<{ id: string; current_version: number }>(
      c.env,
      'SELECT id, current_version FROM flow WHERE id = ?',
      [flowId]
    );
    if (!flow) return c.json({ error: 'flow_not_found' }, 404);

    const runId = uuid();
    const params = {
      _trigger: 'gitlab',
      _event: body.object_kind || 'push',
      _ref: body.ref || '',
      _project: body.project?.name || '',
    };

    await q(
      c.env,
      `INSERT INTO run (id, flow_id, flow_version, status, params, runner_version, created_at)
       VALUES (?, ?, ?, 'queued', ?, 'runner-0.2', ?)`,
      [runId, flowId, flow.current_version, JSON.stringify(params), new Date().toISOString()]
    );

    await enqueueRunExecution(c.env, c.executionCtx, runId);

    return c.json({ ok: true, runId });
  });

  // POST /triggers/github — GitHub webhook receiver
  router.post('/github', async (c) => {
    const githubEvent = c.req.header('X-GitHub-Event');
    const body = await c.req.json<any>();

    // Look up integration by matching repo
    const { results } = await q(
      c.env,
      "SELECT * FROM integration WHERE type = 'github' AND enabled = 1"
    );

    let matchedIntegration: any = null;
    const repoFullName = body.repository?.full_name;
    for (const integ of (results || []) as any[]) {
      const config = JSON.parse(integ.config || '{}');
      if (config.repo === repoFullName || !config.repo) {
        matchedIntegration = { ...integ, config };
        break;
      }
    }

    if (!matchedIntegration) {
      return c.json({ ok: true, message: 'no matching integration' });
    }

    const flowId = matchedIntegration.config.trigger_flow_id;
    if (!flowId) return c.json({ ok: true, message: 'no trigger_flow_id configured' });

    const flow = await q1<{ id: string; current_version: number }>(
      c.env,
      'SELECT id, current_version FROM flow WHERE id = ?',
      [flowId]
    );
    if (!flow) return c.json({ error: 'flow_not_found' }, 404);

    const runId = uuid();
    const params = {
      _trigger: 'github',
      _event: githubEvent || 'push',
      _ref: body.ref || '',
      _repo: repoFullName || '',
    };

    await q(
      c.env,
      `INSERT INTO run (id, flow_id, flow_version, status, params, runner_version, created_at)
       VALUES (?, ?, ?, 'queued', ?, 'runner-0.2', ?)`,
      [runId, flowId, flow.current_version, JSON.stringify(params), new Date().toISOString()]
    );

    await enqueueRunExecution(c.env, c.executionCtx, runId);

    return c.json({ ok: true, runId });
  });

  return router;
}
