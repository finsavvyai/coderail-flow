import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ToastContainer } from './ToastContainer';

vi.mock('react-hot-toast', () => ({
  Toaster: ({
    position,
    toastOptions,
  }: {
    position: string;
    toastOptions: { duration: number };
  }) => (
    <div>
      <span>Toaster position: {position}</span>
      <span>Default duration: {toastOptions.duration}</span>
    </div>
  ),
}));

describe('ToastContainer', () => {
  it('renders the shared toaster shell', () => {
    render(<ToastContainer />);

    expect(screen.getByText('Toaster position: top-right')).toBeInTheDocument();
    expect(screen.getByText('Default duration: 5000')).toBeInTheDocument();
  });
});
