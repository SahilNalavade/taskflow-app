import React, { useState, useEffect, useRef } from 'react';
import { realtimeEngine } from '../services/realtimeEngine';

const CollaborativeCursor = ({ elementId, children, showCursors = true }) => {
  const [cursors, setCursors] = useState({});
  const containerRef = useRef(null);
  const currentUser = realtimeEngine.userId;

  useEffect(() => {
    if (!showCursors) return;

    // Listen for cursor movements
    const unsubscribe = realtimeEngine.on('cursor_moved', (data, event) => {
      if (event.userId !== currentUser && data.elementId === elementId) {
        setCursors(prev => ({
          ...prev,
          [event.userId]: {
            ...data,
            userName: event.userName,
            timestamp: data.timestamp
          }
        }));

        // Remove stale cursors
        setTimeout(() => {
          setCursors(prev => {
            const updated = { ...prev };
            const cursorData = updated[event.userId];
            if (cursorData && cursorData.timestamp === data.timestamp) {
              delete updated[event.userId];
            }
            return updated;
          });
        }, 5000); // Remove after 5 seconds
      }
    });

    return unsubscribe;
  }, [elementId, currentUser, showCursors]);

  const handleMouseMove = (e) => {
    if (!showCursors || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Throttle cursor updates
    if (!handleMouseMove.lastUpdate || Date.now() - handleMouseMove.lastUpdate > 100) {
      realtimeEngine.setCursorPosition(elementId, { x, y });
      handleMouseMove.lastUpdate = Date.now();
    }
  };

  const getCursorColor = (userId) => {
    // Generate consistent color for each user
    const colors = [
      '#3b82f6', // blue
      '#10b981', // green
      '#f59e0b', // amber
      '#ef4444', // red
      '#8b5cf6', // violet
      '#06b6d4', // cyan
      '#84cc16', // lime
      '#f97316'  // orange
    ];
    
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      style={{ position: 'relative', width: '100%', height: '100%' }}
    >
      {children}
      
      {/* Render collaborative cursors */}
      {showCursors && Object.keys(cursors).map(userId => {
        const cursor = cursors[userId];
        const color = getCursorColor(userId);
        
        return (
          <div
            key={userId}
            style={{
              position: 'absolute',
              left: cursor.position.x,
              top: cursor.position.y,
              pointerEvents: 'none',
              zIndex: 1000,
              transform: 'translate(-2px, -2px)'
            }}
          >
            {/* Cursor */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
              }}
            >
              <path
                d="M0 0 L0 16 L4 12 L7 12 L12 20 L14 19 L9 11 L12 11 Z"
                fill={color}
                stroke="white"
                strokeWidth="1"
              />
            </svg>
            
            {/* User name label */}
            <div
              style={{
                position: 'absolute',
                left: '20px',
                top: '0px',
                backgroundColor: color,
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                animation: 'cursor-fade-in 0.3s ease-out'
              }}
            >
              {cursor.userName}
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes cursor-fade-in {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default CollaborativeCursor;