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
    void loadSchedules();
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
      } catch {
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
      void loadSchedules();
    } catch (e) {
      console.error('Failed to toggle schedule:', e);
    }
  }

  async function deleteSchedule(id: string) {
    if (!confirm('Delete this schedule?')) return;
    try {
      await apiRequest(`/schedules/${id}`, { method: 'DELETE' });
      void loadSchedules();
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
      <div className="schedule-header">
        <div className="schedule-name">
          <Calendar size={20} className="schedule-icon" /> Scheduled Flows
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
        <div className="schedule-empty">Loading...</div>
      ) : schedules.length === 0 ? (
        <div className="schedule-empty">
          <Clock size={48} style={{ opacity: 0.5, marginBottom: 16 }} />
          <div>No scheduled flows yet</div>
          <div className="small" style={{ marginTop: 8 }}>
            Create a schedule to run flows automatically
          </div>
        </div>
      ) : (
        <div className="analytics-flow-list">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="schedule-card"
              style={{ opacity: schedule.enabled ? 1 : 0.6 }}
            >
              <div className="schedule-header">
                <div>
                  <div className="schedule-name">{getFlowName(schedule.flow_id)}</div>
                  <div className="schedule-meta">
                    <span>{formatCron(schedule.cron_expression)}</span>
                    {' \u00b7 '}
                    <span>Last: {formatDate(schedule.last_run_at)}</span>
                    {' \u00b7 '}
                    <span>Next: {formatDate(schedule.next_run_at)}</span>
                  </div>
                </div>
                <div className="schedule-actions">
                  <button
                    className={`schedule-toggle ${schedule.enabled ? 'active' : 'paused'}`}
                    onClick={() => toggleSchedule(schedule.id, schedule.enabled)}
                    aria-label={schedule.enabled ? 'Pause schedule' : 'Resume schedule'}
                  >
                    {schedule.enabled ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                  <button
                    className="schedule-toggle schedule-delete"
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
