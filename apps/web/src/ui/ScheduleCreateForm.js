import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const CRON_PRESETS = [
    { label: 'Every minute', value: '* * * * *' },
    { label: 'Every 5 minutes', value: '*/5 * * * *' },
    { label: 'Every 15 minutes', value: '*/15 * * * *' },
    { label: 'Every hour', value: '0 * * * *' },
    { label: 'Every 6 hours', value: '0 */6 * * *' },
    { label: 'Daily at midnight', value: '0 0 * * *' },
    { label: 'Daily at 9am', value: '0 9 * * *' },
    { label: 'Weekly (Sunday)', value: '0 0 * * 0' },
    { label: 'Monthly (1st)', value: '0 0 1 * *' },
];
export function ScheduleCreateForm({ flows, newSchedule, onChange, onCreate, onCancel, }) {
    return (_jsxs("div", { className: "schedule-form", children: [_jsxs("div", { className: "schedule-form-group", children: [_jsx("label", { htmlFor: "schedule-flow", className: "schedule-form-label", children: "Flow" }), _jsxs("select", { id: "schedule-flow", className: "input", value: newSchedule.flowId, onChange: (e) => onChange({ ...newSchedule, flowId: e.target.value }), children: [_jsx("option", { value: "", children: "Select a flow..." }), flows.map((f) => (_jsx("option", { value: f.id, children: f.name }, f.id)))] })] }), _jsxs("div", { className: "schedule-form-group", children: [_jsx("label", { htmlFor: "schedule-cron", className: "schedule-form-label", children: "Schedule" }), _jsx("select", { id: "schedule-cron", className: "input", value: newSchedule.cronExpression, onChange: (e) => onChange({ ...newSchedule, cronExpression: e.target.value }), children: CRON_PRESETS.map((p) => (_jsx("option", { value: p.value, children: p.label }, p.value))) })] }), _jsxs("div", { className: "schedule-form-group", children: [_jsx("label", { htmlFor: "schedule-params", className: "schedule-form-label", children: "Parameters (JSON)" }), _jsx("input", { id: "schedule-params", className: "input", value: newSchedule.params, onChange: (e) => onChange({ ...newSchedule, params: e.target.value }), placeholder: '{"key": "value"}' })] }), _jsxs("div", { className: "schedule-form-actions", children: [_jsx("button", { className: "btn", onClick: onCreate, children: "Create Schedule" }), _jsx("button", { className: "btn schedule-cancel-btn", onClick: onCancel, children: "Cancel" })] })] }));
}
