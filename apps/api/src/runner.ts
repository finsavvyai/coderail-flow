import type { Env } from './env';
import { q, q1 } from './db';
import { runFlowStub } from './runner_stub';
import { startFlowWorkflow } from './workflow_client';
import { runFlowReal } from './runner_execution';
import { isProductionLikeEnv } from './runtime-config';

type WaitUntilContext = {
  waitUntil: (promise: Promise<unknown>) => void;
};

/**
 * Enqueue a run for execution. Attempts to use Cloudflare Workflows
 * in production-like environments; falls back to direct execution via waitUntil.
 */
export async function enqueueRunExecution(
  env: Env,
  executionCtx: WaitUntilContext,
  runId: string
): Promise<void> {
  if (isProductionLikeEnv(env.APP_ENV) && (env as any).FLOW_WORKFLOW) {
    const runWithContext = await q1<any>(
      env,
      `SELECT r.id as run_id, r.flow_id, r.params, f.project_id, p.org_id
       FROM run r
       JOIN flow f ON f.id = r.flow_id
       JOIN project p ON p.id = f.project_id
       WHERE r.id = ?`,
      [runId]
    );

    if (runWithContext) {
      try {
        const started = await startFlowWorkflow(env, {
          runId,
          flowId: runWithContext.flow_id,
          projectId: runWithContext.project_id,
          orgId: runWithContext.org_id,
          params: JSON.parse(runWithContext.params || '{}'),
        });

        if (started?.instanceId) {
          await q(env, "UPDATE run SET status='running', started_at=? WHERE id=?", [
            new Date().toISOString(),
            runId,
          ]);
          return;
        }
      } catch {
        // Fallback to direct execution below
      }
    }
  }

  executionCtx.waitUntil(runFlow(env, runId));
}

/**
 * Dispatch to the real runner in production-like environments, or the stub in dev/test.
 */
export async function runFlow(env: Env, runId: string) {
  if (!isProductionLikeEnv(env.APP_ENV)) {
    return runFlowStub(env, runId);
  }
  return runFlowReal(env, runId);
}
