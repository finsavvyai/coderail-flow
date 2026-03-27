/**
 * Data & assertion step executors.
 * Handles: selectRow, assertText, assertUrl, assertElement.
 */

import { resolveElement } from './locator';
import type { ExecuteInput } from './executor-types';

export async function executeSelectRow(
  page: any,
  step: {
    type: 'selectRow';
    elementId: string;
    matchText: string;
    column?: number;
    narrate?: string;
  },
  input: ExecuteInput
): Promise<void> {
  const elementData = input.elements.find((e) => e.id === step.elementId);
  if (!elementData) throw new Error(`Element not found in database: ${step.elementId}`);

  if (step.narrate) {
    await page.evaluate((text: string) => {
      (window as any).coderail?.caption(text, { placement: 'bottom', duration: 2000 });
    }, step.narrate);
    await page.waitForTimeout(1000);
  }

  const { selector } = await resolveElement(page, elementData, input.params);
  const matchText = step.matchText.replace(/\{\{(\w+)\}\}/g, (_, key) => input.params[key] || '');

  await page.evaluate(
    (tableSelector: string, text: string) => {
      const table = document.querySelector(tableSelector);
      if (!table) return;
      const rows = table.querySelectorAll('tr');
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].textContent?.includes(text)) {
          (rows[i] as HTMLElement).click();
          rows[i].classList.add('coderail-selected');
          break;
        }
      }
    },
    selector,
    matchText
  );

  await page.evaluate((sel: string) => {
    (window as any).coderail?.highlight(sel + ' .coderail-selected, ' + sel + ' tr:focus', {
      style: 'box',
      duration: 2000,
    });
  }, selector);
  await page.waitForTimeout(1000);
}

export async function executeAssertText(
  page: any,
  step: { type: 'assertText'; text: string; elementId?: string; narrate?: string },
  input: ExecuteInput
): Promise<void> {
  if (step.narrate) {
    await page.evaluate((text: string) => {
      (window as any).coderail?.caption(text, { placement: 'bottom', duration: 2000 });
    }, step.narrate);
    await page.waitForTimeout(1000);
  }

  const searchText = step.text.replace(/\{\{(\w+)\}\}/g, (_, key) => input.params[key] || '');
  let found = false;

  if (step.elementId) {
    const elementData = input.elements.find((e) => e.id === step.elementId);
    if (!elementData) throw new Error(`Element not found in database: ${step.elementId}`);
    const { selector } = await resolveElement(page, elementData, input.params);
    found = await page.evaluate(
      (sel: string, text: string) =>
        document.querySelector(sel)?.textContent?.includes(text) ?? false,
      selector,
      searchText
    );
  } else {
    found = await page.evaluate(
      (text: string) => document.body.textContent?.includes(text) ?? false,
      searchText
    );
  }

  if (!found) throw new Error(`Assertion failed: text "${searchText}" not found`);

  await page.evaluate((text: string) => {
    (window as any).coderail?.caption(`\u2713 Found: "${text}"`, {
      placement: 'bottom',
      duration: 1500,
    });
  }, searchText);
  await page.waitForTimeout(1500);
}

export async function executeAssertUrl(
  page: any,
  step: { type: 'assertUrl'; pattern: string; narrate?: string }
): Promise<void> {
  if (step.narrate) {
    await page.evaluate((text: string) => {
      (window as any).coderail?.caption(text, { placement: 'bottom', duration: 2000 });
    }, step.narrate);
    await page.waitForTimeout(500);
  }
  const currentUrl = page.url();
  if (!new RegExp(step.pattern).test(currentUrl)) {
    throw new Error(`URL assertion failed: "${currentUrl}" does not match "${step.pattern}"`);
  }
}

export async function executeAssertElement(
  page: any,
  step: { type: 'assertElement'; elementId: string; assertion: string; narrate?: string },
  input: ExecuteInput
): Promise<void> {
  const elementData = input.elements.find((e) => e.id === step.elementId);
  if (!elementData) throw new Error(`Element not found: ${step.elementId}`);

  if (step.narrate) {
    await page.evaluate((text: string) => {
      (window as any).coderail?.caption(text, { placement: 'bottom', duration: 2000 });
    }, step.narrate);
    await page.waitForTimeout(500);
  }

  const { selector } = await resolveElement(page, elementData, input.params);

  switch (step.assertion) {
    case 'exists': {
      const el = await page.$(selector);
      if (!el) throw new Error(`Element does not exist: ${selector}`);
      break;
    }
    case 'notExists': {
      const el = await page.$(selector);
      if (el) throw new Error(`Element exists but should not: ${selector}`);
      break;
    }
    case 'visible':
      await page.waitForSelector(selector, { visible: true, timeout: 5000 });
      break;
    case 'hidden':
      await page.waitForSelector(selector, { hidden: true, timeout: 5000 });
      break;
    case 'enabled': {
      const ok = await page.$eval(selector, (el: any) => !el.disabled);
      if (!ok) throw new Error(`Element is not enabled: ${selector}`);
      break;
    }
    case 'disabled': {
      const ok = await page.$eval(selector, (el: any) => el.disabled);
      if (!ok) throw new Error(`Element is not disabled: ${selector}`);
      break;
    }
  }
}

// Re-export extraction operations
export { executeExtractData, executeSetVariable } from './steps-data-extract';
