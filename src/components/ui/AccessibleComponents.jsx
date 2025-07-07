import React, { useRef, useEffect, useState, useCallback } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';

// Screen reader only text component
export const VisuallyHidden = ({ children, ...props }) => (
  <span
    style={{
      position: 'absolute',
      width: '1px',
      height: '1px',
      padding: 0,
      margin: '-1px',
      overflow: 'hidden',
      clip: 'rect(0, 0, 0, 0)',
      whiteSpace: 'nowrap',
      border: 0
    }}
    {...props}
  >
    {children}
  </span>
);

// Skip link component
export const SkipLink = ({ href = "#main-content", children = "Skip to main content" }) => (
  <a
    href={href}
    style={{
      position: 'absolute',
      top: '-40px',
      left: '6px',
      backgroundColor: '#3b82f6',
      color: 'white',
      padding: '8px 12px',
      fontSize: '14px',
      fontWeight: '500',
      borderRadius: '4px',
      textDecoration: 'none',
      zIndex: 10000,
      transition: 'top 0.3s ease'
    }}
    onFocus={(e) => {
      e.target.style.top = '6px';
    }}
    onBlur={(e) => {
      e.target.style.top = '-40px';
    }}
  >
    {children}
  </a>
);

// Focus trap hook for modals
export const useFocusTrap = (isActive = true) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    // Focus the first element when trap activates
    firstElement?.focus();
    
    container.addEventListener('keydown', handleTabKey);
    
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return containerRef;
};

// Live region for screen reader announcements
export const LiveRegion = ({ 
  children, 
  politeness = 'polite',
  atomic = true,
  className = ''
}) => (
  <div
    aria-live={politeness}
    aria-atomic={atomic}
    className={className}
    style={{
      position: 'absolute',
      left: '-10000px',
      width: '1px',
      height: '1px',
      overflow: 'hidden'
    }}
  >
    {children}
  </div>
);

// Hook for announcements
export const useAnnouncer = () => {
  const [announcement, setAnnouncement] = useState('');

  const announce = useCallback((message, politeness = 'polite') => {
    setAnnouncement(''); // Clear first to ensure re-announcement
    setTimeout(() => {
      setAnnouncement(message);
    }, 100);
  }, []);

  const clear = useCallback(() => {
    setAnnouncement('');
  }, []);

  return {
    announcement,
    announce,
    clear,
    LiveRegion: ({ className = '' }) => (
      <LiveRegion className={className}>
        {announcement}
      </LiveRegion>
    )
  };
};

// Accessible button component
export const AccessibleButton = ({ 
  children,
  onClick,
  disabled = false,
  ariaLabel,
  ariaDescribedBy,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  className = '',
  ...props
}) => {
  const variants = {
    primary: {
      backgroundColor: disabled ? '#9ca3af' : '#3b82f6',
      color: 'white',
      border: 'none'
    },
    secondary: {
      backgroundColor: disabled ? '#f3f4f6' : 'white',
      color: disabled ? '#9ca3af' : '#374151',
      border: `1px solid ${disabled ? '#d1d5db' : '#d1d5db'}`
    },
    ghost: {
      backgroundColor: 'transparent',
      color: disabled ? '#9ca3af' : '#6b7280',
      border: 'none'
    }
  };

  const sizes = {
    sm: { padding: '8px 12px', fontSize: '14px', minHeight: '36px' },
    md: { padding: '10px 16px', fontSize: '14px', minHeight: '40px' },
    lg: { padding: '12px 20px', fontSize: '16px', minHeight: '44px' }
  };

  return (
    <button
      className={className}
      onClick={disabled || loading ? undefined : onClick}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
      style={{
        ...variants[variant],
        ...sizes[size],
        borderRadius: '8px',
        fontWeight: '500',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: icon ? '8px' : 0,
        transition: 'all 0.2s ease',
        outline: 'none',
        position: 'relative'
      }}
      onFocus={(e) => {
        e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.5)';
      }}
      onBlur={(e) => {
        e.target.style.boxShadow = 'none';
      }}
      {...props}
    >
      {loading && (
        <div
          style={{
            width: '16px',
            height: '16px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTop: '2px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
          aria-hidden="true"
        />
      )}
      {!loading && icon && <span aria-hidden="true">{icon}</span>}
      {children}
      {loading && <VisuallyHidden>Loading...</VisuallyHidden>}
    </button>
  );
};

// Accessible modal component
export const AccessibleModal = ({ 
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  className = ''
}) => {
  const modalRef = useFocusTrap(isOpen);
  const titleId = useRef(`modal-title-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: { maxWidth: '400px' },
    md: { maxWidth: '600px' },
    lg: { maxWidth: '800px' },
    xl: { maxWidth: '1000px' }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 4000,
        padding: '20px'
      }}
      onClick={closeOnOverlayClick ? onClose : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId.current}
    >
      <div
        ref={modalRef}
        className={className}
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          width: '100%',
          ...sizes[size],
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          outline: 'none'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2
            id={titleId.current}
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#111827',
              margin: 0
            }}
          >
            {title}
          </h2>
          <AccessibleButton
            variant="ghost"
            size="sm"
            onClick={onClose}
            ariaLabel="Close modal"
            icon={<X style={{ width: '16px', height: '16px' }} />}
          />
        </div>
        
        {/* Modal Content */}
        <div style={{ padding: '24px' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

// Accessible dropdown component
export const AccessibleDropdown = ({
  trigger,
  children,
  isOpen,
  onToggle,
  onClose,
  align = 'left',
  className = ''
}) => {
  const dropdownRef = useRef(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const menuItems = React.Children.toArray(children);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleKeyDown = (e) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < menuItems.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : menuItems.length - 1
        );
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0) {
          const item = menuItems[focusedIndex];
          if (item && item.props.onClick) {
            item.props.onClick();
          }
        }
        break;
    }
  };

  const alignmentStyles = {
    left: { left: 0 },
    right: { right: 0 },
    center: { left: '50%', transform: 'translateX(-50%)' }
  };

  return (
    <div 
      ref={dropdownRef}
      className={className}
      style={{ position: 'relative', display: 'inline-block' }}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger */}
      <div
        onClick={onToggle}
        role="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
      >
        {trigger}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: '100%',
            zIndex: 1000,
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            minWidth: '200px',
            marginTop: '4px',
            ...alignmentStyles[align]
          }}
        >
          {menuItems.map((child, index) => 
            React.cloneElement(child, {
              key: index,
              role: 'menuitem',
              tabIndex: focusedIndex === index ? 0 : -1,
              style: {
                ...child.props.style,
                backgroundColor: focusedIndex === index ? '#f3f4f6' : 'transparent'
              }
            })
          )}
        </div>
      )}
    </div>
  );
};

// Accessible form input component
export const AccessibleInput = ({
  label,
  id,
  error,
  helpText,
  required = false,
  className = '',
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helpId = helpText ? `${inputId}-help` : undefined;

  return (
    <div className={className} style={{ marginBottom: '16px' }}>
      <label
        htmlFor={inputId}
        style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '6px'
        }}
      >
        {label}
        {required && (
          <span style={{ color: '#ef4444', marginLeft: '4px' }} aria-label="required">
            *
          </span>
        )}
      </label>
      
      <input
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={[errorId, helpId].filter(Boolean).join(' ') || undefined}
        style={{
          width: '100%',
          padding: '10px 12px',
          border: `2px solid ${error ? '#ef4444' : '#e5e7eb'}`,
          borderRadius: '6px',
          fontSize: '14px',
          outline: 'none',
          transition: 'border-color 0.2s ease'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = error ? '#ef4444' : '#3b82f6';
          e.target.style.boxShadow = `0 0 0 1px ${error ? '#ef4444' : '#3b82f6'}`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? '#ef4444' : '#e5e7eb';
          e.target.style.boxShadow = 'none';
        }}
        {...props}
      />
      
      {error && (
        <p id={errorId} role="alert" style={{
          color: '#ef4444',
          fontSize: '12px',
          marginTop: '4px',
          margin: 0
        }}>
          {error}
        </p>
      )}
      
      {helpText && !error && (
        <p id={helpId} style={{
          color: '#6b7280',
          fontSize: '12px',
          marginTop: '4px',
          margin: 0
        }}>
          {helpText}
        </p>
      )}
    </div>
  );
};

export default {
  VisuallyHidden,
  SkipLink,
  useFocusTrap,
  LiveRegion,
  useAnnouncer,
  AccessibleButton,
  AccessibleModal,
  AccessibleDropdown,
  AccessibleInput
};