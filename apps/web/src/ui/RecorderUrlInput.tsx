import {
  Star,
  Clock,
  ExternalLink,
  Minimize2,
  Maximize2,
  Monitor,
  Play,
  Square,
} from 'lucide-react';
import type { RecorderMode } from './FlowRecorder.types';
import { getRecorderModeLabel, getRecorderModeTitle } from './recorder-runtime';
import { UrlDropdown } from './UrlDropdown';

interface RecorderUrlInputProps {
  targetUrl: string;
  setTargetUrl: (url: string) => void;
  isRecording: boolean;
  flowName: string;
  setFlowName: (name: string) => void;
  mode: RecorderMode;
  availableModes: RecorderMode[];
  cycleMode: () => void;
  modeStatusMessage: string;
  favoriteUrls: string[];
  recentUrls: string[];
  showUrlDropdown: boolean;
  setShowUrlDropdown: (show: boolean) => void;
  urlDropdownRef: React.RefObject<HTMLDivElement>;
  startRecording: () => void | Promise<void>;
  stopRecording: () => void | Promise<void>;
  onToggleFavorite: (url: string) => void;
  onRemoveFavorite: (url: string) => void;
  onRemoveRecent: (url: string) => void;
}

export function RecorderUrlInput(props: RecorderUrlInputProps) {
  const {
    targetUrl,
    setTargetUrl,
    isRecording,
    flowName,
    setFlowName,
    mode,
    availableModes,
    cycleMode,
    modeStatusMessage,
    favoriteUrls,
    recentUrls,
    showUrlDropdown,
    setShowUrlDropdown,
    urlDropdownRef,
    startRecording,
    stopRecording,
    onToggleFavorite,
    onRemoveFavorite,
    onRemoveRecent,
  } = props;

  const isFav = favoriteUrls.includes(targetUrl);
  const hasDropdownItems = favoriteUrls.length > 0 || recentUrls.length > 0;

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <div ref={urlDropdownRef} style={{ flex: 1, position: 'relative' }}>
          <input
            className="input"
            placeholder="Enter URL to record (e.g., https://your-app.com)"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            disabled={isRecording}
            style={{ width: '100%', paddingRight: 64 }}
            onKeyDown={(e) => e.key === 'Enter' && !isRecording && startRecording()}
            onFocus={() => !isRecording && setShowUrlDropdown(true)}
          />
          <div
            style={{
              position: 'absolute',
              right: 6,
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              gap: 2,
            }}
          >
            {targetUrl && (
              <button
                onClick={() => onToggleFavorite(targetUrl)}
                title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  color: isFav ? '#eab308' : '#555',
                }}
              >
                <Star size={14} fill={isFav ? '#eab308' : 'none'} />
              </button>
            )}
            <button
              onClick={() => setShowUrlDropdown(!showUrlDropdown)}
              disabled={isRecording}
              title="Recent & favorite URLs"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 4,
                color: '#a3a3a3',
              }}
            >
              <Clock size={14} />
            </button>
          </div>
          {showUrlDropdown && !isRecording && hasDropdownItems && (
            <UrlDropdown
              favoriteUrls={favoriteUrls}
              recentUrls={recentUrls}
              onSelect={(url) => {
                setTargetUrl(url);
                setShowUrlDropdown(false);
              }}
              onRemoveFavorite={onRemoveFavorite}
              onRemoveRecent={onRemoveRecent}
            />
          )}
        </div>
        <button
          className="btn"
          onClick={cycleMode}
          disabled={isRecording || availableModes.length <= 1}
          title={getRecorderModeTitle(mode)}
          style={{ padding: '8px 10px', background: '#2a2a2a' }}
        >
          {mode === 'server' ? (
            <Monitor size={14} />
          ) : mode === 'iframe' ? (
            <Minimize2 size={14} />
          ) : (
            <ExternalLink size={14} />
          )}
        </button>
        {!isRecording ? (
          <button
            className="btn"
            onClick={startRecording}
            style={{ background: '#22c55e', whiteSpace: 'nowrap' }}
          >
            <Play size={14} />{' '}
            {mode === 'server'
              ? 'Record (Browser)'
              : mode === 'window'
                ? 'Record in Window'
                : 'Start Recording'}
          </button>
        ) : (
          <button
            className="btn"
            onClick={stopRecording}
            style={{ background: '#ef4444', whiteSpace: 'nowrap' }}
          >
            <Square size={14} /> Stop
          </button>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          className="input"
          placeholder="Flow name (e.g., 'User Login Flow')"
          value={flowName}
          onChange={(e) => setFlowName(e.target.value)}
          style={{ flex: 1 }}
        />
        <div
          style={{
            fontSize: 11,
            color: '#a3a3a3',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            whiteSpace: 'nowrap',
          }}
        >
          {mode === 'server' ? (
            <Monitor size={11} />
          ) : mode === 'iframe' ? (
            <Minimize2 size={11} />
          ) : (
            <Maximize2 size={11} />
          )}
          {getRecorderModeLabel(mode)}
        </div>
      </div>
      <div style={{ marginTop: 10, fontSize: 11, color: '#8b95b0' }}>{modeStatusMessage}</div>
    </div>
  );
}
