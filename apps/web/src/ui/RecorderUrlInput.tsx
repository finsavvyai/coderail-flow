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
    <div className="card recorder-url-card">
      <div className="recorder-url-row">
        <div ref={urlDropdownRef} className="recorder-url-input-wrapper">
          <input
            className="input recorder-url-input"
            placeholder="Enter URL to record (e.g., https://your-app.com)"
            value={targetUrl}
            onChange={(e) => setTargetUrl(e.target.value)}
            disabled={isRecording}
            onKeyDown={(e) => e.key === 'Enter' && !isRecording && startRecording()}
            onFocus={() => !isRecording && setShowUrlDropdown(true)}
          />
          <div className="recorder-url-actions">
            {targetUrl && (
              <button
                onClick={() => onToggleFavorite(targetUrl)}
                title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                className={`recorder-icon-btn ${isFav ? 'recorder-icon-fav-active' : 'recorder-icon-fav'}`}
              >
                <Star size={14} fill={isFav ? 'currentColor' : 'none'} />
              </button>
            )}
            <button
              onClick={() => setShowUrlDropdown(!showUrlDropdown)}
              disabled={isRecording}
              title="Recent & favorite URLs"
              className="recorder-icon-btn recorder-icon-muted"
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
          className="btn recorder-mode-btn"
          onClick={cycleMode}
          disabled={isRecording || availableModes.length <= 1}
          title={getRecorderModeTitle(mode)}
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
          <button className="btn recorder-start-btn" onClick={startRecording}>
            <Play size={14} />{' '}
            {mode === 'server'
              ? 'Record (Browser)'
              : mode === 'window'
                ? 'Record in Window'
                : 'Start Recording'}
          </button>
        ) : (
          <button className="btn recorder-stop-btn" onClick={stopRecording}>
            <Square size={14} /> Stop
          </button>
        )}
      </div>
      <div className="recorder-name-row">
        <input
          className="input recorder-name-input"
          placeholder="Flow name (e.g., 'User Login Flow')"
          value={flowName}
          onChange={(e) => setFlowName(e.target.value)}
        />
        <div className="recorder-mode-label">
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
      <div className="recorder-status-msg">{modeStatusMessage}</div>
    </div>
  );
}
