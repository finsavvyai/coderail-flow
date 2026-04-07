import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ExternalLink } from 'lucide-react';
import { apiAbsoluteUrl } from './api-core';
export function JiraOAuthSetupGuide({ instanceUrl }) {
    const baseUrl = instanceUrl || 'https://your-domain.atlassian.net';
    const oauthUrl = `${baseUrl}/plugins/servlet/oauth/com.atlassian.oauth.oauth2consumer:client-id-plugin`;
    const callbackUrl = apiAbsoluteUrl('/integrations/jira/callback');
    return (_jsxs("div", { className: "jira-oauth-box", children: [_jsxs("div", { className: "jira-oauth-header", children: [_jsx(ExternalLink, { size: 16, className: "jira-oauth-icon" }), _jsx("span", { className: "jira-oauth-title", children: "OAuth 2.0 Setup Required" })] }), _jsxs("ol", { className: "jira-oauth-steps", children: [_jsxs("li", { children: ["Go to", ' ', _jsx("a", { href: oauthUrl, target: "_blank", rel: "noopener noreferrer", className: "jira-oauth-link", children: "Jira OAuth 2.0 settings" })] }), _jsxs("li", { children: ["Create a new OAuth 2.0 client with redirect URL:", ' ', _jsx("code", { className: "jira-oauth-code", children: callbackUrl })] }), _jsx("li", { children: "Copy the Client ID and Secret to this form" })] })] }));
}
