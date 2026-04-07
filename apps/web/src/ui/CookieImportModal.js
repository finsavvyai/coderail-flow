import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef } from 'react';
import { toastUtils } from './toast';
import { Button } from './Button';
import { validateCookieArray } from './CookieImportTypes';
import { CookieImportPreview } from './CookieImportPreview';
import { ImportInstructions, ImportErrorDisplay, SecurityNotice } from './CookieImportNotices';
export function CookieImportModal({ projectId: _projectId, onSave, onCancel, }) {
    const [profileName, setProfileName] = useState('');
    const [cookies, setCookies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);
    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        setError('');
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result);
                const validated = validateCookieArray(json);
                setCookies(validated);
                toastUtils.success(`Loaded ${validated.length} cookies`);
            }
            catch (err) {
                setError(err.message || 'Failed to parse cookies');
                toastUtils.error('Invalid cookie file format');
            }
        };
        reader.readAsText(file);
    };
    const handleSave = async () => {
        if (!profileName.trim()) {
            setError('Please enter a profile name');
            return;
        }
        if (cookies.length === 0) {
            setError('Please upload cookies');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await onSave({ name: profileName, cookies });
            toastUtils.success('Auth profile saved!');
        }
        catch (err) {
            setError(err.message || 'Failed to save profile');
            toastUtils.error('Failed to save auth profile');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col", children: [_jsx(ModalHeader, { onCancel: onCancel, loading: loading }), _jsxs("div", { className: "flex-1 overflow-auto p-6 space-y-6", children: [_jsx(ImportInstructions, {}), _jsx(ProfileNameInput, { value: profileName, onChange: setProfileName, disabled: loading }), _jsx(FileUploadField, { fileInputRef: fileInputRef, onUpload: handleFileUpload, cookieCount: cookies.length, disabled: loading }), _jsx(CookieImportPreview, { cookies: cookies }), _jsx(ImportErrorDisplay, { error: error }), _jsx(SecurityNotice, {})] }), _jsxs("div", { className: "px-6 py-4 border-t border-gray-200 flex justify-end gap-3", children: [_jsx(Button, { variant: "secondary", onClick: onCancel, disabled: loading, children: "Cancel" }), _jsx(Button, { variant: "primary", onClick: handleSave, loading: loading, disabled: !profileName || cookies.length === 0, children: "Save Auth Profile" })] })] }) }));
}
function ModalHeader(props) {
    return (_jsxs("div", { className: "px-6 py-4 border-b border-gray-200 flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "Import Authentication Cookies" }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Upload cookies to enable authenticated workflow execution" })] }), _jsx("button", { onClick: props.onCancel, className: "text-gray-400 hover:text-gray-600", disabled: props.loading, children: _jsx("svg", { className: "w-6 h-6", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) })] }));
}
function ProfileNameInput({ value, onChange, disabled, }) {
    return (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Profile Name *" }), _jsx("input", { type: "text", value: value, onChange: (e) => onChange(e.target.value), placeholder: "e.g., Production Account, Staging User", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent", disabled: disabled })] }));
}
function FileUploadField({ fileInputRef, onUpload, cookieCount, disabled, }) {
    return (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Cookies JSON File *" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("input", { ref: fileInputRef, type: "file", accept: ".json", onChange: onUpload, className: "hidden", disabled: disabled }), _jsx(Button, { variant: "secondary", onClick: () => fileInputRef.current?.click(), disabled: disabled, children: "Choose File" }), cookieCount > 0 && (_jsxs("span", { className: "text-sm text-gray-600", children: [cookieCount, " cookies loaded"] }))] })] }));
}
