import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';
describe('Modal', () => {
    it('does not render when closed', () => {
        render(_jsx(Modal, { open: false, onClose: vi.fn(), children: _jsx("div", { children: "Modal Content" }) }));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    it('renders content and title when open', () => {
        render(_jsx(Modal, { open: true, onClose: vi.fn(), title: "Test Title", children: _jsx("div", { children: "Modal Content" }) }));
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });
    it('calls onClose when the close button is clicked', async () => {
        const handleClose = vi.fn();
        const user = userEvent.setup();
        render(_jsx(Modal, { open: true, onClose: handleClose, title: "Closable", children: _jsx("div", { children: "Content" }) }));
        await user.click(screen.getByRole('button', { name: /close dialog/i }));
        expect(handleClose).toHaveBeenCalledTimes(1);
    });
    it('calls onClose when the backdrop is clicked', async () => {
        const handleClose = vi.fn();
        const user = userEvent.setup();
        render(_jsx(Modal, { open: true, onClose: handleClose, title: "Closable", children: _jsx("div", { children: "Content" }) }));
        await user.click(screen.getByRole('dialog'));
        expect(handleClose).toHaveBeenCalledTimes(1);
    });
    it('closes when Escape is pressed', () => {
        const handleClose = vi.fn();
        render(_jsx(Modal, { open: true, onClose: handleClose, title: "Closable", children: _jsx("button", { type: "button", children: "Focusable" }) }));
        fireEvent.keyDown(document, { key: 'Escape' });
        expect(handleClose).toHaveBeenCalledTimes(1);
    });
});
