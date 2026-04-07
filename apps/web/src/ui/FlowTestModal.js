import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useFlowTest } from './useFlowTest';
import { FlowTestResults, getStatusIcon } from './FlowTestResults';
export function FlowTestModal({ projectId, flowDefinition, flowName, authProfileId, onClose, }) {
    const stepCount = flowDefinition.steps?.length || 0;
    const { testing, runId, status, currentStep, totalSteps, error, stepDetails, startTest, reset } = useFlowTest({
        projectId,
        flowDefinition,
        authProfileId,
        stepCount,
    });
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape')
                onClose();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);
    return (_jsx("div", { style: {
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
        }, onClick: onClose, role: "dialog", "aria-modal": "true", "aria-labelledby": "flow-test-title", children: _jsxs("div", { className: "card", style: { width: '100%', maxWidth: 500, position: 'relative' }, onClick: (e) => e.stopPropagation(), children: [_jsx("button", { onClick: onClose, "aria-label": "Close dialog", style: {
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#ccc',
                        padding: 14,
                        borderRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }, children: _jsx(X, { size: 18 }) }), _jsxs("div", { style: { textAlign: 'center', padding: '32px 24px' }, children: [getStatusIcon(status), _jsx("h2", { id: "flow-test-title", style: { margin: '16px 0 8px', fontSize: 20 }, children: flowName }), _jsxs("div", { style: { fontSize: 14, color: '#888', marginBottom: 24 }, children: [stepCount, " steps \u2022 Test run"] }), _jsx(FlowTestResults, { status: status, currentStep: currentStep, totalSteps: totalSteps, error: error, runId: runId, testing: testing, stepDetails: stepDetails, flowSteps: flowDefinition.steps || [], onStartTest: startTest, onReset: reset, onClose: onClose })] })] }) }));
}
