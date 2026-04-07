import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { getRun } from './api';
const BADGE_CLASS = {
    queued: 'badge lp-badge-queued',
    running: 'badge lp-badge-running',
    succeeded: 'badge lp-badge-succeeded',
    failed: 'badge lp-badge-failed',
};
const BAR_CLASS = {
    queued: 'lp-bar-fill lp-bar-fill--queued',
    running: 'lp-bar-fill lp-bar-fill--running',
    succeeded: 'lp-bar-fill lp-bar-fill--succeeded',
    failed: 'lp-bar-fill lp-bar-fill--failed',
};
export function LiveProgress({ runId, onComplete }) {
    const [progress, setProgress] = useState({
        step: 0,
        total: 0,
        status: 'queued',
        percentage: 0,
    });
    useEffect(() => {
        let interval = null;
        const pollProgress = async () => {
            try {
                const data = await getRun(runId);
                const run = data.run;
                const screenshots = (data.artifacts || []).filter((a) => a.kind?.startsWith('screenshot'));
                const step = screenshots.length;
                const status = run.status;
                setProgress({
                    step,
                    total: step > 0 ? step : 0,
                    status,
                    description: getStatusDescription(status, step),
                    percentage: status === 'succeeded'
                        ? 100
                        : status === 'failed'
                            ? 0
                            : step > 0
                                ? (step / 13) * 100
                                : 0,
                });
                if (status === 'succeeded' || status === 'failed') {
                    if (interval)
                        clearInterval(interval);
                    if (onComplete)
                        onComplete();
                }
            }
            catch (err) {
                console.error('Failed to poll progress:', err);
            }
        };
        void pollProgress();
        if (progress.status !== 'succeeded' && progress.status !== 'failed') {
            interval = setInterval(() => void pollProgress(), 1000);
        }
        return () => {
            if (interval)
                clearInterval(interval);
        };
    }, [runId, onComplete, progress.status]);
    const badgeClass = BADGE_CLASS[progress.status] || BADGE_CLASS.queued;
    const barFillClass = BAR_CLASS[progress.status] || BAR_CLASS.queued;
    return (_jsxs("div", { className: "lp-wrapper", children: [_jsxs("div", { className: "lp-header", children: [_jsxs("div", { children: [_jsx("span", { className: badgeClass, children: progress.status }), progress.step > 0 && (_jsxs("span", { className: "small lp-step-info", children: ["Step ", progress.step, " ", progress.total > 0 ? `of ${progress.total}` : ''] }))] }), _jsxs("div", { className: "small", children: [Math.round(progress.percentage), "%"] })] }), _jsx("div", { role: "progressbar", "aria-valuenow": Math.round(progress.percentage), "aria-valuemin": 0, "aria-valuemax": 100, "aria-label": "Flow execution progress", className: "lp-bar-track", children: _jsx("div", { className: barFillClass, style: { width: `${progress.percentage}%` } }) }), progress.description && _jsx("div", { className: "small lp-description", children: progress.description })] }));
}
function getStatusDescription(status, step) {
    switch (status) {
        case 'queued':
            return 'Waiting to start...';
        case 'running':
            return step > 0 ? `Executing step ${step}...` : 'Starting execution...';
        case 'succeeded':
            return 'Execution completed successfully!';
        case 'failed':
            return 'Execution failed. Check error details below.';
        default:
            return 'Unknown status';
    }
}
