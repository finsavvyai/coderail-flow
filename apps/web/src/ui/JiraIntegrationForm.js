import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Trash2 } from 'lucide-react';
import { useJiraConfig } from './useJiraConfig';
import { JiraInstanceUrlField, JiraCredentialsFields, JiraProjectFields, JiraAutoCreateToggle, } from './JiraFormFields';
import { JiraOAuthSetupGuide } from './JiraOAuthSetupGuide';
function JiraHeader() {
    return (_jsx("div", { className: "jira-header", children: _jsxs("div", { className: "jira-header-row", children: [_jsx("div", { className: "jira-header-icon", children: _jsx("svg", { width: "24", height: "24", viewBox: "0 0 24 24", fill: "white", children: _jsx("path", { d: "M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" }) }) }), _jsxs("div", { children: [_jsx("h2", { style: { margin: 0, fontSize: 20 }, children: "Jira Integration" }), _jsx("div", { className: "jira-header-subtitle", children: "Automatically create Jira issues from failed runs" })] })] }) }));
}
export function JiraIntegrationForm({ projectId, onClose }) {
    const { config, setConfig, loading, testing, existingConfig, saveConfig, testConnection, deleteIntegration, } = useJiraConfig(projectId);
    function handleSubmit(e) {
        e.preventDefault();
        void saveConfig();
    }
    const testDisabled = testing || !config.instanceUrl || !config.clientId;
    return (_jsxs("div", { className: "card jira-form-card", children: [_jsx(JiraHeader, {}), _jsxs("form", { onSubmit: handleSubmit, children: [_jsx(JiraInstanceUrlField, { config: config, existingConfig: existingConfig, onChange: setConfig }), _jsx(JiraCredentialsFields, { config: config, existingConfig: existingConfig, onChange: setConfig }), _jsx(JiraProjectFields, { config: config, existingConfig: existingConfig, onChange: setConfig }), _jsx(JiraAutoCreateToggle, { config: config, existingConfig: existingConfig, onChange: setConfig }), _jsx(JiraOAuthSetupGuide, { instanceUrl: config.instanceUrl }), _jsxs("div", { className: "jira-form-actions", children: [existingConfig && (_jsxs("button", { type: "button", onClick: deleteIntegration, className: "jira-delete-btn", children: [_jsx(Trash2, { size: 14, style: { display: 'inline', marginRight: 6 } }), "Remove"] })), _jsx("button", { type: "button", onClick: testConnection, disabled: testDisabled, className: "btn jira-test-btn", children: testing ? 'Testing...' : 'Test Connection' }), _jsx("button", { type: "submit", disabled: loading, className: `btn jira-submit-btn${loading ? ' jira-submit-btn--loading' : ''}`, children: loading ? 'Saving...' : existingConfig ? 'Update Integration' : 'Create Integration' })] }), onClose && (_jsx("button", { type: "button", onClick: onClose, className: "btn jira-close-btn", children: "Close" }))] })] }));
}
