import type { Flow, RunRow } from './api';
import { RunDetailPanel } from './RunDetailPanel';

interface FlowPanelProps {
  flows: Flow[];
  selectedFlow: string;
  setSelectedFlow: (id: string) => void;
  flow: Flow | undefined;
  busy: boolean;
  onRun: () => void;
}

export function FlowPanel({
  flows,
  selectedFlow,
  setSelectedFlow,
  flow,
  busy,
  onRun,
}: FlowPanelProps) {
  return (
    <div className="card" style={{ flex: 1, minWidth: 360 }}>
      <div className="h2">Flows</div>
      <div className="row" style={{ alignItems: 'center' }}>
        <select
          className="input"
          value={selectedFlow}
          onChange={(e) => setSelectedFlow(e.target.value)}
        >
          {flows.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name} ({f.id})
            </option>
          ))}
        </select>
        <button className="btn" disabled={busy || !selectedFlow} onClick={onRun}>
          {busy ? 'Running...' : 'Run flow'}
        </button>
      </div>
      <div className="small" style={{ marginTop: 10 }}>
        {flow?.description ?? ''} <span className="badge">v{flow?.current_version ?? '-'}</span>
      </div>
      <pre className="mono" style={{ marginTop: 12, whiteSpace: 'pre-wrap' }}>
        {flow ? JSON.stringify(flow.definition, null, 2) : 'No flow selected'}
      </pre>
    </div>
  );
}

interface RunsTableProps {
  runs: RunRow[];
  selectedRun: string;
  onSelectRun: (id: string) => void;
  runDetail: any;
  showProgress: boolean;
  videoArtifact: any;
  screenshotArtifacts: any[];
  subtitleArtifact: any;
  onProgressComplete: () => void;
  onRetry: () => void;
}

export function RunsTable({
  runs,
  selectedRun,
  onSelectRun,
  runDetail,
  showProgress,
  videoArtifact,
  screenshotArtifacts,
  subtitleArtifact,
  onProgressComplete,
  onRetry,
}: RunsTableProps) {
  return (
    <div className="card" style={{ flex: 1, minWidth: 360 }}>
      <div className="h2">Runs</div>
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
          {runs.map((r) => (
            <tr
              key={r.id}
              style={{ cursor: 'pointer', opacity: r.id === selectedRun ? 0.85 : 1 }}
              onClick={() => onSelectRun(r.id)}
            >
              <td className="mono">{r.id.slice(0, 8)}...</td>
              <td>{r.flow_name}</td>
              <td>
                <span className="badge">{r.status}</span>
              </td>
              <td className="small">{new Date(r.created_at).toLocaleString()}</td>
            </tr>
          ))}
          {runs.length === 0 && (
            <tr>
              <td colSpan={4} className="small">
                No runs yet. Click "Run flow".
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <RunDetailPanel
        selectedRun={selectedRun}
        runDetail={runDetail}
        showProgress={showProgress}
        videoArtifact={videoArtifact}
        screenshotArtifacts={screenshotArtifacts}
        subtitleArtifact={subtitleArtifact}
        onProgressComplete={onProgressComplete}
        onRetry={onRetry}
      />
    </div>
  );
}
