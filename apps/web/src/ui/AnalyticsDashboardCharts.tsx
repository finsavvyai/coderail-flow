import type { AnalyticsStats, RunRow } from './api';

export function formatTimeRangeLabel(timeRange: '7d' | '30d' | '90d') {
  return timeRange === '7d' ? 'last 7 days' : timeRange === '30d' ? 'last 30 days' : 'last 90 days';
}

export function buildOpsSnapshot(
  stats: AnalyticsStats,
  recentRuns: RunRow[],
  timeRange: '7d' | '30d' | '90d',
) {
  const successRate = stats.total > 0 ? Math.round((stats.succeeded / stats.total) * 100) : 0;
  const failedRecent = recentRuns.filter((run) => run.status === 'failed').length;
  const strongestFlow = [...stats.byFlow].sort((a, b) => {
    if (b.successRate !== a.successRate) return b.successRate - a.successRate;
    return b.count - a.count;
  })[0];
  const benchmark =
    successRate >= 95 ? 'Elite reliability' : successRate >= 85 ? 'Strong reliability' : successRate >= 70 ? 'Needs tuning' : 'At risk';

  const message = [
    `CodeRail Flow ops snapshot (${formatTimeRangeLabel(timeRange)}): ${stats.succeeded}/${stats.total} runs succeeded with ${(stats.avgDuration / 1000).toFixed(1)}s average runtime.`,
    strongestFlow ? `Best-performing flow: ${strongestFlow.flowName} at ${strongestFlow.successRate}% success across ${strongestFlow.count} runs.` : '',
    failedRecent === 0 ? 'No failed runs in the latest sample.' : `${failedRecent} recent run${failedRecent === 1 ? '' : 's'} need follow-up.`,
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
    <div
      className="card"
      style={{
        marginBottom: 16,
        border: '1px solid rgba(43, 124, 255, 0.28)',
        background:
          'linear-gradient(135deg, rgba(43, 124, 255, 0.18), rgba(43, 124, 255, 0.06))',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ maxWidth: 760 }}>
          <div className="small" style={{ color: '#8fb8ff', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Shareable ops snapshot
          </div>
          <div className="h2" style={{ marginTop: 6, marginBottom: 8 }}>
            {snapshot.successRate}% success rate over the {formatTimeRangeLabel(timeRange)}
          </div>
          <div className="small" style={{ color: '#d6e4ff', marginBottom: 12 }}>
            {snapshot.message}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}>
              {snapshot.benchmark}
            </span>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.12)', color: '#fff' }}>
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
    <div className="card" style={{ marginTop: 16 }}>
      <div className="h2" style={{ marginBottom: 12 }}>
        Recent Runs
      </div>
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
              style={{
                cursor: onSelectRun ? 'pointer' : 'default',
                background:
                  selectedRunId === run.id ? 'rgba(43, 124, 255, 0.14)' : undefined,
              }}
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
