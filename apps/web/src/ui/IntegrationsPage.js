import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Plus, Webhook, Key } from 'lucide-react';
import { useIntegrations } from './useIntegrations';
import { AddIntegrationForm } from './AddIntegrationForm';
import { IntegrationList, WebhookUrls } from './IntegrationList';
import { ApiKeysTab } from './ApiKeysTab';
import { JiraIntegrationForm } from './JiraIntegrationForm';
export function IntegrationsPage({ projectId }) {
    const [tab, setTab] = useState('integrations');
    const [showAdd, setShowAdd] = useState(false);
    const { integrations, apiKeys, loading, expandedDeliveries, deliveries, testing, createIntegration, toggleIntegration, deleteIntegration, testIntegration, loadDeliveries, createApiKey, deleteApiKey, } = useIntegrations(projectId);
    if (loading) {
        return _jsx("div", { className: "integ-loading", children: "Loading integrations..." });
    }
    return (_jsxs("div", { className: "integ-page", children: [_jsxs("div", { className: "integ-tabs", children: [_jsxs("button", { className: `btn integ-tab${tab === 'integrations' ? ' integ-tab--active' : ''}`, onClick: () => setTab('integrations'), children: [_jsx(Webhook, { size: 14 }), " Integrations"] }), _jsxs("button", { className: `btn integ-tab${tab === 'jira' ? ' integ-tab--jira-active' : ''}`, onClick: () => setTab('jira'), children: [_jsx("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "currentColor", children: _jsx("path", { d: "M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" }) }), "Jira"] }), _jsxs("button", { className: `btn integ-tab${tab === 'apikeys' ? ' integ-tab--active' : ''}`, onClick: () => setTab('apikeys'), children: [_jsx(Key, { size: 14 }), " API Keys"] })] }), tab === 'integrations' && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "integ-header", children: [_jsxs("div", { children: [_jsx("div", { className: "h2", style: { margin: 0 }, children: "Integrations" }), _jsx("div", { className: "integ-header-subtitle", children: "Connect Slack, GitLab, GitHub, and custom webhooks" })] }), _jsxs("button", { className: "btn integ-add-btn", onClick: () => setShowAdd(!showAdd), children: [_jsx(Plus, { size: 14 }), " Add Integration"] })] }), showAdd && (_jsx(AddIntegrationForm, { onSubmit: async (type, name, config) => {
                            const ok = await createIntegration(type, name, config);
                            if (ok)
                                setShowAdd(false);
                            return ok;
                        }, onCancel: () => setShowAdd(false) })), (!showAdd || integrations.length > 0) && (_jsx(IntegrationList, { integrations: integrations, testing: testing, expandedDeliveries: expandedDeliveries, deliveries: deliveries, onTest: testIntegration, onToggle: toggleIntegration, onDelete: deleteIntegration, onLoadDeliveries: loadDeliveries })), _jsx(WebhookUrls, {})] })), tab === 'apikeys' && (_jsx(ApiKeysTab, { apiKeys: apiKeys, onCreateKey: createApiKey, onDeleteKey: deleteApiKey })), tab === 'jira' && _jsx(JiraIntegrationForm, { projectId: projectId })] }));
}
