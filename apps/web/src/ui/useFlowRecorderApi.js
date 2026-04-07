import { useCallback } from 'react';
import { normalizeRecordableUrl, getRecorderModeLabel, } from './recorder-runtime';
import { getProxyUrl, convertToFlowSteps, mergeRecordedActions } from './FlowRecorder.utils';
export function useOpenPopup(recorderConfig, popupRef, setError) {
    return useCallback((url) => {
        const proxyUrl = getProxyUrl(url, recorderConfig.apiBase);
        if (!proxyUrl) {
            setError('Proxy recording is unavailable until VITE_API_URL is configured.');
            return false;
        }
        const width = 1280;
        const height = 900;
        const left = (screen.width - width) / 2;
        const top = (screen.height - height) / 2;
        popupRef.current = window.open(proxyUrl, 'coderail-recorder', `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no`);
        if (!popupRef.current) {
            setError('Popup blocked. Allow popups for this site or use inline recording.');
            return false;
        }
        return true;
    }, [recorderConfig.apiBase, popupRef, setError]);
}
export function useStartRecording(mode, recorderConfig, targetUrl, openPopup, urlHistory, setters) {
    const { setIsRecording, setRecordedActions, setActiveStepIndex, setIframeLoaded, setServerScreenshot, setError, } = setters;
    return useCallback(async () => {
        const normalizedUrl = normalizeRecordableUrl(targetUrl);
        if (!normalizedUrl) {
            setError('Enter a full http:// or https:// URL to record.');
            return;
        }
        if (!recorderConfig.availableModes.includes(mode)) {
            setError(`${getRecorderModeLabel(mode)} recording is not available in this environment.`);
            return;
        }
        if ((mode === 'iframe' || mode === 'window') && !recorderConfig.proxyRecorderReady) {
            setError(recorderConfig.issues[0]?.message || 'Proxy recording is not configured.');
            return;
        }
        if (mode === 'server' && !recorderConfig.localRunnerReady) {
            setError('Local browser recording is only available during local development.');
            return;
        }
        setError(null);
        urlHistory.setShowUrlDropdown(false);
        urlHistory.trackUrl(normalizedUrl);
        setActiveStepIndex(null);
        setIframeLoaded(false);
        setServerScreenshot(null);
        if (mode === 'server') {
            try {
                const res = await fetch(`${recorderConfig.runnerBase}/record/start`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: normalizedUrl }),
                });
                if (!res.ok) {
                    const data = await res.json();
                    setError(data.error || 'Failed to start server recording');
                    return;
                }
                setIsRecording(true);
                setRecordedActions([]);
            }
            catch {
                setError('Local runner not available. Start it with: pnpm dev:runner');
            }
            return;
        }
        if (mode === 'window') {
            const opened = openPopup(normalizedUrl);
            if (!opened)
                return;
        }
        const nextActions = [
            { id: Date.now().toString(), type: 'goto', timestamp: Date.now(), url: normalizedUrl },
        ];
        setIsRecording(true);
        setRecordedActions(nextActions);
        setActiveStepIndex(nextActions.length - 1);
    }, [mode, openPopup, recorderConfig, targetUrl, urlHistory, setters]);
}
export function useStopRecording(mode, recordedActions, recorderConfig, stopServerPoll, refs, setters) {
    const { setIsRecording, setRecordedActions, setActiveStepIndex, setServerScreenshot } = setters;
    return useCallback(async () => {
        let finalActions = recordedActions;
        if (mode === 'server') {
            stopServerPoll();
            try {
                const res = await fetch(`${recorderConfig.runnerBase}/record/stop`, { method: 'POST' });
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data.actions)) {
                        finalActions = mergeRecordedActions(recordedActions, data.actions);
                        setRecordedActions(finalActions);
                        setActiveStepIndex(finalActions.length > 0 ? finalActions.length - 1 : null);
                    }
                }
            }
            catch {
                // Ignore -- browser may already be closed.
            }
            setServerScreenshot(null);
        }
        setIsRecording(false);
        if (refs.popupRef.current && !refs.popupRef.current.closed) {
            refs.popupRef.current.close();
        }
        refs.popupRef.current = null;
        return finalActions;
    }, [mode, recordedActions, recorderConfig.runnerBase, stopServerPoll, refs, setters]);
}
export function useHandleSave(flowName, isRecording, recordedActions, stopRecording, onSaveFlow, setError) {
    return useCallback(async () => {
        if (!flowName.trim()) {
            setError('Please enter a flow name');
            return;
        }
        const finalActions = isRecording ? await stopRecording() : recordedActions;
        if (finalActions.length === 0) {
            setError('No actions recorded');
            return;
        }
        onSaveFlow(convertToFlowSteps(finalActions), flowName.trim());
    }, [flowName, isRecording, onSaveFlow, recordedActions, stopRecording, setError]);
}
