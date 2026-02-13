/**
 * CodeRail Flow Execution Engine
 *
 * Executes flows using Cloudflare Browser Rendering + Puppeteer.
 * Features:
 * - Locator resolution with fallback chain
 * - Overlay injection (highlights + captions)
 * - Video capture
 * - SRT subtitle generation
 * - R2 artifact upload
 */

import puppeteer from '@cloudflare/puppeteer';
import type { Step } from '@coderail-flow/dsl';
import { resolveElement, locatorToPuppeteerSelector, type ElementData } from './locator';
import { generateSRT, buildNarrationTimeline, type NarrationEntry } from './subtitle';
import { uploadArtifacts, type ArtifactUpload } from './r2';

export type ProgressUpdate = {
  step: number;
  total: number;
  status: 'executing' | 'completed' | 'failed';
  description: string;
  type: string;
  timestamp: number;
};

export type ProgressCallback = (progress: ProgressUpdate) => void | Promise<void>;

export type ExecuteInput = {
  browserBinding: Fetcher; // Cloudflare Browser Rendering binding
  baseUrl: string;
  flowDefinition: {
    params?: Array<{ name: string; type: string; required: boolean }>;
    steps: Step[];
  };
  params: Record<string, any>;
  elements: ElementData[]; // Pre-fetched from database
  screens: Array<{ id: string; url_path: string }>; // Pre-fetched from database
  r2Bucket?: R2Bucket; // Optional R2 for artifact upload
  orgId?: string;
  projectId?: string;
  runId: string;
  onProgress?: ProgressCallback; // Optional progress callback
};

export type ExecuteOutput = {
  reportJson: any;
  subtitlesSrt: string;
  videoBytes?: Uint8Array;
  screenshots: Array<{ stepIndex: number; bytes: Uint8Array }>;
  artifacts?: Array<{ kind: string; r2_key: string; bytes: number; sha256: string }>;
};

export interface StepResult {
  idx: number;
  type: string;
  status: 'ok' | 'failed' | 'skipped';
  elementId?: string;
  elementName?: string;
  errorMessage?: string;
  narrate?: string;
  durationMs: number;
}

/**
 * Execute a flow end-to-end
 */
export async function executeFlow(input: ExecuteInput): Promise<ExecuteOutput> {
  const startTime = Date.now();
  const stepResults: StepResult[] = [];
  const screenshots: Array<{ stepIndex: number; bytes: Uint8Array }> = [];
  let videoBytes: Uint8Array | undefined;

  // Launch browser
  const browser = await puppeteer.launch(input.browserBinding);
  let page = await browser.newPage();

  // Set viewport for consistent video size
  await page.setViewport({ width: 1280, height: 720 });

  // Inject overlay library
  await injectOverlay(page);

  // Start recording (if supported)
  // Note: Puppeteer screencast is experimental; we'll implement basic version
  let recordingFrames: any[] = [];

  try {
    // Execute each step
    const totalSteps = input.flowDefinition.steps.length;

    for (let i = 0; i < totalSteps; i++) {
      const step = input.flowDefinition.steps[i];
      const stepStart = Date.now();

      // Report progress: executing
      const description = getStepDescription(step, i);
      if (input.onProgress) {
        await input.onProgress({
          step: i + 1,
          total: totalSteps,
          status: 'executing',
          description,
          type: step.type,
          timestamp: Date.now()
        });
      }

      try {
        await executeStep(page, step, input, i);

        stepResults.push({
          idx: i,
          type: step.type,
          status: 'ok',
          narrate: (step as any).narrate,
          durationMs: Date.now() - stepStart
        });

        // Take screenshot after each step
        const screenshot = await page.screenshot({ type: 'png' });
        screenshots.push({ stepIndex: i, bytes: new Uint8Array(screenshot) });

        // Report progress: completed
        if (input.onProgress) {
          await input.onProgress({
            step: i + 1,
            total: totalSteps,
            status: 'completed',
            description,
            type: step.type,
            timestamp: Date.now()
          });
        }

      } catch (err: any) {
        stepResults.push({
          idx: i,
          type: step.type,
          status: 'failed',
          errorMessage: err.message,
          narrate: (step as any).narrate,
          durationMs: Date.now() - stepStart
        });

        // Take error screenshot
        try {
          const errorScreenshot = await page.screenshot({ type: 'png' });
          screenshots.push({ stepIndex: i, bytes: new Uint8Array(errorScreenshot) });
        } catch {}

        // Report progress: failed
        if (input.onProgress) {
          await input.onProgress({
            step: i + 1,
            total: totalSteps,
            status: 'failed',
            description: `Failed: ${err.message}`,
            type: step.type,
            timestamp: Date.now()
          });
        }

        throw err; // Re-throw to fail the run
      }
    }

    // Generate report
    const duration = Date.now() - startTime;
    const reportJson = {
      runId: input.runId,
      status: 'succeeded',
      runnerVersion: 'puppeteer-0.1',
      duration,
      stepsExecuted: stepResults.length,
      stepsFailed: stepResults.filter(s => s.status === 'failed').length,
      steps: stepResults,
      params: input.params,
      generatedAt: new Date().toISOString()
    };

    // Generate SRT subtitles
    const narrations = buildNarrationTimeline(
      input.flowDefinition.steps.map((s) => ({
        type: s.type as string,
        narrate: (s as any).narrate as string | undefined
      }))
    );
    const subtitlesSrt = generateSRT(narrations);

    // Upload artifacts to R2 if available
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
          video: videoBytes
        }
      );
    }

    return {
      reportJson,
      subtitlesSrt,
      videoBytes,
      screenshots,
      artifacts: uploadedArtifacts
    };

  } finally {
    // Cleanup
    await browser.close();
  }
}

/**
 * Execute a single step
 */
async function executeStep(
  page: any,
  step: Step,
  input: ExecuteInput,
  stepIndex: number
): Promise<void> {
  switch (step.type) {
    case 'goto':
      await executeGoto(page, step as any, input);
      break;

    case 'caption':
      await executeCaption(page, step as any);
      break;

    case 'pause':
      await executePause(page, step as any);
      break;

    case 'fill':
      await executeFill(page, step as any, input);
      break;

    case 'click':
      await executeClick(page, step as any, input);
      break;

    case 'waitFor':
      await executeWaitFor(page, step as any, input);
      break;

    case 'highlight':
      await executeHighlight(page, step as any, input);
      break;

    default:
      throw new Error(`Unsupported step type: ${(step as any).type}`);
  }
}

/**
 * Goto step: Navigate to URL or screen
 */
async function executeGoto(
  page: any,
  step: { type: 'goto'; url?: string; screenId?: string; narrate?: string },
  input: ExecuteInput
): Promise<void> {
  let targetUrl: string;

  if (step.url) {
    targetUrl = step.url;
  } else if (step.screenId) {
    const screen = input.screens.find(s => s.id === step.screenId);
    if (!screen) {
      throw new Error(`Screen not found: ${step.screenId}`);
    }
    targetUrl = input.baseUrl + screen.url_path;
  } else {
    throw new Error('goto step requires url or screenId');
  }

  // Show narration caption if present
  if (step.narrate) {
    await page.evaluate((text: string) => {
      (window as any).coderail?.caption(text, { placement: 'bottom', duration: 3000 });
    }, step.narrate);
  }

  await page.goto(targetUrl, { waitUntil: 'networkidle2' });

  // Wait a bit for caption to be visible
  if (step.narrate) {
    await page.waitForTimeout(1000);
  }
}

/**
 * Caption step: Show text overlay
 */
async function executeCaption(
  page: any,
  step: { type: 'caption'; text: string; placement?: string }
): Promise<void> {
  await page.evaluate((text: string, placement: string) => {
    (window as any).coderail?.caption(text, { placement: placement as any, duration: 3000 });
  }, step.text, step.placement || 'bottom');

  // Wait for caption to be visible
  await page.waitForTimeout(3000);
}

/**
 * Pause step: Wait for specified duration
 */
async function executePause(
  page: any,
  step: { type: 'pause'; ms: number }
): Promise<void> {
  await page.waitForTimeout(step.ms);
}

/**
 * Fill step: Fill input field
 */
async function executeFill(
  page: any,
  step: { type: 'fill'; elementId: string; value: string; narrate?: string },
  input: ExecuteInput
): Promise<void> {
  const elementData = input.elements.find(e => e.id === step.elementId);
  if (!elementData) {
    throw new Error(`Element not found in database: ${step.elementId}`);
  }

  // Show narration if present
  if (step.narrate) {
    await page.evaluate((text: string) => {
      (window as any).coderail?.caption(text, { placement: 'bottom', duration: 2000 });
    }, step.narrate);
    await page.waitForTimeout(1000);
  }

  // Resolve element
  const { element, selector } = await resolveElement(page, elementData, input.params);

  // Fill the input
  await element.type(step.value);

  // Highlight briefly
  await page.evaluate((sel: string) => {
    (window as any).coderail?.highlight(sel, { style: 'box', duration: 1000 });
  }, selector);

  await page.waitForTimeout(500);
}

/**
 * Click step: Click element
 */
async function executeClick(
  page: any,
  step: { type: 'click'; elementId: string; narrate?: string },
  input: ExecuteInput
): Promise<void> {
  const elementData = input.elements.find(e => e.id === step.elementId);
  if (!elementData) {
    throw new Error(`Element not found in database: ${step.elementId}`);
  }

  // Show narration if present
  if (step.narrate) {
    await page.evaluate((text: string) => {
      (window as any).coderail?.caption(text, { placement: 'bottom', duration: 2000 });
    }, step.narrate);
    await page.waitForTimeout(1000);
  }

  // Resolve element
  const { element, selector } = await resolveElement(page, elementData, input.params);

  // Highlight before click
  await page.evaluate((sel: string) => {
    (window as any).coderail?.highlight(sel, { style: 'pulse', duration: 800 });
  }, selector);

  await page.waitForTimeout(500);

  // Click
  await element.click();

  await page.waitForTimeout(500);
}

/**
 * WaitFor step: Wait for element state
 */
async function executeWaitFor(
  page: any,
  step: { type: 'waitFor'; elementId: string; state?: 'visible' | 'attached' | 'hidden' },
  input: ExecuteInput
): Promise<void> {
  const elementData = input.elements.find(e => e.id === step.elementId);
  if (!elementData) {
    throw new Error(`Element not found in database: ${step.elementId}`);
  }

  // Resolve element (this will wait for it to exist)
  const { selector } = await resolveElement(page, elementData, input.params);

  // Wait for state
  const state = step.state || 'visible';
  if (state === 'visible') {
    await page.waitForSelector(selector, { visible: true, timeout: 30000 });
  } else if (state === 'attached') {
    await page.waitForSelector(selector, { timeout: 30000 });
  } else if (state === 'hidden') {
    await page.waitForSelector(selector, { hidden: true, timeout: 30000 });
  }
}

/**
 * Highlight step: Highlight element
 */
async function executeHighlight(
  page: any,
  step: { type: 'highlight'; elementId: string; style?: 'box' | 'pulse'; narrate?: string },
  input: ExecuteInput
): Promise<void> {
  const elementData = input.elements.find(e => e.id === step.elementId);
  if (!elementData) {
    throw new Error(`Element not found in database: ${step.elementId}`);
  }

  // Show narration if present
  if (step.narrate) {
    await page.evaluate((text: string) => {
      (window as any).coderail?.caption(text, { placement: 'bottom', duration: 3000 });
    }, step.narrate);
  }

  // Resolve element
  const { selector } = await resolveElement(page, elementData, input.params);

  // Highlight
  const style = step.style || 'box';
  await page.evaluate((sel: string, highlightStyle: string) => {
    (window as any).coderail?.highlight(sel, { style: highlightStyle as any, duration: 3000 });
  }, selector, style);

  await page.waitForTimeout(3000);
}

/**
 * Inject overlay library into page
 */
async function injectOverlay(page: any): Promise<void> {
  // Inject inline overlay source directly
  // The overlay is inlined to avoid fs reads in Workers environment
  await page.evaluateOnNewDocument(() => {
    // Inline a minimal version of the overlay
    // In production, inject the full compiled bundle
    (window as any).coderail = {
      highlight: (selector: string, options?: any) => {
        const element = document.querySelector(selector);
        if (!element) {
          console.warn(`[CodeRail] Element not found: ${selector}`);
          return null;
        }

        const rect = element.getBoundingClientRect();
        const id = `coderail-hl-${Date.now()}`;
        const container = ensureOverlayContainer();

        const highlightEl = document.createElement('div');
        highlightEl.id = id;
        highlightEl.style.cssText = `
          position: fixed;
          left: ${rect.left - 4}px;
          top: ${rect.top - 4}px;
          width: ${rect.width + 8}px;
          height: ${rect.height + 8}px;
          border: 3px solid #3b82f6;
          border-radius: 8px;
          background: rgba(59, 130, 246, 0.1);
          pointer-events: none;
          z-index: 2147483647;
          animation: ${options?.style === 'pulse' ? 'coderail-pulse 1.5s infinite' : 'none'};
        `;

        container.appendChild(highlightEl);

        if (options?.duration) {
          setTimeout(() => highlightEl.remove(), options.duration);
        }

        return id;
      },

      caption: (text: string, options?: any) => {
        const id = `coderail-cap-${Date.now()}`;
        const container = ensureOverlayContainer();

        const captionEl = document.createElement('div');
        captionEl.id = id;
        captionEl.textContent = text;

        const placement = options?.placement || 'bottom';
        const positionStyle = placement === 'bottom'
          ? 'bottom: 20px; left: 50%; transform: translateX(-50%);'
          : placement === 'top'
          ? 'top: 20px; left: 50%; transform: translateX(-50%);'
          : 'top: 50%; left: 50%; transform: translate(-50%, -50%);';

        captionEl.style.cssText = `
          position: fixed;
          ${positionStyle}
          background: rgba(0, 0, 0, 0.85);
          color: white;
          padding: 16px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-family: system-ui, -apple-system, sans-serif;
          pointer-events: none;
          z-index: 2147483647;
          max-width: 80%;
          text-align: center;
        `;

        container.appendChild(captionEl);

        if (options?.duration) {
          setTimeout(() => captionEl.remove(), options.duration);
        }

        return id;
      },

      clear: () => {
        const container = document.getElementById('coderail-overlay-container');
        if (container) container.innerHTML = '';
      }
    };

    function ensureOverlayContainer() {
      let container = document.getElementById('coderail-overlay-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'coderail-overlay-container';
        container.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 2147483646;
        `;

        // Inject animation styles
        const style = document.createElement('style');
        style.textContent = `
          @keyframes coderail-pulse {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.05); opacity: 0.8; }
          }
        `;
        document.head.appendChild(style);
        document.body.appendChild(container);
      }
      return container;
    }
  });
}

/**
 * Upload all artifacts to R2
 */
async function uploadFlowArtifacts(
  r2Bucket: R2Bucket,
  orgId: string,
  projectId: string,
  runId: string,
  artifacts: {
    report: string;
    subtitles: string;
    screenshots: Array<{ stepIndex: number; bytes: Uint8Array }>;
    video?: Uint8Array;
  }
): Promise<Array<{ kind: string; r2_key: string; bytes: number; sha256: string }>> {
  const uploads: Array<{ kind: string; extension: string; artifact: ArtifactUpload }> = [];

  // Report (JSON)
  uploads.push({
    kind: 'report',
    extension: 'json',
    artifact: {
      kind: 'report',
      content: artifacts.report,
      contentType: 'application/json'
    }
  });

  // Subtitles (SRT)
  uploads.push({
    kind: 'subtitle',
    extension: 'srt',
    artifact: {
      kind: 'subtitle',
      content: artifacts.subtitles,
      contentType: 'text/srt'
    }
  });

  // Video (WebM) - if available
  if (artifacts.video) {
    uploads.push({
      kind: 'video',
      extension: 'webm',
      artifact: {
        kind: 'video',
        content: artifacts.video,
        contentType: 'video/webm'
      }
    });
  }

  // Screenshots (PNG)
  for (let i = 0; i < artifacts.screenshots.length; i++) {
    uploads.push({
      kind: `screenshot-${i}`,
      extension: 'png',
      artifact: {
        kind: 'screenshot',
        content: artifacts.screenshots[i].bytes,
        contentType: 'image/png'
      }
    });
  }

  const results = await uploadArtifacts(r2Bucket, orgId, projectId, runId, uploads);

  return results.map(r => ({
    kind: r.kind,
    r2_key: r.key,
    bytes: r.bytes,
    sha256: r.sha256
  }));
}

/**
 * Get human-readable description for a step
 */
function getStepDescription(step: Step, index: number): string {
  const stepNum = index + 1;

  switch (step.type) {
    case 'goto':
      return `Step ${stepNum}: Navigating to ${(step as any).url || 'page'}`;
    case 'caption':
      return `Step ${stepNum}: Showing caption`;
    case 'highlight':
      return `Step ${stepNum}: Highlighting element`;
    case 'fill':
      return `Step ${stepNum}: Filling input field`;
    case 'click':
      return `Step ${stepNum}: Clicking element`;
    case 'waitFor':
      return `Step ${stepNum}: Waiting for element`;
    case 'pause':
      const duration = (step as any).ms || 1000;
      return `Step ${stepNum}: Pausing for ${duration}ms`;
    default:
      return `Step ${stepNum}: Executing ${(step as any).type}`;
  }
}
