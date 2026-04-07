import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Trash2, MousePointer, Type, Navigation, Eye, Play, MessageSquare } from 'lucide-react';
import { getActionDescription } from './FlowRecorder.utils';
function getActionIcon(type) {
    switch (type) {
        case 'click':
            return _jsx(MousePointer, { size: 14 });
        case 'fill':
            return _jsx(Type, { size: 14 });
        case 'goto':
            return _jsx(Navigation, { size: 14 });
        case 'select':
            return _jsx(Eye, { size: 14 });
        default:
            return _jsx(Play, { size: 14 });
    }
}
export function getActionColorClass(type) {
    switch (type) {
        case 'goto':
            return 'action-goto';
        case 'click':
            return 'action-click';
        case 'fill':
            return 'action-fill';
        default:
            return 'action-default';
    }
}
export function StepItem({ action, index, isActive, onSelect, onRemove, onSubtitleChange, }) {
    const hasSubtitle = Boolean(action.subtitle);
    return (_jsxs("div", { onClick: onSelect, className: `step-item-container${isActive ? ' active' : ''}`, children: [_jsxs("div", { className: "step-item-row", children: [_jsx("span", { className: `step-item-number${isActive ? ' active' : ''}`, children: index + 1 }), _jsx("span", { className: `step-item-action-icon ${getActionColorClass(action.type)}`, children: getActionIcon(action.type) }), _jsx("span", { className: "step-item-description", children: getActionDescription(action) }), _jsx("button", { onClick: (e) => {
                            e.stopPropagation();
                            onRemove();
                        }, "aria-label": `Remove step ${index + 1}`, className: "step-item-remove-btn", children: _jsx(Trash2, { size: 14 }) })] }), _jsxs("div", { className: "step-item-subtitle-row", children: [_jsx(MessageSquare, { size: 11, className: `step-item-subtitle-icon${hasSubtitle ? ' has-subtitle' : ''}` }), _jsx("input", { className: `input step-item-subtitle-input${hasSubtitle ? ' has-subtitle' : ''}`, placeholder: "Add subtitle for this step...", value: action.subtitle || '', onChange: (e) => onSubtitleChange(e.target.value), onClick: (e) => e.stopPropagation() })] })] }));
}
