/** Core flow execution orchestrator. */

import puppeteer from '@cloudflare/puppeteer';
import type { ExecuteInput, ExecuteOutput, StepResult } from './executor-types';
import { captureOptimizedScreenshot } from './executor-video';
import { injectOverlay } from './executor-overlay';
import { getStepDescription } from './steps-navigation';
import { executeStep } from './executor-dispatch';
import { runHooks, buildBeforeStepPayload, buildAfterStepPayload } from './hook-pipeline';
import { buildReport } from './executor-report';

export async function executeFlow(input: ExecuteInput): Promise<ExecuteOutput> {
  const startTime = Date.now();
  const stepResults: StepResult[] = [];
  const screenshots: Array<{ stepIndex: number; bytes: Uint8Array }> = [];

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

  cdpSession.on('Page.screencastFrame', (frame) => {
    videoFrames.push({ data: frame.data, timestamp: Date.now() });
    void cdpSession.send('Page.screencastFrameAck', { sessionId: frame.sessionId });
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
        if (input.hooks?.beforeStep?.length) {
          const hookPayload = buildBeforeStepPayload(
            input.flowId || '',
            input.runId,
            step.type,
            i,
            step as any
          );
          const hookResult = await runHooks(input.hooks.beforeStep, hookPayload);
          if (hookResult.outcome === 'deny') {
            throw new Error(`Step denied by hook: ${hookResult.messages.join('; ')}`);
          }
        }

        await executeStep(page, step, input, i);

        if (input.hooks?.afterStep?.length) {
          const hookPayload = buildAfterStepPayload(
            input.flowId || '',
            input.runId,
            step.type,
            i,
            step as any,
            { status: 'ok' },
            false
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
        if (input.hooks?.afterStep?.length) {
          const hookPayload = buildAfterStepPayload(
            input.flowId || '',
            input.runId,
            step.type,
            i,
            step as any,
            { error: err.message },
            true
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
        } catch {
          /* screenshot capture may fail */
        }

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

    return await buildReport({ input, stepResults, screenshots, videoFrames, startTime });
  } finally {
    await cdpSession.detach().catch(() => {});
    await browser.close();
  }
}
