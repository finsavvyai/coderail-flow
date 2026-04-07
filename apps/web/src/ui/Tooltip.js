import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useId } from 'react';
export function Tooltip({ children, content, position = 'top', }) {
    const [visible, setVisible] = useState(false);
    const [coords, setCoords] = useState({ x: 0, y: 0 });
    const triggerRef = useRef(null);
    const tooltipId = useId();
    const showTooltip = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const baseX = rect.left + rect.width / 2;
            const posMap = {
                bottom: { x: baseX, y: rect.bottom + 8 },
                left: { x: rect.left - 8, y: rect.top + rect.height / 2 },
                right: { x: rect.right + 8, y: rect.top + rect.height / 2 },
                top: { x: baseX, y: rect.top - 8 },
            };
            const pos = posMap[position] || posMap.top;
            const x = pos.x;
            const y = pos.y;
            setCoords({ x, y });
        }
        setVisible(true);
    };
    return (_jsxs(_Fragment, { children: [_jsx("div", { ref: triggerRef, onMouseEnter: showTooltip, onMouseLeave: () => setVisible(false), onFocus: showTooltip, onBlur: () => setVisible(false), "aria-describedby": visible ? tooltipId : undefined, style: { display: 'inline-flex' }, children: children }), visible && (_jsx("div", { id: tooltipId, role: "tooltip", style: {
                    position: 'fixed',
                    left: coords.x,
                    top: coords.y,
                    transform: position === 'top'
                        ? 'translate(-50%, -100%)'
                        : position === 'bottom'
                            ? 'translate(-50%, 0)'
                            : position === 'left'
                                ? 'translate(-100%, -50%)'
                                : 'translate(0, -50%)',
                    background: 'rgba(0, 0, 0, 0.9)',
                    color: '#fff',
                    padding: '6px 10px',
                    borderRadius: 6,
                    fontSize: 12,
                    maxWidth: 200,
                    zIndex: 1050,
                    pointerEvents: 'none',
                    animation: 'fadeIn 0.15s ease',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }, children: content }))] }));
}
