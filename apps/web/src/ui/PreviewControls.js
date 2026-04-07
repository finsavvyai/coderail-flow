import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Maximize2, MousePointer, MessageSquare } from 'lucide-react';
import { getProxyUrl } from './FlowRecorder.utils';
export function IframePreview({ targetUrl, iframeRef, showSubtitleOverlay, activeStepIndex, recordedActions, }) {
    const subtitle = activeStepIndex !== null ? recordedActions[activeStepIndex]?.subtitle : undefined;
    const proxyUrl = getProxyUrl(targetUrl);
    if (!proxyUrl) {
        return (_jsx("div", { className: "preview-empty-state", children: "Configure `VITE_API_URL` so the recorder proxy can load this page." }));
    }
    return (_jsxs(_Fragment, { children: [_jsx("iframe", { ref: iframeRef, src: proxyUrl, className: "preview-iframe", sandbox: "allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox" }), showSubtitleOverlay && subtitle && (_jsx(SubtitleOverlay, { subtitle: subtitle, activeStepIndex: activeStepIndex, totalSteps: recordedActions.length }))] }));
}
function SubtitleOverlay({ subtitle, activeStepIndex, totalSteps, }) {
    return (_jsx("div", { className: "preview-subtitle-wrapper", children: _jsxs("div", { className: "preview-subtitle-box", children: [_jsxs("div", { className: "preview-subtitle-content", children: [_jsx(MessageSquare, { size: 14, className: "preview-subtitle-icon" }), _jsx("span", { children: subtitle })] }), totalSteps > 1 && (_jsxs("div", { className: "preview-subtitle-step", children: ["Step ", (activeStepIndex ?? 0) + 1, " of ", totalSteps] }))] }) }));
}
export function WindowModeView({ iframeLoaded }) {
    return (_jsxs("div", { className: "preview-window-mode", children: [_jsx("div", { className: "preview-window-icon", children: _jsx(Maximize2, { size: 32, className: "preview-icon-accent" }) }), _jsx("div", { className: "preview-window-title", children: "Recording in separate window" }), _jsxs("div", { className: "preview-window-desc", children: ["Interact with your site in the popup window.", _jsx("br", {}), "Actions are recorded here in real-time.", _jsx("br", {}), "Click ", _jsx("strong", { className: "preview-stop-label", children: "Stop" }), " when done."] }), iframeLoaded && (_jsxs("div", { className: "preview-connected-status", children: [_jsx("span", { className: "preview-connected-dot" }), "Connected \u2014 receiving events"] }))] }));
}
export function EmptyPreview() {
    return (_jsxs("div", { className: "preview-empty-placeholder", children: [_jsx(MousePointer, { size: 48, strokeWidth: 1 }), _jsx("div", { children: "Enter a URL and click \"Start Recording\"" }), _jsx("div", { className: "preview-empty-hint", children: "Your clicks, inputs, and navigation will be captured" })] }));
}
