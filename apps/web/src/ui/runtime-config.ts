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

export function getWebRuntimeConfig(env: ImportMetaEnv): WebRuntimeConfigStatus {
  const issues: WebRuntimeIssue[] = [];
  const apiBase = env.VITE_API_URL?.trim() || '/api';
  const authReady = !env.DEV;
  const allowDevelopmentFallback = !!env.DEV;

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

  return {
    apiBase,
    apiReady,
    authReady,
    allowDevelopmentFallback,
    protectedAppReady: apiReady && (authReady || allowDevelopmentFallback),
    issues,
  };
}
