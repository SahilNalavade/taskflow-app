import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'critical';
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Report to monitoring service
    this.reportError(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In production, report to error monitoring service like Sentry
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      level: this.props.level || 'component',
    };

    console.error('Error Report:', errorReport);

    // TODO: Send to monitoring service
    // Sentry.captureException(error, { contexts: { react: errorInfo } });
  };

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
      });
    }
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  private renderErrorDetails = () => {
    const { error, errorInfo } = this.state;
    
    if (!error) return null;

    return (
      <details className="mt-4 p-4 bg-gray-50 rounded-lg">
        <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
          Technical Details
        </summary>
        <div className="mt-2 space-y-2">
          <div>
            <strong>Error:</strong>
            <pre className="mt-1 text-sm bg-red-50 p-2 rounded overflow-x-auto">
              {error.message}
            </pre>
          </div>
          {error.stack && (
            <div>
              <strong>Stack Trace:</strong>
              <pre className="mt-1 text-xs bg-red-50 p-2 rounded overflow-x-auto max-h-32">
                {error.stack}
              </pre>
            </div>
          )}
          {errorInfo?.componentStack && (
            <div>
              <strong>Component Stack:</strong>
              <pre className="mt-1 text-xs bg-red-50 p-2 rounded overflow-x-auto max-h-32">
                {errorInfo.componentStack}
              </pre>
            </div>
          )}
        </div>
      </details>
    );
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI based on level
      const level = this.props.level || 'component';

      if (level === 'critical') {
        return (
          <div className="min-h-screen flex items-center justify-center bg-red-50">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500 mr-3" />
                <h1 className="text-xl font-bold text-gray-900">
                  Critical Error
                </h1>
              </div>
              
              <p className="text-gray-600 mb-6">
                A critical error has occurred that prevents the application from continuing.
                Please reload the page or contact support.
              </p>

              <div className="space-y-3">
                <button
                  onClick={this.handleReload}
                  className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Application
                </button>
                
                <button
                  onClick={() => window.open('mailto:support@taskflow.com')}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  <Bug className="w-4 h-4 mr-2" />
                  Contact Support
                </button>
              </div>

              {this.renderErrorDetails()}
            </div>
          </div>
        );
      }

      if (level === 'page') {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-yellow-500 mr-3" />
                <h1 className="text-lg font-semibold text-gray-900">
                  Page Error
                </h1>
              </div>
              
              <p className="text-gray-600 mb-6">
                Something went wrong with this page. You can try reloading or go back to the home page.
              </p>

              <div className="space-y-3">
                {this.retryCount < this.maxRetries && (
                  <button
                    onClick={this.handleRetry}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again ({this.maxRetries - this.retryCount} attempts left)
                  </button>
                )}
                
                <button
                  onClick={this.handleGoHome}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </button>
              </div>

              {this.renderErrorDetails()}
            </div>
          </div>
        );
      }

      // Component level error
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <h3 className="text-sm font-medium text-yellow-800">
              Component Error
            </h3>
          </div>
          
          <p className="text-sm text-yellow-700 mb-3">
            This component encountered an error and couldn't render properly.
          </p>

          {this.retryCount < this.maxRetries && (
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm hover:bg-yellow-200 transition-colors"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry ({this.maxRetries - this.retryCount} left)
            </button>
          )}

          {this.renderErrorDetails()}
        </div>
      );
    }

    return this.props.children;
  }
}

// Convenience hooks and components
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

// HOC for async components
export const AsyncErrorBoundary: React.FC<Props> = ({ children, ...props }) => (
  <ErrorBoundary level="component" {...props}>
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Loading...</span>
        </div>
      }
    >
      {children}
    </React.Suspense>
  </ErrorBoundary>
);

export default ErrorBoundary;