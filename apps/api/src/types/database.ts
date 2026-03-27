/**
 * Database result types.
 *
 * Proper TypeScript types for database query results.
 */

export interface UserAccount {
  id: string;
  clerk_id: string;
  email: string;
  name: string | null;
  plan: 'free' | 'pro' | 'team' | 'enterprise';
  runs_this_month: number;
  runs_reset_at: string;
  created_at: string;
  updated_at: string;
}

export interface Org {
  id: string;
  name: string;
  created_at: string;
}

export interface Project {
  id: string;
  org_id: string;
  name: string;
  base_url: string;
  env: 'dev' | 'stage' | 'prod';
  created_at: string;
  updated_at: string;
}

export interface Flow {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  auth_profile_id: string | null;
  status: 'active' | 'archived';
  current_version: number;
  created_at: string;
  updated_at: string;
}

export interface FlowVersion {
  id: string;
  flow_id: string;
  version: number;
  definition: string; // JSON string
  changelog: string;
  created_at: string;
}

export interface Run {
  id: string;
  flow_id: string;
  flow_version: number;
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  params: string; // JSON string
  runner_version: string;
  error_code: string | null;
  error_message: string | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
}

export interface Artifact {
  id: string;
  run_id: string;
  kind: 'screenshot' | 'video' | 'subtitle' | 'report' | 'log';
  content_type: string;
  bytes: number;
  storage_key: string | null;
  created_at: string;
}

export interface AuthProfile {
  id: string;
  project_id: string;
  name: string;
  type: 'cookies' | 'basic' | 'bearer' | 'oauth';
  encrypted_payload: string;
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: string;
  flow_id: string;
  cron: string;
  enabled: boolean;
  params: string; // JSON string
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  scopes: string; // JSON array string
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}
