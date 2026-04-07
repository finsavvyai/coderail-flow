import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { X, FileText } from 'lucide-react';
import { createFlowFromTemplate, getAuthProfiles } from './api-flows';
import toast from 'react-hot-toast';
import { TemplateParamForm } from './TemplateParamForm';
export function TemplateInstallModal({ template, projectId, onClose, onSuccess, }) {
    const [flowName, setFlowName] = useState(template.name);
    const [params, setParams] = useState({});
    const [authProfileId, setAuthProfileId] = useState('');
    const [authProfiles, setAuthProfiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingProfiles, setLoadingProfiles] = useState(false);
    const loadAuthProfiles = async () => {
        if (!projectId)
            return;
        setLoadingProfiles(true);
        try {
            const profiles = await getAuthProfiles(projectId);
            setAuthProfiles(profiles);
        }
        catch (error) {
            console.error('Failed to load auth profiles:', error);
        }
        finally {
            setLoadingProfiles(false);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!projectId) {
            toast.error('Please select a project first');
            return;
        }
        setLoading(true);
        try {
            await createFlowFromTemplate({
                templateId: template.id,
                projectId,
                name: flowName,
                authProfileId: authProfileId || undefined,
                params,
            });
            toast.success(`Flow "${flowName}" created from template!`);
            onSuccess();
            onClose();
        }
        catch (error) {
            toast.error(error.message || 'Failed to create flow from template');
        }
        finally {
            setLoading(false);
        }
    };
    const updateParam = (name, value) => {
        setParams((prev) => ({ ...prev, [name]: value }));
    };
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape')
                onClose();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);
    return (_jsx("div", { className: "modal-overlay", role: "dialog", "aria-modal": "true", "aria-label": "Install template", onClick: onClose, children: _jsxs("div", { className: "card modal-card", style: { maxWidth: 600 }, onClick: (e) => e.stopPropagation(), children: [_jsx("button", { className: "modal-close", onClick: onClose, "aria-label": "Close dialog", children: _jsx(X, { size: 20 }) }), _jsx(ModalHeader, { template: template }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "modal-form-group", children: [_jsx("label", { htmlFor: "template-flow-name", className: "modal-form-label", children: "Flow Name" }), _jsx("input", { id: "template-flow-name", className: "input", value: flowName, onChange: (e) => setFlowName(e.target.value), placeholder: template.name, required: true })] }), projectId && (_jsxs("div", { className: "modal-form-group", children: [_jsx("label", { htmlFor: "template-auth-profile", className: "modal-form-label", children: "Authentication Profile (Optional)" }), _jsxs("select", { id: "template-auth-profile", className: "input", value: authProfileId, onChange: (e) => setAuthProfileId(e.target.value), onFocus: loadAuthProfiles, disabled: loadingProfiles, children: [_jsx("option", { value: "", children: "None" }), authProfiles.map((p) => (_jsx("option", { value: p.id, children: p.name }, p.id)))] }), _jsx("div", { className: "modal-form-hint", children: "Required for authenticated workflows" })] })), template.params && template.params.length > 0 && (_jsx(TemplateParamForm, { params: template.params, values: params, onUpdate: updateParam })), _jsxs("div", { className: "modal-footer-actions", children: [_jsx("button", { type: "button", className: "btn modal-btn-cancel", onClick: onClose, children: "Cancel" }), _jsx("button", { type: "submit", className: "btn modal-btn-submit", disabled: loading || !projectId, children: loading ? 'Creating...' : 'Create Flow' })] })] })] }) }));
}
function ModalHeader({ template }) {
    return (_jsxs("div", { className: "modal-header", children: [_jsxs("div", { className: "modal-header-row", children: [_jsx("div", { className: "modal-header-icon", children: _jsx(FileText, { size: 24 }) }), _jsxs("div", { children: [_jsx("h2", { className: "modal-header-title", children: template.name }), _jsx("div", { className: "modal-header-subtitle", children: template.category })] })] }), _jsx("p", { className: "modal-header-desc", children: template.description }), _jsx("div", { className: "modal-header-tags", children: template.tags.map((tag) => (_jsx("span", { className: "template-tag", children: tag }, tag))) })] }));
}
