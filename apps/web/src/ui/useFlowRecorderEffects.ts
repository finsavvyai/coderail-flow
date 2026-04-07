import { useEffect, useCallback } from 'react';
import type { RecordedAction, RecorderMode } from './FlowRecorder.types';
import type { RecorderRuntimeConfigStatus } from './recorder-runtime';
import { mergeRecordedActions } from './FlowRecorder.utils';

type RecorderRuntimeConfig = RecorderRuntimeConfigStatus;

export function useMessageListener(
  isRecording: boolean,
  isTrustedRecorderSource: (source: MessageEventSource | null) => boolean,
  setIframeLoaded: (v: boolean) => void,
  setRecordedActions: React.Dispatch<React.SetStateAction<RecordedAction[]>>,
  setActiveStepIndex: (v: number | null) => void
) {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (!isTrustedRecorderSource(event.source)) return;
      if (event.data?.type === 'CODERAIL_CONNECTED') setIframeLoaded(true);
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
  }, [
    isRecording,
    isTrustedRecorderSource,
    setIframeLoaded,
    setRecordedActions,
    setActiveStepIndex,
  ]);
}

export function usePopupCloseDetector(
  mode: RecorderMode,
  isRecording: boolean,
  popupRef: React.MutableRefObject<Window | null>,
  popupCheckRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>,
  setIsRecording: (v: boolean) => void
) {
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
  }, [mode, isRecording, popupRef, popupCheckRef, setIsRecording]);
}

export function useServerPolling(
  mode: RecorderMode,
  isRecording: boolean,
  recorderConfig: RecorderRuntimeConfig,
  serverPollRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>,
  stopServerPoll: () => void,
  setIsRecording: (v: boolean) => void,
  setRecordedActions: React.Dispatch<React.SetStateAction<RecordedAction[]>>,
  setActiveStepIndex: (v: number | null) => void,
  setServerScreenshot: (v: string | null) => void,
  setIframeLoaded: (v: boolean) => void
) {
  useEffect(() => {
    if (mode !== 'server' || !isRecording) {
      stopServerPoll();
      return;
    }
    serverPollRef.current = setInterval(() => {
      void (async () => {
        try {
          const actRes = await fetch(`${recorderConfig.runnerBase}/record/actions`);
          if (actRes.ok) {
            const data = (await actRes.json()) as {
              recording?: boolean;
              actions?: RecordedAction[];
            };
            if (!data.recording) {
              setIsRecording(false);
              stopServerPoll();
              return;
            }
            if (Array.isArray(data.actions) && data.actions.length > 0) {
              setRecordedActions((prev) => {
                const next = mergeRecordedActions(prev, data.actions!);
                setActiveStepIndex(next.length - 1);
                return next;
              });
            }
          }
          const ssRes = await fetch(`${recorderConfig.runnerBase}/record/screenshot`);
          if (ssRes.ok) {
            const ssData = (await ssRes.json()) as { screenshot?: string };
            if (ssData.screenshot) {
              setServerScreenshot(`data:image/png;base64,${ssData.screenshot}`);
              setIframeLoaded(true);
            }
          }
        } catch {
          /* Ignore local runner network errors while polling. */
        }
      })();
    }, 1500);
    return () => stopServerPoll();
  }, [
    isRecording,
    mode,
    recorderConfig.runnerBase,
    stopServerPoll,
    serverPollRef,
    setIsRecording,
    setRecordedActions,
    setActiveStepIndex,
    setServerScreenshot,
    setIframeLoaded,
  ]);
}

export function useStopServerPoll(
  serverPollRef: React.MutableRefObject<ReturnType<typeof setInterval> | null>
) {
  return useCallback(() => {
    if (serverPollRef.current) {
      clearInterval(serverPollRef.current);
      serverPollRef.current = null;
    }
  }, [serverPollRef]);
}
