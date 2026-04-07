import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function AppHeader({ err }) {
    return (_jsxs("div", { className: "card", style: { marginBottom: 14 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }, children: [_jsxs("div", { children: [_jsx("div", { className: "h1", style: { marginBottom: 4 }, children: "CodeRail Flow" }), _jsx("div", { className: "small app-header-subtitle", children: "Automated Browser Workflows" })] }), _jsx("div", { className: "badge badge-production", children: "PRODUCTION READY" })] }), err && _jsx("div", { className: "small app-header-error", children: err })] }));
}
