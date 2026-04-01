import type { AuthUser, AuthConfig } from '@hono/auth-js';
import GitHub from '@auth/core/providers/github';
import Google from '@auth/core/providers/google';
import LinkedIn from '@auth/core/providers/linkedin';
import MicrosoftEntraID from '@auth/core/providers/microsoft-entra-id';
import type { Env } from './env';

export const AUTH_BASE_PATH = '/auth';

export interface SessionUserProfile {
  id: string;
  email?: string;
  name?: string;
  image?: string;
  provider?: string;
}

export function hasConfiguredAuthProvider(env: Partial<Env>): boolean {
  return getConfiguredAuthProviderIds(env).length > 0;
}

export function getConfiguredAuthProviderIds(env: Partial<Env>): string[] {
  const providerIds: string[] = [];

  if (isNonEmptyString(env.GOOGLE_CLIENT_ID) && isNonEmptyString(env.GOOGLE_CLIENT_SECRET)) {
    providerIds.push('google');
  }
  if (isNonEmptyString(env.GITHUB_CLIENT_ID) && isNonEmptyString(env.GITHUB_CLIENT_SECRET)) {
    providerIds.push('github');
  }
  if (isNonEmptyString(env.LINKEDIN_CLIENT_ID) && isNonEmptyString(env.LINKEDIN_CLIENT_SECRET)) {
    providerIds.push('linkedin');
  }
  if (isNonEmptyString(env.AZURE_AD_CLIENT_ID) && isNonEmptyString(env.AZURE_AD_CLIENT_SECRET)) {
    providerIds.push('microsoft-entra-id');
  }

  return providerIds;
}

export function getAuthConfig(env: Env): AuthConfig {
  return {
    secret: env.AUTH_SECRET,
    basePath: AUTH_BASE_PATH,
    trustHost: true,
    session: { strategy: 'jwt' },
    providers: buildProviders(env),
    callbacks: {
      async redirect({ url, baseUrl }: any) {
        if (typeof url !== 'string' || url.length === 0) {
          return getDefaultRedirectTarget(env, baseUrl);
        }

        if (url.startsWith('/')) {
          return `${baseUrl}${url}`;
        }

        try {
          const target = new URL(url);
          if (target.origin === baseUrl || getAllowedRedirectOrigins(env).includes(target.origin)) {
            return url;
          }
        } catch {
          // Fall through to the safe default below when the callback URL is invalid.
        }

        return getDefaultRedirectTarget(env, baseUrl);
      },
      async jwt({ token, user, trigger, account }: any) {
        if (trigger === 'signIn' && user) {
          token.email = user.email;
          token.name = user.name ?? user.email?.split('@')[0];
          token.picture = user.image;
          if (account?.provider) {
            token.provider = account.provider;
          }
        }

        return token;
      },
      async session({ session, token }: any) {
        if (session.user) {
          const sessionUser = session.user as Record<string, unknown>;
          sessionUser.id = token.sub;
          sessionUser.image = token.picture;
          sessionUser.provider = token.provider;
        }

        return session;
      },
    },
  };
}

export function getSessionUserProfile(authUser: AuthUser | null): SessionUserProfile | null {
  const sessionUser =
    authUser && authUser.session && authUser.session.user
      ? (authUser.session.user as Record<string, unknown>)
      : null;
  const token = authUser?.token as Record<string, unknown> | undefined;
  const id =
    getStringValue(sessionUser?.id) ??
    getStringValue(authUser?.user?.id) ??
    getStringValue(token?.sub);

  if (!id) {
    return null;
  }

  return {
    id,
    email: getStringValue(sessionUser?.email) ?? getStringValue(token?.email),
    name: getStringValue(sessionUser?.name) ?? getStringValue(token?.name),
    image: getStringValue(sessionUser?.image) ?? getStringValue(token?.picture),
    provider: getStringValue(sessionUser?.provider) ?? getStringValue(token?.provider),
  };
}

function buildProviders(env: Env) {
  const providers = [];

  if (isNonEmptyString(env.GOOGLE_CLIENT_ID) && isNonEmptyString(env.GOOGLE_CLIENT_SECRET)) {
    providers.push(
      Google({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: true,
      })
    );
  }

  if (isNonEmptyString(env.GITHUB_CLIENT_ID) && isNonEmptyString(env.GITHUB_CLIENT_SECRET)) {
    providers.push(
      GitHub({
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: true,
      })
    );
  }

  if (isNonEmptyString(env.LINKEDIN_CLIENT_ID) && isNonEmptyString(env.LINKEDIN_CLIENT_SECRET)) {
    providers.push(
      LinkedIn({
        clientId: env.LINKEDIN_CLIENT_ID,
        clientSecret: env.LINKEDIN_CLIENT_SECRET,
        allowDangerousEmailAccountLinking: true,
      })
    );
  }

  if (isNonEmptyString(env.AZURE_AD_CLIENT_ID) && isNonEmptyString(env.AZURE_AD_CLIENT_SECRET)) {
    providers.push(
      MicrosoftEntraID({
        clientId: env.AZURE_AD_CLIENT_ID,
        clientSecret: env.AZURE_AD_CLIENT_SECRET,
        issuer: `https://login.microsoftonline.com/${env.AZURE_AD_TENANT_ID ?? 'common'}/v2.0`,
        allowDangerousEmailAccountLinking: true,
      })
    );
  }

  return providers;
}

function getAllowedRedirectOrigins(env: Partial<Env>): string[] {
  const origins: string[] = [];

  for (const value of [env.PUBLIC_BASE_URL, ...(env.ADDITIONAL_PUBLIC_ORIGINS?.split(',') ?? [])]) {
    if (!isNonEmptyString(value)) continue;

    try {
      const origin = new URL(value.trim()).origin;
      if (!origins.includes(origin)) {
        origins.push(origin);
      }
    } catch {
      // Ignore invalid URLs in auth redirect allow-list construction.
    }
  }

  return origins;
}

function getDefaultRedirectTarget(env: Partial<Env>, baseUrl: string): string {
  return getAllowedRedirectOrigins(env)[0] ?? baseUrl;
}

function getStringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
