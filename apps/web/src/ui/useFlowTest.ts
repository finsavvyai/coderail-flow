import { useState, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { apiUrl, getApiToken } from './api-core';

export type FlowTestStatus = 'idle' | 'running' | 'succeeded' | 'failed';

export interface StepDetail {
  idx: number;
  type: string;
  status: 'running' | 'ok' | 'failed';
  detail?: string;
}

interface UseFlowTestParams {
  projectId: string;
  flowDefinition: any;
  authProfileId?: string;
  stepCount: number;
}

export function useFlowTest({
  projectId,
  flowDefinition,
  authProfileId,
  stepCount,
}: UseFlowTestParams) {
  const [testing, setTesting] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const [status, setStatus] = useState<FlowTestStatus>('idle');
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [stepDetails, setStepDetails] = useState<StepDetail[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  async function pollRunStatus(id: string) {
    try {
      const token = await getApiToken();
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      intervalRef.current = setInterval(
        () =>
          void (async () => {
            try {
              // Fetch run status and steps in parallel
              const [runRes, stepsRes] = await Promise.all([
                fetch(apiUrl(`/runs/${id}`), { headers }),
                fetch(apiUrl(`/runs/${id}/steps`), { headers }),
              ]);

              if (!runRes.ok) {
                stopPolling();
                setStatus('failed');
                setTesting(false);
                return;
              }

              const runData = (await runRes.json()) as {
                run: { status: string; error_message?: string };
              };
              const run = runData.run;

              // Update step details from real DB records
              if (stepsRes.ok) {
                const stepsData = (await stepsRes.json()) as {
                  steps?: Array<{ idx: number; type: string; status: string; detail?: string }>;
                };
                const steps: StepDetail[] = (stepsData.steps || []).map((s: any) => ({
                  idx: s.idx,
                  type: s.type,
                  status: s.status,
                  detail: s.detail,
                }));
                setStepDetails(steps);

                // Current step = number of completed steps
                const completedCount = steps.filter(
                  (s: StepDetail) => s.status === 'ok' || s.status === 'failed'
                ).length;
                setCurrentStep(completedCount);
              }

              if (run.status === 'succeeded') {
                stopPolling();
                setStatus('succeeded');
                setTesting(false);
                setCurrentStep(stepCount);
                toast.success('Flow test completed successfully!');
              } else if (run.status === 'failed') {
                stopPolling();
                setStatus('failed');
                setError(run.error_message || 'Flow test failed');
                setTesting(false);
                toast.error('Flow test failed');
              }
            } catch {
              // Ignore transient fetch errors during polling
            }
          })(),
        1500
      );

      // Safety timeout: stop polling after 2 minutes
      setTimeout(() => stopPolling(), 120000);
    } catch (err: any) {
      setError(err.message || 'Failed to check run status');
      setStatus('failed');
      setTesting(false);
    }
  }

  async function startTest() {
    setTesting(true);
    setStatus('running');
    setCurrentStep(0);
    setTotalSteps(stepCount);
    setError(null);
    setStepDetails([]);

    try {
      const token = await getApiToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(apiUrl('/runs'), {
        method: 'POST',
        headers,
        body: JSON.stringify({
          projectId,
          flowId: 'test',
          flowVersion: 1,
          params: {},
          definition: flowDefinition,
          authProfileId,
        }),
      });

      if (!res.ok) {
        const errData = (await res.json()) as { message?: string };
        throw new Error(errData.message || 'Failed to create test run');
      }

      const data = (await res.json()) as { runId: string };
      setRunId(data.runId);
      void pollRunStatus(data.runId);
    } catch (err: any) {
      setError(err.message || 'Failed to start test');
      setStatus('failed');
      setTesting(false);
      toast.error(err.message || 'Failed to start test');
    }
  }

  function reset() {
    stopPolling();
    setStatus('idle');
    setCurrentStep(0);
    setError(null);
    setStepDetails([]);
  }

  return {
    testing,
    runId,
    status,
    currentStep,
    totalSteps,
    error,
    stepDetails,
    startTest,
    reset,
  };
}
