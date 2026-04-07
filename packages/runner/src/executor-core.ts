/** Core flow execution orchestrator. */

import puppeteer from '@cloudflare/puppeteer';
import { generateSRT, buildNarrationTimeline } from './subtitle';
import type { ExecuteInput, ExecuteOutput, StepResult } from './executor-types';
import { captureOptimizedScreenshot, compileVideoFromFrames } from './executor-video';
import { injectOverlay } from './executor-overlay';
import { uploadFlowArtifacts } from './executor-artifacts';
import { getStepDescription } from './steps-navigation';
import { executeStep } from './executor-dispatch';
import { runHooks, buildBeforeStepPayload, buildAfterStepPayload } from './hook-pipeline';

export async function executeFlow(input: ExecuteInput): Promise<ExecuteOutput> {
  const startTime = Date.now();
  const stepResults: StepResult[] = [];
  const screenshots: Array<{ stepIndex: number; bytes: Uint8Array }> = [];
  let videoBytes: Uint8Array | undefined;

  const browser = await puppeteer.launch(input.browserBinding);
  let page = await browser.newPage();

  await page.setViewport({ width: 1280, height: 720 });
  await injectOverlay(page);

  const cdpSession = await page.target().createCDPSession();
  const videoFrames: Array<{ data: string; timestamp: number }> = [];

  await cdpSession.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 80,
    maxWidth: 1280,
    maxHeight: 720,
    everyNthFrame: 2,
  });

  cdpSession.on('Page.screencastFrame', async (frame) => {
    videoFrames.push({ data: frame.data, timestamp: Date.now() });
    await cdpSession.send('Page.screencastFrameAck', { sessionId: frame.sessionId });
  });

  try {
    const totalSteps = input.flowDefinition.steps.length;

    for (let i = 0; i < totalSteps; i++) {
      const step = input.flowDefinition.steps[i];
      const stepStart = Date.now();

      const description = getStepDescription(step, i);
      if (input.onProgress) {
        await input.onProgress({
          step: i + 1,
          total: totalSteps,
          status: 'executing',
          description,
          type: step.type,
          timestamp: Date.now(),
        });
      }

      try {
        // Run beforeStep hooks
        if (input.hooks?.beforeStep?.length) {
          const hookPayload = buildBeforeStepPayload(
            input.flowId || '', input.runId, step.type, i, step as any
          );
          const hookResult = await runHooks(input.hooks.beforeStep, hookPayload);
          if (hookResult.outcome === 'deny') {
            throw new Error(`Step denied by hook: ${hookResult.messages.join('; ')}`);
          }
        }

        await executeStep(page, step, input, i);

        // Run afterStep hooks (non-blocking)
        if (input.hooks?.afterStep?.length) {
          const hookPayload = buildAfterStepPayload(
            input.flowId || '', input.runId, step.type, i,
            step as any, { status: 'ok' }, false
          );
          await runHooks(input.hooks.afterStep, hookPayload).catch(() => {});
        }

        stepResults.push({
          idx: i,
          type: step.type,
          status: 'ok',
          narrate: (step as any).narrate,
          durationMs: Date.now() - stepStart,
        });

        const screenshot = await captureOptimizedScreenshot(cdpSession);
        screenshots.push({ stepIndex: i, bytes: screenshot });

        if (input.onProgress) {
          await input.onProgress({
            step: i + 1,
            total: totalSteps,
            status: 'completed',
            description,
            type: step.type,
            timestamp: Date.now(),
          });
        }
      } catch (err: any) {
        // Run afterStep hooks on failure (non-blocking)
        if (input.hooks?.afterStep?.length) {
          const hookPayload = buildAfterStepPayload(
            input.flowId || '', input.runId, step.type, i,
            step as any, { error: err.message }, true
          );
          await runHooks(input.hooks.afterStep, hookPayload).catch(() => {});
        }

        stepResults.push({
          idx: i,
          type: step.type,
          status: 'failed',
          errorMessage: err.message,
          narrate: (step as any).narrate,
          durationMs: Date.now() - stepStart,
        });

        try {
          const errorScreenshot = await captureOptimizedScreenshot(cdpSession);
          screenshots.push({ stepIndex: i, bytes: errorScreenshot });
        } catch {}

        if (input.onProgress) {
          await input.onProgress({
            step: i + 1,
            total: totalSteps,
            status: 'failed',
            description: `Failed: ${err.message}`,
            type: step.type,
            timestamp: Date.now(),
          });
        }

        throw err;
      }
    }

    await cdpSession.send('Page.stopScreencast');

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

    return {
      reportJson,
      subtitlesSrt,
      videoBytes,
      screenshots,
      artifacts: uploadedArtifacts,
    };
  } finally {
    await cdpSession.detach().catch(() => {});
    await browser.close();
  }
}
