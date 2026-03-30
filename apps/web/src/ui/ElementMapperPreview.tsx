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
      <div className="mapper-empty">
        <div className="mapper-empty-inner">
          <Eye size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
          <div>Enter a URL and click refresh to load the page</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={previewRef}
      className={`mapper-viewport${inspectMode ? ' inspect' : ''}`}
      onClick={onElementClick}
    >
      <div className="mapper-demo-content">
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
            className="mapper-demo-btn"
          >
            Search
          </button>
          <input
            type="text"
            data-testid="search-input"
            placeholder="Search..."
            className="mapper-demo-input"
          />
        </div>

        <div className="mapper-demo-section">
          <h2 id="section-title">Section Title</h2>
          <p className="description-text">Click elements above to inspect and generate locators.</p>
        </div>

        {inspectMode && (
          <div className="mapper-inspect-banner">
            <Target size={14} style={{ display: 'inline', marginRight: 6 }} />
            Click any element to select it
          </div>
        )}
      </div>
    </div>
  );
}
