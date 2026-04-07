import type { Env } from './env';
import { hasConfiguredAuthProvider } from './auth-config';
import {
  PRODUCTION_LIKE_ENVS,
  BILLING_KEYS,
  isNonEmptyString,
  hasMethod,
  parseUrl,
  collectRuntimeIssues,
} from './runtime-config-defaults';

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

export function isProductionLikeEnv(appEnv: string | undefined): boolean {
  return !!appEnv && PRODUCTION_LIKE_ENVS.has(appEnv);
}

function getAllowedOrigins(
  env: Pick<Partial<Env>, 'PUBLIC_BASE_URL' | 'ADDITIONAL_PUBLIC_ORIGINS'>
): string[] {
  const allowedOrigins: string[] = [];
  const publicBaseUrl = parseUrl(env.PUBLIC_BASE_URL);
  if (publicBaseUrl) {
    allowedOrigins.push(publicBaseUrl.origin);
  }

  const additionalOrigins = env.ADDITIONAL_PUBLIC_ORIGINS?.split(',') ?? [];
  for (const value of additionalOrigins) {
    const parsed = parseUrl(value.trim());
    if (parsed && !allowedOrigins.includes(parsed.origin)) {
      allowedOrigins.push(parsed.origin);
    }
  }

  return allowedOrigins;
}

export function resolveCorsOrigin(
  origin: string | undefined,
  env: Pick<Partial<Env>, 'APP_ENV' | 'PUBLIC_BASE_URL' | 'ADDITIONAL_PUBLIC_ORIGINS'>
): string {
  const allowedOrigins = getAllowedOrigins(env);
  if (allowedOrigins.length === 0 || !isProductionLikeEnv(env.APP_ENV)) {
    return origin || '*';
  }

  if (origin && allowedOrigins.includes(origin)) {
    return origin;
  }

  return allowedOrigins[0];
}

export function getRuntimeConfig(env: Partial<Env>): RuntimeConfigStatus {
  const environment = isNonEmptyString(env.APP_ENV) ? env.APP_ENV.trim() : 'unknown';
  const productionLike = isProductionLikeEnv(environment);
  const issues = collectRuntimeIssues(env, productionLike);

  const configuredBillingKeys = BILLING_KEYS.filter((key) => isNonEmptyString(env[key]));

  return {
    ok: !issues.some((issue) => issue.level === 'fail'),
    environment,
    issues,
    features: {
      auth:
        isNonEmptyString(env.AUTH_SECRET) &&
        !!parseUrl(env.AUTH_URL) &&
        hasConfiguredAuthProvider(env),
      browser: hasMethod(env.BROWSER, 'fetch'),
      billing: configuredBillingKeys.length === BILLING_KEYS.length,
      cache: hasMethod(env.CACHE, 'get') && hasMethod(env.CACHE, 'put'),
      kms: hasMethod(env.CLOUDFLARE_KMS, 'fetch'),
      sentry: isNonEmptyString(env.SENTRY_DSN),
      authEncryption: isNonEmptyString(env.AUTH_ENCRYPTION_KEY),
    },
  };
}
