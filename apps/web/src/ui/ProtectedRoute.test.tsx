/**
 * ProtectedRoute component tests.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from './ProtectedRoute';

// Mock Clerk
vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: false,
  }),
  SignedIn: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SignedOut: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  RedirectToSignIn: () => <div>Redirecting to sign in...</div>,
}));

describe('ProtectedRoute', () => {
  it('shows redirect message when not signed in', () => {
    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Redirecting to sign in')).toBeInTheDocument();
  });

  it('applies custom redirect path', () => {
    render(
      <ProtectedRoute redirectPath="/custom-signin">
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Redirecting to sign in')).toBeInTheDocument();
  });

  it('renders fallback component when provided', () => {
    const Fallback = () => <div>Custom Fallback</div>;

    render(
      <ProtectedRoute fallback={Fallback}>
        <div>Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Custom Fallback')).toBeInTheDocument();
  });
});
