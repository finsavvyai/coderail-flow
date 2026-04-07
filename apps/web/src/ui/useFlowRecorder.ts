import { useState, useRef, useCallback } from 'react';
import type { RecordedAction, RecorderMode, FlowStep } from './FlowRecorder.types';
import {
  getNextRecorderMode,
  getRecorderRuntimeConfig,
  normalizeRecordableUrl,
} from './recorder-runtime';
import { useUrlHistory } from './useUrlHistory';
import {
  useOpenPopup,
  useStartRecording,
  useStopRecording,
  useHandleSave,
} from './useFlowRecorderApi';
import {
  useMessageListener,
  usePopupCloseDetector,
  useServerPolling,
  useStopServerPoll,
} from './useFlowRecorderEffects';

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

  const stopServerPoll = useStopServerPoll(serverPollRef);

  const isTrustedRecorderSource = useCallback((source: MessageEventSource | null) => {
    if (!source) return false;
    const iframeWindow = iframeRef.current?.contentWindow ?? null;
    return source === iframeWindow || source === popupRef.current;
  }, []);

  useMessageListener(
    isRecording,
    isTrustedRecorderSource,
    setIframeLoaded,
    setRecordedActions,
    setActiveStepIndex
  );
  usePopupCloseDetector(mode, isRecording, popupRef, popupCheckRef, setIsRecording);
  useServerPolling(
    mode,
    isRecording,
    recorderConfig,
    serverPollRef,
    stopServerPoll,
    setIsRecording,
    setRecordedActions,
    setActiveStepIndex,
    setServerScreenshot,
    setIframeLoaded
  );

  const openPopup = useOpenPopup(recorderConfig, popupRef, setError);

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

  const setters = {
    setIsRecording,
    setRecordedActions,
    setActiveStepIndex,
    setIframeLoaded,
    setServerScreenshot,
    setError,
  };
  const startRecording = useStartRecording(
    mode,
    recorderConfig,
    targetUrl,
    openPopup,
    urlHistory,
    setters
  );
  const refs = { popupRef, serverPollRef };
  const stopRecording = useStopRecording(
    mode,
    recordedActions,
    recorderConfig,
    stopServerPoll,
    refs,
    setters
  );
  const handleSave = useHandleSave(
    flowName,
    isRecording,
    recordedActions,
    stopRecording,
    onSaveFlow,
    setError
  );

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
