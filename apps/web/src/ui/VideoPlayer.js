import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { artifactDownloadUrl, fetchArtifactBlobUrl, fetchArtifactText } from './api';
function srtToVtt(srt) {
    const normalized = srt.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const withVttTimestamps = normalized.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
    return `WEBVTT\n\n${withVttTimestamps}`;
}
export function VideoPlayer({ artifactId, subtitleArtifactId }) {
    const videoRef = useRef(null);
    const [src, setSrc] = useState(null);
    const [error, setError] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [muted, setMuted] = useState(false);
    const [subtitleSrc, setSubtitleSrc] = useState(null);
    useEffect(() => {
        let revokeUrl = null;
        setSrc(null);
        setError(false);
        fetchArtifactBlobUrl(artifactId)
            .then((url) => {
            revokeUrl = url;
            setSrc(url);
        })
            .catch(() => setError(true));
        return () => {
            if (revokeUrl)
                URL.revokeObjectURL(revokeUrl);
        };
    }, [artifactId]);
    useEffect(() => {
        let revokeUrl = null;
        setSubtitleSrc(null);
        if (!subtitleArtifactId)
            return;
        fetchArtifactText(subtitleArtifactId)
            .then((srt) => {
            const vtt = srtToVtt(srt);
            const blob = new Blob([vtt], { type: 'text/vtt' });
            const url = URL.createObjectURL(blob);
            revokeUrl = url;
            setSubtitleSrc(url);
        })
            .catch(() => setSubtitleSrc(null));
        return () => {
            if (revokeUrl)
                URL.revokeObjectURL(revokeUrl);
        };
    }, [subtitleArtifactId]);
    function updatePlaybackRate(rate) {
        setPlaybackRate(rate);
        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
        }
    }
    function toggleMuted() {
        const next = !muted;
        setMuted(next);
        if (videoRef.current) {
            videoRef.current.muted = next;
        }
    }
    if (error) {
        return _jsx("div", { className: "video-error", children: "Failed to load video artifact." });
    }
    if (!src) {
        return _jsx("div", { className: "video-loading", children: "Loading video\u2026" });
    }
    return (_jsxs("div", { className: "video-wrapper", children: [_jsx("video", { ref: videoRef, controls: true, preload: "metadata", src: src, className: "video-element", children: subtitleSrc ? (_jsx("track", { kind: "captions", src: subtitleSrc, srcLang: "en", label: "Subtitles", default: true })) : null }), _jsxs("div", { className: "video-controls", children: [_jsxs("label", { className: "small video-speed-label", children: ["Speed", _jsxs("select", { className: "input video-speed-select", value: playbackRate, onChange: (e) => updatePlaybackRate(Number(e.target.value)), children: [_jsx("option", { value: 0.5, children: "0.5x" }), _jsx("option", { value: 0.75, children: "0.75x" }), _jsx("option", { value: 1, children: "1x" }), _jsx("option", { value: 1.25, children: "1.25x" }), _jsx("option", { value: 1.5, children: "1.5x" }), _jsx("option", { value: 2, children: "2x" })] })] }), _jsx("button", { className: "btn", type: "button", onClick: toggleMuted, children: muted ? 'Unmute' : 'Mute' }), _jsx("a", { className: "btn", href: artifactDownloadUrl(artifactId), target: "_blank", rel: "noreferrer", children: "Download Video" })] })] }));
}
