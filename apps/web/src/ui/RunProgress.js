import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { RunProgressStepList } from './RunProgressStepList';
import { apiUrl } from './api-core';
export { RunStatusBadge } from './RunStatusBadge';
export function RunProgress({ runId, totalSteps, onComplete }) {
    const [steps, setSteps] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [status, setStatus] = useState('pending');
    const [elapsedTime, setElapsedTime] = useState(0);
    const startTimeRef = useRef(Date.now());
    const pollingRef = useRef(null);
    useEffect(() => {
        const initialSteps = Array.from({ length: totalSteps }, (_, i) => ({
            index: i,
            type: 'step',
            status: 'pending',
        }));
        setSteps(initialSteps);
        setStatus('running');
        startTimeRef.current = Date.now();
        void pollProgress();
        const timer = setInterval(() => {
            setElapsedTime(Date.now() - startTimeRef.current);
        }, 100);
        return () => {
            clearInterval(timer);
            if (pollingRef.current)
                clearTimeout(pollingRef.current);
        };
    }, [runId, totalSteps]);
    async function pollProgress() {
        try {
            const res = await fetch(apiUrl(`/runs/${runId}`));
            const data = (await res.json());
            if (data.run) {
                if (data.run.status === 'succeeded' || data.run.status === 'failed') {
                    setStatus(data.run.status);
                    onComplete?.(data.run.status);
                    return;
                }
                if (data.run.progress) {
                    const progress = typeof data.run.progress === 'string'
                        ? JSON.parse(data.run.progress)
                        : data.run.progress;
                    if (progress.currentStep !== undefined) {
                        setCurrentStep(progress.currentStep);
                        setSteps((prev) => prev.map((step, i) => ({
                            ...step,
                            status: i < progress.currentStep
                                ? 'completed'
                                : i === progress.currentStep
                                    ? 'running'
                                    : 'pending',
                        })));
                    }
                }
            }
            pollingRef.current = window.setTimeout(() => void pollProgress(), 1000);
        }
        catch (e) {
            console.error('Failed to poll progress:', e);
            pollingRef.current = window.setTimeout(() => void pollProgress(), 2000);
        }
    }
    function formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const rem = seconds % 60;
        return minutes > 0 ? `${minutes}:${rem.toString().padStart(2, '0')}` : `${seconds}s`;
    }
    const completedSteps = steps.filter((s) => s.status === 'completed').length;
    const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
    const barClass = `rp-bar-fill rp-bar-fill--${status === 'failed' ? 'failed' : status === 'succeeded' ? 'succeeded' : 'running'}`;
    return (_jsxs("div", { className: "card", children: [_jsxs("div", { className: "rp-header", children: [_jsxs("div", { className: "rp-status-group", children: [status === 'running' && _jsx(Loader2, { size: 18, className: "spin ftr-status-icon-accent" }), status === 'succeeded' && _jsx(CheckCircle, { size: 18, className: "ftr-status-icon-success" }), status === 'failed' && _jsx(XCircle, { size: 18, className: "ftr-status-icon-error" }), _jsx("span", { className: "rp-status-label", children: status === 'running' ? 'Running...' : status === 'succeeded' ? 'Completed' : 'Failed' })] }), _jsxs("div", { className: "rp-timer", children: [_jsx(Clock, { size: 14 }), " ", formatTime(elapsedTime)] })] }), _jsx("div", { role: "progressbar", "aria-valuenow": Math.round(progress), "aria-valuemin": 0, "aria-valuemax": 100, "aria-label": "Flow execution progress", className: "rp-bar-track", children: _jsx("div", { className: barClass, style: { width: `${progress}%` } }) }), _jsxs("div", { className: "rp-meta", children: [_jsxs("span", { children: ["Step ", Math.min(currentStep + 1, totalSteps), " of ", totalSteps] }), _jsxs("span", { children: [Math.round(progress), "% complete"] })] }), _jsx(RunProgressStepList, { steps: steps })] }));
}
