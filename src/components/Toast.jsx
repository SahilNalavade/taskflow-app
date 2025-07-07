import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose,
  show = true 
}) => {
  const [isVisible, setIsVisible] = useState(show);

  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for fade out animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle style={{ width: '20px', height: '20px', color: '#10b981' }} />;
      case 'error':
        return <XCircle style={{ width: '20px', height: '20px', color: '#ef4444' }} />;
      case 'warning':
        return <AlertCircle style={{ width: '20px', height: '20px', color: '#f59e0b' }} />;
      default:
        return <Info style={{ width: '20px', height: '20px', color: '#3b82f6' }} />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#f0fdf4';
      case 'error':
        return '#fef2f2';
      case 'warning':
        return '#fffbeb';
      default:
        return '#eff6ff';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return '#bbf7d0';
      case 'error':
        return '#fecaca';
      case 'warning':
        return '#fed7aa';
      default:
        return '#dbeafe';
    }
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      right: '24px',
      backgroundColor: getBackgroundColor(),
      border: `1px solid ${getBorderColor()}`,
      borderRadius: '8px',
      padding: '16px',
      maxWidth: '400px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      zIndex: 4000,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
      transition: 'all 0.3s ease-in-out'
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        {getIcon()}
        <div style={{ flex: 1 }}>
          <p style={{ 
            margin: 0, 
            fontSize: '14px', 
            color: '#374151',
            lineHeight: '1.5'
          }}>
            {message}
          </p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: '#6b7280',
            cursor: 'pointer',
            padding: '0',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <X style={{ width: '16px', height: '16px' }} />
        </button>
      </div>
    </div>
  );
};

// Toast container component to manage multiple toasts
export const ToastContainer = ({ toasts, onRemoveToast }) => {
  return (
    <>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => onRemoveToast(toast.id)}
          show={toast.show}
        />
      ))}
    </>
  );
};

export default Toast;