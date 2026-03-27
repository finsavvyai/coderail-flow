/**
 * Data extraction and variable step executors.
 * Handles: extractData, setVariable.
 */

import { resolveElement } from './locator';
import type { ExecuteInput } from './executor-types';

export async function executeExtractData(
  page: any,
  step: {
    type: 'extractData';
    elementId: string;
    attribute?: string;
    variableName: string;
    narrate?: string;
  },
  input: ExecuteInput
): Promise<void> {
  const elementData = input.elements.find((e) => e.id === step.elementId);
  if (!elementData) {
    throw new Error(`Element not found: ${step.elementId}`);
  }

  if (step.narrate) {
    await page.evaluate((text: string) => {
      (window as any).coderail?.caption(text, { placement: 'bottom', duration: 2000 });
    }, step.narrate);
    await page.waitForTimeout(500);
  }

  const { selector } = await resolveElement(page, elementData, input.params);

  let value: string;
  if (step.attribute) {
    value = await page.$eval(
      selector,
      (el: any, attr: string) => el.getAttribute(attr),
      step.attribute
    );
  } else {
    value = await page.$eval(selector, (el: any) => el.textContent || el.value || '');
  }

  input.params[step.variableName] = value;
}

export async function executeSetVariable(
  step: { type: 'setVariable'; name: string; value: string },
  input: ExecuteInput
): Promise<void> {
  const value = step.value.replace(/\{\{(\w+)\}\}/g, (_, key) => input.params[key] || '');
  input.params[step.name] = value;
}
