import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnimatedButton } from './AnimatedButton';

describe('AnimatedButton', () => {
  it('renders button text', () => {
    render(<AnimatedButton>Click Me</AnimatedButton>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls the click handler', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<AnimatedButton onClick={handleClick}>Click Me</AnimatedButton>);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled is true', () => {
    render(<AnimatedButton disabled>Disabled</AnimatedButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when loading is true', () => {
    render(<AnimatedButton loading>Loading</AnimatedButton>);
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('applies the selected variant styles', () => {
    const { rerender } = render(<AnimatedButton variant="primary">Primary</AnimatedButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveStyle({ background: 'rgb(59, 130, 246)' });

    rerender(<AnimatedButton variant="secondary">Secondary</AnimatedButton>);
    expect(button).toHaveStyle({ background: 'rgb(42, 42, 42)' });
  });
});
