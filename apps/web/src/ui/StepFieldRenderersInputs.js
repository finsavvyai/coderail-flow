import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function FieldLabel({ children }) {
    return _jsx("label", { className: "small field-label", children: children });
}
export function InputField({ label, field, placeholder, step, onUpdate, type = 'text', }) {
    const isNumber = type === 'number';
    return (_jsxs("div", { children: [_jsx(FieldLabel, { children: label }), _jsx("input", { className: "input", type: type, placeholder: placeholder, value: step[field] || '', onChange: (e) => onUpdate({
                    [field]: isNumber
                        ? parseInt(e.target.value) || (field === 'pixels' ? undefined : 0)
                        : e.target.value,
                }) })] }));
}
export function SelectField({ label, field, options, step, onUpdate, fallback, }) {
    return (_jsxs("div", { children: [_jsx(FieldLabel, { children: label }), _jsx("select", { className: "input", value: step[field] || fallback, onChange: (e) => onUpdate({ [field]: e.target.value }), children: options.map((o) => (_jsx("option", { value: o.value, children: o.label }, o.value))) })] }));
}
export function TextField({ step, onUpdate }) {
    return (_jsxs("div", { children: [_jsx(FieldLabel, { children: "Caption Text *" }), _jsx("textarea", { className: "input", placeholder: "This will appear as an overlay on the page", value: step.text || '', onChange: (e) => onUpdate({ text: e.target.value }), rows: 3 })] }));
}
export function FullPageField({ step, onUpdate }) {
    return (_jsx("div", { children: _jsxs("label", { className: "field-checkbox-label", children: [_jsx("input", { type: "checkbox", checked: step.fullPage || false, onChange: (e) => onUpdate({ fullPage: e.target.checked }) }), "Full Page Screenshot"] }) }));
}
export function CookiesField({ step, onUpdate }) {
    return (_jsxs("div", { children: [_jsx(FieldLabel, { children: "Cookies (JSON array)" }), _jsx("textarea", { className: "input field-cookies-textarea", placeholder: '[{"name": "session", "value": "...", "domain": ".example.com"}]', value: JSON.stringify(step.cookies || [], null, 2), onChange: (e) => {
                    try {
                        onUpdate({ cookies: JSON.parse(e.target.value) });
                    }
                    catch {
                        /* ignore */
                    }
                }, rows: 4 })] }));
}
