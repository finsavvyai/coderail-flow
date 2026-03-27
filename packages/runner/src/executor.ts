/**
 * CodeRail Flow Execution Engine
 *
 * Re-exports the modular execution engine components.
 * See executor-core.ts for the main executeFlow function.
 */

export { executeFlow } from './executor-core';
export type {
  ExecuteInput,
  ExecuteOutput,
  ExecuteResult,
  StepResult,
  ProgressUpdate,
  ProgressCallback,
  StepDispatcher,
} from './executor-types';
