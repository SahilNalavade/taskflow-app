import React, { useEffect } from 'react';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface GlobalErrorHandlerProps {
  children: React.ReactNode;
}

export const GlobalErrorHandler: React.FC<GlobalErrorHandlerProps> = ({ children }) => {
  const { handleError } = useErrorHandler();

  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      handleError(event.reason || 'Unhandled promise rejection');
    };

    // Handle global JavaScript errors
    const handleGlobalError = (event: ErrorEvent) => {
      handleError(event.error || event.message);
    };

    // Handle resource loading errors
    const handleResourceError = (event: Event) => {
      const target = event.target as HTMLElement;
      if (target.tagName) {
        handleError(`Failed to load ${target.tagName.toLowerCase()}: ${(target as any).src || (target as any).href}`);
      }
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('error', handleResourceError, true);

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('error', handleResourceError, true);
    };
  }, [handleError]);

  return <>{children}</>;
};