import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Play, AlertCircle, CheckCircle, XCircle, Loader, Circle } from 'lucide-react';
function getStatusIcon(status) {
    switch (status) {
        case 'running':
            return _jsx(Loader, { size: 48, className: "spin ftr-status-icon-accent" });
        case 'succeeded':
            return _jsx(CheckCircle, { size: 48, className: "ftr-status-icon-success" });
        case 'failed':
            return _jsx(XCircle, { size: 48, className: "ftr-status-icon-error" });
        default:
            return _jsx(Play, { size: 48, className: "ftr-status-icon-muted" });
    }
}
function getStatusText(status, currentStep, totalSteps) {
    switch (status) {
        case 'running':
            return `Testing flow... (Step ${currentStep}/${totalSteps})`;
        case 'succeeded':
            return 'Flow test completed successfully!';
        case 'failed':
            return 'Flow test failed';
        default:
            return 'Ready to test your flow';
    }
}
function stepLabel(step, idx) {
    const prefix = `${idx + 1}.`;
    if (step.narrate)
        return `${prefix} ${step.narrate}`;
    if (step.type === 'goto')
        return `${prefix} Navigate to ${step.url || 'page'}`;
    if (step.type === 'click')
        return `${prefix} Click ${step.elementId || 'element'}`;
    if (step.type === 'fill')
        return `${prefix} Fill "${step.value || ''}" into ${step.elementId || 'field'}`;
    if (step.type === 'caption')
        return `${prefix} ${step.text || 'Caption'}`;
    if (step.type === 'pause')
        return `${prefix} Pause`;
    return `${prefix} ${step.type}`;
}
function StepIcon({ detail }) {
    if (!detail)
        return _jsx(Circle, { size: 14, className: "ftr-status-icon-dim" });
    if (detail.status === 'running') {
        return _jsx(Loader, { size: 14, className: "spin ftr-status-icon-accent" });
    }
    if (detail.status === 'ok') {
        return _jsx(CheckCircle, { size: 14, className: "ftr-status-icon-success" });
    }
    return _jsx(XCircle, { size: 14, className: "ftr-status-icon-error" });
}
export function FlowTestResults({ status, currentStep, totalSteps, error, runId, testing, stepDetails, flowSteps, onStartTest, onReset, onClose, }) {
    const statusBoxClass = `ftr-status-box${status === 'failed' ? ' ftr-status-box--failed' : ''}`;
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: statusBoxClass, children: _jsx("div", { className: "ftr-status-text", children: getStatusText(status, currentStep, totalSteps) }) }), (status === 'running' || status === 'succeeded' || status === 'failed') &&
                flowSteps.length > 0 && (_jsx("div", { className: "ftr-step-list", children: flowSteps.map((fs, i) => {
                    const detail = stepDetails.find((d) => d.idx === i);
                    const rowClass = [
                        'ftr-step-row',
                        detail?.status === 'ok'
                            ? 'ftr-step-row--ok'
                            : detail?.status === 'failed'
                                ? 'ftr-step-row--failed'
                                : 'ftr-step-row--default',
                        detail?.status === 'running' ? 'ftr-step-row--running' : '',
                    ]
                        .filter(Boolean)
                        .join(' ');
                    return (_jsxs("div", { className: rowClass, children: [_jsx(StepIcon, { detail: detail }), _jsx("span", { className: "ftr-step-label", children: stepLabel(fs, i) }), detail?.status === 'ok' && (_jsx("span", { className: "ftr-step-tag ftr-step-tag--ok", children: "done" })), detail?.status === 'failed' && (_jsx("span", { className: "ftr-step-tag ftr-step-tag--failed", children: "failed" })), detail?.status === 'running' && (_jsx("span", { className: "ftr-step-tag ftr-step-tag--running", children: "running" }))] }, i));
                }) })), status === 'running' && totalSteps > 0 && (_jsx("div", { className: "ftr-progress-bar-track", children: _jsx("div", { className: "ftr-progress-bar-fill", style: { width: `${(currentStep / totalSteps) * 100}%` } }) })), error && (_jsxs("div", { className: "ftr-error-box", children: [_jsxs("div", { className: "ftr-error-header", children: [_jsx(AlertCircle, { size: 16, className: "ftr-status-icon-error" }), _jsx("span", { className: "ftr-error-title", children: "Error" })] }), _jsx("div", { className: "ftr-error-body", children: error })] })), _jsxs("div", { className: "ftr-actions", children: [status === 'idle' && (_jsxs("button", { onClick: onStartTest, disabled: testing, className: "btn ftr-btn-start", children: [_jsx(Play, { size: 16, className: "ftr-inline-icon" }), "Start Test"] })), status === 'succeeded' && runId && (_jsx("button", { onClick: () => window.open(`/app?run=${runId}`, '_blank'), className: "btn ftr-btn-view", children: "View Full Results" })), (status === 'succeeded' || status === 'failed') && (_jsx("button", { onClick: onReset, className: "btn ftr-btn-again", children: "Test Again" })), _jsx("button", { onClick: onClose, className: "btn ftr-btn-close", children: "Close" })] })] }));
}
export { getStatusIcon };
