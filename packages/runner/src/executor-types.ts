/**
 * Shared types for the flow execution engine.
 */

import type { Step } from '@coderail-flow/dsl';
import type { ElementData } from './locator';

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
  browserBinding: Fetcher;
  baseUrl: string;
  flowDefinition: {
    params?: Array<{ name: string; type: string; required: boolean }>;
    steps: Step[];
  };
  params: Record<string, any>;
  elements: ElementData[];
  screens: Array<{ id: string; url_path: string }>;
  r2Bucket?: R2Bucket;
  orgId?: string;
  projectId?: string;
  runId: string;
  onProgress?: ProgressCallback;
};

export interface ExecuteResult {
  status: 'succeeded' | 'failed';
  videoBytes?: Uint8Array;
  screenshots?: Array<{ stepIndex: number; bytes: Uint8Array }>;
  reportJson: any;
}

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

export type StepDispatcher = (
  page: any,
  step: Step,
  input: ExecuteInput,
  stepIndex: number
) => Promise<void>;
