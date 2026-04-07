import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Skeleton({ className = '' }) {
    return (_jsx("div", { className: `animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`, role: "status", "aria-label": "Loading...", children: _jsx("span", { className: "sr-only", children: "Loading..." }) }));
}
export function CardSkeleton() {
    return (_jsxs("div", { className: "bg-white rounded-lg shadow p-6 space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Skeleton, { className: "h-4 w-24" }), _jsx(Skeleton, { className: "h-12 w-12 rounded-lg" })] }), _jsx(Skeleton, { className: "h-8 w-16" })] }));
}
export function TableSkeleton({ rows = 5 }) {
    return (_jsxs("div", { className: "bg-white rounded-lg shadow overflow-hidden", children: [_jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: _jsx(Skeleton, { className: "h-6 w-32" }) }), _jsx("div", { className: "p-6 space-y-4", children: Array.from({ length: rows }).map((_, i) => (_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx(Skeleton, { className: "h-4 w-24" }), _jsx(Skeleton, { className: "h-6 w-20 rounded-full" }), _jsx(Skeleton, { className: "h-4 w-16" }), _jsx(Skeleton, { className: "h-4 w-24" })] }, i))) })] }));
}
export function ChartSkeleton() {
    return (_jsxs("div", { className: "bg-white rounded-lg shadow p-6 space-y-4", children: [_jsx(Skeleton, { className: "h-6 w-40" }), _jsx(Skeleton, { className: "h-64 w-full" })] }));
}
export function FlowListSkeleton({ items = 3 }) {
    return (_jsx("div", { className: "space-y-3", children: Array.from({ length: items }).map((_, i) => (_jsx("div", { className: "bg-white rounded-lg shadow p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-2 flex-1", children: [_jsx(Skeleton, { className: "h-5 w-48" }), _jsx(Skeleton, { className: "h-4 w-64" })] }), _jsx(Skeleton, { className: "h-10 w-24" })] }) }, i))) }));
}
