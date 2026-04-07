import type { Env } from './env';
import type { RuntimeIssue } from './runtime-config';
import { hasConfiguredAuthProvider } from './auth-config';

export const VALID_APP_ENVS = new Set(['development', 'test', 'staging', 'production']);
export const PRODUCTION_LIKE_ENVS = new Set(['staging', 'production']);
export const BILLING_KEYS = [
  'LEMONSQUEEZY_API_KEY',
  'LEMONSQUEEZY_WEBHOOK_SECRET',
  'LEMONSQUEEZY_STORE_ID',
  'LEMONSQUEEZY_VARIANT_PRO',
  'LEMONSQUEEZY_VARIANT_TEAM',
] as const;

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function hasMethod(value: unknown, methodName: string): boolean {
  return isObject(value) && typeof value[methodName] === 'function';
}

export function parseUrl(value: string | undefined): URL | null {
  if (!isNonEmptyString(value)) return null;

  try {
    return new URL(value);
  } catch {
    return null;
  }
}

/**
 * Collect all runtime configuration issues for the given environment.
 */
export function collectRuntimeIssues(env: Partial<Env>, productionLike: boolean): RuntimeIssue[] {
  const issues: RuntimeIssue[] = [];
  const environment = isNonEmptyString(env.APP_ENV) ? env.APP_ENV.trim() : 'unknown';

  if (!VALID_APP_ENVS.has(environment)) {
    issues.push({
      code: 'app_env_invalid',
      level: 'fail',
      message: 'APP_ENV must be one of development, test, staging, or production.',
    });
  }

  collectUrlIssues(env, productionLike, issues);
  collectBindingIssues(env, productionLike, issues);
  collectAuthIssues(env, productionLike, issues);
  collectOptionalServiceIssues(env, productionLike, issues);

  return issues;
}

function collectUrlIssues(
  env: Partial<Env>,
  productionLike: boolean,
  issues: RuntimeIssue[]
): void {
  const publicBaseUrl = parseUrl(env.PUBLIC_BASE_URL);
  if (!publicBaseUrl) {
    issues.push({
      code: 'public_base_url_invalid',
      level: 'fail',
      message: 'PUBLIC_BASE_URL must be configured as an absolute URL.',
    });
  } else if (productionLike && publicBaseUrl.protocol !== 'https:') {
    issues.push({
      code: 'public_base_url_https_required',
      level: 'fail',
      message: 'PUBLIC_BASE_URL must use HTTPS outside local development.',
    });
  }
}

function collectBindingIssues(
  env: Partial<Env>,
  productionLike: boolean,
  issues: RuntimeIssue[]
): void {
  if (!hasMethod(env.DB, 'prepare')) {
    issues.push({
      code: 'db_binding_missing',
      level: 'fail',
      message: 'The DB binding is not configured.',
    });
  }

  if (!hasMethod(env.ARTIFACTS, 'list')) {
    issues.push({
      code: 'artifacts_binding_missing',
      level: 'fail',
      message: 'The ARTIFACTS bucket binding is not configured.',
    });
  }

  if (!hasMethod(env.BROWSER, 'fetch')) {
    issues.push({
      code: 'browser_binding_missing',
      level: productionLike ? 'fail' : 'warn',
      message: 'The BROWSER binding is missing, so real browser runs are unavailable.',
    });
  }
}

function collectAuthIssues(
  env: Partial<Env>,
  productionLike: boolean,
  issues: RuntimeIssue[]
): void {
  const authUrl = parseUrl(env.AUTH_URL);
  if (!isNonEmptyString(env.AUTH_URL)) {
    issues.push({
      code: 'auth_url_missing',
      level: productionLike ? 'fail' : 'warn',
      message: 'AUTH_URL is not configured.',
    });
  } else if (!authUrl) {
    issues.push({
      code: 'auth_url_invalid',
      level: 'fail',
      message: 'AUTH_URL must be a valid absolute URL.',
    });
  } else if (productionLike && authUrl.protocol !== 'https:') {
    issues.push({
      code: 'auth_url_https_required',
      level: 'fail',
      message: 'AUTH_URL must use HTTPS outside local development.',
    });
  }

  if (!isNonEmptyString(env.AUTH_SECRET)) {
    issues.push({
      code: 'auth_secret_missing',
      level: productionLike ? 'fail' : 'warn',
      message: 'AUTH_SECRET is not configured.',
    });
  }

  if (!hasConfiguredAuthProvider(env)) {
    issues.push({
      code: 'auth_provider_missing',
      level: productionLike ? 'fail' : 'warn',
      message: 'At least one Auth.js OAuth provider must be configured.',
    });
  }

  if (!isNonEmptyString(env.AUTH_ENCRYPTION_KEY)) {
    issues.push({
      code: 'auth_encryption_key_missing',
      level: productionLike ? 'fail' : 'warn',
      message:
        'AUTH_ENCRYPTION_KEY is not configured, so auth profiles would be stored in plain text.',
    });
  }
}

function collectOptionalServiceIssues(
  env: Partial<Env>,
  productionLike: boolean,
  issues: RuntimeIssue[]
): void {
  const sentryDsn = parseUrl(env.SENTRY_DSN);
  if (isNonEmptyString(env.SENTRY_DSN) && !sentryDsn) {
    issues.push({
      code: 'sentry_dsn_invalid',
      level: 'fail',
      message: 'SENTRY_DSN must be a valid URL when provided.',
    });
  } else if (productionLike && !isNonEmptyString(env.SENTRY_DSN)) {
    issues.push({
      code: 'sentry_dsn_missing',
      level: 'warn',
      message: 'SENTRY_DSN is not configured, so production errors will not be reported to Sentry.',
    });
  }

  const configuredBillingKeys = BILLING_KEYS.filter((key) => isNonEmptyString(env[key]));
  if (configuredBillingKeys.length > 0 && configuredBillingKeys.length < BILLING_KEYS.length) {
    issues.push({
      code: 'billing_config_partial',
      level: 'warn',
      message:
        'Billing is only partially configured; checkout and webhook flows may fail at runtime.',
    });
  }
}
