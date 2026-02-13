import React, { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

type Screenshot = {
  id: string;
  kind: string;
  stepIndex?: number;
};

type ScreenshotGalleryProps = {
  screenshots: Screenshot[];
};

export function ScreenshotGallery({ screenshots }: ScreenshotGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (screenshots.length === 0) {
    return (
      <div className="small" style={{ color: '#8b8b8b', padding: '16px 0' }}>
        No screenshots available
      </div>
    );
  }

  const selectedScreenshot = selectedIndex !== null ? screenshots[selectedIndex] : null;

  return (
    <div style={{ marginTop: 16 }}>
      {/* Grid of thumbnails */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: 12,
        marginBottom: 16
      }}>
        {screenshots.map((screenshot, index) => (
          <div
            key={screenshot.id}
            onClick={() => setSelectedIndex(index)}
            style={{
              cursor: 'pointer',
              border: selectedIndex === index ? '2px solid #2196F3' : '1px solid #3a3a3a',
              borderRadius: 8,
              overflow: 'hidden',
              backgroundColor: '#1a1a1a',
              transition: 'all 0.2s',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              if (selectedIndex !== index) {
                e.currentTarget.style.borderColor = '#555';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedIndex !== index) {
                e.currentTarget.style.borderColor = '#3a3a3a';
              }
            }}
          >
            <img
              src={`${API_BASE}/artifacts/${screenshot.id}/preview`}
              alt={`Screenshot ${index + 1}`}
              style={{
                width: '100%',
                height: 100,
                objectFit: 'cover',
                display: 'block'
              }}
              loading="lazy"
            />
            <div style={{
              padding: '6px 8px',
              fontSize: 11,
              color: '#8b8b8b',
              textAlign: 'center'
            }}>
              Step {getStepNumber(screenshot, index)}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox for full-size view */}
      {selectedScreenshot && (
        <div
          onClick={() => setSelectedIndex(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            cursor: 'zoom-out'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              position: 'relative',
              cursor: 'default'
            }}
          >
            <img
              src={`${API_BASE}/artifacts/${selectedScreenshot.id}/preview`}
              alt={`Screenshot ${(selectedIndex ?? 0) + 1}`}
              style={{
                maxWidth: '100%',
                maxHeight: '90vh',
                borderRadius: 8,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
              }}
            />

            {/* Navigation and controls */}
            <div style={{
              position: 'absolute',
              bottom: -50,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 16
            }}>
              <button
                className="btn"
                disabled={selectedIndex === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  if (selectedIndex !== null && selectedIndex > 0) {
                    setSelectedIndex(selectedIndex - 1);
                  }
                }}
              >
                ← Previous
              </button>

              <span className="small" style={{ color: '#fff' }}>
                {selectedIndex !== null ? selectedIndex + 1 : 0} of {screenshots.length}
              </span>

              <button
                className="btn"
                disabled={selectedIndex === screenshots.length - 1}
                onClick={(e) => {
                  e.stopPropagation();
                  if (selectedIndex !== null && selectedIndex < screenshots.length - 1) {
                    setSelectedIndex(selectedIndex + 1);
                  }
                }}
              >
                Next →
              </button>

              <a
                className="btn"
                href={`${API_BASE}/artifacts/${selectedScreenshot.id}/download`}
                download
                onClick={(e) => e.stopPropagation()}
              >
                Download
              </a>

              <button
                className="btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getStepNumber(screenshot: Screenshot, fallbackIndex: number): number {
  // Try to extract step number from kind (e.g., "screenshot-3")
  if (screenshot.kind && screenshot.kind.startsWith('screenshot')) {
    const match = screenshot.kind.match(/screenshot-(\d+)/);
    if (match) {
      return parseInt(match[1]) + 1; // Convert 0-indexed to 1-indexed
    }
  }
  return fallbackIndex + 1;
}
