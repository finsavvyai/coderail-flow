import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
export function RunProgressStepList({ steps }) {
    return (_jsx("div", { className: "rpsl-list", children: steps.map((step, i) => {
            const stepClass = `rpsl-step${step.status === 'running' ? ' rpsl-step--running' : ''}`;
            const nameClass = step.status === 'pending'
                ? 'rpsl-step-name--pending'
                : step.status === 'running'
                    ? 'rpsl-step-name--running'
                    : step.status === 'completed'
                        ? 'rpsl-step-name--completed'
                        : 'rpsl-step-name--failed';
            return (_jsxs("div", { className: stepClass, children: [step.status === 'pending' && _jsx("div", { className: "rpsl-pending-dot" }), step.status === 'running' && (_jsx(Loader2, { size: 16, className: "spin ftr-status-icon-accent" })), step.status === 'completed' && (_jsx(CheckCircle, { size: 16, className: "ftr-status-icon-success" })), step.status === 'failed' && _jsx(XCircle, { size: 16, className: "ftr-status-icon-error" }), _jsxs("span", { className: nameClass, children: ["Step ", i + 1] }), step.duration && (_jsxs("span", { className: "rpsl-duration", children: [(step.duration / 1000).toFixed(1), "s"] }))] }, i));
        }) }));
}
