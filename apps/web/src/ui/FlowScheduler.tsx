import { useState } from 'react';
import { Clock, Calendar, Plus, Trash2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

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

  // Cron presets
  const cronPresets = [
    { label: 'Every hour', expression: '0 * * * *' },
    { label: 'Every 6 hours', expression: '0 */6 * * *' },
    { label: 'Daily at midnight', expression: '0 0 * * *' },
    { label: 'Daily at 9 AM', expression: '0 9 * * *' },
    { label: 'Weekly (Monday 9 AM)', expression: '0 9 * * 1' },
    { label: 'Monthly (1st at 9 AM)', expression: '0 9 1 * *' },
  ];

  async function loadSchedules() {
    try {
      const token = await (window as any).Clerk?.session?.getToken();
      const res = await fetch(`/api/schedules?projectId=${encodeURIComponent(projectId)}`, {
        headers: { Authorization: `Bearer ${token}` },
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
      const token = await (window as any).Clerk?.session?.getToken();
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectId,
          flowId: selectedFlow,
          cronExpression,
        }),
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
      const token = await (window as any).Clerk?.session?.getToken();
      const res = await fetch(`/api/schedules/${scheduleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to delete schedule');
      }

      toast.success('Schedule deleted');
      await loadSchedules();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete schedule');
    }
  }

  async function toggleSchedule(scheduleId: string, enabled: boolean) {
    try {
      const token = await (window as any).Clerk?.session?.getToken();
      const res = await fetch(`/api/schedules/${scheduleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled }),
      });

      if (!res.ok) {
        throw new Error('Failed to update schedule');
      }

      await loadSchedules();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update schedule');
    }
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
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
        <div
          style={{
            padding: 16,
            background: '#1a1a1a',
            borderRadius: 8,
            border: '1px solid #2a2a2a',
            marginBottom: 16,
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>
              Flow
            </label>
            <select
              className="input"
              value={selectedFlow}
              onChange={(e) => setSelectedFlow(e.target.value)}
            >
              <option value="">Select a flow</option>
              {flows.map((flow) => (
                <option key={flow.id} value={flow.id}>
                  {flow.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>
              Schedule
            </label>
            <select
              className="input"
              value={cronExpression}
              onChange={(e) => setCronExpression(e.target.value)}
            >
              {cronPresets.map((preset) => (
                <option key={preset.expression} value={preset.expression}>
                  {preset.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}>
              Cron Expression
            </label>
            <input
              className="input"
              type="text"
              value={cronExpression}
              onChange={(e) => setCronExpression(e.target.value)}
              placeholder="0 0 * * *"
            />
            <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>
              Format: minute hour day month weekday (e.g., 0 9 * * * for daily at 9 AM)
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn"
              onClick={createSchedule}
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? 'Creating...' : 'Create Schedule'}
            </button>
            <button
              className="btn"
              onClick={() => setShowAdd(false)}
              style={{ flex: 1, background: '#2a2a2a' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {schedules.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 32, color: '#888' }}>
          <Calendar size={48} style={{ marginBottom: 12, opacity: 0.5 }} />
          <div>No schedules yet</div>
          <div className="small" style={{ marginTop: 8 }}>
            Add a schedule to automatically run flows
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              style={{
                padding: 12,
                background: '#1a1a1a',
                borderRadius: 8,
                border: `1px solid ${schedule.enabled ? '#3b82f6' : '#2a2a2a'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>
                  {schedule.flowName}
                </div>
                <div style={{ fontSize: 12, color: '#888' }}>
                  {schedule.cronExpression}
                </div>
                {schedule.nextRun && (
                  <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
                    Next run: {new Date(schedule.nextRun).toLocaleString()}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  className="btn"
                  onClick={() => toggleSchedule(schedule.id, !schedule.enabled)}
                  style={{
                    padding: '4px 8px',
                    fontSize: 11,
                    background: schedule.enabled ? '#22c55e' : '#2a2a2a',
                  }}
                >
                  {schedule.enabled ? 'Enabled' : 'Disabled'}
                </button>
                <button
                  className="btn"
                  onClick={() => deleteSchedule(schedule.id)}
                  style={{ padding: '4px 8px', fontSize: 11, background: '#dc2626' }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
