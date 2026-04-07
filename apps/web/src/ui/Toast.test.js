import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ToastContainer } from './ToastContainer';
vi.mock('react-hot-toast', () => ({
    Toaster: ({ position, toastOptions, }) => (_jsxs("div", { children: [_jsxs("span", { children: ["Toaster position: ", position] }), _jsxs("span", { children: ["Default duration: ", toastOptions.duration] })] })),
}));
describe('ToastContainer', () => {
    it('renders the shared toaster shell', () => {
        render(_jsx(ToastContainer, {}));
        expect(screen.getByText('Toaster position: top-right')).toBeInTheDocument();
        expect(screen.getByText('Default duration: 5000')).toBeInTheDocument();
    });
});
