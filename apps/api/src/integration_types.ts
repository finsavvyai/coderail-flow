/**
 * Shared types and helpers for the integrations module.
 */
import type { Env } from './env';
import { decryptJsonAtRest, encryptJsonAtRest } from './security/encryption';

// ── Types ───────────────────────────────────────────────────
export interface Integration {
  id: string;
  project_id: string;
  type: 'slack' | 'gitlab' | 'github' | 'webhook' | 'jira' | 'email';
  name: string;
  config: string; // JSON
  enabled: number;
}

export interface RunEvent {
  runId: string;
  flowId: string;
  flowName: string;
  status: 'succeeded' | 'failed';
  startedAt?: string;
  finishedAt?: string;
  errorMessage?: string;
  artifactCount?: number;
}

export type DeliveryOptions = {
  maxAttempts?: number;
  retryDelayMs?: number;
};

export const VALID_INTEGRATION_TYPES = [
  'slack',
  'gitlab',
  'github',
  'webhook',
  'jira',
  'email',
] as const;

// ── Helpers ─────────────────────────────────────────────────
export async function sleep(ms: number): Promise<void> {
  if (ms <= 0) return;
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function decryptIntegrationConfig(
  env: Env,
  serialized: string
): Promise<Record<string, any>> {
  return decryptJsonAtRest(serialized || '{}', env);
}

export async function encryptIntegrationConfig(
  env: Env,
  config: Record<string, any>
): Promise<string> {
  return encryptJsonAtRest(config || {}, env);
}
