import React, { useState, useEffect } from 'react';
import { Users, Eye, Edit3, MessageCircle, Wifi, WifiOff } from 'lucide-react';
import { realtimeEngine } from '../services/realtimeEngine';

const PresenceIndicator = ({ userId, showDetails = false, size = 'md' }) => {
  const [presence, setPresence] = useState(null);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Get initial presence
    const initialPresence = realtimeEngine.getUserPresence(userId);
    setPresence(initialPresence);
    setIsOnline(initialPresence?.isOnline || false);

    // Listen for presence updates
    const unsubscribe = realtimeEngine.on('user_presence_changed', (data) => {
      if (data.userId === userId) {
        setPresence(data.presence);
        setIsOnline(data.presence.isOnline);
      }
    });

    return unsubscribe;
  }, [userId]);

  const getAvatarSize = () => {
    switch (size) {
      case 'sm': return { width: '20px', height: '20px', fontSize: '8px' };
      case 'md': return { width: '32px', height: '32px', fontSize: '12px' };
      case 'lg': return { width: '40px', height: '40px', fontSize: '14px' };
      default: return { width: '32px', height: '32px', fontSize: '12px' };
    }
  };

  const getIndicatorSize = () => {
    switch (size) {
      case 'sm': return { width: '6px', height: '6px' };
      case 'md': return { width: '8px', height: '8px' };
      case 'lg': return { width: '10px', height: '10px' };
      default: return { width: '8px', height: '8px' };
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getLastSeenText = (lastSeen) => {
    if (!lastSeen) return 'Unknown';
    
    const date = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const avatarSize = getAvatarSize();
  const indicatorSize = getIndicatorSize();

  if (!presence) {
    return (
      <div style={{
        ...avatarSize,
        backgroundColor: '#6b7280',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: '600',
        opacity: 0.5
      }}>
        ?
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Avatar */}
      <div style={{
        ...avatarSize,
        backgroundColor: isOnline ? '#3b82f6' : '#6b7280',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: '600',
        transition: 'all 0.2s',
        cursor: showDetails ? 'pointer' : 'default',
        opacity: isOnline ? 1 : 0.7
      }}>
        {getInitials(presence.name)}
      </div>

      {/* Online Indicator */}
      <div style={{
        position: 'absolute',
        bottom: '-2px',
        right: '-2px',
        ...indicatorSize,
        backgroundColor: isOnline ? '#10b981' : '#6b7280',
        border: '2px solid white',
        borderRadius: '50%',
        transition: 'all 0.2s'
      }} />

      {/* Activity Indicator */}
      {presence.isTyping && (
        <div style={{
          position: 'absolute',
          top: '-4px',
          right: '-4px',
          width: '12px',
          height: '12px',
          backgroundColor: '#f59e0b',
          borderRadius: '50%',
          border: '2px solid white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Edit3 style={{ width: '6px', height: '6px', color: 'white' }} />
        </div>
      )}

      {/* Detailed Tooltip */}
      {showDetails && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '8px',
          padding: '12px',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.15)',
          minWidth: '150px',
          zIndex: 1000,
          fontSize: '12px'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>
            {presence.name}
          </div>
          <div style={{ 
            color: isOnline ? '#10b981' : '#6b7280',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginBottom: '4px'
          }}>
            {isOnline ? <Wifi style={{ width: '10px', height: '10px' }} /> : <WifiOff style={{ width: '10px', height: '10px' }} />}
            {isOnline ? 'Online' : 'Offline'}
          </div>
          <div style={{ color: '#6b7280', fontSize: '11px' }}>
            Last seen: {getLastSeenText(presence.lastSeen)}
          </div>
          {presence.currentView && (
            <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '4px' }}>
              Viewing: {presence.currentView}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PresenceIndicator;