/** Post-execution report and artifact assembly. */

import { generateSRT, buildNarrationTimeline } from './subtitle';
import type { ExecuteInput, StepResult } from './executor-types';
import { uploadFlowArtifacts } from './executor-artifacts';
import { compileVideoFromFrames } from './executor-video';

export interface ReportInput {
  input: ExecuteInput;
  stepResults: StepResult[];
  screenshots: Array<{ stepIndex: number; bytes: Uint8Array }>;
  videoFrames: Array<{ data: string; timestamp: number }>;
  startTime: number;
}

export async function buildReport(ri: ReportInput) {
  const { input, stepResults, screenshots, videoFrames, startTime } = ri;

  let videoBytes: Uint8Array | undefined;
  if (videoFrames.length > 0) {
    videoBytes = await compileVideoFromFrames(videoFrames);
  }

  const duration = Date.now() - startTime;
  const reportJson = {
    runId: input.runId,
    status: 'succeeded',
    runnerVersion: 'puppeteer-0.1',
    duration,
    stepsExecuted: stepResults.length,
    stepsFailed: stepResults.filter((s) => s.status === 'failed').length,
    steps: stepResults,
    params: input.params,
    generatedAt: new Date().toISOString(),
  };

  const narrations = buildNarrationTimeline(
    input.flowDefinition.steps.map((s) => ({
      type: s.type as string,
      narrate: (s as any).narrate as string | undefined,
    }))
  );
  const subtitlesSrt = generateSRT(narrations);

  let uploadedArtifacts;
  if (input.r2Bucket && input.orgId && input.projectId) {
    uploadedArtifacts = await uploadFlowArtifacts(
      input.r2Bucket,
      input.orgId,
      input.projectId,
      input.runId,
      {
        report: JSON.stringify(reportJson),
        subtitles: subtitlesSrt,
        screenshots,
        video: videoBytes,
      }
    );
  }

  return { reportJson, subtitlesSrt, videoBytes, screenshots, artifacts: uploadedArtifacts };
}
