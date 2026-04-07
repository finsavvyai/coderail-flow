import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppErrorBoundary } from './AppErrorBoundary';
function BrokenComponent() {
    throw new Error('Boom');
}
describe('AppErrorBoundary', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });
    it('renders children when no error is thrown', () => {
        render(_jsx(AppErrorBoundary, { children: _jsx("div", { children: "Workspace ready" }) }));
        expect(screen.getByText('Workspace ready')).toBeInTheDocument();
    });
    it('renders a recovery screen when a child throws', () => {
        vi.spyOn(console, 'error').mockImplementation(() => { });
        render(_jsx(AppErrorBoundary, { children: _jsx(BrokenComponent, {}) }));
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('The workspace failed to load.')).toBeInTheDocument();
        expect(screen.getByText('Boom')).toBeInTheDocument();
    });
});
