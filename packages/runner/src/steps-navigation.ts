/**
 * Navigation & display step executors.
 *
 * Handles: goto, caption, pause, screenshot, scroll, waitFor, setCookies.
 */

import type { Step } from '@coderail-flow/dsl';
import { resolveElement } from './locator';
import type { ExecuteInput } from './executor-types';

export async function executeGoto(
  page: any,
  step: { type: 'goto'; url?: string; screenId?: string; narrate?: string },
  input: ExecuteInput
): Promise<void> {
  let targetUrl: string;
  if (step.url) {
    targetUrl = step.url;
  } else if (step.screenId) {
    const screen = input.screens.find((s) => s.id === step.screenId);
    if (!screen) throw new Error(`Screen not found: ${step.screenId}`);
    targetUrl = input.baseUrl + screen.url_path;
  } else {
    throw new Error('goto step requires url or screenId');
  }

  if (step.narrate) {
    await page.evaluate((text: string) => {
      (window as any).coderail?.caption(text, { placement: 'bottom', duration: 3000 });
    }, step.narrate);
  }

  try {
    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });
  } catch (err: any) {
    if (err.message?.includes('net::ERR_CONNECTION_REFUSED'))
      throw new Error(
        `Connection refused to ${targetUrl}. Server may be blocking Cloudflare IPs.`,
        { cause: err }
      );
    if (err.message?.includes('net::ERR_NAME_NOT_RESOLVED'))
      throw new Error(`DNS resolution failed for ${targetUrl}. Check if the URL is correct.`, {
        cause: err,
      });
    if (err.message?.includes('Timeout'))
      throw new Error(`Navigation timeout for ${targetUrl}. Server may be slow or blocking.`, {
        cause: err,
      });
    throw err;
  }

  if (step.narrate) await page.waitForTimeout(1000);
}

export async function executeCaption(
  page: any,
  step: { type: 'caption'; text: string; placement?: string }
): Promise<void> {
  await page.evaluate(
    (text: string, placement: string) => {
      (window as any).coderail?.caption(text, { placement: placement as any, duration: 3000 });
    },
    step.text,
    step.placement || 'bottom'
  );

  await page.waitForTimeout(3000);
}

export async function executePause(page: any, step: { type: 'pause'; ms: number }): Promise<void> {
  await page.waitForTimeout(step.ms);
}

export async function executeScreenshot(
  page: any,
  step: { type: 'screenshot'; label?: string; fullPage?: boolean }
): Promise<void> {
  if (step.label) {
    await page.evaluate((text: string) => {
      (window as any).coderail?.caption(text, { placement: 'top', duration: 1500 });
    }, step.label);
    await page.waitForTimeout(500);
  }
  await page.waitForTimeout(500);
}

export async function executeScroll(
  page: any,
  step: {
    type: 'scroll';
    direction: 'up' | 'down' | 'top' | 'bottom';
    elementId?: string;
    pixels?: number;
  },
  input: ExecuteInput
): Promise<void> {
  if (step.elementId) {
    const elementData = input.elements.find((e) => e.id === step.elementId);
    if (!elementData) {
      throw new Error(`Element not found in database: ${step.elementId}`);
    }
    const { selector } = await resolveElement(page, elementData, input.params);

    await page.evaluate(
      (sel: string, dir: string, px: number) => {
        const el = document.querySelector(sel);
        if (!el) return;
        if (dir === 'top') el.scrollTop = 0;
        else if (dir === 'bottom') el.scrollTop = el.scrollHeight;
        else if (dir === 'down') el.scrollTop += px;
        else if (dir === 'up') el.scrollTop -= px;
      },
      selector,
      step.direction,
      step.pixels || 300
    );
  } else {
    await page.evaluate(
      (dir: string, px: number) => {
        if (dir === 'top') window.scrollTo(0, 0);
        else if (dir === 'bottom') window.scrollTo(0, document.body.scrollHeight);
        else if (dir === 'down') window.scrollBy(0, px);
        else if (dir === 'up') window.scrollBy(0, -px);
      },
      step.direction,
      step.pixels || 300
    );
  }

  await page.waitForTimeout(500);
}

export async function executeWaitFor(
  page: any,
  step: { type: 'waitFor'; elementId: string; state?: 'visible' | 'attached' | 'hidden' },
  input: ExecuteInput
): Promise<void> {
  const elementData = input.elements.find((e) => e.id === step.elementId);
  if (!elementData) {
    throw new Error(`Element not found in database: ${step.elementId}`);
  }

  const { selector } = await resolveElement(page, elementData, input.params);

  const state = step.state || 'visible';
  if (state === 'visible') {
    await page.waitForSelector(selector, { visible: true, timeout: 30000 });
  } else if (state === 'attached') {
    await page.waitForSelector(selector, { timeout: 30000 });
  } else if (state === 'hidden') {
    await page.waitForSelector(selector, { hidden: true, timeout: 30000 });
  }
}

export async function executeSetCookies(
  page: any,
  step: {
    type: 'setCookies';
    cookies: Array<{
      name: string;
      value: string;
      domain: string;
      path?: string;
      secure?: boolean;
      httpOnly?: boolean;
    }>;
  }
): Promise<void> {
  const cookies = step.cookies.map((c) => ({
    name: c.name,
    value: c.value,
    domain: c.domain,
    path: c.path || '/',
    secure: c.secure ?? true,
    httpOnly: c.httpOnly ?? false,
  }));

  await page.setCookie(...cookies);
  await page.waitForTimeout(100);
}

export function getStepDescription(step: Step, index: number): string {
  const n = index + 1;
  const labels: Record<string, string> = {
    goto: `Navigating to ${(step as any).url || 'page'}`,
    caption: 'Showing caption',
    highlight: 'Highlighting element',
    fill: 'Filling input field',
    click: 'Clicking element',
    waitFor: 'Waiting for element',
    pause: `Pausing for ${(step as any).ms || 1000}ms`,
  };
  return `Step ${n}: ${labels[step.type] || `Executing ${step.type}`}`;
}
