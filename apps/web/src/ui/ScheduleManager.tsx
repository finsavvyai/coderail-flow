import { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, Play, Pause, Calendar } from 'lucide-react';
import { apiRequest } from './api';
import { ScheduleCreateForm, CRON_PRESETS } from './ScheduleCreateForm';

interface Schedule {
  id: string;
  flow_id: string;
  cron_expression: string;
  enabled: boolean;
  params: string;
  last_run_at: string | null;
  next_run_at: string | null;
  created_at: string;
}

interface Flow {
  id: string;
  name: string;
}

export function ScheduleManager({ flows }: { flows: Flow[] }) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    flowId: '',
    cronExpression: '0 * * * *',
    params: '{}',
  });

  useEffect(() => {
    loadSchedules();
  }, []);

  async function loadSchedules() {
    try {
      setLoading(true);
      const data = await apiRequest('/schedules');
      setSchedules(data.schedules || []);
    } catch (e) {
      console.error('Failed to load schedules:', e);
    } finally {
      setLoading(false);
    }
  }

  async function createSchedule() {
    if (!newSchedule.flowId || !newSchedule.cronExpression) return;
    try {
      let params = {};
      try {
        params = JSON.parse(newSchedule.params);
      } catch {}
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
      loadSchedules();
    } catch (e) {
      console.error('Failed to create schedule:', e);
    }
  }

  async function toggleSchedule(id: string, enabled: boolean) {
    try {
      await apiRequest(`/schedules/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ enabled: !enabled }),
      });
      loadSchedules();
    } catch (e) {
      console.error('Failed to toggle schedule:', e);
    }
  }

  async function deleteSchedule(id: string) {
    if (!confirm('Delete this schedule?')) return;
    try {
      await apiRequest(`/schedules/${id}`, { method: 'DELETE' });
      loadSchedules();
    } catch (e) {
      console.error('Failed to delete schedule:', e);
    }
  }

  function getFlowName(flowId: string): string {
    return flows.find((f) => f.id === flowId)?.name || flowId;
  }

  function formatCron(cron: string): string {
    return CRON_PRESETS.find((p) => p.value === cron)?.label || cron;
  }

  function formatDate(date: string | null): string {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  }

  return (
    <div className="card">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <div className="h2" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={20} /> Scheduled Flows
        </div>
        <button className="btn" onClick={() => setShowCreate(true)}>
          <Plus size={16} /> New Schedule
        </button>
      </div>

      {showCreate && (
        <ScheduleCreateForm
          flows={flows}
          newSchedule={newSchedule}
          onChange={setNewSchedule}
          onCreate={createSchedule}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 20, color: '#888' }}>Loading...</div>
      ) : schedules.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
          <Clock size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
          <div>No scheduled flows yet</div>
          <div className="small" style={{ marginTop: 8 }}>
            Create a schedule to run flows automatically
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
                border: `1px solid ${schedule.enabled ? '#2a2a2a' : '#1a1a1a'}`,
                opacity: schedule.enabled ? 1 : 0.6,
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>
                    {getFlowName(schedule.flow_id)}
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#888' }}>
                    <span>{formatCron(schedule.cron_expression)}</span>
                    <span>Last: {formatDate(schedule.last_run_at)}</span>
                    <span>Next: {formatDate(schedule.next_run_at)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className="btn"
                    style={{
                      background: schedule.enabled ? '#22c55e' : '#2a2a2a',
                      padding: '10px 12px',
                    }}
                    onClick={() => toggleSchedule(schedule.id, schedule.enabled)}
                    aria-label={schedule.enabled ? 'Pause schedule' : 'Resume schedule'}
                  >
                    {schedule.enabled ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                  <button
                    className="btn"
                    style={{ background: '#2a2a2a', padding: '10px 12px' }}
                    onClick={() => deleteSchedule(schedule.id)}
                    aria-label="Delete schedule"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
