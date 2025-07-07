import React, { useState, useEffect } from 'react';
import { Edit3, MessageCircle } from 'lucide-react';
import { realtimeEngine } from '../services/realtimeEngine';

const TypingIndicator = ({ context = null, compact = false }) => {
  const [typingUsers, setTypingUsers] = useState({});

  useEffect(() => {
    // Get initial typing status
    const initialTyping = realtimeEngine.getTypingUsers(context);
    setTypingUsers(initialTyping);

    // Listen for typing updates
    const unsubscribe = realtimeEngine.on('typing_status_changed', (data) => {
      const filtered = {};
      Object.keys(data).forEach(userId => {
        const typing = data[userId];
        if (!context || typing.context === context) {
          filtered[userId] = typing;
        }
      });
      setTypingUsers(filtered);
    });

    // Update typing status periodically
    const interval = setInterval(() => {
      const currentTyping = realtimeEngine.getTypingUsers(context);
      setTypingUsers(currentTyping);
    }, 2000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [context]);

  const typingUsersList = Object.values(typingUsers);

  if (typingUsersList.length === 0) {
    return null;
  }

  const getTypingText = () => {
    const names = typingUsersList.map(user => user.name);
    
    if (names.length === 1) {
      return `${names[0]} is typing...`;
    } else if (names.length === 2) {
      return `${names.join(' and ')} are typing...`;
    } else {
      return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]} are typing...`;
    }
  };

  if (compact) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        color: '#6b7280',
        fontSize: '12px',
        fontStyle: 'italic'
      }}>
        <div style={{
          display: 'flex',
          gap: '2px'
        }}>
          {[0, 1, 2].map((dot) => (
            <div
              key={dot}
              style={{
                width: '4px',
                height: '4px',
                backgroundColor: '#6b7280',
                borderRadius: '50%',
                animation: `typing-dot 1.4s infinite ease-in-out`,
                animationDelay: `${dot * 0.16}s`
              }}
            />
          ))}
        </div>
        <span>{typingUsersList.length} typing</span>
        
        <style>{`
          @keyframes typing-dot {
            0%, 80%, 100% {
              transform: scale(0.8);
              opacity: 0.5;
            }
            40% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      backgroundColor: '#f3f4f6',
      borderRadius: '16px',
      border: '1px solid #e5e7eb',
      fontSize: '13px',
      color: '#6b7280',
      fontStyle: 'italic'
    }}>
      {/* Typing Animation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <Edit3 style={{ width: '12px', height: '12px', color: '#3b82f6' }} />
        <div style={{
          display: 'flex',
          gap: '2px',
          alignItems: 'center'
        }}>
          {[0, 1, 2].map((dot) => (
            <div
              key={dot}
              style={{
                width: '4px',
                height: '4px',
                backgroundColor: '#3b82f6',
                borderRadius: '50%',
                animation: `typing-pulse 1.4s infinite ease-in-out`,
                animationDelay: `${dot * 0.16}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Typing Text */}
      <span>{getTypingText()}</span>

      {/* User Avatars */}
      <div style={{
        display: 'flex',
        gap: '4px',
        marginLeft: '4px'
      }}>
        {typingUsersList.slice(0, 3).map((user, index) => (
          <div
            key={index}
            style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#3b82f6',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '8px',
              fontWeight: '600',
              border: '2px solid white',
              marginLeft: index > 0 ? '-8px' : '0'
            }}
          >
            {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
        ))}
        {typingUsersList.length > 3 && (
          <div style={{
            width: '20px',
            height: '20px',
            backgroundColor: '#6b7280',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '8px',
            fontWeight: '600',
            border: '2px solid white',
            marginLeft: '-8px'
          }}>
            +{typingUsersList.length - 3}
          </div>
        )}
      </div>

      <style>{`
        @keyframes typing-pulse {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1.2);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default TypingIndicator;