import { useState, useRef, useEffect, useCallback } from 'react';
import type { RecordedAction, RecorderMode, FlowStep } from './FlowRecorder.types';
import { getProxyUrl, convertToFlowSteps } from './FlowRecorder.utils';
import { useUrlHistory } from './useUrlHistory';

export function useFlowRecorder(onSaveFlow: (steps: FlowStep[], name: string) => void) {
  const [targetUrl, setTargetUrl] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedActions, setRecordedActions] = useState<RecordedAction[]>([]);
  const [flowName, setFlowName] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<RecorderMode>('iframe');
  const popupRef = useRef<Window | null>(null);
  const popupCheckRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [showSubtitleOverlay, setShowSubtitleOverlay] = useState(true);
  const urlHistory = useUrlHistory();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'CODERAIL_CONNECTED') {
        setIframeLoaded(true);
      }
      if (event.data?.type === 'CODERAIL_ACTION' && isRecording) {
        setRecordedActions((prev) => {
          const next = [...prev, event.data.action];
          setActiveStepIndex(next.length - 1);
          return next;
        });
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isRecording]);

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

  const openPopup = useCallback((url: string) => {
    const w = 1280,
      h = 900;
    const left = (screen.width - w) / 2,
      top = (screen.height - h) / 2;
    popupRef.current = window.open(
      getProxyUrl(url),
      'coderail-recorder',
      `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no`
    );
  }, []);

  const startRecording = useCallback(() => {
    if (!targetUrl) {
      setError('Please enter a URL to record');
      return;
    }
    setError(null);
    urlHistory.setShowUrlDropdown(false);
    urlHistory.trackUrl(targetUrl);
    setIsRecording(true);
    setIframeLoaded(false);
    setRecordedActions([
      { id: Date.now().toString(), type: 'goto', timestamp: Date.now(), url: targetUrl },
    ]);
    if (mode === 'window') openPopup(targetUrl);
  }, [targetUrl, mode, openPopup, urlHistory]);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }
    popupRef.current = null;
  }, []);

  const removeAction = useCallback((id: string) => {
    setRecordedActions((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const updateSubtitle = useCallback((index: number, subtitle: string) => {
    setRecordedActions((prev) => prev.map((a, i) => (i === index ? { ...a, subtitle } : a)));
  }, []);

  const clearActions = useCallback(() => {
    setRecordedActions([]);
    setActiveStepIndex(null);
  }, []);

  const handleSave = useCallback(() => {
    if (!flowName.trim()) {
      setError('Please enter a flow name');
      return;
    }
    if (recordedActions.length === 0) {
      setError('No actions recorded');
      return;
    }
    stopRecording();
    onSaveFlow(convertToFlowSteps(recordedActions), flowName);
  }, [flowName, recordedActions, stopRecording, onSaveFlow]);

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
    setMode('window');
    openPopup(targetUrl);
  }, [targetUrl, openPopup]);

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
    setMode,
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
