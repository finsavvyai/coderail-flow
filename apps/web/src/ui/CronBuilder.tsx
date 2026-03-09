interface CronPreset {
  label: string;
  expression: string;
}

const cronPresets: CronPreset[] = [
  { label: 'Every hour', expression: '0 * * * *' },
  { label: 'Every 6 hours', expression: '0 */6 * * *' },
  { label: 'Daily at midnight', expression: '0 0 * * *' },
  { label: 'Daily at 9 AM', expression: '0 9 * * *' },
  { label: 'Weekly (Monday 9 AM)', expression: '0 9 * * 1' },
  { label: 'Monthly (1st at 9 AM)', expression: '0 9 1 * *' },
];

const CRON_REGEX = /^(\S+\s+){4}\S+$/;

function isValidCron(expression: string): boolean {
  return CRON_REGEX.test(expression.trim());
}

interface CronBuilderProps {
  flows: Array<{ id: string; name: string }>;
  selectedFlow: string;
  onSelectedFlowChange: (value: string) => void;
  cronExpression: string;
  onCronExpressionChange: (value: string) => void;
  loading: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

export function CronBuilder({
  flows,
  selectedFlow,
  onSelectedFlowChange,
  cronExpression,
  onCronExpressionChange,
  loading,
  onSubmit,
  onCancel,
}: CronBuilderProps) {
  return (
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
        <label
          htmlFor="cron-flow-select"
          style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}
        >
          Flow
        </label>
        <select
          id="cron-flow-select"
          className="input"
          value={selectedFlow}
          onChange={(e) => onSelectedFlowChange(e.target.value)}
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
        <label
          htmlFor="cron-schedule-preset"
          style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}
        >
          Schedule
        </label>
        <select
          id="cron-schedule-preset"
          className="input"
          value={cronExpression}
          onChange={(e) => onCronExpressionChange(e.target.value)}
        >
          {cronPresets.map((preset) => (
            <option key={preset.expression} value={preset.expression}>
              {preset.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label
          htmlFor="cron-expression-input"
          style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500 }}
        >
          Cron Expression
        </label>
        <input
          id="cron-expression-input"
          className="input"
          type="text"
          value={cronExpression}
          onChange={(e) => onCronExpressionChange(e.target.value)}
          placeholder="0 0 * * *"
          aria-invalid={cronExpression.trim() !== '' && !isValidCron(cronExpression)}
          aria-describedby="cron-error cron-hint"
        />
        {cronExpression.trim() !== '' && !isValidCron(cronExpression) && (
          <div
            id="cron-error"
            role="alert"
            style={{ fontSize: 12, color: '#f44336', marginTop: 4 }}
          >
            Invalid cron expression. Must be 5 space-separated fields (minute hour day month
            weekday).
          </div>
        )}
        <div id="cron-hint" style={{ fontSize: 11, color: '#a3a3a3', marginTop: 4 }}>
          Format: minute hour day month weekday (e.g., 0 9 * * * for daily at 9 AM)
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          className="btn"
          onClick={onSubmit}
          disabled={loading || !isValidCron(cronExpression)}
          style={{ flex: 1 }}
        >
          {loading ? 'Creating...' : 'Create Schedule'}
        </button>
        <button className="btn" onClick={onCancel} style={{ flex: 1, background: '#2a2a2a' }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
