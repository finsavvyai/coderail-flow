import React, { useEffect } from 'react';
import { AuthImage } from './AuthImage';
import { artifactDownloadUrl } from './api';

interface Screenshot {
  id: string;
  kind: string;
  stepIndex?: number;
}

interface ScreenshotLightboxProps {
  screenshot: Screenshot;
  index: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function ScreenshotLightbox({
  screenshot,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: ScreenshotLightboxProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Screenshot viewer"
      onClick={onClose}
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
        cursor: 'zoom-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '90vw',
          maxHeight: '90vh',
          position: 'relative',
          cursor: 'default',
        }}
      >
        <AuthImage
          artifactId={screenshot.id}
          alt={`Screenshot ${index + 1}`}
          style={{
            maxWidth: '100%',
            maxHeight: '90vh',
            borderRadius: 8,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            bottom: -50,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <button
            className="btn"
            disabled={index === 0}
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
          >
            Previous
          </button>
          <span className="small" style={{ color: '#fff' }}>
            {index + 1} of {total}
          </span>
          <button
            className="btn"
            disabled={index === total - 1}
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
          >
            Next
          </button>
          <a
            className="btn"
            href={artifactDownloadUrl(screenshot.id)}
            download
            onClick={(e) => e.stopPropagation()}
          >
            Download
          </a>
          <button
            className="btn"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
