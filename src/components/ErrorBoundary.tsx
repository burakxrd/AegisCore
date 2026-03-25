import React, { Component, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if ((import.meta as any).env?.DEV) {
      console.error('Uncaught error:', error, errorInfo);
    }
    // In production, this error could be reported to a service like Sentry
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Generic default fallback UI
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 max-w-md w-full text-center">
            <h1 className="text-2xl font-bold text-red-500 mb-4">500</h1>
            <h2 className="text-xl text-slate-200 mb-2">An Unknown Error Occurred</h2>
            <p className="text-slate-400 mb-6">
              An unexpected error occurred while the application was running. Our team is working to resolve this issue.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
