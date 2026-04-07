import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Check } from 'lucide-react';
import { INTEGRATION_TYPES, getConfigFields } from './integrations-types';
export function AddIntegrationForm({ onSubmit, onCancel }) {
    const [addType, setAddType] = useState('slack');
    const [addName, setAddName] = useState('');
    const [addConfig, setAddConfig] = useState({});
    async function handleCreate() {
        const success = await onSubmit(addType, addName, addConfig);
        if (success) {
            setAddName('');
            setAddConfig({});
        }
    }
    return (_jsxs("div", { className: "card add-form-card", children: [_jsx("div", { className: "add-form-title", children: "New Integration" }), _jsx("div", { className: "add-form-types", children: INTEGRATION_TYPES.map((t) => (_jsxs("button", { className: `btn add-form-type-btn${addType === t.value ? ' add-form-type-btn--selected' : ''}`, onClick: () => {
                        setAddType(t.value);
                        setAddConfig({});
                    }, children: [_jsx(t.icon, { size: 20, style: { color: t.color } }), _jsx("span", { className: "add-form-type-label", children: t.label })] }, t.value))) }), _jsx("input", { className: "input add-form-input-gap", placeholder: "Integration name (e.g., 'Engineering Slack')", value: addName, onChange: (e) => setAddName(e.target.value) }), getConfigFields(addType).map((field) => (_jsx("input", { className: "input add-form-input-gap-sm", type: field.secret ? 'password' : 'text', placeholder: field.placeholder, value: addConfig[field.key] || '', onChange: (e) => setAddConfig({ ...addConfig, [field.key]: e.target.value }) }, field.key))), _jsxs("div", { className: "add-form-actions", children: [_jsxs("button", { className: "btn add-form-create-btn", onClick: handleCreate, children: [_jsx(Check, { size: 14 }), " Create"] }), _jsx("button", { className: "btn add-form-cancel-btn", onClick: onCancel, children: "Cancel" })] })] }));
}
