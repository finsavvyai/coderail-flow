import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FileText, Copy, Check } from 'lucide-react';
export function TemplateCard({ template, isCopied, onCopy, onSelect }) {
    return (_jsxs("div", { className: "template-card", children: [_jsxs("div", { className: "template-card-header", children: [_jsxs("div", { className: "template-card-name-group", children: [_jsx(FileText, { size: 18, className: "template-card-icon", "aria-hidden": "true" }), _jsx("span", { className: "template-card-name", children: template.name })] }), _jsx("button", { className: "btn template-card-copy-btn", "aria-label": isCopied ? 'Copied' : 'Copy template details', onClick: (e) => {
                            e.stopPropagation();
                            onCopy(template);
                        }, title: "Copy template details", children: isCopied ? _jsx(Check, { size: 14 }) : _jsx(Copy, { size: 14 }) })] }), _jsx("p", { className: "template-card-desc", children: template.description }), _jsx("div", { className: "template-card-tags", children: template.tags.map((tag) => (_jsx("span", { className: "template-tag", children: tag }, tag))) }), _jsxs("div", { className: "template-card-footer", children: [_jsxs("span", { className: "template-card-param-count", children: [template.params?.length ?? 0, " params"] }), _jsx("button", { className: "btn template-card-use-btn", onClick: () => onSelect(template), children: "Use Template" })] })] }));
}
