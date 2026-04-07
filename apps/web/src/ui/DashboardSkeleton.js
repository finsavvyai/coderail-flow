import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Skeleton } from './Modal';
export function DashboardSkeleton() {
    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 24 }, children: [_jsx("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: 16,
                }, children: Array.from({ length: 4 }).map((_, i) => (_jsxs("div", { className: "card", style: { padding: 20 }, children: [_jsx(Skeleton, { width: 40, height: 40, borderRadius: 10 }), _jsx("div", { style: { marginTop: 12 }, children: _jsx(Skeleton, { width: 60, height: 12 }) }), _jsx("div", { style: { marginTop: 8 }, children: _jsx(Skeleton, { width: 80, height: 24 }) })] }, i))) }), _jsxs("div", { className: "card", style: { padding: 20 }, children: [_jsx(Skeleton, { width: 120, height: 16 }), _jsx("div", { style: { marginTop: 16 }, children: _jsx(Skeleton, { width: "100%", height: 200, borderRadius: 8 }) })] }), _jsxs("div", { className: "card", style: { padding: 16 }, children: [_jsx(Skeleton, { width: 100, height: 16 }), _jsx("div", { style: { marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }, children: Array.from({ length: 5 }).map((_, i) => (_jsxs("div", { style: { display: 'flex', gap: 16, alignItems: 'center' }, children: [_jsx(Skeleton, { width: 60, height: 12 }), _jsx(Skeleton, { width: "40%", height: 12 }), _jsx(Skeleton, { width: 80, height: 24, borderRadius: 12 }), _jsx(Skeleton, { width: 100, height: 12 })] }, i))) })] })] }));
}
