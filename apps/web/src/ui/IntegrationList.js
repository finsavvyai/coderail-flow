import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Webhook, Check, Copy, Globe } from 'lucide-react';
import { API_BASE } from './integrations-types';
import { IntegrationCard } from './IntegrationCard';
export function IntegrationList({ integrations, testing, expandedDeliveries, deliveries, onTest, onToggle, onDelete, onLoadDeliveries, }) {
    if (integrations.length === 0) {
        return (_jsxs("div", { className: "card integ-empty", children: [_jsx(Webhook, { size: 48, strokeWidth: 1, className: "integ-empty-icon" }), _jsx("div", { className: "integ-empty-title", children: "No integrations yet" }), _jsx("div", { className: "integ-empty-hint", children: "Add Slack, GitLab, GitHub, or webhook integrations" })] }));
    }
    return (_jsx("div", { className: "integ-list", children: integrations.map((integ) => (_jsx(IntegrationCard, { integ: integ, testing: testing, expandedDeliveries: expandedDeliveries, deliveries: deliveries, onTest: onTest, onToggle: onToggle, onDelete: onDelete, onLoadDeliveries: onLoadDeliveries }, integ.id))) }));
}
function CodeBlock({ label, url }) {
    const [copied, setCopied] = useState(false);
    return (_jsxs("div", { className: "codeblock-row", children: [_jsxs("span", { className: "codeblock-label", children: [label, ":"] }), _jsx("code", { className: "codeblock-value", children: url }), _jsx("button", { className: "btn codeblock-copy-btn", onClick: () => {
                    void navigator.clipboard.writeText(url);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                }, "aria-label": "Copy webhook URL", children: copied ? _jsx(Check, { size: 10 }) : _jsx(Copy, { size: 10 }) })] }));
}
export function WebhookUrls() {
    return (_jsxs("div", { className: "card webhook-card", children: [_jsxs("div", { className: "webhook-header", children: [_jsx(Globe, { size: 16 }), " Incoming Webhook URLs"] }), _jsx("div", { className: "webhook-hint", children: "Use these URLs in your CI/CD pipelines to trigger flows:" }), _jsxs("div", { className: "webhook-urls", children: [_jsx(CodeBlock, { label: "GitLab CI", url: `${API_BASE}/triggers/gitlab` }), _jsx(CodeBlock, { label: "GitHub Actions", url: `${API_BASE}/triggers/github` }), _jsx(CodeBlock, { label: "Generic (API Key)", url: `${API_BASE}/triggers/run` })] })] }));
}
