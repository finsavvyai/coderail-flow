import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { ShareToSlackModal } from './ShareToSlackModal';
export function RunShareCard({ run, selectedRun, artifacts }) {
    const [copiedState, setCopiedState] = useState(null);
    const [showSlackModal, setShowSlackModal] = useState(false);
    const runUrl = useMemo(() => {
        if (!selectedRun || typeof window === 'undefined')
            return '';
        return `${window.location.origin}/app?run=${selectedRun}`;
    }, [selectedRun]);
    const runSummary = useMemo(() => {
        if (!run)
            return '';
        const artifactCount = Array.isArray(artifacts) ? artifacts.length : 0;
        const durationSeconds = run.finished_at && run.started_at
            ? Math.max(0, Math.round((new Date(run.finished_at).getTime() - new Date(run.started_at).getTime()) / 1000))
            : null;
        return [
            `CodeRail Flow run ${run.id.slice(0, 8)} for ${run.flow_name ?? run.flow_id ?? 'selected flow'} is ${run.status}.`,
            durationSeconds !== null ? `Duration: ${durationSeconds}s.` : '',
            `${artifactCount} artifact${artifactCount === 1 ? '' : 's'} captured.`,
            runUrl ? `Open run: ${runUrl}` : '',
        ]
            .filter(Boolean)
            .join(' ');
    }, [run, artifacts, runUrl]);
    async function handleCopy(type) {
        const text = type === 'link' ? runUrl : runSummary;
        if (!text)
            return;
        try {
            await navigator.clipboard.writeText(text);
            setCopiedState(type);
            window.setTimeout(() => setCopiedState(null), 2000);
        }
        catch (error) {
            console.error(`Failed to copy ${type}:`, error);
        }
    }
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "card rsc-card", children: _jsxs("div", { className: "rsc-layout", children: [_jsxs("div", { className: "rsc-content", children: [_jsx("div", { className: "small rsc-heading", children: "Share this run" }), _jsx("div", { className: "rsc-summary", children: runSummary })] }), _jsxs("div", { className: "rsc-actions", children: [_jsx("button", { className: "btn", onClick: () => handleCopy('link'), children: copiedState === 'link' ? 'Copied link' : 'Copy run link' }), _jsx("button", { className: "btn", onClick: () => handleCopy('summary'), children: copiedState === 'summary' ? 'Copied summary' : 'Copy run summary' }), _jsxs("button", { className: "btn rsc-btn-slack", onClick: () => setShowSlackModal(true), children: [_jsx("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "currentColor", className: "rsc-slack-icon", children: _jsx("path", { d: "M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.527 2.527 0 0 1 2.52-2.52h6.313A2.528 2.528 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" }) }), "Share to Slack"] })] })] }) }), showSlackModal && run && (_jsx(ShareToSlackModal, { flowId: run.flow_id, flowName: run.flow_name || 'Untitled Flow', runId: selectedRun, onClose: () => setShowSlackModal(false) }))] }));
}
