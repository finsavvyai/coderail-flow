import { useEffect, useState } from 'react';
import { Clock, Calendar, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { CronBuilder } from './CronBuilder';
import { apiUrl, getClerkToken } from './api-core';
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
      const token = await getClerkToken();
      const res = await fetch(apiUrl(`/schedules?projectId=${encodeURIComponent(projectId)}`), {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.ok) {
        const data = await res.json();
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
      const token = await getClerkToken();
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
    } catch (error: any) {
      toast.error(error.message || 'Failed to create schedule');
    } finally {
      setLoading(false);
    }
  }

  async function deleteSchedule(scheduleId: string) {
    try {
      const token = await getClerkToken();
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
      const token = await getClerkToken();
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={18} style={{ color: '#3b82f6' }} />
          <h3 style={{ margin: 0 }}>Flow Scheduler</h3>
        </div>
        <button
          className="btn"
          onClick={() => setShowAdd(!showAdd)}
          style={{ background: '#3b82f6', padding: '6px 12px', fontSize: 13 }}
        >
          <Plus size={14} style={{ display: 'inline', marginRight: 6 }} />
          Add Schedule
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
        <div style={{ textAlign: 'center', padding: 32, color: '#a8b3cf' }}>
          <Calendar size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
          <div>No schedules yet</div>
          <div className="small" style={{ marginTop: 8 }}>
            Add a schedule to automatically run flows
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
    <div
      style={{
        padding: 12,
        background: '#1a1a1a',
        borderRadius: 8,
        border: `1px solid ${schedule.enabled ? '#3b82f6' : '#2a2a2a'}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = '#222')}
      onMouseLeave={(e) => (e.currentTarget.style.background = '#1a1a1a')}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>{schedule.flowName}</div>
        <div style={{ fontSize: 12, color: '#a8b3cf' }}>{schedule.cronExpression}</div>
        {schedule.nextRun && (
          <div style={{ fontSize: 11, color: '#a8b3cf', marginTop: 4 }}>
            Next run: {new Date(schedule.nextRun).toLocaleString()}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          className="btn"
          onClick={() => onToggle(schedule.id, !schedule.enabled)}
          style={{
            padding: '8px 12px',
            fontSize: 11,
            background: schedule.enabled ? '#22c55e' : '#2a2a2a',
          }}
        >
          {schedule.enabled ? 'Enabled' : 'Disabled'}
        </button>
        <button
          className="btn"
          onClick={() => onDelete(schedule.id)}
          aria-label="Delete schedule"
          style={{ padding: '8px 12px', fontSize: 11, background: '#dc2626' }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
