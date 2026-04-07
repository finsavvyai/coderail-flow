import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useSession } from '@hono/auth-js/react';
import { Zap, ArrowLeft, CreditCard, Loader2, Folder, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clearApiTokenCache, getApiSessionToken, getSessionUser, listAuthProviders, } from './auth-client';
import { setTokenProvider } from './api';
import { handleSignIn, handleSignOut } from './ProtectedRouteHelpers';
function FullScreenLoader({ label }) {
    return (_jsxs("div", { className: "fullscreen-loader", children: [_jsx(Loader2, { size: 32, className: "spin fullscreen-loader-icon" }), _jsx("div", { className: "fullscreen-loader-label", children: label })] }));
}
function AuthGateCard({ title, body, actions, }) {
    return (_jsx("div", { className: "auth-gate", children: _jsxs("div", { className: "auth-gate-card", children: [_jsx(Zap, { size: 32, className: "auth-gate-icon" }), _jsx("h2", { children: title }), _jsx("p", { children: body }), _jsx("div", { className: "auth-gate-actions", children: actions })] }) }));
}
export function ProtectedRoute({ children }) {
    const { data: session, status } = useSession();
    const user = getSessionUser(session);
    const [tokenReady, setTokenReady] = useState(false);
    const [tokenError, setTokenError] = useState(null);
    const [providers, setProviders] = useState([]);
    const [providersLoading, setProvidersLoading] = useState(false);
    const [providerError, setProviderError] = useState(null);
    const [activeProvider, setActiveProvider] = useState(null);
    const [signInError, setSignInError] = useState(null);
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
            if (cancelled)
                return;
            if (!token) {
                setTokenError('The current session did not issue an API token.');
                return;
            }
            setTokenReady(true);
        })
            .catch((error) => {
            if (cancelled)
                return;
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
            if (!cancelled)
                setProviders(items);
        })
            .catch((error) => {
            if (!cancelled) {
                setProviders([]);
                setProviderError(error instanceof Error ? error.message : 'Failed to load the available sign-in options.');
            }
        })
            .finally(() => {
            if (!cancelled)
                setProvidersLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [status]);
    if (status === 'loading')
        return _jsx(FullScreenLoader, { label: "Restoring your session..." });
    if (user) {
        if (tokenError) {
            return (_jsx(AuthGateCard, { title: "Authentication is not ready.", body: tokenError, actions: _jsxs(_Fragment, { children: [_jsx("button", { className: "lp-btn-primary", onClick: () => void handleSignOut(), children: "Sign Out" }), _jsxs(Link, { to: "/", className: "auth-gate-back", children: [_jsx(ArrowLeft, { size: 14 }), " Back to home"] })] }) }));
        }
        if (!tokenReady)
            return _jsx(FullScreenLoader, { label: "Preparing your workspace..." });
        return (_jsxs(_Fragment, { children: [_jsx("div", { className: "app-topbar", children: _jsxs("div", { className: "app-topbar-inner", children: [_jsxs(Link, { to: "/", className: "app-topbar-brand", children: [_jsx(Zap, { size: 18, strokeWidth: 2.5 }), _jsx("span", { children: "CodeRail Flow" })] }), _jsxs("div", { className: "topbar-nav", children: [_jsx(Link, { to: "/app", className: "nav-link", children: "Dashboard" }), _jsxs(Link, { to: "/projects", className: "nav-link", children: [_jsx(Folder, { size: 14 }), " Projects"] }), _jsxs(Link, { to: "/billing", className: "nav-link", children: [_jsx(CreditCard, { size: 14 }), " Billing"] }), _jsxs("div", { className: "user-pill", children: [_jsxs("div", { className: "user-pill-info", children: [_jsx("span", { className: "user-pill-name", children: user.name || user.email || 'Signed in' }), user.email ? _jsx("span", { className: "user-pill-email", children: user.email }) : null] }), _jsxs("button", { className: "btn btn-signout", onClick: () => void handleSignOut(), children: [_jsx(LogOut, { size: 14 }), "Sign Out"] })] })] })] }) }), children] }));
    }
    const authUnavailable = !providersLoading && providers.length === 0;
    const authGateTitle = providerError
        ? 'Authentication is unavailable.'
        : authUnavailable
            ? 'Authentication is not configured.'
            : 'Sign in to CodeRail Flow';
    const authGateBody = signInError ??
        providerError ??
        (authUnavailable
            ? 'No sign-in providers are configured for this deployment yet.'
            : 'Access your browser automation dashboard.');
    return (_jsx(AuthGateCard, { title: authGateTitle, body: authGateBody, actions: _jsxs(_Fragment, { children: [providersLoading ? (_jsx("button", { className: "lp-btn-primary", disabled: true, children: "Loading sign-in options..." })) : providers.length > 0 ? (providers.map((provider) => (_jsx("button", { className: "lp-btn-primary btn-fullwidth", disabled: activeProvider === provider.id, onClick: () => void handleSignIn(provider.id, setActiveProvider, setSignInError), "aria-label": `Continue with ${provider.name}`, children: activeProvider === provider.id
                        ? `Opening ${provider.name}...`
                        : `Continue with ${provider.name}` }, provider.id)))) : providerError ? (_jsx("button", { className: "lp-btn-primary btn-fullwidth", onClick: () => window.location.reload(), children: "Retry" })) : null, _jsxs(Link, { to: "/", className: "auth-gate-back", children: [_jsx(ArrowLeft, { size: 14 }), " Back to home"] })] }) }));
}
