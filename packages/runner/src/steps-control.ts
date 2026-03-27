/** Browser control & flow control step executors: iframe, waitForNavigation, waitForNetwork, executeScript, setViewport, emulateDevice, pdf, loop, conditional. */
import type { ExecuteInput, StepDispatcher } from './executor-types';

export async function executeIframe(
  page: any,
  step: { type: 'iframe'; frameSelector: string; steps: any[]; narrate?: string },
  input: ExecuteInput,
  dispatchStep: StepDispatcher
): Promise<void> {
  if (step.narrate) {
    await page.evaluate((text: string) => {
      (window as any).coderail?.caption(text, { placement: 'bottom', duration: 2000 });
    }, step.narrate);
    await page.waitForTimeout(500);
  }

  const frameHandle = await page.$(step.frameSelector);
  if (!frameHandle) {
    throw new Error(`Iframe not found: ${step.frameSelector}`);
  }

  const frame = await frameHandle.contentFrame();
  if (!frame) {
    throw new Error(`Could not access iframe content`);
  }

  for (const nestedStep of step.steps) {
    await dispatchStep(frame, nestedStep, input, 0);
  }
}

export async function executeWaitForNavigation(
  page: any,
  step: { type: 'waitForNavigation'; timeout?: number }
): Promise<void> {
  await page.waitForNavigation({
    waitUntil: 'networkidle2',
    timeout: step.timeout || 30000,
  });
}

export async function executeWaitForNetwork(
  page: any,
  step: { type: 'waitForNetwork'; urlPattern?: string; timeout?: number }
): Promise<void> {
  if (step.urlPattern) {
    await page.waitForResponse((response: any) => response.url().includes(step.urlPattern), {
      timeout: step.timeout || 30000,
    });
  } else {
    await page.waitForNetworkIdle({ timeout: step.timeout || 30000 });
  }
}

export async function executeExecuteScript(
  page: any,
  step: { type: 'executeScript'; script: string; narrate?: string }
): Promise<void> {
  if (step.narrate) {
    await page.evaluate((text: string) => {
      (window as any).coderail?.caption(text, { placement: 'bottom', duration: 2000 });
    }, step.narrate);
    await page.waitForTimeout(500);
  }

  await page.evaluate(step.script);
  await page.waitForTimeout(200);
}

export async function executeSetViewport(
  page: any,
  step: { type: 'setViewport'; width: number; height: number; isMobile?: boolean }
): Promise<void> {
  await page.setViewport({
    width: step.width,
    height: step.height,
    isMobile: step.isMobile || false,
  });
  await page.waitForTimeout(300);
}

export async function executeEmulateDevice(
  page: any,
  step: { type: 'emulateDevice'; device: string }
): Promise<void> {
  const devices: Record<
    string,
    { width: number; height: number; isMobile: boolean; userAgent: string }
  > = {
    'iPhone 12': {
      width: 390,
      height: 844,
      isMobile: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    },
    'iPhone 14': {
      width: 390,
      height: 844,
      isMobile: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
    },
    iPad: {
      width: 768,
      height: 1024,
      isMobile: true,
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)',
    },
    'Pixel 5': {
      width: 393,
      height: 851,
      isMobile: true,
      userAgent: 'Mozilla/5.0 (Linux; Android 11; Pixel 5)',
    },
    'Galaxy S21': {
      width: 360,
      height: 800,
      isMobile: true,
      userAgent: 'Mozilla/5.0 (Linux; Android 11; SM-G991B)',
    },
    Desktop: {
      width: 1920,
      height: 1080,
      isMobile: false,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
  };

  const device = devices[step.device] || devices['Desktop'];
  await page.setViewport({ width: device.width, height: device.height, isMobile: device.isMobile });
  await page.setUserAgent(device.userAgent);
  await page.waitForTimeout(300);
}

export async function executePdf(
  page: any,
  step: { type: 'pdf'; filename?: string; format?: string }
): Promise<void> {
  await page.pdf({
    path: step.filename || 'page.pdf',
    format: step.format || 'A4',
    printBackground: true,
  });
}

export async function executeLoop(
  page: any,
  step: { type: 'loop'; times: number; steps: any[]; narrate?: string },
  input: ExecuteInput,
  dispatchStep: StepDispatcher
): Promise<void> {
  if (step.narrate) {
    await page.evaluate((text: string) => {
      (window as any).coderail?.caption(text, { placement: 'bottom', duration: 2000 });
    }, step.narrate);
    await page.waitForTimeout(500);
  }

  for (let i = 0; i < step.times; i++) {
    for (const nestedStep of step.steps) {
      await dispatchStep(page, nestedStep, input, 0);
    }
  }
}

export async function executeConditional(
  page: any,
  step: {
    type: 'conditional';
    condition: string;
    thenSteps: any[];
    elseSteps?: any[];
    narrate?: string;
  },
  input: ExecuteInput,
  dispatchStep: StepDispatcher
): Promise<void> {
  if (step.narrate) {
    await page.evaluate((text: string) => {
      (window as any).coderail?.caption(text, { placement: 'bottom', duration: 2000 });
    }, step.narrate);
    await page.waitForTimeout(500);
  }

  const result = await page.evaluate(step.condition);

  if (result) {
    for (const nestedStep of step.thenSteps) {
      await dispatchStep(page, nestedStep, input, 0);
    }
  } else if (step.elseSteps) {
    for (const nestedStep of step.elseSteps) {
      await dispatchStep(page, nestedStep, input, 0);
    }
  }
}
