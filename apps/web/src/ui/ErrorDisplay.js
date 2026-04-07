import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { XCircle, RefreshCw, Lightbulb, ChevronDown, ChevronRight } from 'lucide-react';
import { apiUrl } from './api-core';
export function ErrorDisplay({ run, errorScreenshot, onRetry }) {
    const [showStack, setShowStack] = useState(false);
    const [retrying, setRetrying] = useState(false);
    const handleRetry = async () => {
        if (!onRetry)
            return;
        setRetrying(true);
        try {
            await onRetry();
        }
        finally {
            setRetrying(false);
        }
    };
    return (_jsxs("div", { className: "error-display", children: [_jsxs("div", { className: "error-display-header", children: [_jsxs("div", { className: "error-display-header-left", children: [_jsx(XCircle, { size: 24, className: "error-display-icon" }), _jsxs("div", { children: [_jsx("div", { className: "h2 error-display-title", children: "Execution Failed" }), _jsx("div", { className: "small error-display-code", children: run.error_code || 'UNKNOWN_ERROR' })] })] }), onRetry && (_jsxs("button", { className: "btn error-display-retry", onClick: handleRetry, disabled: retrying, children: [_jsx(RefreshCw, { size: 14, className: "ftr-inline-icon" }), retrying ? 'Retrying...' : 'Retry'] }))] }), _jsxs("div", { className: "error-display-panel", children: [_jsx("div", { className: "small error-display-label", children: "Error Message:" }), _jsx("div", { className: "error-display-message", children: run.error_message || 'No error message provided' })] }), errorScreenshot && (_jsxs("div", { className: "error-display-panel", children: [_jsx("div", { className: "small error-display-label", children: "Screenshot at time of failure:" }), _jsx("button", { onClick: () => {
                            window.open(apiUrl(`/artifacts/${errorScreenshot.id}/preview`), '_blank');
                        }, "aria-label": "View error screenshot full size", className: "error-display-screenshot-btn", children: _jsx("img", { src: apiUrl(`/artifacts/${errorScreenshot.id}/preview`), alt: "Error screenshot", className: "error-display-screenshot-img" }) })] })), run.error_message && run.error_message.includes('\n') && (_jsxs("div", { children: [_jsxs("button", { className: "btn error-display-toggle", onClick: () => setShowStack(!showStack), "aria-expanded": showStack, "aria-label": showStack ? 'Hide error details' : 'Show error details', children: [showStack ? _jsx(ChevronDown, { size: 14 }) : _jsx(ChevronRight, { size: 14 }), showStack ? 'Hide Details' : 'Show Details'] }), showStack && _jsx("pre", { className: "error-display-stack", children: run.error_message })] })), _jsxs("div", { className: "error-display-panel", children: [_jsxs("div", { className: "small error-display-tips", children: [_jsx(Lightbulb, { size: 14, className: "error-display-tips-icon" }), "Troubleshooting Tips:"] }), _jsxs("ul", { className: "error-display-tips-list", children: [_jsx("li", { children: "Check if the target page structure has changed" }), _jsx("li", { children: "Verify element locators are still valid" }), _jsx("li", { children: "Ensure the page loaded completely before interaction" }), _jsx("li", { children: "Check network connectivity and timeouts" }), _jsx("li", { children: "Review the error screenshot for visual clues" })] })] })] }));
}
