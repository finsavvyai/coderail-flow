import { useState, useRef, useEffect, useCallback } from 'react';
import { getNextRecorderMode, getRecorderRuntimeConfig, normalizeRecordableUrl, } from './recorder-runtime';
import { mergeRecordedActions } from './FlowRecorder.utils';
import { useUrlHistory } from './useUrlHistory';
import { useOpenPopup, useStartRecording, useStopRecording, useHandleSave, } from './useFlowRecorderApi';
export function useFlowRecorder(onSaveFlow) {
    const recorderConfig = getRecorderRuntimeConfig(import.meta.env);
    const [targetUrl, setTargetUrl] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [recordedActions, setRecordedActions] = useState([]);
    const [flowName, setFlowName] = useState('');
    const iframeRef = useRef(null);
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [error, setError] = useState(null);
    const [mode, setMode] = useState(recorderConfig.defaultMode);
    const popupRef = useRef(null);
    const popupCheckRef = useRef(null);
    const serverPollRef = useRef(null);
    const [activeStepIndex, setActiveStepIndex] = useState(null);
    const [showSubtitleOverlay, setShowSubtitleOverlay] = useState(true);
    const [serverScreenshot, setServerScreenshot] = useState(null);
    const urlHistory = useUrlHistory();
    const recorderStatusMessage = mode === 'server'
        ? `Local browser recording uses the dev runner at ${recorderConfig.runnerBase}.`
        : 'Inline and popup recording run through the API proxy and are safe for deployed environments.';
    const stopServerPoll = useCallback(() => {
        if (serverPollRef.current) {
            clearInterval(serverPollRef.current);
            serverPollRef.current = null;
        }
    }, []);
    const isTrustedRecorderSource = useCallback((source) => {
        if (!source)
            return false;
        const iframeWindow = iframeRef.current?.contentWindow ?? null;
        return source === iframeWindow || source === popupRef.current;
    }, []);
    useEffect(() => {
        const handleMessage = (event) => {
            if (!isTrustedRecorderSource(event.source))
                return;
            if (event.data?.type === 'CODERAIL_CONNECTED')
                setIframeLoaded(true);
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
                    if (popupCheckRef.current)
                        clearInterval(popupCheckRef.current);
                }
            }, 1000);
        }
        return () => {
            if (popupCheckRef.current)
                clearInterval(popupCheckRef.current);
        };
    }, [mode, isRecording]);
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
                }
                catch {
                    /* Ignore local runner network errors while polling. */
                }
            })();
        }, 1500);
        return () => stopServerPoll();
    }, [isRecording, mode, recorderConfig.runnerBase, stopServerPoll]);
    const openPopup = useOpenPopup(recorderConfig, popupRef, setError);
    const setRecorderMode = useCallback((nextMode) => {
        if (!recorderConfig.availableModes.includes(nextMode))
            return;
        setError(null);
        setMode(nextMode);
    }, [recorderConfig.availableModes]);
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
    const startRecording = useStartRecording(mode, recorderConfig, targetUrl, openPopup, urlHistory, setters);
    const refs = { popupRef, serverPollRef };
    const stopRecording = useStopRecording(mode, recordedActions, recorderConfig, stopServerPoll, refs, setters);
    const handleSave = useHandleSave(flowName, isRecording, recordedActions, stopRecording, onSaveFlow, setError);
    const removeAction = useCallback((id) => {
        setRecordedActions((prev) => prev.filter((action) => action.id !== id));
    }, []);
    const updateSubtitle = useCallback((index, subtitle) => {
        setRecordedActions((prev) => prev.map((action, actionIndex) => (actionIndex === index ? { ...action, subtitle } : action)));
    }, []);
    const clearActions = useCallback(() => {
        setRecordedActions([]);
        setActiveStepIndex(null);
    }, []);
    const addManualAction = useCallback((type) => {
        const base = {
            id: Date.now().toString(),
            type,
            timestamp: Date.now(),
            selector: '[selector]',
        };
        if (type === 'click')
            base.text = 'Element';
        if (type === 'fill')
            base.value = 'text';
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
