import type { Env } from './env';
import { q, q1 } from './db';
import type { ExecuteInput } from '@coderail-flow/runner';
import { readAuthProfilePayloadFromRow } from './auth_profiles';
import { deliverWebhooks } from './integrations';
import { loadElementsForFlow, loadScreensForFlow } from './runner_data_loaders';
import { persistRunSteps, storeArtifacts } from './runner_artifacts';
import type { RunEvent } from './integration_types';

/**
 * Real flow runner using Browser Rendering + Puppeteer.
 * Called from runner.ts when APP_ENV === "production".
 */
export async function runFlowReal(env: Env, runId: string) {
  const run = await q1<any>(env, 'SELECT * FROM run WHERE id = ?', [runId]);
  if (!run) throw new Error('run not found');

  const started = new Date().toISOString();
  await q(env, "UPDATE run SET status='running', started_at=? WHERE id=?", [started, runId]);

  try {
    const flow = await q1<any>(
      env,
      `SELECT f.*, fv.definition, p.base_url, p.org_id
       FROM flow f
       JOIN flow_version fv ON fv.flow_id = f.id AND fv.version = ?
       JOIN project p ON p.id = f.project_id
       WHERE f.id = ?`,
      [run.flow_version, run.flow_id]
    );

    if (!flow) throw new Error('Flow not found');

    const flowDefinition = JSON.parse(flow.definition);

    const elementIds = extractIds(flowDefinition.steps, 'elementId');
    const elements = await loadElementsForFlow(env, flow.project_id, elementIds);

    const screenIds = extractIds(flowDefinition.steps, 'screenId');
    const screens = await loadScreensForFlow(env, flow.project_id, screenIds);

    const params = JSON.parse(run.params || '{}');

    const authCookies = await loadAuthCookies(env, flow.auth_profile_id);

    const executeInput: ExecuteInput = {
      browserBinding: env.BROWSER,
      baseUrl: flow.base_url,
      flowDefinition,
      params,
      elements,
      screens,
      r2Bucket: env.ARTIFACTS,
      orgId: flow.org_id,
      projectId: flow.project_id,
      runId,
    };

    if (authCookies.length > 0) {
      executeInput.flowDefinition.steps = [
        { type: 'setCookies', cookies: authCookies } as any,
        ...executeInput.flowDefinition.steps,
      ];
    }

    // Lazy import to reduce cold-start parse/load work for non-run requests
    const { executeFlow } = await import('@coderail-flow/runner');
    const result = await executeFlow(executeInput);

    await persistRunSteps(env, runId, result.reportJson);
    await storeArtifacts(env, runId, result);

    const finished = new Date().toISOString();
    await q(env, "UPDATE run SET status='succeeded', finished_at=? WHERE id=?", [finished, runId]);

    await deliverWebhooksSafe(env, 'run.completed', {
      runId,
      flowId: run.flow_id,
      flowName: flow.name || run.flow_id,
      status: 'succeeded',
      startedAt: started,
      finishedAt: finished,
      artifactCount: await countArtifacts(env, runId),
    });
  } catch (err: any) {
    const finished = new Date().toISOString();
    await q(
      env,
      "UPDATE run SET status='failed', finished_at=?, error_code=?, error_message=? WHERE id=?",
      [finished, 'EXECUTION_ERROR', err.message || 'Unknown error', runId]
    );

    await deliverWebhooksSafe(env, 'run.failed', {
      runId,
      flowId: run.flow_id,
      flowName: run.flow_id,
      status: 'failed',
      startedAt: started,
      finishedAt: finished,
      errorMessage: err.message || 'Unknown error',
    });

    throw err;
  }
}

function extractIds(steps: any[], key: string): string[] {
  const ids = new Set<string>();
  for (const step of steps) {
    if (step[key]) ids.add(step[key]);
  }
  return Array.from(ids);
}

async function loadAuthCookies(env: Env, authProfileId?: string): Promise<any[]> {
  if (!authProfileId) return [];
  const authProfile = await q1<any>(env, 'SELECT * FROM auth_profile WHERE id = ?', [
    authProfileId,
  ]);
  if (!authProfile) {
    throw new Error(`Auth profile not found: ${authProfileId}`);
  }
  const authPayload = await readAuthProfilePayloadFromRow(authProfile, env);
  return Array.isArray(authPayload.cookies) ? authPayload.cookies : [];
}

async function countArtifacts(env: Env, runId: string): Promise<number> {
  const result = await q(env, 'SELECT COUNT(*) as cnt FROM artifact WHERE run_id = ?', [runId]);
  return (result.results?.[0] as any)?.cnt || 0;
}

async function deliverWebhooksSafe(env: Env, event: string, payload: RunEvent): Promise<void> {
  try {
    await deliverWebhooks(env, event, payload);
  } catch (_e) {
    /* don't fail the run if webhooks fail */
  }
}
