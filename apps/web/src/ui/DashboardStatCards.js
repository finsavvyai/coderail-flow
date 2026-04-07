import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
function SvgIcon({ d }) {
    return (_jsx("svg", { width: "22", height: "22", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: d }) }));
}
export function DashboardStatCards({ stats }) {
    const successRate = stats.total_runs > 0 ? ((stats.succeeded_runs / stats.total_runs) * 100).toFixed(1) : '0.0';
    const cards = [
        {
            label: 'Total Runs',
            value: String(stats.total_runs),
            color: 'blue',
            icon: 'M13 10V3L4 14h7v7l9-11h-7z',
        },
        {
            label: 'Success Rate',
            value: `${successRate}%`,
            color: 'green',
            icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        },
        {
            label: 'Avg Duration',
            value: `${(stats.avg_duration / 1000).toFixed(1)}s`,
            color: 'purple',
            icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
        },
        {
            label: 'Failed Runs',
            value: String(stats.failed_runs),
            color: 'red',
            icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        },
    ];
    return (_jsx("div", { className: "dash-stats", children: cards.map((c) => (_jsxs("div", { className: "dash-stat-card", children: [_jsxs("div", { children: [_jsx("p", { className: "dash-stat-label", children: c.label }), _jsx("p", { className: "dash-stat-value", children: c.value })] }), _jsx("div", { className: `dash-stat-icon ${c.color}`, "aria-hidden": "true", children: _jsx(SvgIcon, { d: c.icon }) })] }, c.label))) }));
}
