import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Trash2 } from 'lucide-react';
export function CookieProfileList({ profiles, selectedId, onSelect, onDelete }) {
    if (profiles.length === 0) {
        return (_jsx("div", { className: "small profile-empty", children: "No auth profiles yet. Create one to store cookies for authenticated flows." }));
    }
    return (_jsx("div", { className: "profile-list", children: profiles.map((p) => (_jsxs("div", { onClick: () => onSelect(p), className: `profile-item${selectedId === p.id ? ' profile-item--selected' : ''}`, children: [_jsxs("div", { children: [_jsx("div", { className: "profile-name", children: p.name }), _jsxs("div", { className: "small profile-count", children: [p.cookies.length, " cookies"] })] }), _jsx("button", { className: "btn btn-delete", onClick: (e) => {
                        e.stopPropagation();
                        onDelete(p.id);
                    }, children: _jsx(Trash2, { size: 14 }) })] }, p.id))) }));
}
