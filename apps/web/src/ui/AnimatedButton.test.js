import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AnimatedButton } from './AnimatedButton';
describe('AnimatedButton', () => {
    it('renders button text', () => {
        render(_jsx(AnimatedButton, { children: "Click Me" }));
        expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
    });
    it('calls the click handler', async () => {
        const handleClick = vi.fn();
        const user = userEvent.setup();
        render(_jsx(AnimatedButton, { onClick: handleClick, children: "Click Me" }));
        await user.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });
    it('is disabled when disabled is true', () => {
        render(_jsx(AnimatedButton, { disabled: true, children: "Disabled" }));
        expect(screen.getByRole('button')).toBeDisabled();
    });
    it('is disabled when loading is true', () => {
        render(_jsx(AnimatedButton, { loading: true, children: "Loading" }));
        expect(screen.getByRole('button')).toBeDisabled();
        expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
    it('applies the selected variant styles', () => {
        const { rerender } = render(_jsx(AnimatedButton, { variant: "primary", children: "Primary" }));
        const button = screen.getByRole('button');
        expect(button).toHaveStyle({ background: 'rgb(59, 130, 246)' });
        rerender(_jsx(AnimatedButton, { variant: "secondary", children: "Secondary" }));
        expect(button).toHaveStyle({ background: 'rgb(42, 42, 42)' });
    });
});
