/**
 * Runner/Executor types.
 */

export interface ExecutionResult {
  status: 'succeeded' | 'failed';
  reportJson: Record<string, unknown>;
  subtitlesSrt: string;
  videoBytes?: Uint8Array;
  screenshots: Array<{ stepIndex: number; bytes: Uint8Array }>;
  artifacts?: ArtifactUpload[];
}

export interface ArtifactUpload {
  kind: string;
  contentType: string;
  bytes: number;
  key: string;
  url?: string;
}

export interface StepResult {
  idx: number;
  type: string;
  status: 'ok' | 'failed';
  errorMessage?: string;
  durationMs: number;
}
