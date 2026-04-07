import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
export class AppErrorBoundary extends React.Component {
    state = {};
    static getDerivedStateFromError(error) {
        return { error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('Uncaught application error', error, errorInfo);
    }
    handleReload = () => {
        window.location.reload();
    };
    render() {
        if (!this.state.error) {
            return this.props.children;
        }
        return (_jsx("div", { className: "error-boundary-backdrop", children: _jsxs("div", { className: "card error-boundary-card", role: "alert", children: [_jsx("div", { className: "eyebrow error-boundary-eyebrow", children: "Application Error" }), _jsx("h1", { className: "h1", style: { marginBottom: 12 }, children: "The workspace failed to load." }), _jsx("p", { className: "body error-boundary-body", children: "Reload the page to retry. If this persists, check the browser console and API health endpoints before routing traffic to this deployment." }), _jsx("div", { className: "error-boundary-trace", children: this.state.error.message }), _jsx("button", { className: "btn btn-primary", type: "button", onClick: this.handleReload, children: "Reload App" })] }) }));
    }
}
