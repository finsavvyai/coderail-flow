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
    return <div className="small gallery-empty">No screenshots available</div>;
  }

  const selectedScreenshot = selectedIndex !== null ? screenshots[selectedIndex] : null;

  return (
    <div className="gallery-wrapper">
      <div className="gallery-grid">
        {screenshots.map((screenshot, index) => (
          <button
            key={screenshot.id}
            onClick={() => setSelectedIndex(index)}
            aria-label={`View screenshot ${getStepNumber(screenshot, index)}`}
            className={`gallery-thumb${selectedIndex === index ? ' selected' : ''}`}
          >
            <AuthImage
              artifactId={screenshot.id}
              alt={`Screenshot ${index + 1}`}
              className="gallery-thumb-img"
              loading="lazy"
            />
            <div className="gallery-thumb-label">Step {getStepNumber(screenshot, index)}</div>
          </button>
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
