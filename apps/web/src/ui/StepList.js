import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { GripVertical, Trash2 } from 'lucide-react';
import { STEP_TYPES } from './flow-builder-step-types';
import { StepIcon } from './step-icons';
export function StepList({ steps, selectedStep, onSelectStep, onDeleteStep }) {
    if (steps.length === 0) {
        return (_jsx("div", { className: "step-list-empty", children: "No steps yet. Add steps from the panel on the right." }));
    }
    return (_jsx("div", { className: "step-list", children: steps.map((step, i) => {
            const config = STEP_TYPES.find((t) => t.value === step.type);
            return (_jsxs("div", { onClick: () => onSelectStep(i), className: `step-list-item${selectedStep === i ? ' selected' : ''}`, children: [_jsx(GripVertical, { size: 14, className: "step-list-grip" }), _jsx(StepIcon, { type: step.type, size: 16 }), _jsxs("div", { className: "step-list-content", children: [_jsx("div", { className: "step-list-label", children: config?.label }), _jsx("div", { className: "step-list-detail", children: step.narrate || step.text || step.elementId || step.url || `Step ${i + 1}` })] }), _jsx("button", { className: "step-delete-btn", onClick: (e) => {
                            e.stopPropagation();
                            onDeleteStep(i);
                        }, "aria-label": "Delete step", children: _jsx(Trash2, { size: 14 }) })] }, i));
        }) }));
}
