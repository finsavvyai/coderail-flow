/**
 * Modal component tests.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

describe('Modal', () => {
  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()}>
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
  });

  it('renders when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('renders title when provided', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Title">
        <div>Content</div>
      </Modal>
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal isOpen={true} onClose={handleClose}>
        <div>Content</div>
      </Modal>
    );

    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal isOpen={true} onClose={handleClose}>
        <div>Content</div>
      </Modal>
    );

    const backdrop = screen.getByTestId('modal-backdrop');
    await user.click(backdrop);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when closeOnBackdropClick is false', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal isOpen={true} onClose={handleClose} closeOnBackdropClick={false}>
        <div>Content</div>
      </Modal>
    );

    const backdrop = screen.getByTestId('modal-backdrop');
    await user.click(backdrop);
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('applies size classes correctly', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={vi.fn()} size="small">
        <div>Content</div>
      </Modal>
    );

    const modal = screen.getByTestId('modal-backdrop');
    expect(modal).toHaveClass('size-small');

    rerender(
      <Modal isOpen={true} onClose={vi.fn()} size="large">
        <div>Content</div>
      </Modal>
    );

    expect(modal).toHaveClass('size-large');
  });
});
