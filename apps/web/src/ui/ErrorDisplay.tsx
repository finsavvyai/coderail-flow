import React, { useState } from 'react';
import { XCircle, RefreshCw, Lightbulb, ChevronDown, ChevronRight } from 'lucide-react';
import { apiUrl } from './api-core';

type ErrorDisplayProps = {
  run: any;
  errorScreenshot?: { id: string };
  onRetry?: () => void;
};

export function ErrorDisplay({ run, errorScreenshot, onRetry }: ErrorDisplayProps) {
  const [showStack, setShowStack] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    if (!onRetry) return;
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="error-display">
      {/* Error Header */}
      <div className="error-display-header">
        <div className="error-display-header-left">
          <XCircle size={24} className="error-display-icon" />
          <div>
            <div className="h2 error-display-title">
              Execution Failed
            </div>
            <div className="small error-display-code">
              {run.error_code || 'UNKNOWN_ERROR'}
            </div>
          </div>
        </div>

        {onRetry && (
          <button
            className="btn error-display-retry"
            onClick={handleRetry}
            disabled={retrying}
          >
            <RefreshCw size={14} className="ftr-inline-icon" />
            {retrying ? 'Retrying...' : 'Retry'}
          </button>
        )}
      </div>

      {/* Error Message */}
      <div className="error-display-panel">
        <div className="small error-display-label">
          Error Message:
        </div>
        <div className="error-display-message">
          {run.error_message || 'No error message provided'}
        </div>
      </div>

      {/* Error Screenshot */}
      {errorScreenshot && (
        <div className="error-display-panel">
          <div className="small error-display-label">
            Screenshot at time of failure:
          </div>
          <button
            onClick={() => {
              window.open(apiUrl(`/artifacts/${errorScreenshot.id}/preview`), '_blank');
            }}
            aria-label="View error screenshot full size"
            className="error-display-screenshot-btn"
          >
            <img
              src={apiUrl(`/artifacts/${errorScreenshot.id}/preview`)}
              alt="Error screenshot"
              className="error-display-screenshot-img"
            />
          </button>
        </div>
      )}

      {/* Stack Trace Toggle */}
      {run.error_message && run.error_message.includes('\n') && (
        <div>
          <button
            className="btn error-display-toggle"
            onClick={() => setShowStack(!showStack)}
            aria-expanded={showStack}
            aria-label={showStack ? 'Hide error details' : 'Show error details'}
          >
            {showStack ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            {showStack ? 'Hide Details' : 'Show Details'}
          </button>

          {showStack && (
            <pre className="error-display-stack">
              {run.error_message}
            </pre>
          )}
        </div>
      )}

      {/* Troubleshooting Tips */}
      <div className="error-display-panel">
        <div className="small error-display-tips">
          <Lightbulb
            size={14}
            className="error-display-tips-icon"
          />
          Troubleshooting Tips:
        </div>
        <ul className="error-display-tips-list">
          <li>Check if the target page structure has changed</li>
          <li>Verify element locators are still valid</li>
          <li>Ensure the page loaded completely before interaction</li>
          <li>Check network connectivity and timeouts</li>
          <li>Review the error screenshot for visual clues</li>
        </ul>
      </div>
    </div>
  );
}
