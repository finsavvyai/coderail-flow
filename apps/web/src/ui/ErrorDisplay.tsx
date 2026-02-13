import React, { useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

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
    <div style={{
      backgroundColor: '#2a1a1a',
      border: '2px solid #f44336',
      borderRadius: 8,
      padding: 16,
      marginTop: 16,
      marginBottom: 16
    }}>
      {/* Error Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 24 }}>❌</span>
          <div>
            <div className="h2" style={{ color: '#f44336', margin: 0 }}>
              Execution Failed
            </div>
            <div className="small" style={{ color: '#ff9aa2', marginTop: 4 }}>
              {run.error_code || 'UNKNOWN_ERROR'}
            </div>
          </div>
        </div>

        {onRetry && (
          <button
            className="btn"
            onClick={handleRetry}
            disabled={retrying}
            style={{
              backgroundColor: '#2196F3',
              color: '#fff',
              border: 'none'
            }}
          >
            {retrying ? 'Retrying...' : '🔄 Retry'}
          </button>
        )}
      </div>

      {/* Error Message */}
      <div style={{
        backgroundColor: '#1a1a1a',
        padding: 12,
        borderRadius: 6,
        marginBottom: 12,
        border: '1px solid #3a3a3a'
      }}>
        <div className="small" style={{ color: '#8b8b8b', marginBottom: 4 }}>
          Error Message:
        </div>
        <div style={{ color: '#ff9aa2', fontFamily: 'monospace', fontSize: 14 }}>
          {run.error_message || 'No error message provided'}
        </div>
      </div>

      {/* Error Screenshot */}
      {errorScreenshot && (
        <div style={{ marginBottom: 12 }}>
          <div className="small" style={{ color: '#8b8b8b', marginBottom: 8 }}>
            Screenshot at time of failure:
          </div>
          <img
            src={`${API_BASE}/artifacts/${errorScreenshot.id}/preview`}
            alt="Error screenshot"
            style={{
              width: '100%',
              maxWidth: 600,
              borderRadius: 6,
              border: '1px solid #3a3a3a',
              cursor: 'pointer'
            }}
            onClick={() => {
              window.open(`${API_BASE}/artifacts/${errorScreenshot.id}/preview`, '_blank');
            }}
          />
        </div>
      )}

      {/* Stack Trace Toggle */}
      {run.error_message && run.error_message.includes('\n') && (
        <div>
          <button
            className="btn"
            onClick={() => setShowStack(!showStack)}
            style={{
              fontSize: 12,
              padding: '4px 8px'
            }}
          >
            {showStack ? '▼ Hide Details' : '▶ Show Details'}
          </button>

          {showStack && (
            <pre style={{
              marginTop: 12,
              padding: 12,
              backgroundColor: '#0a0a0a',
              borderRadius: 6,
              fontSize: 11,
              color: '#ff9aa2',
              overflow: 'auto',
              maxHeight: 300,
              border: '1px solid #3a3a3a'
            }}>
              {run.error_message}
            </pre>
          )}
        </div>
      )}

      {/* Troubleshooting Tips */}
      <div style={{
        marginTop: 12,
        padding: 12,
        backgroundColor: '#1a1a1a',
        borderRadius: 6,
        border: '1px solid #3a3a3a'
      }}>
        <div className="small" style={{ color: '#8b8b8b', marginBottom: 6 }}>
          💡 Troubleshooting Tips:
        </div>
        <ul style={{ margin: 0, paddingLeft: 20, color: '#aaa', fontSize: 12 }}>
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
