import { signIn, signOut } from '@hono/auth-js/react';
import { clearApiTokenCache } from './auth-client';
import { setTokenProvider } from './api';

/**
 * Initiates sign-in for the given provider.
 */
export async function handleSignIn(
  providerId: string,
  setActiveProvider: (value: string | null) => void,
  setSignInError: (value: string | null) => void
) {
  setActiveProvider(providerId);
  setSignInError(null);

  try {
    await signIn(providerId as any, { callbackUrl: window.location.href });
  } catch (error) {
    setSignInError(error instanceof Error ? error.message : 'Failed to open the sign-in flow.');
  } finally {
    setActiveProvider(null);
  }
}

/**
 * Signs out the current user and clears cached tokens.
 */
export async function handleSignOut() {
  clearApiTokenCache();
  setTokenProvider(async () => null);
  await signOut({ callbackUrl: `${window.location.origin}/` });
}
