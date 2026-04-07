import { useEffect, useRef, useState } from 'react';
import { artifactDownloadUrl, fetchArtifactBlobUrl, fetchArtifactText } from './api';

interface VideoPlayerProps {
  artifactId: string;
  subtitleArtifactId?: string;
}

function srtToVtt(srt: string): string {
  const normalized = srt.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const withVttTimestamps = normalized.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
  return `WEBVTT\n\n${withVttTimestamps}`;
}

export function VideoPlayer({ artifactId, subtitleArtifactId }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [muted, setMuted] = useState(false);
  const [subtitleSrc, setSubtitleSrc] = useState<string | null>(null);

  useEffect(() => {
    let revokeUrl: string | null = null;
    setSrc(null);
    setError(false);

    fetchArtifactBlobUrl(artifactId)
      .then((url) => {
        revokeUrl = url;
        setSrc(url);
      })
      .catch(() => setError(true));

    return () => {
      if (revokeUrl) URL.revokeObjectURL(revokeUrl);
    };
  }, [artifactId]);

  useEffect(() => {
    let revokeUrl: string | null = null;
    setSubtitleSrc(null);

    if (!subtitleArtifactId) return;

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
      if (revokeUrl) URL.revokeObjectURL(revokeUrl);
    };
  }, [subtitleArtifactId]);

  function updatePlaybackRate(rate: number) {
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
    return <div className="video-error">Failed to load video artifact.</div>;
  }

  if (!src) {
    return <div className="video-loading">Loading video…</div>;
  }

  return (
    <div className="video-wrapper">
      <video ref={videoRef} controls preload="metadata" src={src} className="video-element">
        {subtitleSrc ? (
          <track kind="captions" src={subtitleSrc} srcLang="en" label="Subtitles" default />
        ) : null}
      </video>
      <div className="video-controls">
        <label className="small video-speed-label">
          Speed
          <select
            className="input video-speed-select"
            value={playbackRate}
            onChange={(e) => updatePlaybackRate(Number(e.target.value))}
          >
            <option value={0.5}>0.5x</option>
            <option value={0.75}>0.75x</option>
            <option value={1}>1x</option>
            <option value={1.25}>1.25x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>
        </label>
        <button className="btn" type="button" onClick={toggleMuted}>
          {muted ? 'Unmute' : 'Mute'}
        </button>
        <a className="btn" href={artifactDownloadUrl(artifactId)} target="_blank" rel="noreferrer">
          Download Video
        </a>
      </div>
    </div>
  );
}
