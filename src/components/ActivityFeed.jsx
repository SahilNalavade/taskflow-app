import React, { useState, useEffect } from 'react';
import { Activity, MessageCircle, CheckCircle2, UserPlus, FileText, Clock, Users } from 'lucide-react';
import { demoTeamService } from '../services/demoTeamService';

const ActivityFeed = ({ compact = false }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    loadActivityFeed();
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      loadActivityFeed();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const loadActivityFeed = async () => {
    try {
      const [activityData, membersData] = await Promise.all([
        demoTeamService.getRecentActivity(compact ? 5 : 15),
        demoTeamService.getTeamMembers()
      ]);
      setActivities(activityData);
      setTeamMembers(membersData);
    } catch (error) {
      console.error('Error loading activity feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'task_completed':
        return <CheckCircle2 style={{ width: '16px', height: '16px', color: '#10b981' }} />;
      case 'comment_added':
        return <MessageCircle style={{ width: '16px', height: '16px', color: '#3b82f6' }} />;
      case 'task_assigned':
        return <UserPlus style={{ width: '16px', height: '16px', color: '#f59e0b' }} />;
      case 'task_created':
        return <FileText style={{ width: '16px', height: '16px', color: '#8b5cf6' }} />;
      case 'status_changed':
        return <Activity style={{ width: '16px', height: '16px', color: '#6b7280' }} />;
      default:
        return <Activity style={{ width: '16px', height: '16px', color: '#6b7280' }} />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'task_completed':
        return '#10b981';
      case 'comment_added':
        return '#3b82f6';
      case 'task_assigned':
        return '#f59e0b';
      case 'task_created':
        return '#8b5cf6';
      case 'status_changed':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getAvatarInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const isUserOnline = (userId) => {
    const member = teamMembers.find(m => m.id === userId);
    return member?.isOnline || false;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: compact ? '100px' : '200px',
        color: '#6b7280'
      }}>
        <div style={{
          width: '20px',
          height: '20px',
          border: '2px solid #f3f4f6',
          borderTop: '2px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Activity style={{ width: '18px', height: '18px', color: '#3b82f6' }} />
        <h3 style={{
          fontSize: compact ? '16px' : '18px',
          fontWeight: '600',
          color: '#111827',
          margin: 0
        }}>
          Team Activity
        </h3>
        <div style={{
          width: '8px',
          height: '8px',
          backgroundColor: '#10b981',
          borderRadius: '50%',
          marginLeft: 'auto'
        }} />
        <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '500' }}>
          Live
        </span>
      </div>

      {/* Activity List */}
      <div style={{
        maxHeight: compact ? '300px' : '500px',
        overflowY: 'auto',
        padding: '12px'
      }}>
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            style={{
              display: 'flex',
              gap: '12px',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: index !== activities.length - 1 ? '4px' : 0,
              backgroundColor: 'white',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
          >
            {/* User Avatar */}
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#3b82f6',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px',
                fontWeight: '600',
                flexShrink: 0
              }}>
                {getAvatarInitials(activity.userName)}
              </div>
              
              {/* Online indicator */}
              {isUserOnline(activity.userId) && (
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  width: '12px',
                  height: '12px',
                  backgroundColor: '#10b981',
                  border: '2px solid white',
                  borderRadius: '50%'
                }} />
              )}
            </div>

            {/* Activity Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '4px'
              }}>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#111827'
                }}>
                  {activity.userName}
                </span>
                <span style={{
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  {activity.message}
                </span>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {getActivityIcon(activity.type)}
                <span style={{
                  fontSize: '12px',
                  color: '#9ca3af'
                }}>
                  {formatTimestamp(activity.timestamp)}
                </span>
              </div>
            </div>

            {/* Activity Type Indicator */}
            <div style={{
              width: '4px',
              height: '100%',
              backgroundColor: getActivityColor(activity.type),
              borderRadius: '2px',
              flexShrink: 0
            }} />
          </div>
        ))}

        {activities.length === 0 && (
          <div style={{
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '14px',
            padding: '32px 16px'
          }}>
            <Activity style={{ width: '32px', height: '32px', margin: '0 auto 8px', color: '#d1d5db' }} />
            <p style={{ margin: 0 }}>No recent activity</p>
          </div>
        )}
      </div>

      {/* Team Members Online */}
      {!compact && (
        <div style={{
          padding: '12px 20px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            <Users style={{ width: '14px', height: '14px', color: '#6b7280' }} />
            <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
              Team Members Online
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {teamMembers
              .filter(member => member.isOnline)
              .map((member) => (
                <div
                  key={member.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 8px',
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                >
                  <div style={{
                    position: 'relative',
                    width: '16px',
                    height: '16px',
                    backgroundColor: '#3b82f6',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '8px',
                    fontWeight: '600'
                  }}>
                    {getAvatarInitials(member.name)}
                    <div style={{
                      position: 'absolute',
                      bottom: '-1px',
                      right: '-1px',
                      width: '6px',
                      height: '6px',
                      backgroundColor: '#10b981',
                      border: '1px solid white',
                      borderRadius: '50%'
                    }} />
                  </div>
                  <span style={{ color: '#374151' }}>{member.name}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;