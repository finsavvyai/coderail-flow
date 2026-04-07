import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './analytics-ext.css';
export function formatTimeRangeLabel(timeRange) {
    return timeRange === '7d' ? 'last 7 days' : timeRange === '30d' ? 'last 30 days' : 'last 90 days';
}
export function buildOpsSnapshot(stats, recentRuns, timeRange) {
    const successRate = stats.total > 0 ? Math.round((stats.succeeded / stats.total) * 100) : 0;
    const failedRecent = recentRuns.filter((run) => run.status === 'failed').length;
    const strongestFlow = [...stats.byFlow].sort((a, b) => {
        if (b.successRate !== a.successRate)
            return b.successRate - a.successRate;
        return b.count - a.count;
    })[0];
    const benchmark = successRate >= 95
        ? 'Elite reliability'
        : successRate >= 85
            ? 'Strong reliability'
            : successRate >= 70
                ? 'Needs tuning'
                : 'At risk';
    const message = [
        `CodeRail Flow ops snapshot (${formatTimeRangeLabel(timeRange)}): ${stats.succeeded}/${stats.total} runs succeeded with ${(stats.avgDuration / 1000).toFixed(1)}s average runtime.`,
        strongestFlow
            ? `Best-performing flow: ${strongestFlow.flowName} at ${strongestFlow.successRate}% success across ${strongestFlow.count} runs.`
            : '',
        failedRecent === 0
            ? 'No failed runs in the latest sample.'
            : `${failedRecent} recent run${failedRecent === 1 ? '' : 's'} need follow-up.`,
    ]
        .filter(Boolean)
        .join(' ');
    return { successRate, benchmark, message };
}
export function OpsSnapshotCard({ snapshot, stats, timeRange, copiedSnapshot, onCopySnapshot, }) {
    return (_jsx("div", { className: "card ops-snapshot-card", children: _jsxs("div", { className: "ops-snapshot-layout", children: [_jsxs("div", { className: "ops-snapshot-body", children: [_jsx("div", { className: "small ops-snapshot-label", children: "Shareable ops snapshot" }), _jsxs("div", { className: "h2 ops-snapshot-heading", children: [snapshot.successRate, "% success rate over the ", formatTimeRangeLabel(timeRange)] }), _jsx("div", { className: "small ops-snapshot-message", children: snapshot.message }), _jsxs("div", { className: "ops-snapshot-badges", children: [_jsx("span", { className: "badge badge--translucent", children: snapshot.benchmark }), _jsxs("span", { className: "badge badge--translucent", children: ["Avg runtime ", (stats.avgDuration / 1000).toFixed(1), "s"] })] })] }), _jsx("button", { className: "btn", onClick: onCopySnapshot, children: copiedSnapshot ? 'Copied update' : 'Copy ops update' })] }) }));
}
export function RecentRunsTable({ recentRuns, selectedRunId, onSelectRun }) {
    return (_jsxs("div", { className: "card recent-runs-card", children: [_jsx("div", { className: "h2 analytics-section-title", children: "Recent Runs" }), _jsxs("table", { className: "table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Run" }), _jsx("th", { children: "Flow" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Created" })] }) }), _jsxs("tbody", { children: [recentRuns.map((run) => (_jsxs("tr", { onClick: () => onSelectRun?.(run.id), className: [
                                    onSelectRun ? 'run-row--clickable' : '',
                                    selectedRunId === run.id ? 'run-row--selected' : '',
                                ]
                                    .filter(Boolean)
                                    .join(' '), children: [_jsxs("td", { className: "mono", children: [run.id.slice(0, 8), "..."] }), _jsx("td", { children: run.flow_name }), _jsx("td", { children: _jsx("span", { className: "badge", children: run.status }) }), _jsx("td", { className: "small", children: new Date(run.created_at).toLocaleString() })] }, run.id))), recentRuns.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: 4, className: "small", children: "No runs available yet." }) }))] })] })] }));
}
