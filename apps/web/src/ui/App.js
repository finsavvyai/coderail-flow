import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { createFlowFromTemplate, createRun, getFlows, getRun, getRuns, getTemplates, retryRun, } from './api';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { TemplateLibrary } from './TemplateLibrary';
import { AppHeader } from './AppHeader';
import { FlowPanel, RunsTable } from './FlowPanel';
import { useRunArtifacts } from './useRunArtifacts';
export function App() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [flows, setFlows] = useState([]);
    const [runs, setRuns] = useState([]);
    const [selectedFlow, setSelectedFlow] = useState('hello-flow');
    const [selectedRun, setSelectedRun] = useState('');
    const [runDetail, setRunDetail] = useState(null);
    const [templates, setTemplates] = useState([]);
    const [busy, setBusy] = useState(false);
    const [installingTemplateId, setInstallingTemplateId] = useState('');
    const [err, setErr] = useState('');
    const [showProgress, setShowProgress] = useState(false);
    const flow = useMemo(() => flows.find((x) => x.id === selectedFlow), [flows, selectedFlow]);
    const { videoArtifact, screenshotArtifacts, subtitleArtifact } = useRunArtifacts(runDetail);
    const activeProjectId = useMemo(() => flow?.project_id || flows.find((f) => f.project_id)?.project_id || '', [flow, flows]);
    async function refreshAll() {
        const [f, r, t] = await Promise.all([getFlows(), getRuns(), getTemplates()]);
        setFlows(f);
        setRuns(r);
        setTemplates(t);
        if (!selectedFlow && f[0]?.id)
            setSelectedFlow(f[0].id);
    }
    useEffect(() => {
        refreshAll().catch((e) => setErr(String(e)));
    }, []);
    useEffect(() => {
        const requestedRun = searchParams.get('run');
        if (!requestedRun || requestedRun === selectedRun)
            return;
        onSelectRun(requestedRun).catch((e) => setErr(String(e)));
    }, [searchParams, selectedRun]);
    async function onRun() {
        try {
            setErr('');
            setBusy(true);
            setShowProgress(true);
            const runId = await createRun(selectedFlow, {});
            setSelectedRun(runId);
            setRunDetail(await getRun(runId));
        }
        catch (e) {
            setErr(e?.message ?? String(e));
            setBusy(false);
            setShowProgress(false);
        }
    }
    async function onInstallTemplate(template) {
        if (!activeProjectId) {
            setErr('No project context found.');
            return;
        }
        const params = {};
        for (const p of template.params ?? []) {
            if (!p.required)
                continue;
            const value = window.prompt(`Template param: ${p.name}`);
            if (!value) {
                setErr(`Cancelled: missing ${p.name}`);
                return;
            }
            params[p.name] = value;
        }
        try {
            setErr('');
            setInstallingTemplateId(template.id);
            const created = await createFlowFromTemplate({
                templateId: template.id,
                projectId: activeProjectId,
                params,
            });
            await refreshAll();
            setSelectedFlow(created.flowId);
        }
        catch (e) {
            setErr(e?.message ?? String(e));
        }
        finally {
            setInstallingTemplateId('');
        }
    }
    async function onProgressComplete() {
        setBusy(false);
        setShowProgress(false);
        await refreshAll();
        if (selectedRun)
            setRunDetail(await getRun(selectedRun));
    }
    async function onSelectRun(id) {
        setSelectedRun(id);
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('run', id);
        setSearchParams(nextParams, { replace: true });
        setRunDetail(await getRun(id));
    }
    async function onRetry() {
        if (!selectedRun)
            return;
        try {
            setErr('');
            setShowProgress(true);
            await retryRun(selectedRun);
            setRunDetail(await getRun(selectedRun));
            await refreshAll();
        }
        catch (e) {
            setErr(e?.message ?? String(e));
            setShowProgress(false);
        }
    }
    return (_jsxs("div", { className: "container", children: [_jsx(AppHeader, { err: err }), _jsxs("div", { className: "card", style: { marginBottom: 14 }, children: [_jsx("div", { className: "h2", style: { marginBottom: 12 }, children: "Run History Dashboard" }), _jsx(AnalyticsDashboard, { selectedRunId: selectedRun, onSelectRun: onSelectRun })] }), _jsx(TemplateLibrary, { templates: templates, installingTemplateId: installingTemplateId, onInstall: onInstallTemplate }), _jsxs("div", { className: "row", children: [_jsx(FlowPanel, { flows: flows, selectedFlow: selectedFlow, setSelectedFlow: setSelectedFlow, flow: flow, busy: busy, onRun: onRun }), _jsx(RunsTable, { runs: runs, selectedRun: selectedRun, onSelectRun: onSelectRun, runDetail: runDetail, showProgress: showProgress, videoArtifact: videoArtifact, screenshotArtifacts: screenshotArtifacts, subtitleArtifact: subtitleArtifact, onProgressComplete: onProgressComplete, onRetry: onRetry })] }), _jsx("div", { className: "app-status-bar", children: _jsxs("div", { className: "app-status-row", children: [_jsxs("div", { children: [_jsx("div", { className: "app-status-label", children: "Production Status" }), _jsx("div", { className: "app-status-desc", children: "Real-time Progress / Screenshot Gallery / Error Handling / Browser Automation" })] }), _jsx("div", { className: "app-status-version", children: "v1.0.0" })] }) })] }));
}
