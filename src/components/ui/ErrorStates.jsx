import React from 'react';
import { 
  AlertCircle, 
  RefreshCw, 
  Wifi, 
  Server, 
  Lock, 
  Search,
  FileText,
  Users,
  ArrowLeft,
  Home,
  Mail
} from 'lucide-react';
import { ResponsiveButton, ResponsiveCard, useResponsive } from './ResponsiveLayout';

// Generic error display component
export const ErrorState = ({ 
  icon: Icon = AlertCircle,
  title = "Something went wrong",
  message = "We encountered an unexpected error. Please try again.",
  actions = [],
  className = "",
  style = {}
}) => {
  const { isMobile } = useResponsive();

  return (
    <ResponsiveCard 
      className={className}
      style={{
        textAlign: 'center',
        padding: isMobile ? '32px 16px' : '48px 24px',
        ...style
      }}
    >
      <Icon style={{ 
        width: isMobile ? '48px' : '64px', 
        height: isMobile ? '48px' : '64px', 
        color: '#ef4444', 
        margin: '0 auto 24px' 
      }} />
      
      <h2 style={{
        fontSize: isMobile ? '18px' : '20px',
        fontWeight: '600',
        color: '#111827',
        marginBottom: '8px'
      }}>
        {title}
      </h2>
      
      <p style={{
        color: '#6b7280',
        fontSize: isMobile ? '14px' : '16px',
        marginBottom: actions.length > 0 ? '24px' : '0',
        lineHeight: '1.5'
      }}>
        {message}
      </p>
      
      {actions.length > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '12px',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {actions}
        </div>
      )}
    </ResponsiveCard>
  );
};

// Network error component
export const NetworkError = ({ onRetry, onGoHome }) => {
  const { isMobile } = useResponsive();
  
  return (
    <ErrorState
      icon={Wifi}
      title="Connection Problem"
      message="Unable to connect to the server. Please check your internet connection and try again."
      actions={[
        <ResponsiveButton
          key="retry"
          onClick={onRetry}
          icon={<RefreshCw style={{ width: '16px', height: '16px' }} />}
        >
          Try Again
        </ResponsiveButton>,
        onGoHome && (
          <ResponsiveButton
            key="home"
            variant="secondary"
            onClick={onGoHome}
            icon={<Home style={{ width: '16px', height: '16px' }} />}
          >
            Go Home
          </ResponsiveButton>
        )
      ].filter(Boolean)}
    />
  );
};

// Server error component
export const ServerError = ({ onRetry, onReport }) => {
  return (
    <ErrorState
      icon={Server}
      title="Server Error"
      message="Our servers are experiencing issues. We're working to fix this as quickly as possible."
      actions={[
        <ResponsiveButton
          key="retry"
          onClick={onRetry}
          icon={<RefreshCw style={{ width: '16px', height: '16px' }} />}
        >
          Try Again
        </ResponsiveButton>,
        onReport && (
          <ResponsiveButton
            key="report"
            variant="secondary"
            onClick={onReport}
            icon={<Mail style={{ width: '16px', height: '16px' }} />}
          >
            Report Issue
          </ResponsiveButton>
        )
      ].filter(Boolean)}
    />
  );
};

// Permission denied component
export const PermissionDenied = ({ onGoBack, onContactAdmin }) => {
  return (
    <ErrorState
      icon={Lock}
      title="Access Denied"
      message="You don't have permission to view this content. Contact your team administrator if you believe this is an error."
      actions={[
        onGoBack && (
          <ResponsiveButton
            key="back"
            onClick={onGoBack}
            icon={<ArrowLeft style={{ width: '16px', height: '16px' }} />}
          >
            Go Back
          </ResponsiveButton>
        ),
        onContactAdmin && (
          <ResponsiveButton
            key="contact"
            variant="secondary"
            onClick={onContactAdmin}
            icon={<Mail style={{ width: '16px', height: '16px' }} />}
          >
            Contact Admin
          </ResponsiveButton>
        )
      ].filter(Boolean)}
    />
  );
};

// Not found component
export const NotFound = ({ 
  title = "Page Not Found",
  message = "The page you're looking for doesn't exist or has been moved.",
  onGoHome,
  onGoBack
}) => {
  return (
    <ErrorState
      icon={Search}
      title={title}
      message={message}
      actions={[
        onGoHome && (
          <ResponsiveButton
            key="home"
            onClick={onGoHome}
            icon={<Home style={{ width: '16px', height: '16px' }} />}
          >
            Go Home
          </ResponsiveButton>
        ),
        onGoBack && (
          <ResponsiveButton
            key="back"
            variant="secondary"
            onClick={onGoBack}
            icon={<ArrowLeft style={{ width: '16px', height: '16px' }} />}
          >
            Go Back
          </ResponsiveButton>
        )
      ].filter(Boolean)}
    />
  );
};

// Empty state component
export const EmptyState = ({ 
  icon: Icon = FileText,
  title = "Nothing here yet",
  message = "Get started by creating your first item.",
  actions = [],
  illustration = null,
  className = "",
  style = {}
}) => {
  const { isMobile } = useResponsive();

  return (
    <ResponsiveCard 
      className={className}
      style={{
        textAlign: 'center',
        padding: isMobile ? '32px 16px' : '48px 24px',
        ...style
      }}
    >
      {illustration || (
        <Icon style={{ 
          width: isMobile ? '48px' : '64px', 
          height: isMobile ? '48px' : '64px', 
          color: '#9ca3af', 
          margin: '0 auto 24px' 
        }} />
      )}
      
      <h3 style={{
        fontSize: isMobile ? '18px' : '20px',
        fontWeight: '600',
        color: '#111827',
        marginBottom: '8px'
      }}>
        {title}
      </h3>
      
      <p style={{
        color: '#6b7280',
        fontSize: isMobile ? '14px' : '16px',
        marginBottom: actions.length > 0 ? '24px' : '0',
        lineHeight: '1.5'
      }}>
        {message}
      </p>
      
      {actions.length > 0 && (
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '12px',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {actions}
        </div>
      )}
    </ResponsiveCard>
  );
};

// Specific empty states for common scenarios
export const EmptyTaskBoard = ({ onCreateTask }) => (
  <EmptyState
    title="No tasks yet"
    message="Start organizing your work by creating your first task."
    actions={[
      <ResponsiveButton
        key="create"
        onClick={onCreateTask}
        icon={<FileText style={{ width: '16px', height: '16px' }} />}
      >
        Create Task
      </ResponsiveButton>
    ]}
  />
);

export const EmptyTeamList = ({ onCreateTeam, onJoinTeam }) => (
  <EmptyState
    icon={Users}
    title="No teams yet"
    message="Create a new team or join an existing one to start collaborating."
    actions={[
      <ResponsiveButton
        key="create"
        onClick={onCreateTeam}
        icon={<Users style={{ width: '16px', height: '16px' }} />}
      >
        Create Team
      </ResponsiveButton>,
      onJoinTeam && (
        <ResponsiveButton
          key="join"
          variant="secondary"
          onClick={onJoinTeam}
          icon={<Mail style={{ width: '16px', height: '16px' }} />}
        >
          Join Team
        </ResponsiveButton>
      )
    ].filter(Boolean)}
  />
);

export const EmptySearchResults = ({ query, onClearSearch }) => (
  <EmptyState
    icon={Search}
    title="No results found"
    message={`No items match "${query}". Try adjusting your search terms.`}
    actions={[
      <ResponsiveButton
        key="clear"
        variant="secondary"
        onClick={onClearSearch}
      >
        Clear Search
      </ResponsiveButton>
    ]}
  />
);

// Error boundary fallback component
export const ErrorBoundaryFallback = ({ error, resetErrorBoundary }) => {
  const { isMobile } = useResponsive();
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f8fafc',
      padding: '20px'
    }}>
      <ErrorState
        title="Application Error"
        message="Something went wrong in the application. Try refreshing the page or contact support if the problem persists."
        actions={[
          <ResponsiveButton
            key="refresh"
            onClick={() => window.location.reload()}
            icon={<RefreshCw style={{ width: '16px', height: '16px' }} />}
          >
            Refresh Page
          </ResponsiveButton>,
          <ResponsiveButton
            key="retry"
            variant="secondary"
            onClick={resetErrorBoundary}
          >
            Try Again
          </ResponsiveButton>
        ]}
        style={{ maxWidth: isMobile ? '100%' : '500px' }}
      />
    </div>
  );
};

// Hook for error handling
export const useErrorHandler = () => {
  const [error, setError] = React.useState(null);
  
  const handleError = React.useCallback((error) => {
    console.error('Handled error:', error);
    setError(error);
  }, []);
  
  const clearError = React.useCallback(() => {
    setError(null);
  }, []);
  
  const retry = React.useCallback((fn) => {
    setError(null);
    if (typeof fn === 'function') {
      try {
        const result = fn();
        if (result && typeof result.catch === 'function') {
          result.catch(handleError);
        }
        return result;
      } catch (err) {
        handleError(err);
      }
    }
  }, [handleError]);
  
  return {
    error,
    handleError,
    clearError,
    retry,
    hasError: !!error
  };
};

export default {
  ErrorState,
  NetworkError,
  ServerError,
  PermissionDenied,
  NotFound,
  EmptyState,
  EmptyTaskBoard,
  EmptyTeamList,
  EmptySearchResults,
  ErrorBoundaryFallback,
  useErrorHandler
};