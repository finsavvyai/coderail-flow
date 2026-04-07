import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, Play, Pause, Calendar } from 'lucide-react';
import { apiRequest } from './api';
import { ScheduleCreateForm, CRON_PRESETS } from './ScheduleCreateForm';
export function ScheduleManager({ flows }) {
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const [newSchedule, setNewSchedule] = useState({
        flowId: '',
        cronExpression: '0 * * * *',
        params: '{}',
    });
    useEffect(() => {
        void loadSchedules();
    }, []);
    async function loadSchedules() {
        try {
            setLoading(true);
            const data = await apiRequest('/schedules');
            setSchedules(data.schedules || []);
        }
        catch (e) {
            console.error('Failed to load schedules:', e);
        }
        finally {
            setLoading(false);
        }
    }
    async function createSchedule() {
        if (!newSchedule.flowId || !newSchedule.cronExpression)
            return;
        try {
            let params = {};
            try {
                params = JSON.parse(newSchedule.params);
            }
            catch {
                // ignore invalid JSON, use empty object
            }
            await apiRequest('/schedules', {
                method: 'POST',
                body: JSON.stringify({
                    flowId: newSchedule.flowId,
                    cronExpression: newSchedule.cronExpression,
                    params,
                }),
            });
            setShowCreate(false);
            setNewSchedule({ flowId: '', cronExpression: '0 * * * *', params: '{}' });
            void loadSchedules();
        }
        catch (e) {
            console.error('Failed to create schedule:', e);
        }
    }
    async function toggleSchedule(id, enabled) {
        try {
            await apiRequest(`/schedules/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ enabled: !enabled }),
            });
            void loadSchedules();
        }
        catch (e) {
            console.error('Failed to toggle schedule:', e);
        }
    }
    async function deleteSchedule(id) {
        if (!confirm('Delete this schedule?'))
            return;
        try {
            await apiRequest(`/schedules/${id}`, { method: 'DELETE' });
            void loadSchedules();
        }
        catch (e) {
            console.error('Failed to delete schedule:', e);
        }
    }
    function getFlowName(flowId) {
        return flows.find((f) => f.id === flowId)?.name || flowId;
    }
    function formatCron(cron) {
        return CRON_PRESETS.find((p) => p.value === cron)?.label || cron;
    }
    function formatDate(date) {
        if (!date)
            return 'Never';
        return new Date(date).toLocaleString();
    }
    return (_jsxs("div", { className: "card", children: [_jsxs("div", { className: "schedule-header", children: [_jsxs("div", { className: "schedule-name", children: [_jsx(Calendar, { size: 20, className: "schedule-icon" }), " Scheduled Flows"] }), _jsxs("button", { className: "btn", onClick: () => setShowCreate(true), children: [_jsx(Plus, { size: 16 }), " New Schedule"] })] }), showCreate && (_jsx(ScheduleCreateForm, { flows: flows, newSchedule: newSchedule, onChange: setNewSchedule, onCreate: createSchedule, onCancel: () => setShowCreate(false) })), loading ? (_jsx("div", { className: "schedule-empty", children: "Loading..." })) : schedules.length === 0 ? (_jsxs("div", { className: "schedule-empty", children: [_jsx(Clock, { size: 48, style: { opacity: 0.5, marginBottom: 16 } }), _jsx("div", { children: "No scheduled flows yet" }), _jsx("div", { className: "small", style: { marginTop: 8 }, children: "Create a schedule to run flows automatically" })] })) : (_jsx("div", { className: "analytics-flow-list", children: schedules.map((schedule) => (_jsx("div", { className: "schedule-card", style: { opacity: schedule.enabled ? 1 : 0.6 }, children: _jsxs("div", { className: "schedule-header", children: [_jsxs("div", { children: [_jsx("div", { className: "schedule-name", children: getFlowName(schedule.flow_id) }), _jsxs("div", { className: "schedule-meta", children: [_jsx("span", { children: formatCron(schedule.cron_expression) }), ' \u00b7 ', _jsxs("span", { children: ["Last: ", formatDate(schedule.last_run_at)] }), ' \u00b7 ', _jsxs("span", { children: ["Next: ", formatDate(schedule.next_run_at)] })] })] }), _jsxs("div", { className: "schedule-actions", children: [_jsx("button", { className: `schedule-toggle ${schedule.enabled ? 'active' : 'paused'}`, onClick: () => toggleSchedule(schedule.id, schedule.enabled), "aria-label": schedule.enabled ? 'Pause schedule' : 'Resume schedule', children: schedule.enabled ? _jsx(Pause, { size: 14 }) : _jsx(Play, { size: 14 }) }), _jsx("button", { className: "schedule-toggle schedule-delete", onClick: () => deleteSchedule(schedule.id), "aria-label": "Delete schedule", children: _jsx(Trash2, { size: 14 }) })] })] }) }, schedule.id))) }))] }));
}
