/**
 * Comprehensive health check endpoints.
 *
 * Provides health status for API, database, storage, and external services.
 */

import { Hono } from 'hono';
import type { Env } from '../env';
import { requireAuth } from '../auth';
import type { Variables } from '../index';
import { getRuntimeConfig } from '../runtime-config';

const health = new Hono<{ Bindings: Env; Variables: Variables }>();
const SERVICE_NAME = 'coderail-flow-api';
const SERVICE_VERSION = '1.0.0';

interface HealthCheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  duration?: number;
  message?: string;
}

interface HealthResponse {
  status: 'pass' | 'fail' | 'warn';
  version: string;
  timestamp: string;
  checks: Record<string, HealthCheckResult>;
}

/**
 * Basic health check (no auth required).
 */
health.get('/', async (c) => {
  const config = getRuntimeConfig(c.env);

  return c.json({
    ok: true,
    status: 'pass',
    service: SERVICE_NAME,
    version: SERVICE_VERSION,
    environment: c.env.APP_ENV,
    timestamp: new Date().toISOString(),
    readiness: {
      ok: config.ok,
      failingChecks: config.issues.filter((issue) => issue.level === 'fail').length,
      warningChecks: config.issues.filter((issue) => issue.level === 'warn').length,
    },
  });
});

/**
 * Readiness check (no auth required).
 *
 * Returns 503 when the service should not receive production traffic.
 */
health.get('/ready', async (c) => {
  const config = getRuntimeConfig(c.env);

  return c.json(
    {
      ok: config.ok,
      status: config.ok ? 'pass' : 'fail',
      service: SERVICE_NAME,
      version: SERVICE_VERSION,
      environment: config.environment,
      timestamp: new Date().toISOString(),
      features: config.features,
      issues: config.issues,
    },
    config.ok ? 200 : 503
  );
});

/**
 * Detailed health check (requires auth).
 */
health.get('/detailed', requireAuth(), async (c) => {
  const checks: Record<string, HealthCheckResult> = {};
  let overallStatus: 'pass' | 'fail' | 'warn' = 'pass';
  const config = getRuntimeConfig(c.env);

  checks.configuration = {
    name: 'configuration',
    status: config.ok ? 'pass' : 'fail',
    message: config.ok
      ? 'Runtime configuration is ready.'
      : config.issues
          .filter((issue) => issue.level === 'fail')
          .map((issue) => issue.message)
          .join(' '),
  };

  // Check database
  checks.database = await checkDatabase(c.env);

  // Check R2 storage
  checks.storage = await checkR2(c.env);

  // Check browser rendering service
  checks.browser = await checkBrowser(c.env);

  // Check Clerk (optional)
  if (c.env.CLERK_ISSUER) {
    checks.clerk = await checkClerk(c.env);
  }

  // Determine overall status
  const checkValues = Object.values(checks);
  if (checkValues.some((c) => c.status === 'fail')) {
    overallStatus = 'fail';
  } else if (checkValues.some((c) => c.status === 'warn')) {
    overallStatus = 'warn';
  }

  const response: HealthResponse = {
    status: overallStatus,
    version: SERVICE_VERSION,
    timestamp: new Date().toISOString(),
    checks,
  };

  return c.json(response, overallStatus === 'fail' ? 503 : 200);
});

/**
 * Check database connectivity.
 */
async function checkDatabase(env: Env): Promise<HealthCheckResult> {
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
async function checkR2(env: Env): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    // Try to list objects (should be empty or have objects)
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
async function checkBrowser(env: Env): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    // Just check if the binding exists
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
 * Check Clerk service availability.
 */
async function checkClerk(env: Env): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    const url = `${env.CLERK_ISSUER}/.well-known/jwks.json`;
    const response = await fetch(url, { method: 'HEAD' });

    if (response.ok) {
      return {
        name: 'clerk',
        status: 'pass',
        duration: Date.now() - start,
      };
    } else {
      return {
        name: 'clerk',
        status: 'warn',
        duration: Date.now() - start,
        message: `Clerk returned ${response.status}`,
      };
    }
  } catch (error: any) {
    return {
      name: 'clerk',
      status: 'fail',
      duration: Date.now() - start,
      message: error.message,
    };
  }
}

export { health };
