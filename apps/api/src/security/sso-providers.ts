import type { Env } from '../env';

export type OAuthProvider = 'google' | 'github';

export type ProviderTestResult = {
  provider: 'google' | 'github' | 'saml';
  configured: boolean;
  ok: boolean;
  message: string;
};

async function checkReachability(
  url: string
): Promise<{ ok: boolean; status?: number; message: string }> {
  try {
    const res = await fetch(url, { method: 'GET' });
    return {
      ok: res.ok,
      status: res.status,
      message: res.ok ? 'reachable' : `unreachable_status_${res.status}`,
    };
  } catch (error: any) {
    return {
      ok: false,
      message: error?.message || 'request_failed',
    };
  }
}

export async function testGoogleProvider(env: Env): Promise<ProviderTestResult> {
  if (!env.SSO_GOOGLE_CLIENT_ID) {
    return {
      provider: 'google',
      configured: false,
      ok: false,
      message: 'google_client_id_missing',
    };
  }

  const reachability = await checkReachability(
    'https://accounts.google.com/.well-known/openid-configuration'
  );
  return {
    provider: 'google',
    configured: true,
    ok: reachability.ok,
    message: reachability.message,
  };
}

export async function testGithubProvider(env: Env): Promise<ProviderTestResult> {
  if (!env.SSO_GITHUB_CLIENT_ID) {
    return {
      provider: 'github',
      configured: false,
      ok: false,
      message: 'github_client_id_missing',
    };
  }

  const reachability = await checkReachability('https://github.com/login/oauth/authorize');
  return {
    provider: 'github',
    configured: true,
    ok: reachability.ok,
    message: reachability.message,
  };
}

export async function testSamlProvider(env: Env): Promise<ProviderTestResult> {
  const configured = Boolean(env.SSO_SAML_ENTRYPOINT && env.SSO_SAML_CERT);
  if (!configured) {
    return { provider: 'saml', configured: false, ok: false, message: 'saml_config_missing' };
  }

  let validUrl = true;
  try {
    new URL(env.SSO_SAML_ENTRYPOINT!);
  } catch {
    validUrl = false;
  }
  if (!validUrl) {
    return {
      provider: 'saml',
      configured: true,
      ok: false,
      message: 'saml_entrypoint_invalid_url',
    };
  }

  const reachability = await checkReachability(env.SSO_SAML_ENTRYPOINT!);
  return {
    provider: 'saml',
    configured: true,
    ok: reachability.ok,
    message: reachability.message,
  };
}

export function getOAuthConfig(env: Env, provider: OAuthProvider) {
  if (provider === 'google') {
    return {
      clientId: env.SSO_GOOGLE_CLIENT_ID,
      authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      scope: 'openid email profile',
    };
  }

  return {
    clientId: env.SSO_GITHUB_CLIENT_ID,
    authorizeUrl: 'https://github.com/login/oauth/authorize',
    scope: 'read:user user:email',
  };
}

export function buildOAuthAuthorizeUrl(params: {
  authorizeUrl: string;
  clientId: string;
  redirectUri: string;
  scope: string;
  state: string;
}) {
  const url = new URL(params.authorizeUrl);
  url.searchParams.set('client_id', params.clientId);
  url.searchParams.set('redirect_uri', params.redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', params.scope);
  url.searchParams.set('state', params.state);
  return url.toString();
}

export function isValidOAuthRedirectUri(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
