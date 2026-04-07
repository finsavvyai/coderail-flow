import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { ChevronUp, ChevronDown } from 'lucide-react';
import { renderStepFields } from './StepFieldRenderers';
import { StepIcon } from './step-icons';
export function StepFieldEditor({ step, stepConfig, stepIndex, totalSteps, onUpdate, onMoveUp, onMoveDown, }) {
    return (_jsxs(_Fragment, { children: [_jsxs("div", { style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 16,
                }, children: [_jsxs("h2", { className: "h2", style: { margin: 0 }, children: [_jsx(StepIcon, { type: step.type }), " ", stepConfig.label, " \u2014 Step ", stepIndex + 1] }), _jsxs("div", { style: { display: 'flex', gap: 4 }, children: [_jsx("button", { className: "btn", onClick: onMoveUp, disabled: stepIndex === 0, style: { padding: '10px 12px', minHeight: 44, minWidth: 44 }, "aria-label": "Move step up", children: _jsx(ChevronUp, { size: 14 }) }), _jsx("button", { className: "btn", onClick: onMoveDown, disabled: stepIndex === totalSteps - 1, style: { padding: '10px 12px', minHeight: 44, minWidth: 44 }, "aria-label": "Move step down", children: _jsx(ChevronDown, { size: 14 }) })] })] }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 12 }, children: renderStepFields(stepConfig.fields, step, onUpdate) })] }));
}
