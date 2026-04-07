/**
 * Step dispatch router.
 *
 * Routes each step type to the appropriate executor function.
 */

import type { Step } from '@coderail-flow/dsl';
import type { ExecuteInput } from './executor-types';
import {
  executeGoto,
  executeCaption,
  executePause,
  executeScreenshot,
  executeScroll,
  executeWaitFor,
  executeSetCookies,
} from './steps-navigation';
import {
  executeFill,
  executeClick,
  executeHighlight,
  executeHover,
  executeSelect,
} from './steps-input';
import {
  executeSelectRow,
  executeAssertText,
  executeAssertUrl,
  executeAssertElement,
  executeExtractData,
  executeSetVariable,
} from './steps-data';
import {
  executeKeyboard,
  executeFileUpload,
  executeDragDrop,
  executeRightClick,
  executeDoubleClick,
  executeClearInput,
  executeFocus,
  executeBlur,
} from './steps-interaction';
import {
  executeIframe,
  executeWaitForNavigation,
  executeWaitForNetwork,
  executeExecuteScript,
  executeSetViewport,
  executeEmulateDevice,
  executePdf,
  executeLoop,
  executeConditional,
} from './steps-control';

export async function executeStep(
  page: any,
  step: Step,
  input: ExecuteInput,
  _stepIndex: number
): Promise<void> {
  switch (step.type) {
    case 'goto':
      return executeGoto(page, step as any, input);
    case 'caption':
      return executeCaption(page, step as any);
    case 'pause':
      return executePause(page, step as any);
    case 'fill':
      return executeFill(page, step as any, input);
    case 'click':
      return executeClick(page, step as any, input);
    case 'waitFor':
      return executeWaitFor(page, step as any, input);
    case 'highlight':
      return executeHighlight(page, step as any, input);
    case 'selectRow':
      return executeSelectRow(page, step as any, input);
    case 'assertText':
      return executeAssertText(page, step as any, input);
    case 'screenshot':
      return executeScreenshot(page, step as any);
    case 'scroll':
      return executeScroll(page, step as any, input);
    case 'hover':
      return executeHover(page, step as any, input);
    case 'select':
      return executeSelect(page, step as any, input);
    case 'setCookies':
      return executeSetCookies(page, step as any);
    case 'keyboard':
      return executeKeyboard(page, step as any, input);
    case 'fileUpload':
      return executeFileUpload(page, step as any, input);
    case 'dragDrop':
      return executeDragDrop(page, step as any, input);
    case 'rightClick':
      return executeRightClick(page, step as any, input);
    case 'doubleClick':
      return executeDoubleClick(page, step as any, input);
    case 'iframe':
      return executeIframe(page, step as any, input, executeStep);
    case 'waitForNavigation':
      return executeWaitForNavigation(page, step as any);
    case 'waitForNetwork':
      return executeWaitForNetwork(page, step as any);
    case 'executeScript':
      return executeExecuteScript(page, step as any);
    case 'assertUrl':
      return executeAssertUrl(page, step as any);
    case 'assertElement':
      return executeAssertElement(page, step as any, input);
    case 'clearInput':
      return executeClearInput(page, step as any, input);
    case 'focus':
      return executeFocus(page, step as any, input);
    case 'blur':
      return executeBlur(page, step as any, input);
    case 'setViewport':
      return executeSetViewport(page, step as any);
    case 'emulateDevice':
      return executeEmulateDevice(page, step as any);
    case 'pdf':
      return executePdf(page, step as any);
    case 'loop':
      return executeLoop(page, step as any, input, executeStep);
    case 'conditional':
      return executeConditional(page, step as any, input, executeStep);
    case 'extractData':
      return executeExtractData(page, step as any, input);
    case 'setVariable':
      return executeSetVariable(step as any, input);
    default:
      throw new Error(`Unsupported step type: ${(step as any).type}`);
  }
}
