/**
 * Types for visual regression testing.
 */

export interface Baseline {
  id: string;
  flowId: string;
  stepIndex: number;
  r2Key: string;
  sha256: string;
  width: number;
  height: number;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
}

export interface VisualDiff {
  id: string;
  runId: string;
  baselineId: string;
  stepIndex: number;
  diffR2Key?: string;
  mismatchPixels: number;
  mismatchPercentage: number;
  threshold: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface VisualRegressionConfig {
  enabled: boolean;
  threshold: number;
  autoApproveOnFirstRun: boolean;
  notifyOnRegression: boolean;
}

export interface VisualRegressionResult {
  stepIndex: number;
  baselineId?: string;
  status: 'new_baseline' | 'match' | 'regression' | 'error';
  mismatchPercentage?: number;
  diffR2Key?: string;
  error?: string;
}
