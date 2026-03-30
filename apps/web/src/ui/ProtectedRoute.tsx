import React, { useEffect, useState } from 'react';
import { signIn, signOut, useSession } from '@hono/auth-js/react';
import { Zap, ArrowLeft, CreditCard, Loader2, Folder, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  clearApiTokenCache,
  getApiSessionToken,
  getSessionUser,
  listAuthProviders,
  type AuthProviderOption,
} from './auth-client';
import { setTokenProvider } from './api';

function FullScreenLoader({ label }: { label: string }) {
  return (
    <div className="fullscreen-loader">
      <Loader2 size={32} className="spin fullscreen-loader-icon" />
      <div className="fullscreen-loader-label">{label}</div>
    </div>
  );
}

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
        if (!cancelled) {
          setProviders(items);
        }
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
        if (!cancelled) {
          setProvidersLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [status]);

  if (status === 'loading') {
    return <FullScreenLoader label="Restoring your session..." />;
  }

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

    if (!tokenReady) {
      return <FullScreenLoader label="Preparing your workspace..." />;
    }

    return (
      <>
        <div className="app-topbar">
          <div className="app-topbar-inner">
            <Link to="/" className="app-topbar-brand">
              <Zap size={18} strokeWidth={2.5} />
              <span>CodeRail Flow</span>
            </Link>
            <div className="topbar-nav">
              <Link to="/app" className="nav-link">
                Dashboard
              </Link>
              <Link to="/projects" className="nav-link">
                <Folder size={14} /> Projects
              </Link>
              <Link to="/billing" className="nav-link">
                <CreditCard size={14} /> Billing
              </Link>
              <div className="user-pill">
                <div className="user-pill-info">
                  <span className="user-pill-name">
                    {user.name || user.email || 'Signed in'}
                  </span>
                  {user.email ? (
                    <span className="user-pill-email">{user.email}</span>
                  ) : null}
                </div>
                <button
                  className="btn btn-signout"
                  onClick={() => void handleSignOut()}
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
        {children}
      </>
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

function AuthGateCard({
  title,
  body,
  actions,
}: {
  title: string;
  body: string;
  actions: React.ReactNode;
}) {
  return (
    <div className="auth-gate">
      <div className="auth-gate-card">
        <Zap size={32} className="auth-gate-icon" />
        <h2>{title}</h2>
        <p>{body}</p>
        <div className="auth-gate-actions">
          {actions}
        </div>
      </div>
    </div>
  );
}

async function handleSignIn(
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

async function handleSignOut() {
  clearApiTokenCache();
  setTokenProvider(async () => null);
  await signOut({ callbackUrl: `${window.location.origin}/` });
}
