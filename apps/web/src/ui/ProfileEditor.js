import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Trash2, Eye, EyeOff, Download, Plus, Upload } from 'lucide-react';
import { CookieEditorModal } from './CookieEditorModal';
export function ProfileEditor({ cm }) {
    const profile = cm.selectedProfile;
    return (_jsxs(_Fragment, { children: [_jsx(ProfileToolbar, { cm: cm, profileName: profile.name }), _jsx(CookiesTable, { cm: cm }), _jsx(ImportSection, { cm: cm }), cm.editingCookie && (_jsx(CookieEditorModal, { cookie: cm.editingCookie, showValues: cm.showValues, onSave: cm.saveCookie, onClose: () => cm.setEditingCookie(null), onChange: cm.setEditingCookie }))] }));
}
function ProfileToolbar({ cm, profileName }) {
    return (_jsxs("div", { className: "profile-toolbar", children: [_jsx("h2", { children: profileName }), _jsxs("div", { className: "profile-toolbar-actions", children: [_jsxs("button", { className: "btn btn-dark", onClick: () => cm.setShowValues(!cm.showValues), children: [cm.showValues ? _jsx(EyeOff, { size: 16 }) : _jsx(Eye, { size: 16 }), cm.showValues ? 'Hide' : 'Show', " Values"] }), _jsxs("button", { className: "btn btn-dark", onClick: cm.exportProfile, children: [_jsx(Download, { size: 16 }), " Export"] }), _jsxs("button", { className: "btn", onClick: cm.addCookie, children: [_jsx(Plus, { size: 16 }), " Add Cookie"] })] })] }));
}
function CookiesTable({ cm }) {
    const profile = cm.selectedProfile;
    return (_jsxs("div", { className: "cookies-section", children: [_jsxs("h2", { children: ["Cookies (", profile.cookies.length, ")"] }), profile.cookies.length === 0 ? (_jsx("div", { className: "cookies-empty", children: "No cookies. Add cookies manually or import from a JSON file." })) : (_jsxs("table", { className: "table cookies-table", children: [_jsx("caption", { className: "sr-only", children: "Cookies in this profile" }), _jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { scope: "col", children: "Name" }), _jsx("th", { scope: "col", children: "Domain" }), _jsx("th", { scope: "col", children: "Value" }), _jsx("th", { scope: "col", children: "Secure" }), _jsx("th", { scope: "col", children: "Actions" })] }) }), _jsx("tbody", { children: profile.cookies.map((cookie, i) => (_jsxs("tr", { children: [_jsx("td", { className: "mono", children: cookie.name }), _jsx("td", { className: "small", children: cookie.domain }), _jsx("td", { className: "mono cookie-value", children: cm.showValues
                                        ? cookie.value
                                        : '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022' }), _jsx("td", { children: cookie.secure ? '\u2713' : '\u2717' }), _jsx("td", { children: _jsxs("div", { className: "cookie-actions", children: [_jsx("button", { className: "btn btn-edit", onClick: () => cm.setEditingCookie(cookie), children: "Edit" }), _jsx("button", { className: "btn btn-delete", onClick: () => cm.deleteCookie(cookie), "aria-label": "Delete cookie", children: _jsx(Trash2, { size: 14 }) })] }) })] }, i))) })] }))] }));
}
function ImportSection({ cm }) {
    return (_jsxs("div", { className: "import-section", children: [_jsxs("h2", { children: [_jsx(Upload, { size: 14, style: { marginRight: 6 } }), "Import Cookies"] }), _jsx("textarea", { className: "input import-textarea", placeholder: 'Paste JSON: {"cookies": [{"name": "session", "value": "...", "domain": ".example.com"}]}', value: cm.importJson, onChange: (e) => cm.setImportJson(e.target.value), rows: 4 }), _jsxs("button", { className: "btn", onClick: cm.importProfile, disabled: !cm.importJson.trim(), children: [_jsx(Upload, { size: 16 }), " Import"] })] }));
}
