import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export function AnimatedButton({ children, onClick, variant = 'primary', size = 'md', loading = false, disabled = false, className, ...props }) {
    const [ripples, setRipples] = useState([]);
    const handleClick = (e) => {
        if (disabled || loading)
            return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = Date.now();
        setRipples((prev) => [...prev, { x, y, id }]);
        setTimeout(() => {
            setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 600);
        onClick?.();
    };
    const classes = [
        'btn-animated',
        `btn-animated--${variant}`,
        `btn-animated--${size}`,
        disabled ? 'btn-animated--disabled' : '',
        className ?? '',
    ]
        .filter(Boolean)
        .join(' ');
    return (_jsxs("button", { onClick: handleClick, disabled: disabled || loading, className: classes, ...props, children: [loading && _jsx("span", { className: "btn-animated-spinner spin" }), children, ripples.map((ripple) => (_jsx("span", { className: "btn-animated-ripple", style: { left: ripple.x, top: ripple.y } }, ripple.id)))] }));
}
export function AnimatedCard({ children, onClick, selected = false, className, ...props }) {
    const classes = [
        'animated-card',
        selected ? 'animated-card--selected' : '',
        onClick ? 'animated-card--clickable' : '',
        className ?? '',
    ]
        .filter(Boolean)
        .join(' ');
    return (_jsx("div", { onClick: onClick, className: classes, ...props, children: children }));
}
