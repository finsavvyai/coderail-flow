import { useState } from 'react';
import { AuthImage } from './AuthImage';
import { ScreenshotLightbox } from './ScreenshotLightbox';

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
      <div className="small" style={{ color: '#a8b3cf', padding: '16px 0' }}>
        No screenshots available
      </div>
    );
  }

  const selectedScreenshot = selectedIndex !== null ? screenshots[selectedIndex] : null;

  return (
    <div style={{ marginTop: 16 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 12,
          marginBottom: 16,
        }}
      >
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
              transition: 'border-color 0.15s',
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              if (selectedIndex !== index) e.currentTarget.style.borderColor = '#555';
            }}
            onMouseLeave={(e) => {
              if (selectedIndex !== index) e.currentTarget.style.borderColor = '#3a3a3a';
            }}
          >
            <AuthImage
              artifactId={screenshot.id}
              alt={`Screenshot ${index + 1}`}
              style={{ width: '100%', height: 100, objectFit: 'cover', display: 'block' }}
              loading="lazy"
            />
            <div
              style={{ padding: '6px 8px', fontSize: 11, color: '#a8b3cf', textAlign: 'center' }}
            >
              Step {getStepNumber(screenshot, index)}
            </div>
          </div>
        ))}
      </div>

      {selectedScreenshot && selectedIndex !== null && (
        <ScreenshotLightbox
          screenshot={selectedScreenshot}
          index={selectedIndex}
          total={screenshots.length}
          onClose={() => setSelectedIndex(null)}
          onPrev={() => {
            if (selectedIndex > 0) setSelectedIndex(selectedIndex - 1);
          }}
          onNext={() => {
            if (selectedIndex < screenshots.length - 1) setSelectedIndex(selectedIndex + 1);
          }}
        />
      )}
    </div>
  );
}

function getStepNumber(screenshot: Screenshot, fallbackIndex: number): number {
  if (screenshot.kind && screenshot.kind.startsWith('screenshot')) {
    const match = screenshot.kind.match(/screenshot-(\d+)/);
    if (match) return parseInt(match[1]) + 1;
  }
  return fallbackIndex + 1;
}
