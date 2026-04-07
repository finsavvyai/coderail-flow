import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Clock, Calendar, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { CronBuilder } from './CronBuilder';
import { apiUrl, getApiToken } from './api-core';
export function FlowScheduler({ projectId, flows }) {
    const [schedules, setSchedules] = useState([]);
    const [showAdd, setShowAdd] = useState(false);
    const [selectedFlow, setSelectedFlow] = useState('');
    const [cronExpression, setCronExpression] = useState('0 0 * * *');
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (!projectId) {
            setSchedules([]);
            return;
        }
        void loadSchedules();
    }, [projectId]);
    async function loadSchedules() {
        if (!projectId)
            return;
        try {
            const token = await getApiToken();
            const res = await fetch(apiUrl(`/schedules?projectId=${encodeURIComponent(projectId)}`), {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            if (res.ok) {
                const data = await res.json();
                setSchedules(data.schedules || []);
            }
        }
        catch (error) {
            console.error('Failed to load schedules:', error);
        }
    }
    async function createSchedule() {
        if (!selectedFlow) {
            toast.error('Please select a flow');
            return;
        }
        setLoading(true);
        try {
            const token = await getApiToken();
            const res = await fetch(apiUrl('/schedules'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ projectId, flowId: selectedFlow, cronExpression }),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || 'Failed to create schedule');
            }
            toast.success('Schedule created successfully!');
            setShowAdd(false);
            setSelectedFlow('');
            setCronExpression('0 0 * * *');
            await loadSchedules();
        }
        catch (error) {
            toast.error(error.message || 'Failed to create schedule');
        }
        finally {
            setLoading(false);
        }
    }
    async function deleteSchedule(scheduleId) {
        try {
            const token = await getApiToken();
            const res = await fetch(apiUrl(`/schedules/${scheduleId}`), {
                method: 'DELETE',
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            if (!res.ok)
                throw new Error('Failed to delete schedule');
            toast.success('Schedule deleted');
            await loadSchedules();
        }
        catch (error) {
            toast.error(error.message || 'Failed to delete schedule');
        }
    }
    async function toggleSchedule(scheduleId, enabled) {
        try {
            const token = await getApiToken();
            const res = await fetch(apiUrl(`/schedules/${scheduleId}`), {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ enabled }),
            });
            if (!res.ok)
                throw new Error('Failed to update schedule');
            await loadSchedules();
        }
        catch (error) {
            toast.error(error.message || 'Failed to update schedule');
        }
    }
    return (_jsxs("div", { className: "card", children: [_jsxs("div", { className: "schedule-header", children: [_jsxs("div", { className: "schedule-name", children: [_jsx(Clock, { size: 18, className: "schedule-icon" }), "Flow Scheduler"] }), _jsxs("button", { className: "btn", onClick: () => setShowAdd(!showAdd), children: [_jsx(Plus, { size: 14 }), " Add Schedule"] })] }), showAdd && (_jsx(CronBuilder, { flows: flows, selectedFlow: selectedFlow, onSelectedFlowChange: setSelectedFlow, cronExpression: cronExpression, onCronExpressionChange: setCronExpression, loading: loading, onSubmit: createSchedule, onCancel: () => setShowAdd(false) })), schedules.length === 0 ? (_jsxs("div", { className: "schedule-empty", children: [_jsx(Calendar, { size: 48, style: { opacity: 0.5, marginBottom: 12 } }), _jsx("div", { children: "No schedules yet" }), _jsx("div", { className: "small", style: { marginTop: 8 }, children: "Add a schedule to automatically run flows" })] })) : (_jsx("div", { className: "analytics-flow-list", children: schedules.map((schedule) => (_jsx(ScheduleItem, { schedule: schedule, onToggle: toggleSchedule, onDelete: deleteSchedule }, schedule.id))) }))] }));
}
function ScheduleItem({ schedule, onToggle, onDelete, }) {
    return (_jsxs("div", { className: `schedule-card ${schedule.enabled ? 'schedule-active' : ''}`, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { className: "schedule-name", children: schedule.flowName }), _jsx("div", { className: "schedule-cron-display", children: schedule.cronExpression }), schedule.nextRun && (_jsxs("div", { className: "schedule-meta", style: { marginTop: 4 }, children: ["Next run: ", new Date(schedule.nextRun).toLocaleString()] }))] }), _jsxs("div", { className: "schedule-actions", children: [_jsx("button", { className: `schedule-toggle ${schedule.enabled ? 'active' : 'paused'}`, onClick: () => onToggle(schedule.id, !schedule.enabled), children: schedule.enabled ? 'Enabled' : 'Disabled' }), _jsx("button", { className: "schedule-toggle schedule-delete", onClick: () => onDelete(schedule.id), "aria-label": "Delete schedule", children: _jsx(Trash2, { size: 14 }) })] })] }));
}
