import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  createFlowFromTemplate,
  createRun,
  getFlows,
  getRun,
  getRuns,
  getTemplates,
  retryRun,
  type Flow,
  type RunRow,
  type TemplateSummary,
} from './api';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { TemplateLibrary } from './TemplateLibrary';
import { AppHeader } from './AppHeader';
import { FlowPanel, RunsTable } from './FlowPanel';
import { useRunArtifacts } from './useRunArtifacts';

export function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [flows, setFlows] = useState<Flow[]>([]);
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<string>('hello-flow');
  const [selectedRun, setSelectedRun] = useState<string>('');
  const [runDetail, setRunDetail] = useState<any>(null);
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [busy, setBusy] = useState(false);
  const [installingTemplateId, setInstallingTemplateId] = useState<string>('');
  const [err, setErr] = useState<string>('');
  const [showProgress, setShowProgress] = useState(false);

  const flow = useMemo(() => flows.find((x) => x.id === selectedFlow), [flows, selectedFlow]);
  const { videoArtifact, screenshotArtifacts, subtitleArtifact } = useRunArtifacts(runDetail);
  const activeProjectId = useMemo(
    () => flow?.project_id || flows.find((f) => f.project_id)?.project_id || '',
    [flow, flows]
  );

  async function refreshAll() {
    const [f, r, t] = await Promise.all([getFlows(), getRuns(), getTemplates()]);
    setFlows(f);
    setRuns(r);
    setTemplates(t);
    if (!selectedFlow && f[0]?.id) setSelectedFlow(f[0].id);
  }

  useEffect(() => { refreshAll().catch((e) => setErr(String(e))); }, []);

  useEffect(() => {
    const requestedRun = searchParams.get('run');
    if (!requestedRun || requestedRun === selectedRun) return;
    onSelectRun(requestedRun).catch((e) => setErr(String(e)));
  }, [searchParams, selectedRun]);

  async function onRun() {
    try {
      setErr(''); setBusy(true); setShowProgress(true);
      const runId = await createRun(selectedFlow, {});
      setSelectedRun(runId);
      setRunDetail(await getRun(runId));
    } catch (e: any) {
      setErr(e?.message ?? String(e)); setBusy(false); setShowProgress(false);
    }
  }

  async function onInstallTemplate(template: TemplateSummary) {
    if (!activeProjectId) { setErr('No project context found.'); return; }
    const params: Record<string, any> = {};
    for (const p of template.params ?? []) {
      if (!p.required) continue;
      const value = window.prompt(`Template param: ${p.name}`);
      if (!value) { setErr(`Cancelled: missing ${p.name}`); return; }
      params[p.name] = value;
    }
    try {
      setErr(''); setInstallingTemplateId(template.id);
      const created = await createFlowFromTemplate({ templateId: template.id, projectId: activeProjectId, params });
      await refreshAll();
      setSelectedFlow(created.flowId);
    } catch (e: any) { setErr(e?.message ?? String(e)); }
    finally { setInstallingTemplateId(''); }
  }

  async function onProgressComplete() {
    setBusy(false); setShowProgress(false);
    await refreshAll();
    if (selectedRun) setRunDetail(await getRun(selectedRun));
  }

  async function onSelectRun(id: string) {
    setSelectedRun(id);
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('run', id);
    setSearchParams(nextParams, { replace: true });
    setRunDetail(await getRun(id));
  }

  async function onRetry() {
    if (!selectedRun) return;
    try {
      setErr(''); setShowProgress(true);
      await retryRun(selectedRun);
      setRunDetail(await getRun(selectedRun)); await refreshAll();
    } catch (e: any) { setErr(e?.message ?? String(e)); setShowProgress(false); }
  }

  return (
    <div className="container">
      <AppHeader err={err} />
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="h2" style={{ marginBottom: 12 }}>Run History Dashboard</div>
        <AnalyticsDashboard selectedRunId={selectedRun} onSelectRun={onSelectRun} />
      </div>
      <TemplateLibrary templates={templates} installingTemplateId={installingTemplateId} onInstall={onInstallTemplate} />
      <div className="row">
        <FlowPanel flows={flows} selectedFlow={selectedFlow} setSelectedFlow={setSelectedFlow} flow={flow} busy={busy} onRun={onRun} />
        <RunsTable runs={runs} selectedRun={selectedRun} onSelectRun={onSelectRun} runDetail={runDetail} showProgress={showProgress}
          videoArtifact={videoArtifact} screenshotArtifacts={screenshotArtifacts} subtitleArtifact={subtitleArtifact}
          onProgressComplete={onProgressComplete} onRetry={onRetry} />
      </div>
      <div style={{ marginTop: 24, padding: 16, backgroundColor: '#1a1a1a', borderRadius: 8, border: '1px solid #3a3a3a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="small" style={{ color: '#a8b3cf', marginBottom: 4 }}>Production Status</div>
            <div style={{ fontSize: 12 }}>Real-time Progress / Screenshot Gallery / Error Handling / Browser Automation</div>
          </div>
          <div className="small" style={{ color: '#22c55e' }}>v1.0.0</div>
        </div>
      </div>
    </div>
  );
}
