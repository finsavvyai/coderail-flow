import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ExternalLink, Monitor } from 'lucide-react';
import { IframePreview, WindowModeView, EmptyPreview } from './PreviewControls';
export function RecorderPreview(props) {
    const { targetUrl, isRecording, mode, iframeRef, iframeLoaded, showSubtitleOverlay, activeStepIndex, recordedActions, onPopOut, serverScreenshot, } = props;
    return (_jsxs("div", { className: "card recorder-preview-card", children: [_jsx(PreviewHeader, { targetUrl: targetUrl, isRecording: isRecording, mode: mode, iframeLoaded: iframeLoaded, onPopOut: onPopOut }), _jsx("div", { className: "recorder-preview-viewport", children: targetUrl && isRecording && mode === 'server' ? (_jsx(ServerModeView, { screenshot: serverScreenshot, iframeLoaded: iframeLoaded })) : targetUrl && isRecording && mode === 'iframe' ? (_jsx(IframePreview, { targetUrl: targetUrl, iframeRef: iframeRef, showSubtitleOverlay: showSubtitleOverlay, activeStepIndex: activeStepIndex, recordedActions: recordedActions })) : targetUrl && isRecording && mode === 'window' ? (_jsx(WindowModeView, { iframeLoaded: iframeLoaded })) : (_jsx(EmptyPreview, {})) })] }));
}
function ServerModeView({ screenshot, iframeLoaded, }) {
    if (screenshot) {
        return _jsx("img", { src: screenshot, alt: "Live browser preview", className: "recorder-preview-img" });
    }
    return (_jsxs("div", { className: "recorder-preview-placeholder", children: [_jsx(Monitor, { size: 24 }), _jsx("div", { children: iframeLoaded ? 'Loading preview…' : 'Launching browser…' }), _jsx("div", { className: "recorder-preview-hint", children: "Interact with the Puppeteer browser window to record actions" })] }));
}
function PreviewHeader({ targetUrl, isRecording, mode, iframeLoaded, onPopOut, }) {
    return (_jsxs("div", { className: "recorder-preview-header", children: [_jsx("span", { className: "recorder-preview-url", children: targetUrl || 'Enter a URL above to start recording' }), _jsxs("span", { className: "recorder-preview-status", children: [isRecording && iframeLoaded && _jsx("span", { className: "recorder-connected", children: "Connected" }), isRecording && mode === 'iframe' && (_jsxs("button", { className: "btn recorder-popout-btn", onClick: onPopOut, title: "Pop out to new window", children: [_jsx(ExternalLink, { size: 10 }), " Pop Out"] }))] })] }));
}
