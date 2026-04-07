import React, { useEffect, useState } from 'react';
import { useSession } from '@hono/auth-js/react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  clearApiTokenCache,
  getApiSessionToken,
  getSessionUser,
  listAuthProviders,
  type AuthProviderOption,
} from './auth-client';
import { setTokenProvider } from './api';
import { handleSignIn, handleSignOut } from './ProtectedRouteHelpers';
import { FullScreenLoader, AuthGateCard, AppTopBar } from './ProtectedRouteUI';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const user = getSessionUser(session);
  const [tokenReady, setTokenReady] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [providers, setProviders] = useState<AuthProviderOption[]>([]);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [providerError, setProviderError] = useState<string | null>(null);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [signInError, setSignInError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      clearApiTokenCache();
      setTokenProvider(async () => null);
      setTokenReady(false);
      setTokenError(null);
      setSignInError(null);
      return;
    }

    let cancelled = false;
    setTokenReady(false);
    setTokenError(null);
    setTokenProvider(getApiSessionToken);

    void getApiSessionToken()
      .then((token) => {
        if (cancelled) return;
        if (!token) {
          setTokenError('The current session did not issue an API token.');
          return;
        }
        setTokenReady(true);
      })
      .catch((error) => {
        if (cancelled) return;
        setTokenError(error instanceof Error ? error.message : 'Failed to initialize auth.');
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (status !== 'unauthenticated') {
      setProviderError(null);
      return;
    }

    let cancelled = false;
    setProvidersLoading(true);
    setProviderError(null);
    setSignInError(null);

    void listAuthProviders()
      .then((items) => {
        if (!cancelled) setProviders(items);
      })
      .catch((error) => {
        if (!cancelled) {
          setProviders([]);
          setProviderError(
            error instanceof Error ? error.message : 'Failed to load the available sign-in options.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) setProvidersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [status]);

  if (status === 'loading') return <FullScreenLoader label="Restoring your session..." />;

  if (user) {
    if (tokenError) {
      return (
        <AuthGateCard
          title="Authentication is not ready."
          body={tokenError}
          actions={
            <>
              <button className="lp-btn-primary" onClick={() => void handleSignOut()}>
                Sign Out
              </button>
              <Link to="/" className="auth-gate-back">
                <ArrowLeft size={14} /> Back to home
              </Link>
            </>
          }
        />
      );
    }

    if (!tokenReady) return <FullScreenLoader label="Preparing your workspace..." />;

    return (
      <AppTopBar user={user} onSignOut={() => void handleSignOut()}>
        {children}
      </AppTopBar>
    );
  }

  const authUnavailable = !providersLoading && providers.length === 0;
  const authGateTitle = providerError
    ? 'Authentication is unavailable.'
    : authUnavailable
      ? 'Authentication is not configured.'
      : 'Sign in to CodeRail Flow';
  const authGateBody =
    signInError ??
    providerError ??
    (authUnavailable
      ? 'No sign-in providers are configured for this deployment yet.'
      : 'Access your browser automation dashboard.');

  return (
    <AuthGateCard
      title={authGateTitle}
      body={authGateBody}
      actions={
        <>
          {providersLoading ? (
            <button className="lp-btn-primary" disabled>
              Loading sign-in options...
            </button>
          ) : providers.length > 0 ? (
            providers.map((provider) => (
              <button
                key={provider.id}
                className="lp-btn-primary btn-fullwidth"
                disabled={activeProvider === provider.id}
                onClick={() => void handleSignIn(provider.id, setActiveProvider, setSignInError)}
                aria-label={`Continue with ${provider.name}`}
              >
                {activeProvider === provider.id
                  ? `Opening ${provider.name}...`
                  : `Continue with ${provider.name}`}
              </button>
            ))
          ) : providerError ? (
            <button
              className="lp-btn-primary btn-fullwidth"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          ) : null}
          <Link to="/" className="auth-gate-back">
            <ArrowLeft size={14} /> Back to home
          </Link>
        </>
      }
    />
  );
}
