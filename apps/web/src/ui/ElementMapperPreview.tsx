import React from 'react';
import { Target, Eye } from 'lucide-react';

export function ElementMapperPreview({
  iframeLoaded,
  inspectMode,
  previewRef,
  onElementClick,
}: {
  iframeLoaded: boolean;
  inspectMode: boolean;
  previewRef: React.RefObject<HTMLDivElement>;
  onElementClick: (e: React.MouseEvent) => void;
}) {
  if (!iframeLoaded) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: '#a8b3cf',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Eye size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
          <div>Enter a URL and click refresh to load the page</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={previewRef}
      style={{
        width: '100%',
        height: '100%',
        background: '#fff',
        cursor: inspectMode ? 'crosshair' : 'default',
        position: 'relative',
      }}
      onClick={onElementClick}
    >
      {/* Simulated page content */}
      <div style={{ padding: 24, color: '#000' }}>
        <h1 data-testid="page-title">Demo Page</h1>
        <p>
          This is a simulated page. In production, this would load the actual URL in an embedded
          browser.
        </p>

        <div style={{ marginTop: 20 }}>
          <button
            data-testid="search-button"
            role="button"
            aria-label="Search"
            style={{
              padding: '10px 20px',
              background: '#6366f1',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            Search
          </button>
          <input
            type="text"
            data-testid="search-input"
            placeholder="Search..."
            style={{
              marginLeft: 10,
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: 6,
            }}
          />
        </div>

        <div
          style={{
            marginTop: 20,
            padding: 16,
            background: '#f5f5f5',
            borderRadius: 8,
          }}
        >
          <h2 id="section-title">Section Title</h2>
          <p className="description-text">Click elements above to inspect and generate locators.</p>
        </div>

        {inspectMode && (
          <div
            style={{
              position: 'fixed',
              top: 10,
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#6366f1',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
              zIndex: 1000,
            }}
          >
            <Target size={14} style={{ display: 'inline', marginRight: 6 }} />
            Click any element to select it
          </div>
        )}
      </div>
    </div>
  );
}
