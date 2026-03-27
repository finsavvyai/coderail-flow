import type { Env } from './env';

export type FlowWorkflowParams = {
  runId: string;
  flowId: string;
  projectId: string;
  orgId: string;
  params: Record<string, any>;
};

export type FlowWorkflowState = {
  status: 'pending' | 'running' | 'succeeded' | 'failed';
  currentStep: number;
  totalSteps: number;
  error?: string;
};

export async function startFlowWorkflow(
  env: Env,
  params: FlowWorkflowParams
): Promise<{ instanceId: string } | null> {
  const workflow = (env as any).FLOW_WORKFLOW as any;
  if (!workflow) return null;

  const instance = await workflow.create({
    id: `flow-${params.runId}`,
    params,
  });

  return { instanceId: instance.id };
}

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
