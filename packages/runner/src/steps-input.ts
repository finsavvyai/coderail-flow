/**
 * Input & interaction step executors.
 *
 * Handles: fill, click, highlight, hover, select.
 */

import { resolveElement } from './locator';
import type { ExecuteInput } from './executor-types';

export async function executeFill(
  page: any,
  step: { type: 'fill'; elementId: string; value: string; narrate?: string },
  input: ExecuteInput
): Promise<void> {
  const elementData = input.elements.find((e) => e.id === step.elementId);
  if (!elementData) {
    throw new Error(`Element not found in database: ${step.elementId}`);
  }

  if (step.narrate) {
    await page.evaluate((text: string) => {
      (window as any).coderail?.caption(text, { placement: 'bottom', duration: 2000 });
    }, step.narrate);
    await page.waitForTimeout(1000);
  }

  const { element, selector } = await resolveElement(page, elementData, input.params);
  await element.type(step.value);

  await page.evaluate((sel: string) => {
    (window as any).coderail?.highlight(sel, { style: 'box', duration: 1000 });
  }, selector);

  await page.waitForTimeout(500);
}

export async function executeClick(
  page: any,
  step: { type: 'click'; elementId: string; narrate?: string },
  input: ExecuteInput
): Promise<void> {
  const elementData = input.elements.find((e) => e.id === step.elementId);
  if (!elementData) {
    throw new Error(`Element not found in database: ${step.elementId}`);
  }

  if (step.narrate) {
    await page.evaluate((text: string) => {
      (window as any).coderail?.caption(text, { placement: 'bottom', duration: 2000 });
    }, step.narrate);
    await page.waitForTimeout(1000);
  }

  const { element, selector } = await resolveElement(page, elementData, input.params);

  await page.evaluate((sel: string) => {
    (window as any).coderail?.highlight(sel, { style: 'pulse', duration: 800 });
  }, selector);

  await page.waitForTimeout(500);
  await element.click();
  await page.waitForTimeout(500);
}

export async function executeHighlight(
  page: any,
  step: { type: 'highlight'; elementId: string; style?: 'box' | 'pulse'; narrate?: string },
  input: ExecuteInput
): Promise<void> {
  const elementData = input.elements.find((e) => e.id === step.elementId);
  if (!elementData) {
    throw new Error(`Element not found in database: ${step.elementId}`);
  }

  if (step.narrate) {
    await page.evaluate((text: string) => {
      (window as any).coderail?.caption(text, { placement: 'bottom', duration: 3000 });
    }, step.narrate);
  }

  const { selector } = await resolveElement(page, elementData, input.params);

  const style = step.style || 'box';
  await page.evaluate(
    (sel: string, highlightStyle: string) => {
      (window as any).coderail?.highlight(sel, { style: highlightStyle as any, duration: 3000 });
    },
    selector,
    style
  );

  await page.waitForTimeout(3000);
}

export async function executeHover(
  page: any,
  step: { type: 'hover'; elementId: string; narrate?: string },
  input: ExecuteInput
): Promise<void> {
  const elementData = input.elements.find((e) => e.id === step.elementId);
  if (!elementData) {
    throw new Error(`Element not found in database: ${step.elementId}`);
  }

  if (step.narrate) {
    await page.evaluate((text: string) => {
      (window as any).coderail?.caption(text, { placement: 'bottom', duration: 2000 });
    }, step.narrate);
    await page.waitForTimeout(1000);
  }

  const { element, selector } = await resolveElement(page, elementData, input.params);

  await page.evaluate((sel: string) => {
    (window as any).coderail?.highlight(sel, { style: 'box', duration: 1500 });
  }, selector);

  await element.hover();
  await page.waitForTimeout(1000);
}

export async function executeSelect(
  page: any,
  step: { type: 'select'; elementId: string; value: string; narrate?: string },
  input: ExecuteInput
): Promise<void> {
  const elementData = input.elements.find((e) => e.id === step.elementId);
  if (!elementData) {
    throw new Error(`Element not found in database: ${step.elementId}`);
  }

  if (step.narrate) {
    await page.evaluate((text: string) => {
      (window as any).coderail?.caption(text, { placement: 'bottom', duration: 2000 });
    }, step.narrate);
    await page.waitForTimeout(1000);
  }

  const { selector } = await resolveElement(page, elementData, input.params);
  const value = step.value.replace(/\{\{(\w+)\}\}/g, (_, key) => input.params[key] || '');

  await page.select(selector, value);

  await page.evaluate((sel: string) => {
    (window as any).coderail?.highlight(sel, { style: 'box', duration: 1000 });
  }, selector);

  await page.waitForTimeout(500);
}
