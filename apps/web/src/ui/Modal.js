import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
export function Modal({ open, onClose, title, children, size = 'md', }) {
    const dialogRef = useRef(null);
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') {
            onClose();
            return;
        }
        if (e.key === 'Tab' && dialogRef.current) {
            const focusable = dialogRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusable.length === 0)
                return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
            else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    }, [onClose]);
    useEffect(() => {
        if (!open)
            return;
        document.addEventListener('keydown', handleKeyDown);
        const prev = document.activeElement;
        dialogRef.current?.querySelector('button, [href], input')?.focus();
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            prev?.focus();
        };
    }, [open, handleKeyDown]);
    if (!open)
        return null;
    return (_jsx("div", { className: "modal-overlay", onClick: onClose, role: "dialog", "aria-modal": "true", "aria-labelledby": title ? 'modal-title' : undefined, "aria-label": title ? undefined : 'Dialog', children: _jsxs("div", { ref: dialogRef, className: `modal-card modal-${size}`, onClick: (e) => e.stopPropagation(), children: [title && (_jsxs("div", { className: "modal-header", children: [_jsx("h3", { id: "modal-title", className: "modal-title", children: title }), _jsx("button", { onClick: onClose, "aria-label": "Close dialog", className: "modal-close", children: _jsx(X, { size: 18 }) })] })), _jsx("div", { className: "modal-body", children: children })] }) }));
}
export function Skeleton({ width = '100%', height = 20, borderRadius = 4, }) {
    return _jsx("div", { className: "skeleton", style: { width, height, borderRadius } });
}
export function ProgressRing({ progress, size = 60, strokeWidth = 4, color = 'var(--accent)', }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;
    return (_jsxs("svg", { width: size, height: size, style: { transform: 'rotate(-90deg)' }, children: [_jsx("circle", { cx: size / 2, cy: size / 2, r: radius, fill: "none", className: "progress-ring-track", strokeWidth: strokeWidth }), _jsx("circle", { cx: size / 2, cy: size / 2, r: radius, fill: "none", stroke: color, strokeWidth: strokeWidth, strokeDasharray: circumference, strokeDashoffset: offset, strokeLinecap: "round", className: "progress-ring-fill" })] }));
}
export const globalAnimationStyles = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes ripple {
  to { transform: translate(-50%, -50%) scale(40); opacity: 0; }
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.spin {
  animation: spin 1s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
`;
