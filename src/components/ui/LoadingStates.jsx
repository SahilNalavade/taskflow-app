import React from 'react';

// CSS-in-JS animation for skeleton loading
const skeletonAnimation = {
  animation: 'skeleton-loading 1.5s ease-in-out infinite',
  background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
  backgroundSize: '200% 100%'
};

// Add the keyframes using a style tag (will be injected once)
if (typeof document !== 'undefined' && !document.querySelector('#skeleton-styles')) {
  const style = document.createElement('style');
  style.id = 'skeleton-styles';
  style.textContent = `
    @keyframes skeleton-loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;
  document.head.appendChild(style);
}

// Basic skeleton line component
export const SkeletonLine = ({ 
  width = '100%', 
  height = '16px', 
  borderRadius = '4px',
  className = '',
  style = {}
}) => (
  <div
    className={className}
    style={{
      width,
      height,
      borderRadius,
      ...skeletonAnimation,
      ...style
    }}
  />
);

// Skeleton circle (for avatars)
export const SkeletonCircle = ({ 
  size = '40px',
  className = '',
  style = {}
}) => (
  <div
    className={className}
    style={{
      width: size,
      height: size,
      borderRadius: '50%',
      flexShrink: 0,
      ...skeletonAnimation,
      ...style
    }}
  />
);

// Skeleton card component
export const SkeletonCard = ({ 
  children,
  padding = '24px',
  className = '',
  style = {}
}) => (
  <div
    className={className}
    style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      padding: padding,
      ...style
    }}
  >
    {children}
  </div>
);

// Task card skeleton
export const TaskCardSkeleton = ({ isMobile = false }) => (
  <SkeletonCard padding={isMobile ? '16px' : '20px'}>
    <div style={{ marginBottom: '12px' }}>
      <SkeletonLine width="75%" height="18px" style={{ marginBottom: '8px' }} />
      <SkeletonLine width="90%" height="14px" />
    </div>
    <div style={{ marginBottom: '16px' }}>
      <SkeletonLine width="60%" height="12px" style={{ marginBottom: '4px' }} />
      <SkeletonLine width="40%" height="12px" />
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <SkeletonCircle size="24px" />
      <SkeletonLine width="80px" height="12px" />
    </div>
  </SkeletonCard>
);

// Team member card skeleton
export const TeamMemberSkeleton = ({ isMobile = false }) => (
  <SkeletonCard padding={isMobile ? '16px' : '20px'}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <SkeletonCircle size={isMobile ? '48px' : '56px'} />
      <div style={{ flex: 1 }}>
        <SkeletonLine width="60%" height="16px" style={{ marginBottom: '6px' }} />
        <SkeletonLine width="80%" height="14px" style={{ marginBottom: '6px' }} />
        <SkeletonLine width="40%" height="12px" />
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <SkeletonLine width="60px" height="32px" borderRadius="6px" />
        <SkeletonLine width="32px" height="32px" borderRadius="6px" />
      </div>
    </div>
  </SkeletonCard>
);

// Dashboard header skeleton
export const HeaderSkeleton = ({ isMobile = false }) => (
  <div style={{
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    padding: isMobile ? '16px' : '16px 24px'
  }}>
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <SkeletonLine width="120px" height="24px" />
        <SkeletonLine width="150px" height="36px" borderRadius="8px" />
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {!isMobile && (
          <>
            <SkeletonLine width="100px" height="36px" borderRadius="8px" />
            <SkeletonLine width="120px" height="36px" borderRadius="8px" />
            <SkeletonLine width="140px" height="36px" borderRadius="8px" />
          </>
        )}
        <SkeletonCircle size="36px" />
      </div>
    </div>
  </div>
);

// Task board skeleton
export const TaskBoardSkeleton = ({ isMobile = false }) => {
  const columns = isMobile ? 1 : 3;
  
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
      gap: '24px',
      padding: '24px'
    }}>
      {Array.from({ length: columns }).map((_, columnIndex) => (
        <div key={columnIndex}>
          <SkeletonLine 
            width="80px" 
            height="20px" 
            style={{ marginBottom: '16px' }} 
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Array.from({ length: 3 }).map((_, taskIndex) => (
              <TaskCardSkeleton key={taskIndex} isMobile={isMobile} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// Team list skeleton
export const TeamListSkeleton = ({ count = 3, isMobile = false }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
    {Array.from({ length: count }).map((_, index) => (
      <TeamMemberSkeleton key={index} isMobile={isMobile} />
    ))}
  </div>
);

// Activity feed skeleton
export const ActivityFeedSkeleton = ({ count = 5, isMobile = false }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} padding={isMobile ? '16px' : '20px'}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <SkeletonCircle size="32px" />
          <div style={{ flex: 1 }}>
            <SkeletonLine width="40%" height="14px" style={{ marginBottom: '4px' }} />
            <SkeletonLine width="60%" height="12px" />
          </div>
          <SkeletonLine width="60px" height="12px" />
        </div>
        <SkeletonLine width="90%" height="14px" style={{ marginBottom: '4px' }} />
        <SkeletonLine width="70%" height="14px" />
      </SkeletonCard>
    ))}
  </div>
);

// Generic page skeleton
export const PageSkeleton = ({ isMobile = false }) => (
  <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
    <HeaderSkeleton isMobile={isMobile} />
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: isMobile ? '16px' : '24px'
    }}>
      <div style={{ marginBottom: '24px' }}>
        <SkeletonLine width="300px" height="32px" style={{ marginBottom: '8px' }} />
        <SkeletonLine width="500px" height="16px" />
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px'
      }}>
        {Array.from({ length: isMobile ? 2 : 4 }).map((_, index) => (
          <SkeletonCard key={index}>
            <SkeletonLine width="80%" height="20px" style={{ marginBottom: '16px' }} />
            <SkeletonLine width="100%" height="14px" style={{ marginBottom: '8px' }} />
            <SkeletonLine width="90%" height="14px" style={{ marginBottom: '8px' }} />
            <SkeletonLine width="60%" height="14px" />
          </SkeletonCard>
        ))}
      </div>
    </div>
  </div>
);

// Loading wrapper that shows skeleton while content loads
export const LoadingWrapper = ({ 
  loading, 
  skeleton, 
  children,
  fallback = null 
}) => {
  if (loading) {
    return skeleton || fallback || <PageSkeleton />;
  }
  return children;
};

// Hook for loading states
export const useLoadingState = (initialState = false) => {
  const [loading, setLoading] = React.useState(initialState);
  
  const startLoading = React.useCallback(() => setLoading(true), []);
  const stopLoading = React.useCallback(() => setLoading(false), []);
  
  return {
    loading,
    startLoading,
    stopLoading,
    setLoading
  };
};

export default {
  SkeletonLine,
  SkeletonCircle,
  SkeletonCard,
  TaskCardSkeleton,
  TeamMemberSkeleton,
  HeaderSkeleton,
  TaskBoardSkeleton,
  TeamListSkeleton,
  ActivityFeedSkeleton,
  PageSkeleton,
  LoadingWrapper,
  useLoadingState
};