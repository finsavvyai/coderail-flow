import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
const mocks = vi.hoisted(() => ({
    authState: {
        status: 'unauthenticated',
        session: null,
    },
    signIn: vi.fn(async () => undefined),
    signOut: vi.fn(async () => undefined),
    getApiSessionToken: vi.fn(async () => 'token-123'),
    listAuthProviders: vi.fn(async () => [{ id: 'google', name: 'Google' }]),
    clearApiTokenCache: vi.fn(),
}));
vi.mock('@hono/auth-js/react', () => ({
    useSession: () => ({ data: mocks.authState.session, status: mocks.authState.status }),
    signIn: mocks.signIn,
    signOut: mocks.signOut,
}));
vi.mock('./auth-client', () => ({
    clearApiTokenCache: mocks.clearApiTokenCache,
    getApiSessionToken: mocks.getApiSessionToken,
    getSessionUser: (session) => {
        if (!session?.user?.id)
            return null;
        return session.user;
    },
    listAuthProviders: mocks.listAuthProviders,
}));
describe('ProtectedRoute', () => {
    beforeEach(() => {
        mocks.authState.status = 'unauthenticated';
        mocks.authState.session = null;
        mocks.signIn.mockClear();
        mocks.signOut.mockClear();
        mocks.getApiSessionToken.mockClear();
        mocks.listAuthProviders.mockClear();
        mocks.clearApiTokenCache.mockClear();
    });
    it('shows the sign-in gate when signed out', async () => {
        render(_jsx(MemoryRouter, { children: _jsx(ProtectedRoute, { children: _jsx("div", { children: "Protected Content" }) }) }));
        expect(screen.getByText('Sign in to CodeRail Flow')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByText('Continue with Google')).toBeInTheDocument();
        });
        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
    it('shows an explicit configuration message when no providers are available', async () => {
        mocks.listAuthProviders.mockResolvedValueOnce([]);
        render(_jsx(MemoryRouter, { children: _jsx(ProtectedRoute, { children: _jsx("div", { children: "Protected Content" }) }) }));
        await waitFor(() => {
            expect(screen.getByText('Authentication is not configured.')).toBeInTheDocument();
        });
        expect(screen.getByText('No sign-in providers are configured for this deployment yet.')).toBeInTheDocument();
    });
    it('renders children and the topbar once the session token is ready', async () => {
        mocks.authState.status = 'authenticated';
        mocks.authState.session = {
            user: {
                id: 'user-123',
                email: 'test@example.com',
                name: 'Test User',
            },
        };
        render(_jsx(MemoryRouter, { children: _jsx(ProtectedRoute, { children: _jsx("div", { children: "Protected Content" }) }) }));
        await waitFor(() => {
            expect(screen.getByText('Protected Content')).toBeInTheDocument();
        });
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('Sign Out')).toBeInTheDocument();
    });
});
