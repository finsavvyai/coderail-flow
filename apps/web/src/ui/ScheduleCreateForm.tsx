import React from 'react';

interface Flow {
  id: string;
  name: string;
}

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

interface ScheduleCreateFormProps {
  flows: Flow[];
  newSchedule: { flowId: string; cronExpression: string; params: string };
  onChange: (val: { flowId: string; cronExpression: string; params: string }) => void;
  onCreate: () => void;
  onCancel: () => void;
}

export function ScheduleCreateForm({
  flows,
  newSchedule,
  onChange,
  onCreate,
  onCancel,
}: ScheduleCreateFormProps) {
  return (
    <div
      style={{
        padding: 16,
        background: '#1a1a1a',
        borderRadius: 8,
        marginBottom: 16,
        border: '1px solid #2a2a2a',
      }}
    >
      <div style={{ marginBottom: 12 }}>
        <label htmlFor="schedule-flow" style={{ display: 'block', fontSize: 12, color: '#a3a3a3', marginBottom: 4 }}>
          Flow
        </label>
        <select
          id="schedule-flow"
          className="input"
          value={newSchedule.flowId}
          onChange={(e) => onChange({ ...newSchedule, flowId: e.target.value })}
        >
          <option value="">Select a flow...</option>
          {flows.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label htmlFor="schedule-cron" style={{ display: 'block', fontSize: 12, color: '#a3a3a3', marginBottom: 4 }}>
          Schedule
        </label>
        <select
          id="schedule-cron"
          className="input"
          value={newSchedule.cronExpression}
          onChange={(e) => onChange({ ...newSchedule, cronExpression: e.target.value })}
        >
          {CRON_PRESETS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label htmlFor="schedule-params" style={{ display: 'block', fontSize: 12, color: '#a3a3a3', marginBottom: 4 }}>
          Parameters (JSON)
        </label>
        <input
          id="schedule-params"
          className="input"
          value={newSchedule.params}
          onChange={(e) => onChange({ ...newSchedule, params: e.target.value })}
          placeholder='{"key": "value"}'
        />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn" onClick={onCreate}>
          Create Schedule
        </button>
        <button className="btn" style={{ background: '#2a2a2a' }} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
