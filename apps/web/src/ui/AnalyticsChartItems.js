import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './analytics-ext.css';
export function StepPerformanceCard({ stepStats }) {
    const topStepTypes = stepStats?.byType?.slice(0, 5) ?? [];
    return (_jsxs("div", { className: "card", children: [_jsx("div", { className: "h2 analytics-section-title", children: "Step Performance" }), topStepTypes.length === 0 ? (_jsx("div", { className: "small analytics-text-muted", children: "No step analytics yet." })) : (_jsx("div", { className: "analytics-item-list", children: topStepTypes.map((step) => {
                    const failRate = step.count > 0 ? Math.round((step.failed / step.count) * 100) : 0;
                    return (_jsxs("div", { className: "analytics-item-row", children: [_jsxs("div", { className: "analytics-item-header", children: [_jsx("span", { className: "analytics-item-name", children: step.type }), _jsxs("span", { className: "small analytics-text-muted", children: [step.count, " runs"] })] }), _jsxs("div", { className: "small analytics-text-muted", children: ["Avg ", Math.max(0, step.avgDurationMs), "ms / Fail rate ", failRate, "%"] })] }, step.type));
                }) }))] }));
}
export function ElementReliabilityCard({ elementStats, }) {
    const lowReliability = elementStats?.lowest?.slice(0, 5) ?? [];
    return (_jsxs("div", { className: "card", children: [_jsx("div", { className: "h2 analytics-section-title", children: "Element Reliability" }), _jsxs("div", { className: "analytics-badge-row", children: [_jsxs("span", { className: "badge badge--reliability-high", children: ["High: ", elementStats?.summary.high ?? 0] }), _jsxs("span", { className: "badge badge--reliability-medium", children: ["Medium: ", elementStats?.summary.medium ?? 0] }), _jsxs("span", { className: "badge badge--reliability-low", children: ["Low: ", elementStats?.summary.low ?? 0] })] }), lowReliability.length === 0 ? (_jsx("div", { className: "small analytics-text-muted", children: "No elements tracked yet." })) : (_jsx("div", { className: "analytics-item-list", children: lowReliability.map((el) => (_jsxs("div", { className: "analytics-item-row", children: [_jsxs("div", { className: "analytics-item-header", children: [_jsx("span", { className: "analytics-item-name", children: el.name }), _jsxs("span", { className: "small analytics-text-error", children: [Math.round(el.reliabilityScore * 100), "%"] })] }), _jsxs("div", { className: "small analytics-text-muted", children: ["Element: ", el.elementId.slice(0, 8), "..."] })] }, el.elementId))) }))] }));
}
