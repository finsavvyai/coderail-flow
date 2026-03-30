import { Target, X, RefreshCw } from 'lucide-react';

interface InspectToolbarProps {
  url: string;
  setUrl: (v: string) => void;
  iframeLoaded: boolean;
  inspectMode: boolean;
  setInspectMode: (v: boolean) => void;
  error: string;
  onLoadPage: () => void;
  onCancel: () => void;
}

export function InspectToolbar({
  url,
  setUrl,
  iframeLoaded,
  inspectMode,
  setInspectMode,
  error,
  onLoadPage,
  onCancel,
}: InspectToolbarProps) {
  return (
    <div className="card">
      <div className="panel-header">
        <div className="h2">Element Mapper</div>
        <button
          className="btn btn-icon"
          onClick={onCancel}
          aria-label="Close inspector"
        >
          <X size={16} />
        </button>
      </div>
      <div className="field-group">
        <label
          htmlFor="inspect-url"
          className="small field-label"
        >
          Page URL
        </label>
        <div className="field-row">
          <input
            id="inspect-url"
            className="input flex-1"
            placeholder="https://example.com/page"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onLoadPage()}
          />
          <button
            className="btn btn-icon"
            onClick={onLoadPage}
            disabled={!url.trim()}
            aria-label="Reload page"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>
      {error && <div className="error-banner">{error}</div>}
      {iframeLoaded && (
        <button
          className={`btn inspect-toggle${inspectMode ? ' inspect-toggle--active' : ''}`}
          onClick={() => setInspectMode(!inspectMode)}
        >
          <Target size={16} /> {inspectMode ? 'Click element to select' : 'Start Inspecting'}
        </button>
      )}
    </div>
  );
}
