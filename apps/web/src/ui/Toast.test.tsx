/**
 * Toast component tests.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Toast } from './Toast';

describe('Toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders success toast', () => {
    render(<Toast message="Success!" type="success" />);
    expect(screen.getByText('Success!')).toBeInTheDocument();
  });

  it('renders error toast', () => {
    render(<Toast message="Error occurred" type="error" />);
    expect(screen.getByText('Error occurred')).toBeInTheDocument();
  });

  it('auto-dismisses after timeout', async () => {
    render(<Toast message="Auto dismiss" duration={3000} />);

    vi.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(screen.queryByText('Auto dismiss')).not.toBeInTheDocument();
    });
  });

  it('renders close button', () => {
    render(<Toast message="Closable" onClose={vi.fn()} />);
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(<Toast message="Close me" onClose={handleClose} />);

    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
