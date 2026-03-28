export interface WebRuntimeIssue {
  code: string;
  message: string;
}

export interface WebRuntimeConfigStatus {
  apiBase: string;
  apiReady: boolean;
  authReady: boolean;
  allowDevelopmentFallback: boolean;
  protectedAppReady: boolean;
  issues: WebRuntimeIssue[];
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function isLiveClerkPublishableKey(value: string): boolean {
  return value.startsWith('pk_live_');
}

export function getWebRuntimeConfig(env: ImportMetaEnv): WebRuntimeConfigStatus {
  const issues: WebRuntimeIssue[] = [];
  const apiBase = env.VITE_API_URL?.trim() || '/api';
  const clerkPublishableKey = env.VITE_CLERK_PUBLISHABLE_KEY?.trim() || '';
  const authReady = env.PROD
    ? isLiveClerkPublishableKey(clerkPublishableKey)
    : isNonEmptyString(clerkPublishableKey);
  const allowDevelopmentFallback = env.DEV && !authReady;

  let apiReady = true;
  if (env.PROD) {
    apiReady = isNonEmptyString(env.VITE_API_URL) && isHttpsUrl(env.VITE_API_URL);
    if (!apiReady) {
      issues.push({
        code: 'api_url_missing',
        message: 'VITE_API_URL must be set to an HTTPS API origin in production builds.',
      });
    }
  }

  if (env.PROD && !isNonEmptyString(clerkPublishableKey)) {
    issues.push({
      code: 'clerk_publishable_key_missing',
      message:
        'VITE_CLERK_PUBLISHABLE_KEY must be configured with a live Clerk key for protected production routes.',
    });
  } else if (env.PROD && !isLiveClerkPublishableKey(clerkPublishableKey)) {
    issues.push({
      code: 'clerk_publishable_key_invalid',
      message:
        'VITE_CLERK_PUBLISHABLE_KEY must use a pk_live_ Clerk publishable key in production builds.',
    });
  }

  return {
    apiBase,
    apiReady,
    authReady,
    allowDevelopmentFallback,
    protectedAppReady: apiReady && (authReady || allowDevelopmentFallback),
    issues,
  };
}
