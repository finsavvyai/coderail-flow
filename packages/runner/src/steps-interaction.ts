/** Enhanced interaction step executors: keyboard, fileUpload, dragDrop, rightClick, doubleClick, clearInput, focus, blur. */
import { resolveElement } from './locator';
import type { ExecuteInput } from './executor-types';
export async function executeKeyboard(
  page: any,
  step: { type: 'keyboard'; keys: string; elementId?: string; narrate?: string },
  input: ExecuteInput
): Promise<void> {
  if (step.narrate) {
    await page.evaluate((text: string) => {
      (window as any).coderail?.caption(text, { placement: 'bottom', duration: 2000 });
    }, step.narrate);
    await page.waitForTimeout(500);
  }

  if (step.elementId) {
    const elementData = input.elements.find((e) => e.id === step.elementId);
    if (elementData) {
      const { element } = await resolveElement(page, elementData, input.params);
      await element.focus();
    }
  }

  await page.keyboard.press(step.keys);
  await page.waitForTimeout(200);
}

export async function executeFileUpload(
  page: any,
  step: { type: 'fileUpload'; elementId: string; filePath: string; narrate?: string },
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

  const { element } = await resolveElement(page, elementData, input.params);
  await element.uploadFile(step.filePath);
  await page.waitForTimeout(500);
}

export async function executeDragDrop(
  page: any,
  step: { type: 'dragDrop'; sourceElementId: string; targetElementId: string; narrate?: string },
  input: ExecuteInput
): Promise<void> {
  const sourceData = input.elements.find((e) => e.id === step.sourceElementId);
  const targetData = input.elements.find((e) => e.id === step.targetElementId);

  if (!sourceData || !targetData) {
    throw new Error(`Elements not found for drag/drop`);
  }

  if (step.narrate) {
    await page.evaluate((text: string) => {
      (window as any).coderail?.caption(text, { placement: 'bottom', duration: 2000 });
    }, step.narrate);
    await page.waitForTimeout(500);
  }

  const { element: source } = await resolveElement(page, sourceData, input.params);
  const { element: target } = await resolveElement(page, targetData, input.params);

  const sourceBox = await source.boundingBox();
  const targetBox = await target.boundingBox();

  if (sourceBox && targetBox) {
    await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, {
      steps: 10,
    });
    await page.mouse.up();
  }

  await page.waitForTimeout(300);
}

export async function executeRightClick(
  page: any,
  step: { type: 'rightClick'; elementId: string; narrate?: string },
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

  const { element } = await resolveElement(page, elementData, input.params);
  await element.click({ button: 'right' });
  await page.waitForTimeout(300);
}

export async function executeDoubleClick(
  page: any,
  step: { type: 'doubleClick'; elementId: string; narrate?: string },
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

  const { element } = await resolveElement(page, elementData, input.params);
  await element.click({ clickCount: 2 });
  await page.waitForTimeout(300);
}

export async function executeClearInput(
  page: any,
  step: { type: 'clearInput'; elementId: string; narrate?: string },
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

  const { element } = await resolveElement(page, elementData, input.params);
  await element.click({ clickCount: 3 });
  await page.keyboard.press('Backspace');
  await page.waitForTimeout(200);
}

export async function executeFocus(
  page: any,
  step: { type: 'focus'; elementId: string; narrate?: string },
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

  const { element } = await resolveElement(page, elementData, input.params);
  await element.focus();
  await page.waitForTimeout(200);
}

export async function executeBlur(
  page: any,
  step: { type: 'blur'; elementId: string; narrate?: string },
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
  await page.evaluate((sel: string) => {
    const el = document.querySelector(sel) as HTMLElement;
    if (el) el.blur();
  }, selector);
  await page.waitForTimeout(200);
}
