import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useLocation } from 'react-router-dom';
import { Zap } from 'lucide-react';
export function DashboardNav() {
    const location = useLocation();
    const isActive = (path) => location.pathname === path || (path === '/app' && location.pathname === '/app/dashboard');
    const links = [
        { to: '/app', label: 'Dashboard' },
        { to: '/app/flows', label: 'Flows' },
        { to: '/projects', label: 'Projects' },
        { to: '/billing', label: 'Billing' },
    ];
    return (_jsx("nav", { className: "dash-nav", children: _jsxs("div", { className: "dash-nav-inner", children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 24 }, children: [_jsxs(Link, { to: "/app", className: "dash-nav-brand", children: [_jsx(Zap, { size: 18, strokeWidth: 2.5 }), _jsx("span", { children: "CodeRail Flow" })] }), _jsx("div", { className: "dash-nav-links", children: links.map((l) => (_jsx(Link, { to: l.to, className: `dash-nav-link${isActive(l.to) ? ' active' : ''}`, children: l.label }, l.to))) })] }), _jsx("div", { className: "dash-nav-right", children: _jsx("a", { href: "https://docs.coderail.app", target: "_blank", rel: "noopener noreferrer", className: "dash-nav-doc", children: "Docs" }) })] }) }));
}
