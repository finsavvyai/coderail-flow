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
    <div className="cron-container">
      <div className="cron-field">
        <label htmlFor="cron-flow-select" className="cron-label">
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

      <div className="cron-field">
        <label htmlFor="cron-schedule-preset" className="cron-label">
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

      <div className="cron-field">
        <label htmlFor="cron-expression-input" className="cron-label">
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
          <div id="cron-error" role="alert" className="cron-error">
            Invalid cron expression. Must be 5 space-separated fields (minute hour day month
            weekday).
          </div>
        )}
        <div id="cron-hint" className="cron-hint">
          Format: minute hour day month weekday (e.g., 0 9 * * * for daily at 9 AM)
        </div>
      </div>

      <div className="cron-actions">
        <button
          className="btn"
          onClick={onSubmit}
          disabled={loading || !isValidCron(cronExpression)}
        >
          {loading ? 'Creating...' : 'Create Schedule'}
        </button>
        <button className="btn cron-cancel-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
