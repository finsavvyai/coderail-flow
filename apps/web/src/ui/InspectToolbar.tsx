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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <div className="h2" style={{ margin: 0 }}>
          Element Mapper
        </div>
        <button
          className="btn"
          onClick={onCancel}
          style={{ padding: '10px 12px', minHeight: 44, minWidth: 44 }}
          aria-label="Close inspector"
        >
          <X size={16} />
        </button>
      </div>
      <div style={{ marginBottom: 12 }}>
        <label
          htmlFor="inspect-url"
          className="small"
          style={{ display: 'block', marginBottom: 4, color: '#a8b3cf' }}
        >
          Page URL
        </label>
        <div style={{ display: 'flex', gap: 4 }}>
          <input
            id="inspect-url"
            className="input"
            placeholder="https://example.com/page"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onLoadPage()}
            style={{ flex: 1 }}
          />
          <button
            className="btn"
            onClick={onLoadPage}
            disabled={!url.trim()}
            aria-label="Reload page"
            style={{ minHeight: 44, minWidth: 44 }}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>
      {error && (
        <div
          style={{
            padding: 10,
            background: '#2a1a1a',
            border: '1px solid #f44336',
            borderRadius: 6,
            color: '#fca5a5',
            fontSize: 13,
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}
      {iframeLoaded && (
        <button
          className="btn"
          onClick={() => setInspectMode(!inspectMode)}
          style={{
            width: '100%',
            background: inspectMode ? '#6366f1' : '#1a1a1a',
            marginBottom: 12,
          }}
        >
          <Target size={16} /> {inspectMode ? 'Click element to select' : 'Start Inspecting'}
        </button>
      )}
    </div>
  );
}
