import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const cronPresets = [
    { label: 'Every hour', expression: '0 * * * *' },
    { label: 'Every 6 hours', expression: '0 */6 * * *' },
    { label: 'Daily at midnight', expression: '0 0 * * *' },
    { label: 'Daily at 9 AM', expression: '0 9 * * *' },
    { label: 'Weekly (Monday 9 AM)', expression: '0 9 * * 1' },
    { label: 'Monthly (1st at 9 AM)', expression: '0 9 1 * *' },
];
const CRON_REGEX = /^(\S+\s+){4}\S+$/;
function isValidCron(expression) {
    return CRON_REGEX.test(expression.trim());
}
export function CronBuilder({ flows, selectedFlow, onSelectedFlowChange, cronExpression, onCronExpressionChange, loading, onSubmit, onCancel, }) {
    return (_jsxs("div", { className: "cron-container", children: [_jsxs("div", { className: "cron-field", children: [_jsx("label", { htmlFor: "cron-flow-select", className: "cron-label", children: "Flow" }), _jsxs("select", { id: "cron-flow-select", className: "input", value: selectedFlow, onChange: (e) => onSelectedFlowChange(e.target.value), children: [_jsx("option", { value: "", children: "Select a flow" }), flows.map((flow) => (_jsx("option", { value: flow.id, children: flow.name }, flow.id)))] })] }), _jsxs("div", { className: "cron-field", children: [_jsx("label", { htmlFor: "cron-schedule-preset", className: "cron-label", children: "Schedule" }), _jsx("select", { id: "cron-schedule-preset", className: "input", value: cronExpression, onChange: (e) => onCronExpressionChange(e.target.value), children: cronPresets.map((preset) => (_jsx("option", { value: preset.expression, children: preset.label }, preset.expression))) })] }), _jsxs("div", { className: "cron-field", children: [_jsx("label", { htmlFor: "cron-expression-input", className: "cron-label", children: "Cron Expression" }), _jsx("input", { id: "cron-expression-input", className: "input", type: "text", value: cronExpression, onChange: (e) => onCronExpressionChange(e.target.value), placeholder: "0 0 * * *", "aria-invalid": cronExpression.trim() !== '' && !isValidCron(cronExpression), "aria-describedby": "cron-error cron-hint" }), cronExpression.trim() !== '' && !isValidCron(cronExpression) && (_jsx("div", { id: "cron-error", role: "alert", className: "cron-error", children: "Invalid cron expression. Must be 5 space-separated fields (minute hour day month weekday)." })), _jsx("div", { id: "cron-hint", className: "cron-hint", children: "Format: minute hour day month weekday (e.g., 0 9 * * * for daily at 9 AM)" })] }), _jsxs("div", { className: "cron-actions", children: [_jsx("button", { className: "btn", onClick: onSubmit, disabled: loading || !isValidCron(cronExpression), children: loading ? 'Creating...' : 'Create Schedule' }), _jsx("button", { className: "btn cron-cancel-btn", onClick: onCancel, children: "Cancel" })] })] }));
}
