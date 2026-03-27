import { useState, useRef, useEffect, useCallback } from 'react';
import type { RecordedAction, RecorderMode, FlowStep } from './FlowRecorder.types';
import {
  getNextRecorderMode,
  getRecorderModeLabel,
  getRecorderRuntimeConfig,
  normalizeRecordableUrl,
} from './recorder-runtime';
import { getProxyUrl, convertToFlowSteps, mergeRecordedActions } from './FlowRecorder.utils';
import { useUrlHistory } from './useUrlHistory';

export function useFlowRecorder(onSaveFlow: (steps: FlowStep[], name: string) => void) {
  const recorderConfig = getRecorderRuntimeConfig(import.meta.env);
  const [targetUrl, setTargetUrl] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedActions, setRecordedActions] = useState<RecordedAction[]>([]);
  const [flowName, setFlowName] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<RecorderMode>(recorderConfig.defaultMode);
  const popupRef = useRef<Window | null>(null);
  const popupCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const serverPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [showSubtitleOverlay, setShowSubtitleOverlay] = useState(true);
  const [serverScreenshot, setServerScreenshot] = useState<string | null>(null);
  const urlHistory = useUrlHistory();

  const recorderStatusMessage =
    mode === 'server'
      ? `Local browser recording uses the dev runner at ${recorderConfig.runnerBase}.`
      : 'Inline and popup recording run through the API proxy and are safe for deployed environments.';

  const stopServerPoll = useCallback(() => {
    if (serverPollRef.current) {
      clearInterval(serverPollRef.current);
      serverPollRef.current = null;
    }
  }, []);

  const isTrustedRecorderSource = useCallback((source: MessageEventSource | null) => {
    if (!source) return false;

    const iframeWindow = iframeRef.current?.contentWindow ?? null;
    return source === iframeWindow || source === popupRef.current;
  }, []);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!isTrustedRecorderSource(event.source)) return;

      if (event.data?.type === 'CODERAIL_CONNECTED') {
        setIframeLoaded(true);
      }

      if (event.data?.type === 'CODERAIL_ACTION' && isRecording) {
        setRecordedActions((prev) => {
          const next = mergeRecordedActions(prev, [event.data.action]);
          setActiveStepIndex(next.length - 1);
          return next;
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isRecording, isTrustedRecorderSource]);

  useEffect(() => {
    if (mode === 'window' && isRecording && popupRef.current) {
      popupCheckRef.current = setInterval(() => {
        if (popupRef.current?.closed) {
          setIsRecording(false);
          popupRef.current = null;
          if (popupCheckRef.current) clearInterval(popupCheckRef.current);
        }
      }, 1000);
    }

    return () => {
      if (popupCheckRef.current) clearInterval(popupCheckRef.current);
    };
  }, [mode, isRecording]);

  useEffect(() => {
    if (mode !== 'server' || !isRecording) {
      stopServerPoll();
      return;
    }

    serverPollRef.current = setInterval(async () => {
      try {
        const actRes = await fetch(`${recorderConfig.runnerBase}/record/actions`);
        if (actRes.ok) {
          const data = await actRes.json();
          if (!data.recording) {
            setIsRecording(false);
            stopServerPoll();
            return;
          }

          if (Array.isArray(data.actions) && data.actions.length > 0) {
            setRecordedActions((prev) => {
              const next = mergeRecordedActions(prev, data.actions);
              setActiveStepIndex(next.length - 1);
              return next;
            });
          }
        }

        const ssRes = await fetch(`${recorderConfig.runnerBase}/record/screenshot`);
        if (ssRes.ok) {
          const ssData = await ssRes.json();
          if (ssData.screenshot) {
            setServerScreenshot(`data:image/png;base64,${ssData.screenshot}`);
            setIframeLoaded(true);
          }
        }
      } catch {
        // Ignore local runner network errors while polling.
      }
    }, 1500);

    return () => stopServerPoll();
  }, [isRecording, mode, recorderConfig.runnerBase, stopServerPoll]);

  const openPopup = useCallback(
    (url: string) => {
      const proxyUrl = getProxyUrl(url, recorderConfig.apiBase);
      if (!proxyUrl) {
        setError('Proxy recording is unavailable until VITE_API_URL is configured.');
        return false;
      }

      const width = 1280;
      const height = 900;
      const left = (screen.width - width) / 2;
      const top = (screen.height - height) / 2;

      popupRef.current = window.open(
        proxyUrl,
        'coderail-recorder',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no`
      );

      if (!popupRef.current) {
        setError('Popup blocked. Allow popups for this site or use inline recording.');
        return false;
      }

      return true;
    },
    [recorderConfig.apiBase]
  );

  const setRecorderMode = useCallback(
    (nextMode: RecorderMode) => {
      if (!recorderConfig.availableModes.includes(nextMode)) return;
      setError(null);
      setMode(nextMode);
    },
    [recorderConfig.availableModes]
  );

  const cycleRecorderMode = useCallback(() => {
    setRecorderMode(getNextRecorderMode(mode, recorderConfig.availableModes));
  }, [mode, recorderConfig.availableModes, setRecorderMode]);

  const startRecording = useCallback(async () => {
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
      } catch {
        setError('Local runner not available. Start it with: pnpm dev:runner');
      }

      return;
    }

    if (mode === 'window') {
      const opened = openPopup(normalizedUrl);
      if (!opened) return;
    }

    const nextActions = [
      { id: Date.now().toString(), type: 'goto', timestamp: Date.now(), url: normalizedUrl },
    ] satisfies RecordedAction[];

    setIsRecording(true);
    setRecordedActions(nextActions);
    setActiveStepIndex(nextActions.length - 1);
  }, [mode, openPopup, recorderConfig, targetUrl, urlHistory]);

  const stopRecording = useCallback(async (): Promise<RecordedAction[]> => {
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
      } catch {
        // Ignore — browser may already be closed.
      }

      setServerScreenshot(null);
    }

    setIsRecording(false);

    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }
    popupRef.current = null;

    return finalActions;
  }, [mode, recordedActions, recorderConfig.runnerBase, stopServerPoll]);

  const removeAction = useCallback((id: string) => {
    setRecordedActions((prev) => prev.filter((action) => action.id !== id));
  }, []);

  const updateSubtitle = useCallback((index: number, subtitle: string) => {
    setRecordedActions((prev) =>
      prev.map((action, actionIndex) => (actionIndex === index ? { ...action, subtitle } : action))
    );
  }, []);

  const clearActions = useCallback(() => {
    setRecordedActions([]);
    setActiveStepIndex(null);
  }, []);

  const handleSave = useCallback(async () => {
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
  }, [flowName, isRecording, onSaveFlow, recordedActions, stopRecording]);

  const addManualAction = useCallback((type: 'click' | 'fill') => {
    const base: RecordedAction = {
      id: Date.now().toString(),
      type,
      timestamp: Date.now(),
      selector: '[selector]',
    };

    if (type === 'click') base.text = 'Element';
    if (type === 'fill') base.value = 'text';

    setRecordedActions((prev) => [...prev, base]);
  }, []);

  const popOutToWindow = useCallback(() => {
    const normalizedUrl = normalizeRecordableUrl(targetUrl);
    if (!normalizedUrl) {
      setError('Enter a full http:// or https:// URL before opening a popup recorder.');
      return;
    }

    setRecorderMode('window');
    openPopup(normalizedUrl);
  }, [openPopup, setRecorderMode, targetUrl]);

  return {
    targetUrl,
    setTargetUrl,
    isRecording,
    recordedActions,
    flowName,
    setFlowName,
    iframeRef,
    iframeLoaded,
    error,
    mode,
    setMode: setRecorderMode,
    availableModes: recorderConfig.availableModes,
    cycleRecorderMode,
    recorderStatusMessage,
    serverScreenshot,
    recentUrls: urlHistory.recentUrls,
    favoriteUrls: urlHistory.favoriteUrls,
    showUrlDropdown: urlHistory.showUrlDropdown,
    setShowUrlDropdown: urlHistory.setShowUrlDropdown,
    urlDropdownRef: urlHistory.urlDropdownRef,
    activeStepIndex,
    setActiveStepIndex,
    showSubtitleOverlay,
    setShowSubtitleOverlay,
    startRecording,
    stopRecording,
    removeAction,
    updateSubtitle,
    clearActions,
    handleSave,
    handleToggleFavorite: urlHistory.handleToggleFavorite,
    handleRemoveFavorite: urlHistory.handleRemoveFavorite,
    handleRemoveRecent: urlHistory.handleRemoveRecent,
    addManualAction,
    popOutToWindow,
  };
}
