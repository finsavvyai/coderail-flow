import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Plus, Trash2, Key } from 'lucide-react';
import { API_BASE } from './integrations-types';
import { NewKeyBanner, AddKeyForm, EmptyKeyState } from './ApiKeyForm';
export function ApiKeysTab({ apiKeys, onCreateKey, onDeleteKey }) {
    const [showAddKey, setShowAddKey] = useState(false);
    const [newKey, setNewKey] = useState(null);
    const [keyName, setKeyName] = useState('');
    const [keyExpiry, setKeyExpiry] = useState('90');
    async function handleCreate() {
        const key = await onCreateKey(keyName, parseInt(keyExpiry) || 90);
        if (key) {
            setNewKey(key);
            setKeyName('');
        }
    }
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "api-key-header", children: [_jsxs("div", { children: [_jsx("div", { className: "h2", children: "API Keys" }), _jsx("div", { className: "api-key-subtitle", children: "Use API keys to trigger flows from CI/CD, CLI, or external services" })] }), _jsxs("button", { className: "btn api-key-create-btn", onClick: () => {
                            setShowAddKey(!showAddKey);
                            setNewKey(null);
                        }, children: [_jsx(Plus, { size: 14 }), " Create Key"] })] }), newKey && _jsx(NewKeyBanner, { keyValue: newKey }), showAddKey && !newKey && (_jsx(AddKeyForm, { keyName: keyName, keyExpiry: keyExpiry, onNameChange: setKeyName, onExpiryChange: setKeyExpiry, onCreate: handleCreate, onCancel: () => setShowAddKey(false) })), apiKeys.length === 0 && !showAddKey ? (_jsx(EmptyKeyState, {})) : (_jsx(KeyList, { apiKeys: apiKeys, onDelete: onDeleteKey })), _jsx(UsageExamples, {})] }));
}
function KeyList({ apiKeys, onDelete }) {
    return (_jsx("div", { className: "api-key-list", children: apiKeys.map((key) => (_jsxs("div", { className: "card api-key-card", children: [_jsx(Key, { size: 16, className: "api-key-icon" }), _jsxs("div", { className: "api-key-info", children: [_jsx("div", { className: "api-key-info-name", children: key.name }), _jsxs("div", { className: "api-key-info-meta", children: [_jsxs("code", { children: [key.key_prefix, "..."] }), key.last_used_at &&
                                    ` · Last used ${new Date(key.last_used_at).toLocaleDateString()}`, key.expires_at && ` · Expires ${new Date(key.expires_at).toLocaleDateString()}`] })] }), _jsx("button", { className: "btn api-key-delete-btn", onClick: () => onDelete(key.id), "aria-label": "Delete API key", children: _jsx(Trash2, { size: 12 }) })] }, key.id))) }));
}
function UsageExamples() {
    return (_jsxs("div", { className: "card api-key-usage-card", children: [_jsx("div", { className: "api-key-usage-title", children: "Usage Examples" }), _jsx("div", { className: "api-key-usage-label", children: "Trigger a flow run via API:" }), _jsx("pre", { className: "api-key-code-block", children: `curl -X POST ${API_BASE}/triggers/run \\
  -H "Authorization: Bearer crf_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"flowId": "FLOW_ID", "params": {}}'` }), _jsx("div", { className: "api-key-usage-label spaced", children: "GitLab CI example:" }), _jsx("pre", { className: "api-key-code-block", children: `# .gitlab-ci.yml
e2e_test:
  stage: test
  script:
    - |
      curl -X POST ${API_BASE}/triggers/run \\
        -H "Authorization: Bearer $CODERAIL_API_KEY" \\
        -H "Content-Type: application/json" \\
        -d '{"flowId": "'$FLOW_ID'"}'` })] }));
}
