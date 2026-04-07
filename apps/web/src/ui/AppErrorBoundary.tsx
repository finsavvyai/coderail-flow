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
      <div className="error-boundary-backdrop">
        <div className="card error-boundary-card" role="alert">
          <div className="eyebrow error-boundary-eyebrow">Application Error</div>
          <h1 className="h1" style={{ marginBottom: 12 }}>
            The workspace failed to load.
          </h1>
          <p className="body error-boundary-body">
            Reload the page to retry. If this persists, check the browser console and API health
            endpoints before routing traffic to this deployment.
          </p>
          <div className="error-boundary-trace">{this.state.error.message}</div>
          <button className="btn btn-primary" type="button" onClick={this.handleReload}>
            Reload App
          </button>
        </div>
      </div>
    );
  }
}
