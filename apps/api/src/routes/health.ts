/**
 * Comprehensive health check endpoints.
 *
 * Provides health status for API, database, storage, and external services.
 */

import { Hono } from 'hono';
import type { Env } from '../env';
import { requireAuth } from '../auth';
import { getConfiguredAuthProviderIds } from '../auth-config';
import type { Variables } from '../index';
import { getRuntimeConfig } from '../runtime-config';
import {
  checkDatabase,
  checkR2,
  checkBrowser,
  isRuntimeReadyEnoughForWarnings,
  type HealthCheckResult,
  type HealthResponse,
} from './health-checks';

const health = new Hono<{ Bindings: Env; Variables: Variables }>();
const SERVICE_NAME = 'coderail-flow-api';
const SERVICE_VERSION = '1.0.0';

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

  const authIssues = config.issues
    .filter((issue) => issue.code.startsWith('auth_'))
    .map((issue) => issue.message)
    .join(' ');
  const configuredProviders = getConfiguredAuthProviderIds(c.env);
  checks.auth = {
    name: 'auth',
    status: config.features.auth
      ? 'pass'
      : isRuntimeReadyEnoughForWarnings(config)
        ? 'warn'
        : 'fail',
    message: config.features.auth
      ? `Configured Auth.js providers: ${configuredProviders.join(', ')}`
      : authIssues || 'Authentication is not fully configured.',
  };

  checks.database = await checkDatabase(c.env);
  checks.storage = await checkR2(c.env);
  checks.browser = await checkBrowser(c.env);

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

export { health };
