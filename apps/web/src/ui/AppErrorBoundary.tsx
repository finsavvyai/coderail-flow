import React from 'react';

type AppErrorBoundaryProps = {
  children: React.ReactNode;
};

type AppErrorBoundaryState = {
  error?: Error;
};

export class AppErrorBoundary extends React.Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {};

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught application error', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: 24,
          background:
            'radial-gradient(circle at top, rgba(48, 79, 142, 0.35), transparent 48%), #07111f',
          color: '#d6deeb',
        }}
      >
        <div
          className="card"
          role="alert"
          style={{
            width: 'min(560px, 100%)',
            padding: 24,
            border: '1px solid rgba(112, 132, 168, 0.28)',
          }}
        >
          <div className="eyebrow" style={{ color: '#7dd3fc', marginBottom: 12 }}>
            Application Error
          </div>
          <h1 className="h1" style={{ marginBottom: 12 }}>
            The workspace failed to load.
          </h1>
          <p className="body" style={{ marginBottom: 20, color: '#a8b3cf' }}>
            Reload the page to retry. If this persists, check the browser console and API health
            endpoints before routing traffic to this deployment.
          </p>
          <div
            style={{
              marginBottom: 20,
              padding: 12,
              borderRadius: 12,
              background: 'rgba(7, 17, 31, 0.7)',
              border: '1px solid rgba(112, 132, 168, 0.22)',
              fontFamily: 'monospace',
              fontSize: 13,
              overflowX: 'auto',
            }}
          >
            {this.state.error.message}
          </div>
          <button className="btn btn-primary" type="button" onClick={this.handleReload}>
            Reload App
          </button>
        </div>
      </div>
    );
  }
}
