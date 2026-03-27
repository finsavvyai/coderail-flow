import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./db.js', () => ({ q: vi.fn(), q1: vi.fn() }));
vi.mock('./runner_stub.js', () => ({ runFlowStub: vi.fn().mockResolvedValue(undefined) }));
vi.mock('./runner_execution.js', () => ({ runFlowReal: vi.fn().mockResolvedValue(undefined) }));
vi.mock('./workflow_client.js', () => ({
  startFlowWorkflow: vi.fn().mockResolvedValue({ instanceId: 'wf-1' }),
}));

import { q, q1 } from './db.js';
import { runFlowStub } from './runner_stub.js';
import { runFlowReal } from './runner_execution.js';
import { startFlowWorkflow } from './workflow_client.js';
import { enqueueRunExecution, runFlow } from './runner.js';

const mockQ = vi.mocked(q);
const mockQ1 = vi.mocked(q1);
const mockRunFlowStub = vi.mocked(runFlowStub);
const mockRunFlowReal = vi.mocked(runFlowReal);
const mockStartFlowWorkflow = vi.mocked(startFlowWorkflow);

describe('runner environment dispatch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses workflow-backed execution in staging when configured', async () => {
    mockQ1.mockResolvedValueOnce({
      flow_id: 'flow-1',
      project_id: 'project-1',
      org_id: 'org-1',
      params: '{"key":"value"}',
    } as any);
    mockQ.mockResolvedValueOnce({ results: [] } as any);

    const waitUntil = vi.fn();
    await enqueueRunExecution(
      {
        APP_ENV: 'staging',
        FLOW_WORKFLOW: {},
      } as any,
      { waitUntil },
      'run-1'
    );

    expect(mockStartFlowWorkflow).toHaveBeenCalledWith(
      expect.objectContaining({ APP_ENV: 'staging' }),
      expect.objectContaining({
        runId: 'run-1',
        flowId: 'flow-1',
        projectId: 'project-1',
        orgId: 'org-1',
        params: { key: 'value' },
      })
    );
    expect(waitUntil).not.toHaveBeenCalled();
  });

  it('uses the dev stub outside production-like environments', async () => {
    await runFlow({ APP_ENV: 'development' } as any, 'run-1');

    expect(mockRunFlowStub).toHaveBeenCalledWith(
      expect.objectContaining({ APP_ENV: 'development' }),
      'run-1'
    );
    expect(mockRunFlowReal).not.toHaveBeenCalled();
  });

  it('uses the real runner in staging', async () => {
    await runFlow({ APP_ENV: 'staging' } as any, 'run-1');

    expect(mockRunFlowReal).toHaveBeenCalledWith(
      expect.objectContaining({ APP_ENV: 'staging' }),
      'run-1'
    );
    expect(mockRunFlowStub).not.toHaveBeenCalled();
  });
});
