/**
 * Cloudflare Workflows for Durable Flow Execution
 *
 * Workflows provide:
 * - Automatic retries on failure
 * - State persistence across steps
 * - Long-running execution (up to 15 minutes)
 * - Progress tracking
 */

import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from 'cloudflare:workers';
import type { Env } from './env';
import { runFlow } from './runner';

export interface FlowWorkflowParams {
  runId: string;
  flowId: string;
  projectId: string;
  orgId: string;
  params: Record<string, string>;
}

export interface FlowWorkflowState {
  status: 'pending' | 'running' | 'succeeded' | 'failed';
  currentStep: number;
  totalSteps: number;
  error?: string;
}

export class FlowExecutionWorkflow extends WorkflowEntrypoint<Env, FlowWorkflowParams> {
  async run(
    event: WorkflowEvent<FlowWorkflowParams>,
    step: WorkflowStep
  ): Promise<FlowWorkflowState> {
    const { runId } = event.payload;

    // Step 1: mark run as running for visibility
    await step.do('update-status-running', async (): Promise<boolean> => {
      await this.env.DB.prepare('UPDATE run SET status = ?, started_at = ? WHERE id = ?')
        .bind('running', new Date().toISOString(), runId)
        .run();
      return true;
    });

    // Step 2: execute run with workflow-managed retries and timeout
    await step.do(
      'execute-flow',
      {
        retries: { limit: 2, delay: '5 seconds', backoff: 'exponential' },
        timeout: '15 minutes',
      },
      async (): Promise<boolean> => {
        await runFlow(this.env, runId);
        return true;
      }
    );

    // Step 3: return persisted status from DB
    const runRow = await step.do(
      'read-final-status',
      async (): Promise<{ status: string; stepCount: number }> => {
        const run = await this.env.DB.prepare('SELECT status FROM run WHERE id = ?')
          .bind(runId)
          .first<{ status: string }>();
        const stepCount = await this.env.DB.prepare(
          'SELECT COUNT(*) as cnt FROM run_step WHERE run_id = ?'
        )
          .bind(runId)
          .first<{ cnt: number }>();
        return { status: run?.status || 'failed', stepCount: Number(stepCount?.cnt || 0) };
      }
    );

    return {
      status: runRow.status === 'succeeded' ? 'succeeded' : 'failed',
      currentStep: runRow.stepCount,
      totalSteps: runRow.stepCount,
    };
  }
}

/**
 * Helper to start a workflow execution
 */
export async function startFlowWorkflow(
  env: Env,
  params: FlowWorkflowParams
): Promise<{ instanceId: string }> {
  // Workflows binding would be configured in wrangler.toml
  const workflow = (env as any).FLOW_WORKFLOW as any;

  if (!workflow) {
    throw new Error('Workflow binding not configured');
  }

  const instance = await workflow.create({
    id: `flow-${params.runId}`,
    params,
  });

  return { instanceId: instance.id };
}

/**
 * Get workflow status
 */
export async function getWorkflowStatus(
  env: Env,
  instanceId: string
): Promise<FlowWorkflowState | null> {
  const workflow = (env as any).FLOW_WORKFLOW as any;

  if (!workflow) return null;

  try {
    const instance = await workflow.get(instanceId);
    const status = await instance.status();
    return status.output || { status: status.status, currentStep: 0, totalSteps: 0 };
  } catch {
    return null;
  }
}
