import type { Env } from './env';

export type RuntimeIssueLevel = 'warn' | 'fail';

export interface RuntimeIssue {
  code: string;
  level: RuntimeIssueLevel;
  message: string;
}

export interface RuntimeFeatureFlags {
  auth: boolean;
  browser: boolean;
  billing: boolean;
  cache: boolean;
  kms: boolean;
  sentry: boolean;
  authEncryption: boolean;
}

export interface RuntimeConfigStatus {
  environment: string;
  features: RuntimeFeatureFlags;
  issues: RuntimeIssue[];
  ok: boolean;
}

const VALID_APP_ENVS = new Set(['development', 'test', 'staging', 'production']);
const PRODUCTION_LIKE_ENVS = new Set(['staging', 'production']);
const BILLING_KEYS = [
  'LEMONSQUEEZY_API_KEY',
  'LEMONSQUEEZY_WEBHOOK_SECRET',
  'LEMONSQUEEZY_STORE_ID',
  'LEMONSQUEEZY_VARIANT_PRO',
  'LEMONSQUEEZY_VARIANT_TEAM',
] as const;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function hasMethod(value: unknown, methodName: string): boolean {
  return isObject(value) && typeof value[methodName] === 'function';
}

function parseUrl(value: string | undefined): URL | null {
  if (!isNonEmptyString(value)) return null;

  try {
    return new URL(value);
  } catch {
    return null;
  }
}

export function isProductionLikeEnv(appEnv: string | undefined): boolean {
  return !!appEnv && PRODUCTION_LIKE_ENVS.has(appEnv);
}

export function resolveCorsOrigin(
  origin: string | undefined,
  env: Pick<Partial<Env>, 'APP_ENV' | 'PUBLIC_BASE_URL'>
): string {
  const publicBaseUrl = parseUrl(env.PUBLIC_BASE_URL);
  if (!publicBaseUrl || !isProductionLikeEnv(env.APP_ENV)) {
    return origin || '*';
  }

  const allowedOrigin = publicBaseUrl.origin;
  return origin === allowedOrigin ? origin : allowedOrigin;
}

export function getRuntimeConfig(env: Partial<Env>): RuntimeConfigStatus {
  const issues: RuntimeIssue[] = [];
  const environment = isNonEmptyString(env.APP_ENV) ? env.APP_ENV.trim() : 'unknown';
  const productionLike = isProductionLikeEnv(environment);

  if (!VALID_APP_ENVS.has(environment)) {
    issues.push({
      code: 'app_env_invalid',
      level: 'fail',
      message: 'APP_ENV must be one of development, test, staging, or production.',
    });
  }

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

  const clerkIssuer = parseUrl(env.CLERK_ISSUER);
  if (!isNonEmptyString(env.CLERK_ISSUER)) {
    issues.push({
      code: 'clerk_issuer_missing',
      level: productionLike ? 'fail' : 'warn',
      message: 'CLERK_ISSUER is not configured.',
    });
  } else if (!clerkIssuer) {
    issues.push({
      code: 'clerk_issuer_invalid',
      level: 'fail',
      message: 'CLERK_ISSUER must be a valid absolute URL.',
    });
  } else if (productionLike && clerkIssuer.protocol !== 'https:') {
    issues.push({
      code: 'clerk_issuer_https_required',
      level: 'fail',
      message: 'CLERK_ISSUER must use HTTPS outside local development.',
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

  return {
    ok: !issues.some((issue) => issue.level === 'fail'),
    environment,
    issues,
    features: {
      auth: isNonEmptyString(env.CLERK_ISSUER),
      browser: hasMethod(env.BROWSER, 'fetch'),
      billing: configuredBillingKeys.length === BILLING_KEYS.length,
      cache: hasMethod(env.CACHE, 'get') && hasMethod(env.CACHE, 'put'),
      kms: hasMethod(env.CLOUDFLARE_KMS, 'fetch'),
      sentry: isNonEmptyString(env.SENTRY_DSN),
      authEncryption: isNonEmptyString(env.AUTH_ENCRYPTION_KEY),
    },
  };
}
