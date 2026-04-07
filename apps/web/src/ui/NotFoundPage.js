import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
export function NotFoundPage() {
    return (_jsx("main", { className: "notfound-page", children: _jsxs("section", { className: "card notfound-card", children: [_jsx("div", { className: "eyebrow notfound-eyebrow", children: "404" }), _jsx("h1", { className: "h1 notfound-heading", children: "This route does not exist." }), _jsx("p", { className: "body notfound-body", children: "The requested page is not part of the current application bundle. Use one of the primary entry points below." }), _jsxs("div", { className: "notfound-actions", children: [_jsx(Link, { className: "btn btn-primary", to: "/", children: "Landing Page" }), _jsx(Link, { className: "btn", to: "/app", children: "Open App" })] })] }) }));
}
