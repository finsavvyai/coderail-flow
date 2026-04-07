import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Activity, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
const STATUS_ICON = {
    pending: Clock,
    running: Loader2,
    succeeded: CheckCircle,
    failed: XCircle,
};
const STATUS_CLASS = {
    pending: 'rsb rsb--pending',
    running: 'rsb rsb--running',
    succeeded: 'rsb rsb--succeeded',
    failed: 'rsb rsb--failed',
};
export function RunStatusBadge({ status }) {
    const Icon = STATUS_ICON[status] || Activity;
    const className = STATUS_CLASS[status] || 'rsb rsb--pending';
    return (_jsxs("span", { className: className, children: [_jsx(Icon, { size: 12, className: status === 'running' ? 'spin' : '' }), status.charAt(0).toUpperCase() + status.slice(1)] }));
}
