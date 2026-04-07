/**
 * Individual health check functions for database, storage, and browser services.
 */

import type { Env } from '../env';

export interface HealthCheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  duration?: number;
  message?: string;
}

export interface HealthResponse {
  status: 'pass' | 'fail' | 'warn';
  version: string;
  timestamp: string;
  checks: Record<string, HealthCheckResult>;
}

/**
 * Check database connectivity.
 */
export async function checkDatabase(env: Env): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    await env.DB.prepare('SELECT 1').first();
    return {
      name: 'database',
      status: 'pass',
      duration: Date.now() - start,
    };
  } catch (error: any) {
    return {
      name: 'database',
      status: 'fail',
      duration: Date.now() - start,
      message: error.message,
    };
  }
}

/**
 * Check R2 bucket accessibility.
 */
export async function checkR2(env: Env): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    await env.ARTIFACTS.list({ limit: 1 });
    return {
      name: 'storage',
      status: 'pass',
      duration: Date.now() - start,
    };
  } catch (error: any) {
    return {
      name: 'storage',
      status: 'fail',
      duration: Date.now() - start,
      message: error.message,
    };
  }
}

/**
 * Check browser rendering service.
 */
export async function checkBrowser(env: Env): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    if (!env.BROWSER) {
      return {
        name: 'browser',
        status: 'warn',
        duration: Date.now() - start,
        message: 'Browser binding not configured',
      };
    }
    return {
      name: 'browser',
      status: 'pass',
      duration: Date.now() - start,
    };
  } catch (error: any) {
    return {
      name: 'browser',
      status: 'fail',
      duration: Date.now() - start,
      message: error.message,
    };
  }
}

/**
 * Returns true when the runtime config has no fatal issues.
 */
export function isRuntimeReadyEnoughForWarnings(config: {
  issues: Array<{ level: string }>;
}): boolean {
  return !config.issues.some((issue) => issue.level === 'fail');
}
