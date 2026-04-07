import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function BillingUsageCard({ runsThisMonth, runsLimit, plan }) {
    const isOver = runsLimit > 0 && runsThisMonth >= runsLimit;
    return (_jsxs("div", { className: "card", style: { marginBottom: 20 }, children: [_jsx("div", { className: "h2", children: "Usage This Month" }), _jsxs("div", { className: "usage-stats", children: [_jsxs("div", { children: [_jsxs("div", { className: "usage-big-number", children: [runsThisMonth, _jsxs("span", { className: "usage-big-limit", children: [" / ", runsLimit === -1 ? 'Unlimited' : runsLimit] })] }), _jsx("div", { className: "small", children: "Runs used" })] }), _jsxs("div", { children: [_jsx("div", { className: "usage-big-number", children: plan.toUpperCase() }), _jsx("div", { className: "small", children: "Current plan" })] })] }), runsLimit > 0 && (_jsx("div", { style: { marginTop: 12 }, children: _jsx("div", { className: "usage-bar-track", children: _jsx("div", { className: `usage-bar-fill${isOver ? ' usage-bar-fill--over' : ''}`, style: {
                            width: `${Math.min(100, (runsThisMonth / runsLimit) * 100)}%`,
                        } }) }) }))] }));
}
