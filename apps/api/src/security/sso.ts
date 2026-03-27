import { Hono } from 'hono';
import type { Env } from '../env';
import { uuid } from '../ids';
import {
  type OAuthProvider,
  type ProviderTestResult,
  testGoogleProvider,
  testGithubProvider,
  testSamlProvider,
  getOAuthConfig,
  buildOAuthAuthorizeUrl,
  isValidOAuthRedirectUri,
} from './sso-providers';

type Variables = { userId: string; userEmail?: string };

export function ssoRoutes() {
  const app = new Hono<{ Bindings: Env; Variables: Variables }>();

  app.get('/providers', (c) => {
    const env = c.env;
    return c.json({
      saml: {
        configured: Boolean(env.SSO_SAML_ENTRYPOINT && env.SSO_SAML_CERT),
      },
      oauth: {
        google: Boolean(env.SSO_GOOGLE_CLIENT_ID),
        github: Boolean(env.SSO_GITHUB_CLIENT_ID),
      },
    });
  });

  app.post('/oauth/start', async (c) => {
    const env = c.env;
    const body = await c.req.json<{ provider?: OAuthProvider; redirectUri?: string }>();
    const provider = body.provider;

    if (!provider || !body.redirectUri) {
      return c.json({ error: 'provider_and_redirect_uri_required' }, 400);
    }

    if (!isValidOAuthRedirectUri(body.redirectUri)) {
      return c.json({ error: 'invalid_redirect_uri' }, 400);
    }

    if (provider !== 'google' && provider !== 'github') {
      return c.json({ error: 'unsupported_provider' }, 400);
    }

    const config = getOAuthConfig(env, provider);
    if (!config.clientId) {
      return c.json({ error: 'provider_not_configured' }, 400);
    }

    const state = uuid();
    const authorizationUrl = buildOAuthAuthorizeUrl({
      authorizeUrl: config.authorizeUrl,
      clientId: config.clientId,
      redirectUri: body.redirectUri,
      scope: config.scope,
      state,
    });

    return c.json({ provider, authorizationUrl, state });
  });

  app.get('/oauth/callback', (c) => {
    const provider = c.req.query('provider');
    const code = c.req.query('code');
    const state = c.req.query('state');

    if (!provider || !code || !state) {
      return c.json({ error: 'provider_code_state_required' }, 400);
    }

    return c.json({
      ok: true,
      provider,
      message: 'OAuth callback foundation ready. Token exchange and user provisioning are pending.',
    });
  });

  app.post('/saml/start', async (c) => {
    const env = c.env;
    const body = await c.req.json<{ relayState?: string }>();

    if (!env.SSO_SAML_ENTRYPOINT) {
      return c.json({ error: 'saml_not_configured' }, 400);
    }

    return c.json({
      redirectUrl: env.SSO_SAML_ENTRYPOINT,
      relayState: body.relayState || uuid(),
      message: 'SAML SSO foundation ready. Signed AuthnRequest support is pending.',
    });
  });

  app.get('/test', async (c) => {
    const provider = c.req.query('provider');
    const env = c.env;

    if (provider && !['google', 'github', 'saml'].includes(provider)) {
      return c.json({ error: 'unsupported_provider' }, 400);
    }

    const tests: ProviderTestResult[] = [];
    if (!provider || provider === 'google') tests.push(await testGoogleProvider(env));
    if (!provider || provider === 'github') tests.push(await testGithubProvider(env));
    if (!provider || provider === 'saml') tests.push(await testSamlProvider(env));

    const allOk = tests.every((test) => test.ok);
    return c.json({ ok: allOk, tests });
  });

  return app;
}
