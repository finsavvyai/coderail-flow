export type Flow = {
  id: string;
  project_id?: string;
  name: string;
  description?: string;
  current_version: number;
  definition: any;
};

export type TemplateSummary = {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  params: Array<{ name: string; type: string; required: boolean }>;
};

export type RunRow = {
  id: string;
  flow_id: string;
  flow_name: string;
  flow_version: number;
  status: string;
  created_at: string;
  started_at?: string;
  finished_at?: string;
};

export type AnalyticsStats = {
  total: number;
  succeeded: number;
  failed: number;
  avgDuration: number;
  byDay: Array<{ date: string; count: number; succeeded: number; failed: number }>;
  byFlow: Array<{ flowId: string; flowName: string; count: number; successRate: number }>;
};

export type StepAnalyticsStats = {
  byType: Array<{ type: string; count: number; failed: number; avgDurationMs: number }>;
  slowestTypes: Array<{ type: string; avgDurationMs: number; samples: number }>;
};

export type ElementReliabilityStats = {
  summary: { high: number; medium: number; low: number };
  lowest: Array<{ elementId: string; name: string; reliabilityScore: number; screenId: string }>;
};

export type AuthProfile = {
  id: string;
  name: string;
  projectId: string;
  cookies: any[];
  localStorage?: Record<string, string>;
  sessionStorage?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
};
