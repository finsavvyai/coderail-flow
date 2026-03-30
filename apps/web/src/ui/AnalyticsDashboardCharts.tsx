import type { AnalyticsStats, RunRow } from './api';
import './analytics-ext.css';

export function formatTimeRangeLabel(timeRange: '7d' | '30d' | '90d') {
  return timeRange === '7d' ? 'last 7 days' : timeRange === '30d' ? 'last 30 days' : 'last 90 days';
}

export function buildOpsSnapshot(
  stats: AnalyticsStats,
  recentRuns: RunRow[],
  timeRange: '7d' | '30d' | '90d'
) {
  const successRate = stats.total > 0 ? Math.round((stats.succeeded / stats.total) * 100) : 0;
  const failedRecent = recentRuns.filter((run) => run.status === 'failed').length;
  const strongestFlow = [...stats.byFlow].sort((a, b) => {
    if (b.successRate !== a.successRate) return b.successRate - a.successRate;
    return b.count - a.count;
  })[0];
  const benchmark =
    successRate >= 95
      ? 'Elite reliability'
      : successRate >= 85
        ? 'Strong reliability'
        : successRate >= 70
          ? 'Needs tuning'
          : 'At risk';

  const message = [
    `CodeRail Flow ops snapshot (${formatTimeRangeLabel(timeRange)}): ${stats.succeeded}/${stats.total} runs succeeded with ${(stats.avgDuration / 1000).toFixed(1)}s average runtime.`,
    strongestFlow
      ? `Best-performing flow: ${strongestFlow.flowName} at ${strongestFlow.successRate}% success across ${strongestFlow.count} runs.`
      : '',
    failedRecent === 0
      ? 'No failed runs in the latest sample.'
      : `${failedRecent} recent run${failedRecent === 1 ? '' : 's'} need follow-up.`,
  ]
    .filter(Boolean)
    .join(' ');

  return { successRate, benchmark, message };
}

interface OpsSnapshotCardProps {
  snapshot: { successRate: number; benchmark: string; message: string };
  stats: AnalyticsStats;
  timeRange: '7d' | '30d' | '90d';
  copiedSnapshot: boolean;
  onCopySnapshot: () => void;
}

export function OpsSnapshotCard({
  snapshot,
  stats,
  timeRange,
  copiedSnapshot,
  onCopySnapshot,
}: OpsSnapshotCardProps) {
  return (
    <div className="card ops-snapshot-card">
      <div className="ops-snapshot-layout">
        <div className="ops-snapshot-body">
          <div className="small ops-snapshot-label">
            Shareable ops snapshot
          </div>
          <div className="h2 ops-snapshot-heading">
            {snapshot.successRate}% success rate over the {formatTimeRangeLabel(timeRange)}
          </div>
          <div className="small ops-snapshot-message">
            {snapshot.message}
          </div>
          <div className="ops-snapshot-badges">
            <span className="badge badge--translucent">
              {snapshot.benchmark}
            </span>
            <span className="badge badge--translucent">
              Avg runtime {(stats.avgDuration / 1000).toFixed(1)}s
            </span>
          </div>
        </div>
        <button className="btn" onClick={onCopySnapshot}>
          {copiedSnapshot ? 'Copied update' : 'Copy ops update'}
        </button>
      </div>
    </div>
  );
}

interface RecentRunsTableProps {
  recentRuns: RunRow[];
  selectedRunId?: string;
  onSelectRun?: (runId: string) => void | Promise<void>;
}

export function RecentRunsTable({ recentRuns, selectedRunId, onSelectRun }: RecentRunsTableProps) {
  return (
    <div className="card recent-runs-card">
      <div className="h2 analytics-section-title">Recent Runs</div>
      <table className="table">
        <thead>
          <tr>
            <th>Run</th>
            <th>Flow</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {recentRuns.map((run) => (
            <tr
              key={run.id}
              onClick={() => onSelectRun?.(run.id)}
              className={[
                onSelectRun ? 'run-row--clickable' : '',
                selectedRunId === run.id ? 'run-row--selected' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <td className="mono">{run.id.slice(0, 8)}...</td>
              <td>{run.flow_name}</td>
              <td>
                <span className="badge">{run.status}</span>
              </td>
              <td className="small">{new Date(run.created_at).toLocaleString()}</td>
            </tr>
          ))}
          {recentRuns.length === 0 && (
            <tr>
              <td colSpan={4} className="small">
                No runs available yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
