import { useCallback } from 'react';
import type { AppError, ErrorCode } from '@/types';

interface UseErrorHandlerOptions {
  onError?: (error: AppError) => void;
  showToast?: boolean;
  logToConsole?: boolean;
  reportToService?: boolean;
}

export const useErrorHandler = (options: UseErrorHandlerOptions = {}) => {
  const {
    onError,
    showToast = true,
    logToConsole = true,
    reportToService = true,
  } = options;

  const handleError = useCallback((
    error: Error | AppError | string,
    context?: Record<string, any>
  ) => {
    const appError: AppError = normalizeError(error, context);

    if (logToConsole) {
      console.error('Error handled:', appError);
    }

    if (reportToService) {
      reportError(appError);
    }

    if (showToast) {
      showErrorToast(appError);
    }

    onError?.(appError);

    return appError;
  }, [onError, showToast, logToConsole, reportToService]);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    fallbackValue?: T
  ): Promise<T | undefined> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error);
      return fallbackValue;
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
  };
};

const normalizeError = (
  error: Error | AppError | string,
  context?: Record<string, any>
): AppError => {
  if (typeof error === 'string') {
    return {
      code: 'GENERIC_ERROR',
      message: error,
      timestamp: new Date().toISOString(),
      details: context,
    };
  }

  if ('code' in error && 'timestamp' in error) {
    return error as AppError;
  }

  // Convert Error to AppError
  const errorCode = getErrorCode(error);
  
  return {
    code: errorCode,
    message: error.message || 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    details: {
      name: error.name,
      stack: error.stack,
      ...context,
    },
    stackTrace: error.stack,
  };
};

const getErrorCode = (error: Error): ErrorCode => {
  const message = error.message.toLowerCase();
  
  if (message.includes('network') || message.includes('fetch')) {
    return 'NETWORK_ERROR';
  }
  
  if (message.includes('auth') || message.includes('unauthorized')) {
    return 'AUTH_FAILED';
  }
  
  if (message.includes('permission') || message.includes('forbidden')) {
    return 'PERMISSION_DENIED';
  }
  
  if (message.includes('not found') || message.includes('404')) {
    return 'RESOURCE_NOT_FOUND';
  }
  
  if (message.includes('validation') || message.includes('invalid')) {
    return 'VALIDATION_ERROR';
  }
  
  if (message.includes('rate limit')) {
    return 'RATE_LIMIT_EXCEEDED';
  }
  
  return 'INTERNAL_ERROR';
};

const reportError = (error: AppError) => {
  // In production, send to error reporting service
  if (process.env.NODE_ENV === 'production') {
    // Example: Sentry, LogRocket, etc.
    // Sentry.captureException(error);
  }
  
  // For now, just log to console
  console.error('Error reported:', error);
};

const showErrorToast = (error: AppError) => {
  // In a real app, this would trigger a toast notification
  // For now, we'll just use browser notification if available
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Application Error', {
      body: error.message,
      icon: '/error-icon.png',
    });
  }
};