import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import { Button } from './ui';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-2xl shadow-soft-lg p-8 text-center">
              {/* Error Icon */}
              <div className="w-16 h-16 mx-auto mb-6 bg-error-100 rounded-full flex items-center justify-center">
                <span className="text-3xl">⚠️</span>
              </div>

              {/* Error Message */}
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600 mb-6 leading-relaxed">
                We're sorry, but something unexpected happened. Please try refreshing the page or contact support if the problem persists.
              </p>

              {/* Error Details (Development) */}
              {import.meta.env.DEV && this.state.error && (
                <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
                  <h3 className="font-semibold text-gray-900 mb-2">Error Details:</h3>
                  <p className="text-sm text-gray-700 font-mono break-all">
                    {this.state.error.message}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-sm text-gray-600 cursor-pointer">
                        Stack Trace
                      </summary>
                      <pre className="text-xs text-gray-600 mt-2 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={this.handleReset}
                  variant="primary"
                  size="lg"
                  fullWidth
                >
                  🔄 Try Again
                </Button>
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                  size="lg"
                  fullWidth
                >
                  🔃 Reload Page
                </Button>
                <Button
                  onClick={() => window.history.back()}
                  variant="ghost"
                  size="md"
                  fullWidth
                >
                  ← Go Back
                </Button>
              </div>

              {/* Support Contact */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Need help?{' '}
                  <a
                    href="mailto:support@moviehub.com"
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Contact Support
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;