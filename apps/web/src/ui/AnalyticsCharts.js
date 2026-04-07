import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TrendingUp } from 'lucide-react';
export { StepPerformanceCard, ElementReliabilityCard } from './AnalyticsChartItems';
function successRateClass(rate) {
    if (rate >= 90)
        return 'rate-good';
    if (rate >= 70)
        return 'rate-warn';
    return 'rate-bad';
}
export function RunsOverTimeChart({ stats }) {
    const maxDayCount = Math.max(...stats.byDay.map((d) => d.count), 1);
    return (_jsxs("div", { className: "card analytics-chart-card", children: [_jsxs("div", { className: "analytics-chart-title", children: [_jsx(TrendingUp, { size: 18, style: { verticalAlign: 'middle', marginRight: 8 } }), "Runs Over Time"] }), _jsx("div", { className: "analytics-bar-chart", children: stats.byDay.map((day, i) => (_jsxs("div", { className: "analytics-bar-col", children: [_jsxs("div", { className: "analytics-bar-stack", children: [_jsx("div", { className: "analytics-bar analytics-bar-success", style: {
                                        height: `${(day.succeeded / maxDayCount) * 100}%`,
                                        minHeight: day.succeeded > 0 ? 2 : 0,
                                    } }), _jsx("div", { className: "analytics-bar analytics-bar-fail", style: {
                                        height: `${(day.failed / maxDayCount) * 100}%`,
                                        minHeight: day.failed > 0 ? 2 : 0,
                                    } })] }), i % Math.ceil(stats.byDay.length / 7) === 0 && (_jsx("div", { className: "analytics-bar-label", children: new Date(day.date).toLocaleDateString('en', { month: 'short', day: 'numeric' }) }))] }, i))) }), _jsxs("div", { className: "analytics-legend", children: [_jsxs("div", { children: [_jsx("span", { className: "analytics-legend-dot", style: { background: 'var(--success)' } }), "Succeeded"] }), _jsxs("div", { children: [_jsx("span", { className: "analytics-legend-dot", style: { background: 'var(--error)' } }), "Failed"] })] })] }));
}
export function TopFlowsList({ stats }) {
    return (_jsxs("div", { className: "card analytics-chart-card", children: [_jsx("div", { className: "analytics-chart-title", children: "Top Flows" }), _jsx("div", { className: "analytics-flow-list", children: stats.byFlow.map((flow, i) => (_jsxs("div", { className: "analytics-flow-row", children: [_jsx("div", { className: "analytics-flow-rank", children: i + 1 }), _jsxs("div", { className: "analytics-flow-info", children: [_jsx("div", { className: "analytics-flow-name", children: flow.flowName }), _jsxs("div", { className: "analytics-flow-count", children: [flow.count, " runs"] })] }), _jsxs("div", { className: `analytics-flow-rate ${successRateClass(flow.successRate)}`, children: [flow.successRate, "%"] })] }, flow.flowId))) })] }));
}
