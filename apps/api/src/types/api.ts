/**
 * API request/response types.
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Flow types
export interface FlowResponse {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  currentVersion: number;
  status: 'active' | 'archived';
  createdAt: string;
}

export interface CreateFlowRequest {
  projectId: string;
  name: string;
  description?: string;
  authProfileId?: string;
  definition: {
    params: Array<{ name: string; type: string; required: boolean }>;
    steps: unknown[];
  };
}

// Run types
export interface RunResponse {
  id: string;
  flowId: string;
  flowVersion: number;
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  params: Record<string, unknown>;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  errorMessage?: string;
}

export interface CreateRunRequest {
  flowId: string;
  params?: Record<string, unknown>;
}

// Artifact types
export interface ArtifactResponse {
  id: string;
  runId: string;
  kind: 'screenshot' | 'video' | 'subtitle' | 'report' | 'log';
  contentType: string;
  bytes: number;
  createdAt: string;
}

// Auth profile types
export interface AuthProfileResponse {
  id: string;
  projectId: string;
  name: string;
  type: 'cookies' | 'basic' | 'bearer' | 'oauth';
  createdAt: string;
  updatedAt: string;
}

// Schedule types
export interface ScheduleResponse {
  id: string;
  flowId: string;
  cron: string;
  enabled: boolean;
  params: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Analytics types
export interface AnalyticsSummary {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  successRate: number;
  avgDuration: number;
}

// Error types
export interface ErrorResponse {
  error: string;
  message?: string;
  details?: unknown;
  requestId?: string;
}
