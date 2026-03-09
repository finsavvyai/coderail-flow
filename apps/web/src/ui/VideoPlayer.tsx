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
    return (
      <div
        style={{
          padding: 12,
          background: '#2a1a1a',
          border: '1px solid #f44336',
          borderRadius: 8,
          color: '#fca5a5',
        }}
      >
        Failed to load video artifact.
      </div>
    );
  }

  if (!src) {
    return (
      <div
        style={{
          padding: 20,
          background: '#1a1a1a',
          border: '1px solid #2a2a2a',
          borderRadius: 8,
          color: '#a8b3cf',
        }}
      >
        Loading video…
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <video
        ref={videoRef}
        controls
        preload="metadata"
        src={src}
        style={{ width: '100%', borderRadius: 8, background: '#000', maxHeight: 420 }}
      >
        {subtitleSrc ? (
          <track kind="captions" src={subtitleSrc} srcLang="en" label="Subtitles" default />
        ) : null}
      </video>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <label className="small" style={{ color: '#a8b3cf' }}>
          Speed
          <select
            className="input"
            value={playbackRate}
            onChange={(e) => updatePlaybackRate(Number(e.target.value))}
            style={{ marginLeft: 6, width: 90, padding: '4px 8px' }}
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
