import React from 'react';

// Responsive breakpoints
const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

// Responsive container component
export const ResponsiveContainer = ({ 
  children, 
  maxWidth = 'xl',
  padding = true,
  className = '' 
}) => {
  const maxWidthMap = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
    full: '100%'
  };

  return (
    <div 
      className={className}
      style={{
        maxWidth: maxWidthMap[maxWidth],
        margin: '0 auto',
        padding: padding ? '0 16px' : '0',
        width: '100%',
        ...window.innerWidth >= 640 && { padding: padding ? '0 24px' : '0' },
        ...window.innerWidth >= 1024 && { padding: padding ? '0 32px' : '0' }
      }}
    >
      {children}
    </div>
  );
};

// Responsive header component
export const ResponsiveHeader = ({ 
  title, 
  subtitle,
  actions,
  navigation,
  className = ''
}) => {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className={className} style={{
      position: 'sticky',
      top: 0,
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      zIndex: 50
    }}>
      <ResponsiveContainer>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '16px',
          paddingBottom: '16px',
          minHeight: '64px'
        }}>
          <div style={{ 
            minWidth: 0, 
            flex: 1,
            marginRight: actions ? '16px' : 0
          }}>
            <h1 style={{
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: '700',
              color: '#111827',
              margin: 0,
              lineHeight: '1.2'
            }}>
              {title}
            </h1>
            {subtitle && (
              <p style={{
                marginTop: '4px',
                fontSize: '14px',
                color: '#6b7280',
                margin: 0
              }}>
                {subtitle}
              </p>
            )}
          </div>
          
          {actions && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? '8px' : '12px',
              flexShrink: 0
            }}>
              {actions}
            </div>
          )}
        </div>
        
        {navigation && (
          <nav style={{
            borderTop: '1px solid #f3f4f6',
            paddingTop: '12px',
            paddingBottom: '12px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}>
            <div style={{
              display: 'flex',
              gap: isMobile ? '4px' : '8px',
              minWidth: 'max-content'
            }}>
              {navigation}
            </div>
          </nav>
        )}
      </ResponsiveContainer>
    </header>
  );
};

// Responsive grid component
export const ResponsiveGrid = ({ 
  children, 
  columns = { sm: 1, md: 2, lg: 3 },
  gap = '24px',
  className = ''
}) => {
  const [screenSize, setScreenSize] = React.useState('lg');

  React.useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      if (width < 640) setScreenSize('sm');
      else if (width < 768) setScreenSize('md');
      else if (width < 1024) setScreenSize('lg');
      else setScreenSize('xl');
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  const getColumnCount = () => {
    if (screenSize === 'sm') return columns.sm || 1;
    if (screenSize === 'md') return columns.md || 2;
    if (screenSize === 'lg') return columns.lg || 3;
    return columns.xl || columns.lg || 3;
  };

  return (
    <div 
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${getColumnCount()}, 1fr)`,
        gap: gap,
        width: '100%'
      }}
    >
      {children}
    </div>
  );
};

// Mobile-friendly button component
export const ResponsiveButton = ({ 
  children, 
  variant = 'primary',
  size = 'md',
  icon,
  onClick,
  disabled = false,
  className = '',
  ...props
}) => {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const variants = {
    primary: {
      backgroundColor: '#3b82f6',
      color: 'white',
      border: 'none'
    },
    secondary: {
      backgroundColor: 'white',
      color: '#374151',
      border: '1px solid #d1d5db'
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#6b7280',
      border: 'none'
    }
  };

  const sizes = {
    sm: {
      padding: isMobile ? '8px 12px' : '6px 12px',
      fontSize: '14px',
      minHeight: isMobile ? '44px' : '32px'
    },
    md: {
      padding: isMobile ? '12px 16px' : '8px 16px',
      fontSize: '14px',
      minHeight: isMobile ? '44px' : '36px'
    },
    lg: {
      padding: isMobile ? '16px 20px' : '12px 20px',
      fontSize: '16px',
      minHeight: isMobile ? '48px' : '40px'
    }
  };

  return (
    <button
      className={className}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variants[variant],
        ...sizes[size],
        borderRadius: '8px',
        fontWeight: '500',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: icon ? '8px' : 0,
        transition: 'all 0.2s ease',
        touchAction: 'manipulation', // Better touch response
        userSelect: 'none',
        outline: 'none',
        ...props.style
      }}
      {...props}
    >
      {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
      {children}
    </button>
  );
};

// Responsive card component
export const ResponsiveCard = ({ 
  children, 
  padding = true,
  className = '',
  hover = false,
  ...props 
}) => {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      className={className}
      style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        padding: padding ? (isMobile ? '16px' : '24px') : 0,
        boxShadow: hover ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 'none',
        transition: 'all 0.2s ease',
        ...props.style
      }}
      {...props}
    >
      {children}
    </div>
  );
};

// Hook for responsive behavior
export const useResponsive = () => {
  const [screenSize, setScreenSize] = React.useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const [breakpoint, setBreakpoint] = React.useState('lg');

  React.useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({ width, height });
      
      if (width < 640) setBreakpoint('sm');
      else if (width < 768) setBreakpoint('md');
      else if (width < 1024) setBreakpoint('lg');
      else if (width < 1280) setBreakpoint('xl');
      else setBreakpoint('2xl');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    screenSize,
    breakpoint,
    isMobile: screenSize.width < 768,
    isTablet: screenSize.width >= 768 && screenSize.width < 1024,
    isDesktop: screenSize.width >= 1024
  };
};

export default {
  ResponsiveContainer,
  ResponsiveHeader,
  ResponsiveGrid,
  ResponsiveButton,
  ResponsiveCard,
  useResponsive
};