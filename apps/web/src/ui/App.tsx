import React, { useEffect, useMemo, useState } from "react";
import { artifactDownloadUrl, createRun, getFlows, getRun, getRuns, retryRun, type Flow, type RunRow } from "./api";
import { LiveProgress } from "./LiveProgress";
import { ScreenshotGallery } from "./ScreenshotGallery";
import { ErrorDisplay } from "./ErrorDisplay";

export function App() {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<string>("hello-flow");
  const [selectedRun, setSelectedRun] = useState<string>("");
  const [runDetail, setRunDetail] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>("");
  const [showProgress, setShowProgress] = useState(false);

  async function refreshAll() {
    const [f, r] = await Promise.all([getFlows(), getRuns()]);
    setFlows(f);
    setRuns(r);
    if (!selectedFlow && f[0]?.id) setSelectedFlow(f[0].id);
  }

  useEffect(() => { refreshAll().catch(e => setErr(String(e))); }, []);

  const flow = useMemo(() => flows.find(x => x.id === selectedFlow), [flows, selectedFlow]);

  async function onRun() {
    try {
      setErr("");
      setBusy(true);
      setShowProgress(true);
      const runId = await createRun(selectedFlow, {});
      setSelectedRun(runId);
      const detail = await getRun(runId);
      setRunDetail(detail);
      // Don't call refreshAll() yet - let LiveProgress handle completion
    } catch (e: any) {
      setErr(e?.message ?? String(e));
      setBusy(false);
      setShowProgress(false);
    }
  }

  async function onProgressComplete() {
    setBusy(false);
    setShowProgress(false);
    await refreshAll();
    if (selectedRun) {
      const detail = await getRun(selectedRun);
      setRunDetail(detail);
    }
  }

  async function onSelectRun(id: string) {
    setSelectedRun(id);
    const detail = await getRun(id);
    setRunDetail(detail);
  }

  async function onRetry() {
    if (!selectedRun) return;
    try {
      setErr("");
      setShowProgress(true);
      await retryRun(selectedRun);
      // Refresh to see the retry in progress
      const detail = await getRun(selectedRun);
      setRunDetail(detail);
      await refreshAll();
    } catch (e: any) {
      setErr(e?.message ?? String(e));
      setShowProgress(false);
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div className="h1" style={{ marginBottom: 4 }}>⚡ CodeRail Flow</div>
            <div className="small" style={{ color: '#8b8b8b' }}>Automated Browser Workflows • Powered by Cloudflare</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="badge" style={{ backgroundColor: '#4CAF50', color: '#fff', fontSize: 11 }}>
              PRODUCTION READY
            </div>
          </div>
        </div>
        {err ? <div className="small" style={{ marginTop: 10, padding: 12, backgroundColor: '#2a1a1a', border: '1px solid #f44336', borderRadius: 6, color: "#ff9aa2" }}>{err}</div> : null}
      </div>

      <div className="row">
        <div className="card" style={{ flex: 1, minWidth: 360 }}>
          <div className="h2">Flows</div>
          <div className="row" style={{ alignItems: "center" }}>
            <select className="input" value={selectedFlow} onChange={(e) => setSelectedFlow(e.target.value)}>
              {flows.map(f => <option key={f.id} value={f.id}>{f.name} ({f.id})</option>)}
            </select>
            <button className="btn" disabled={busy || !selectedFlow} onClick={onRun}>
              {busy ? "Running…" : "Run flow"}
            </button>
          </div>
          <div className="small" style={{ marginTop: 10 }}>
            {flow?.description ?? ""} <span className="badge">v{flow?.current_version ?? "-"}</span>
          </div>
          <pre className="mono" style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>
            {flow ? JSON.stringify(flow.definition, null, 2) : "No flow selected"}
          </pre>
        </div>

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
              {runs.map(r => (
                <tr key={r.id} style={{ cursor: "pointer", opacity: r.id === selectedRun ? 0.85 : 1 }} onClick={() => onSelectRun(r.id)}>
                  <td className="mono">{r.id.slice(0, 8)}…</td>
                  <td>{r.flow_name}</td>
                  <td><span className="badge">{r.status}</span></td>
                  <td className="small">{new Date(r.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {runs.length === 0 ? (
                <tr><td colSpan={4} className="small">No runs yet. Click “Run flow”.</td></tr>
              ) : null}
            </tbody>
          </table>

          <div style={{ marginTop: 12 }}>
            <div className="h2">Selected run</div>

            {/* Live Progress */}
            {showProgress && selectedRun && (
              <LiveProgress runId={selectedRun} onComplete={onProgressComplete} />
            )}

            {/* Error Display */}
            {runDetail?.run?.status === 'failed' && (
              <ErrorDisplay
                run={runDetail.run}
                errorScreenshot={runDetail.artifacts?.find((a: any) => a.kind?.startsWith('screenshot'))}
                onRetry={onRetry}
              />
            )}

            {/* Screenshot Gallery */}
            {runDetail?.artifacts?.length > 0 && (
              <>
                <div className="h2" style={{ marginTop: 12 }}>Screenshots</div>
                <ScreenshotGallery
                  screenshots={runDetail.artifacts.filter((a: any) => a.kind?.startsWith('screenshot') || a.content_type === 'image/png')}
                />
              </>
            )}

            {/* Run Details */}
            <div className="h2" style={{ marginTop: 12 }}>Run Details</div>
            <pre className="mono" style={{ whiteSpace: "pre-wrap", fontSize: 11 }}>
              {runDetail ? JSON.stringify(runDetail.run, null, 2) : "Select a run"}
            </pre>

            {/* Other Artifacts */}
            {runDetail?.artifacts?.length ? (
              <>
                <div className="h2" style={{ marginTop: 12 }}>Artifacts</div>
                {runDetail.artifacts.map((a: any) => (
                  <div key={a.id} className="row" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div className="small">
                      <span className="badge">{a.kind}</span>{" "}
                      <span className="mono">{a.id.slice(0, 8)}...</span>
                    </div>
                    <a className="btn" href={artifactDownloadUrl(a.id)} target="_blank" rel="noreferrer">Download</a>
                  </div>
                ))}
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, padding: 16, backgroundColor: '#1a1a1a', borderRadius: 8, border: '1px solid #3a3a3a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="small" style={{ color: '#8b8b8b', marginBottom: 4 }}>
              Production Status
            </div>
            <div style={{ fontSize: 12 }}>
              ✅ Real-time Progress • ✅ Screenshot Gallery • ✅ Error Handling • ✅ Browser Automation
            </div>
          </div>
          <div className="small" style={{ color: '#4CAF50' }}>
            v1.0.0
          </div>
        </div>
      </div>
    </div>
  );
}
