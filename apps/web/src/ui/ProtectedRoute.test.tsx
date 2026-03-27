import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ProtectedRoute } from './ProtectedRoute';

const authState = {
  getToken: vi.fn(async () => 'token-123'),
  isLoaded: true,
  isSignedIn: false,
};

vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => authState,
  SignedIn: ({ children }: { children: ReactNode }) =>
    authState.isSignedIn ? <>{children}</> : null,
  SignedOut: ({ children }: { children: ReactNode }) =>
    authState.isSignedIn ? null : <>{children}</>,
  SignInButton: ({ children }: { children: ReactNode }) => <>{children}</>,
  UserButton: () => <div>User Menu</div>,
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    authState.isSignedIn = false;
    authState.getToken.mockClear();
  });

  it('shows the sign-in gate when signed out', () => {
    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    expect(screen.getByText('Sign in to CodeRail Flow')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children and topbar once a token is available', async () => {
    authState.isSignedIn = true;

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    expect(screen.getByText('User Menu')).toBeInTheDocument();
  });
});
