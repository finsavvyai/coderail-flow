import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { getAnalyticsStats, getElementReliability, getRuns, getStepAnalytics, } from './api';
import { AnalyticsSummaryCards } from './AnalyticsSummaryCards';
import { RunsOverTimeChart, TopFlowsList } from './AnalyticsCharts';
import { StepPerformanceCard, ElementReliabilityCard } from './AnalyticsChartItems';
import { buildOpsSnapshot, OpsSnapshotCard, RecentRunsTable } from './AnalyticsDashboardCharts';
import './analytics-ext.css';
export function AnalyticsDashboard({ projectId, selectedRunId, onSelectRun, }) {
    const [stats, setStats] = useState(null);
    const [stepStats, setStepStats] = useState(null);
    const [elementStats, setElementStats] = useState(null);
    const [recentRuns, setRecentRuns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('7d');
    const [copiedSnapshot, setCopiedSnapshot] = useState(false);
    useEffect(() => {
        void loadStats();
    }, [projectId, timeRange]);
    async function loadStats() {
        try {
            setLoading(true);
            const [data, steps, elements, runs] = await Promise.all([
                getAnalyticsStats(timeRange, projectId),
                getStepAnalytics(timeRange, projectId),
                getElementReliability(projectId),
                getRuns(),
            ]);
            setStats(data);
            setStepStats(steps);
            setElementStats(elements);
            setRecentRuns(runs.slice(0, 8));
        }
        catch (e) {
            console.error('Failed to load analytics:', e);
            setStats(null);
            setStepStats(null);
            setElementStats(null);
            setRecentRuns([]);
        }
        finally {
            setLoading(false);
        }
    }
    if (loading) {
        return (_jsxs("div", { className: "card analytics-center-card", children: [_jsx(Activity, { size: 32, className: "spin analytics-spin-icon" }), _jsx("div", { children: "Loading analytics..." })] }));
    }
    if (!stats) {
        return (_jsxs("div", { className: "card analytics-center-card", children: [_jsx("div", { className: "analytics-retry-gap", children: "Could not load analytics right now." }), _jsx("button", { className: "btn", onClick: loadStats, children: "Retry" })] }));
    }
    const snapshot = buildOpsSnapshot(stats, recentRuns, timeRange);
    async function handleCopySnapshot() {
        try {
            await navigator.clipboard.writeText(snapshot.message);
            setCopiedSnapshot(true);
            window.setTimeout(() => setCopiedSnapshot(false), 2000);
        }
        catch (e) {
            console.error('Failed to copy ops snapshot:', e);
        }
    }
    return (_jsxs("div", { children: [_jsx("div", { className: "analytics-range-bar", children: ['7d', '30d', '90d'].map((range) => (_jsx("button", { className: `btn btn--range ${timeRange === range ? 'btn--range-active' : 'btn--range-inactive'}`, onClick: () => setTimeRange(range), children: range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days' }, range))) }), _jsx(OpsSnapshotCard, { snapshot: snapshot, stats: stats, timeRange: timeRange, copiedSnapshot: copiedSnapshot, onCopySnapshot: handleCopySnapshot }), _jsx(AnalyticsSummaryCards, { stats: stats }), _jsx(RunsOverTimeChart, { stats: stats }), _jsx(TopFlowsList, { stats: stats }), _jsxs("div", { className: "analytics-detail-grid", children: [_jsx(StepPerformanceCard, { stepStats: stepStats }), _jsx(ElementReliabilityCard, { elementStats: elementStats })] }), _jsx(RecentRunsTable, { recentRuns: recentRuns, selectedRunId: selectedRunId, onSelectRun: onSelectRun })] }));
}
