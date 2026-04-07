import { useEffect, useState } from 'react';
import { Clock, Calendar, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { CronBuilder } from './CronBuilder';
import { apiUrl, getApiToken } from './api-core';
interface Schedule {
  id: string;
  flowId: string;
  flowName: string;
  cronExpression: string;
  enabled: boolean;
  nextRun: string;
}

interface FlowSchedulerProps {
  projectId: string;
  flows: Array<{ id: string; name: string }>;
}

export function FlowScheduler({ projectId, flows }: FlowSchedulerProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
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
    if (!projectId) return;
    try {
      const token = await getApiToken();
      const res = await fetch(apiUrl(`/schedules?projectId=${encodeURIComponent(projectId)}`), {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.ok) {
        const data = (await res.json()) as { schedules?: Schedule[] };
        setSchedules(data.schedules || []);
      }
    } catch (error) {
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
        const error = (await res.json()) as { message?: string };
        throw new Error(error.message || 'Failed to create schedule');
      }
      toast.success('Schedule created successfully!');
      setShowAdd(false);
      setSelectedFlow('');
      setCronExpression('0 0 * * *');
      await loadSchedules();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create schedule');
    } finally {
      setLoading(false);
    }
  }

  async function deleteSchedule(scheduleId: string) {
    try {
      const token = await getApiToken();
      const res = await fetch(apiUrl(`/schedules/${scheduleId}`), {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error('Failed to delete schedule');
      toast.success('Schedule deleted');
      await loadSchedules();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete schedule');
    }
  }

  async function toggleSchedule(scheduleId: string, enabled: boolean) {
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
      if (!res.ok) throw new Error('Failed to update schedule');
      await loadSchedules();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update schedule');
    }
  }

  return (
    <div className="card">
      <div className="schedule-header">
        <div className="schedule-name">
          <Clock size={18} className="schedule-icon" />
          Flow Scheduler
        </div>
        <button className="btn" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={14} /> Add Schedule
        </button>
      </div>
      {showAdd && (
        <CronBuilder
          flows={flows}
          selectedFlow={selectedFlow}
          onSelectedFlowChange={setSelectedFlow}
          cronExpression={cronExpression}
          onCronExpressionChange={setCronExpression}
          loading={loading}
          onSubmit={createSchedule}
          onCancel={() => setShowAdd(false)}
        />
      )}
      {schedules.length === 0 ? (
        <div className="schedule-empty">
          <Calendar size={48} style={{ opacity: 0.5, marginBottom: 12 }} />
          <div>No schedules yet</div>
          <div className="small" style={{ marginTop: 8 }}>
            Add a schedule to automatically run flows
          </div>
        </div>
      ) : (
        <div className="analytics-flow-list">
          {schedules.map((schedule) => (
            <ScheduleItem
              key={schedule.id}
              schedule={schedule}
              onToggle={toggleSchedule}
              onDelete={deleteSchedule}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ScheduleItem({
  schedule,
  onToggle,
  onDelete,
}: {
  schedule: Schedule;
  onToggle: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className={`schedule-card ${schedule.enabled ? 'schedule-active' : ''}`}>
      <div style={{ flex: 1 }}>
        <div className="schedule-name">{schedule.flowName}</div>
        <div className="schedule-cron-display">{schedule.cronExpression}</div>
        {schedule.nextRun && (
          <div className="schedule-meta" style={{ marginTop: 4 }}>
            Next run: {new Date(schedule.nextRun).toLocaleString()}
          </div>
        )}
      </div>
      <div className="schedule-actions">
        <button
          className={`schedule-toggle ${schedule.enabled ? 'active' : 'paused'}`}
          onClick={() => onToggle(schedule.id, !schedule.enabled)}
        >
          {schedule.enabled ? 'Enabled' : 'Disabled'}
        </button>
        <button
          className="schedule-toggle schedule-delete"
          onClick={() => onDelete(schedule.id)}
          aria-label="Delete schedule"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
