import type { Session } from '@auth/core/types';
import { authConfigManager, getProviders } from '@hono/auth-js/react';
import { apiUrl } from './api-core';

export interface AuthProviderOption {
  id: string;
  name: string;
}

export interface SessionUser {
  id: string;
  email?: string;
  name?: string;
  image?: string;
  provider?: string;
}

const TOKEN_TTL_MS = 55 * 60 * 1000;
const PROVIDER_ORDER = ['google', 'github', 'microsoft-entra-id', 'linkedin'] as const;
const PROVIDER_LABELS: Record<string, string> = {
  google: 'Google',
  github: 'GitHub',
  'microsoft-entra-id': 'Microsoft',
  linkedin: 'LinkedIn',
};

let authClientConfigured = false;
let cachedToken: { value: string; fetchedAt: number } | null = null;

export function configureAuthClient() {
  if (authClientConfigured) return;

  authConfigManager.setConfig({
    basePath: apiUrl('/auth'),
    credentials: 'include',
  });
  authClientConfigured = true;
}

export function clearApiTokenCache() {
  cachedToken = null;
}

export async function getApiSessionToken(): Promise<string | null> {
  if (cachedToken && Date.now() - cachedToken.fetchedAt < TOKEN_TTL_MS) {
    return cachedToken.value;
  }

  const res = await fetch(apiUrl('/auth/token'), {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });

  if (res.status === 401) {
    clearApiTokenCache();
    return null;
  }

  if (!res.ok) {
    const message = await readErrorMessage(res);
    throw new Error(message || 'Failed to retrieve the API auth token.');
  }

  const data = (await res.json()) as { token?: string };
  if (!data.token) {
    throw new Error('The auth token response was invalid.');
  }

  cachedToken = { value: data.token, fetchedAt: Date.now() };
  return data.token;
}

export function getSessionUser(session: Session | null | undefined): SessionUser | null {
  const user = session?.user as Record<string, unknown> | undefined;
  const id = getStringValue(user?.id);

  if (!id) {
    return null;
  }

  return {
    id,
    email: getStringValue(user?.email),
    name: getStringValue(user?.name),
    image: getStringValue(user?.image),
    provider: getStringValue(user?.provider),
  };
}

export async function listAuthProviders(): Promise<AuthProviderOption[]> {
  const providers = await getProviders();
  if (!providers) {
    return [];
  }

  return Object.values(providers)
    .map((provider) => ({
      id: provider.id,
      name: PROVIDER_LABELS[provider.id] ?? provider.name,
    }))
    .sort((left, right) => compareProviders(left.id, right.id));
}

function compareProviders(left: string, right: string): number {
  return getProviderOrder(left) - getProviderOrder(right);
}

function getProviderOrder(providerId: string): number {
  const index = PROVIDER_ORDER.indexOf(providerId as (typeof PROVIDER_ORDER)[number]);
  return index === -1 ? PROVIDER_ORDER.length : index;
}

function getStringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const text = await res.text();
    if (!text) {
      return res.statusText || 'Request failed.';
    }

    const body = JSON.parse(text);
    if (typeof body?.message === 'string' && body.message) {
      return body.message;
    }
    if (typeof body?.error === 'string' && body.error) {
      return body.error;
    }
    return text;
  } catch {
    // Fall back to status text when the response body is missing or not JSON.
  }

  return res.statusText || 'Request failed.';
}
