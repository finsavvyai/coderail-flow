/**
 * Run execution route handlers.
 */

import { Hono } from 'hono';
import type { Env } from '../env';
import { q, q1 } from '../db';
import { uuid } from '../ids';
import { requireAuth } from '../auth';
import { rateLimit } from '../ratelimit';
import { enqueueRunExecution } from '../runner';
import { CreateRunSchema } from '../schemas';
import { getWorkflowStatus } from '../workflow_client';
import { validationErrorHandler } from '../middleware/validation';

type Variables = { userId: string; userEmail?: string };
const runs = new Hono<{ Bindings: Env; Variables: Variables }>();
const auth = requireAuth();
const readLimit = rateLimit(120, 60_000);
const writeLimit = rateLimit(30, 60_000);

runs.use('*', validationErrorHandler);

runs.post('/', auth, writeLimit, async (c) => {
  const env = c.env;
  const body = CreateRunSchema.parse(await c.req.json());

  const isTestRun = body.flowId === 'test' && body.definition;
  const now = new Date().toISOString();

  let flowId = body.flowId;
  let flowVersion = 1;

  if (isTestRun) {
    // Create a temporary flow for the test run to satisfy FK constraint
    const tempFlowId = `test-${uuid()}`;
    const projectId = body.projectId || 'demo-project';
    await q(
      env,
      `INSERT INTO flow (id, project_id, name, description, status, current_version, created_at)
                 VALUES (?, ?, 'Test Run', 'Ad-hoc test run', 'test', 1, ?)`,
      [tempFlowId, projectId, now]
    );
    await q(
      env,
      `INSERT INTO flow_version (id, flow_id, version, definition, changelog, created_at)
                 VALUES (?, ?, 1, ?, 'Test run', ?)`,
      [uuid(), tempFlowId, JSON.stringify(body.definition), now]
    );
    flowId = tempFlowId;
  } else {
    const flow = await q1<{ id: string; current_version: number }>(
      env,
      'SELECT id, current_version FROM flow WHERE id = ?',
      [body.flowId]
    );
    if (!flow) return c.json({ error: 'flow_not_found' }, 404);
    flowId = flow.id;
    flowVersion = flow.current_version;
  }

  const runId = uuid();
  await q(
    env,
    `INSERT INTO run (id, flow_id, flow_version, status, params, runner_version, created_at)
               VALUES (?, ?, ?, 'queued', ?, 'runner-0.2', ?)`,
    [runId, flowId, flowVersion, JSON.stringify(body.params ?? {}), now]
  );

  const external = c.req.query('external') === 'true';
  if (!external) {
    await enqueueRunExecution(env, c.executionCtx, runId);
  }

  return c.json({ runId });
});

runs.get('/', auth, readLimit, async (c) => {
  const res = await q(
    c.env,
    `
    SELECT r.id, r.flow_id, f.name as flow_name, r.flow_version, r.status, r.started_at, r.finished_at, r.created_at
    FROM run r JOIN flow f ON f.id = r.flow_id ORDER BY r.created_at DESC LIMIT 100
  `
  );
  return c.json({ runs: res.results ?? [] });
});

runs.get('/:id', auth, readLimit, async (c) => {
  const id = c.req.param('id');
  const run = await q1<any>(
    c.env,
    `SELECT r.*, f.name as flow_name FROM run r JOIN flow f ON f.id = r.flow_id WHERE r.id = ?`,
    [id]
  );
  if (!run) return c.json({ error: 'run_not_found' }, 404);
  const arts = await q(
    c.env,
    'SELECT id, kind, content_type, bytes, created_at FROM artifact WHERE run_id = ? ORDER BY created_at ASC',
    [id]
  );
  return c.json({ run, artifacts: arts.results ?? [] });
});

runs.get('/:id/steps', auth, readLimit, async (c) => {
  const runId = c.req.param('id');
  const steps = await q(
    c.env,
    'SELECT id, idx, type, status, started_at, finished_at, detail FROM run_step WHERE run_id = ? ORDER BY idx ASC',
    [runId]
  );
  return c.json({ steps: steps.results ?? [] });
});

runs.get('/:id/progress', auth, readLimit, async (c) => {
  const runId = c.req.param('id');
  const run = await q1<any>(c.env, 'SELECT id, status FROM run WHERE id = ?', [runId]);
  if (!run) return c.json({ error: 'run_not_found' }, 404);

  if (run.status === 'succeeded' || run.status === 'failed') {
    return c.json({ status: run.status, complete: true });
  }
  return c.json({
    status: run.status,
    complete: false,
    message: 'Use polling to check status. Check /runs/:id for updates.',
  });
});

runs.get('/:id/workflow-status', auth, readLimit, async (c) => {
  const runId = c.req.param('id');
  const run = await q1<any>(c.env, 'SELECT id FROM run WHERE id = ?', [runId]);
  if (!run) return c.json({ error: 'run_not_found' }, 404);

  const status = await getWorkflowStatus(c.env, `flow-${runId}`);
  if (!status) {
    return c.json({
      workflowEnabled: false,
      message: 'Workflow binding not configured or no workflow execution found',
    });
  }
  return c.json({ workflowEnabled: true, status });
});

runs.post('/:id/retry', auth, writeLimit, async (c) => {
  const env = c.env;
  const runId = c.req.param('id');
  const run = await q1<any>(env, 'SELECT * FROM run WHERE id = ?', [runId]);
  if (!run) return c.json({ error: 'run_not_found' }, 404);
  if (run.status !== 'failed') {
    return c.json({ error: 'only_failed_runs_can_be_retried' }, 400);
  }

  await q(env, "UPDATE run SET status='queued', error_code=NULL, error_message=NULL WHERE id=?", [
    runId,
  ]);
  await enqueueRunExecution(env, c.executionCtx, runId);
  return c.json({ success: true, runId });
});

export { runs };
