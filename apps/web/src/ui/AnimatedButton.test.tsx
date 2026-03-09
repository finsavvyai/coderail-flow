/**
 * Button component tests.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnimatedButton } from './AnimatedButton';

describe('AnimatedButton', () => {
  it('renders button with text', () => {
    render(<AnimatedButton>Click Me</AnimatedButton>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<AnimatedButton onClick={handleClick}>Click Me</AnimatedButton>);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<AnimatedButton disabled>Click Me</AnimatedButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('shows loading state when isLoading is true', () => {
    render(<AnimatedButton isLoading>Loading</AnimatedButton>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('applies variant styles correctly', () => {
    const { rerender } = render(<AnimatedButton variant="primary">Primary</AnimatedButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('variant-primary');

    rerender(<AnimatedButton variant="secondary">Secondary</AnimatedButton>);
    expect(button).toHaveClass('variant-secondary');
  });
});
