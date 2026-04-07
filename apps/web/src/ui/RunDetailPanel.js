import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { LiveProgress } from './LiveProgress';
import { ScreenshotGallery } from './ScreenshotGallery';
import { ErrorDisplay } from './ErrorDisplay';
import { VideoPlayer } from './VideoPlayer';
import { RunShareCard } from './RunShareCard';
import { artifactDownloadUrl } from './api';
export function RunDetailPanel({ selectedRun, runDetail, showProgress, videoArtifact, screenshotArtifacts, subtitleArtifact, onProgressComplete, onRetry, }) {
    const run = runDetail?.run ?? null;
    return (_jsxs("div", { style: { marginTop: 12 }, children: [_jsx("div", { className: "h2", children: "Selected run" }), showProgress && selectedRun && (_jsx(LiveProgress, { runId: selectedRun, onComplete: onProgressComplete })), run && _jsx(RunShareCard, { run: run, selectedRun: selectedRun, artifacts: runDetail?.artifacts }), runDetail?.run?.status === 'failed' && (_jsx(ErrorDisplay, { run: runDetail.run, errorScreenshot: runDetail.artifacts?.find((a) => a.kind?.startsWith('screenshot')), onRetry: onRetry })), videoArtifact ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "h2", style: { marginTop: 12 }, children: "Recording" }), _jsx(VideoPlayer, { artifactId: videoArtifact.id, subtitleArtifactId: subtitleArtifact?.id })] })) : screenshotArtifacts.length > 0 ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "h2", style: { marginTop: 12 }, children: "Screenshots" }), _jsx(ScreenshotGallery, { screenshots: screenshotArtifacts })] })) : null, _jsx("div", { className: "h2", style: { marginTop: 12 }, children: "Run Details" }), _jsx("pre", { className: "mono", style: { whiteSpace: 'pre-wrap', fontSize: 11 }, children: runDetail ? JSON.stringify(runDetail.run, null, 2) : 'Select a run' }), runDetail?.artifacts?.length ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "h2", style: { marginTop: 12 }, children: "Artifacts" }), runDetail.artifacts.map((a) => (_jsxs("div", { className: "row", style: {
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 8,
                        }, children: [_jsxs("div", { className: "small", children: [_jsx("span", { className: "badge", children: a.kind }), ' ', _jsxs("span", { className: "mono", children: [a.id.slice(0, 8), "..."] })] }), _jsx("a", { className: "btn", href: artifactDownloadUrl(a.id), target: "_blank", rel: "noreferrer", children: "Download" })] }, a.id)))] })) : null] }));
}
