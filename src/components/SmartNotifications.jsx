import React, { useState, useEffect } from 'react';
import { 
  Bell, BellRing, X, Check, User, MessageCircle, 
  Calendar, AlertTriangle, Award, Users, Settings,
  Filter, Search, MoreHorizontal, CheckCircle2
} from 'lucide-react';
import { realtimeEngine } from '../services/realtimeEngine';
import { demoData } from '../services/demoData';

const SmartNotifications = ({ currentUser }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'mentions', 'assignments', 'deadlines'
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Initialize with some demo notifications
    const demoNotifications = [
      {
        id: 'notif_1',
        type: 'mention',
        title: 'You were mentioned in a comment',
        message: '@you Great work on the frontend updates! The new design looks amazing.',
        taskId: 'task_001',
        taskTitle: 'User Interface Redesign',
        fromUser: 'sarah_chen',
        fromUserName: 'Sarah Chen',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        read: false,
        priority: 'medium'
      },
      {
        id: 'notif_2',
        type: 'assignment',
        title: 'New task assigned to you',
        message: 'Database Optimization task has been assigned to you with high priority.',
        taskId: 'task_002',
        taskTitle: 'Database Optimization',
        fromUser: 'mike_johnson',
        fromUserName: 'Mike Johnson',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        read: false,
        priority: 'high'
      },
      {
        id: 'notif_3',
        type: 'deadline',
        title: 'Task deadline approaching',
        message: 'Mobile App Testing is due tomorrow. Current progress: 75% complete.',
        taskId: 'task_003',
        taskTitle: 'Mobile App Testing',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: true,
        priority: 'high'
      },
      {
        id: 'notif_4',
        type: 'collaboration',
        title: 'Team member joined project',
        message: 'Jordan Smith has joined the project and is ready to collaborate.',
        fromUser: 'jordan_smith',
        fromUserName: 'Jordan Smith',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        read: true,
        priority: 'low'
      },
      {
        id: 'notif_5',
        type: 'achievement',
        title: 'Milestone completed!',
        message: 'Your team has completed 25 tasks this month. Great teamwork!',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        read: false,
        priority: 'medium'
      }
    ];

    setNotifications(demoNotifications);
    setUnreadCount(demoNotifications.filter(n => !n.read).length);

    // Listen for new notifications
    const unsubscribeAssignment = realtimeEngine.on('task_assigned', (data) => {
      if (data.assigneeId === currentUser.id) {
        addNotification({
          type: 'assignment',
          title: 'New task assigned to you',
          message: `${data.taskTitle || 'A task'} has been assigned to you.`,
          taskId: data.taskId,
          fromUser: data.assignedBy,
          priority: 'high'
        });
      }
    });

    const unsubscribeMention = realtimeEngine.on('user_mentioned', (data) => {
      if (data.mentionedUserId === currentUser.id) {
        addNotification({
          type: 'mention',
          title: 'You were mentioned',
          message: data.message,
          taskId: data.taskId,
          fromUser: data.fromUser,
          priority: 'medium'
        });
      }
    });

    const unsubscribeComment = realtimeEngine.on('comment_added', (data) => {
      // Notify if it's on a task assigned to current user
      addNotification({
        type: 'comment',
        title: 'New comment on your task',
        message: data.comment,
        taskId: data.taskId,
        fromUser: data.userId,
        priority: 'low'
      });
    });

    return () => {
      unsubscribeAssignment();
      unsubscribeMention();
      unsubscribeComment();
    };
  }, [currentUser.id]);

  const addNotification = (notificationData) => {
    const newNotification = {
      id: `notif_${Date.now()}`,
      ...notificationData,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 19)]); // Keep last 20
    setUnreadCount(prev => prev + 1);

    // Auto-dismiss low priority notifications after 10 seconds
    if (notificationData.priority === 'low') {
      setTimeout(() => {
        markAsRead(newNotification.id);
      }, 10000);
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    const notif = notifications.find(n => n.id === notificationId);
    if (notif && !notif.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const getFilteredNotifications = () => {
    switch (filter) {
      case 'mentions':
        return notifications.filter(n => n.type === 'mention');
      case 'assignments':
        return notifications.filter(n => n.type === 'assignment');
      case 'deadlines':
        return notifications.filter(n => n.type === 'deadline');
      default:
        return notifications;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'mention': return MessageCircle;
      case 'assignment': return User;
      case 'deadline': return Calendar;
      case 'collaboration': return Users;
      case 'achievement': return Award;
      case 'comment': return MessageCircle;
      default: return Bell;
    }
  };

  const getNotificationColor = (type, priority) => {
    if (priority === 'high') return '#ef4444';
    if (priority === 'medium') return '#f59e0b';
    
    switch (type) {
      case 'mention': return '#3b82f6';
      case 'assignment': return '#8b5cf6';
      case 'deadline': return '#ef4444';
      case 'collaboration': return '#10b981';
      case 'achievement': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <div style={{ position: 'relative' }}>
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        style={{
          position: 'relative',
          padding: '8px',
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          color: '#6b7280'
        }}
      >
        {unreadCount > 0 ? (
          <BellRing style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
        ) : (
          <Bell style={{ width: '20px', height: '20px' }} />
        )}
        
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            width: '16px',
            height: '16px',
            backgroundColor: '#ef4444',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '10px',
            fontWeight: '600'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </div>
        )}
      </button>

      {/* Notifications Panel */}
      {showNotifications && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          marginTop: '8px',
          width: '400px',
          maxHeight: '600px',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f8fafc'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
                Notifications ({unreadCount} unread)
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setShowNotifications(false)}
                  style={{
                    padding: '4px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    color: '#6b7280'
                  }}
                >
                  <X style={{ width: '14px', height: '14px' }} />
                </button>
              </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {[
                { key: 'all', label: 'All' },
                { key: 'mentions', label: 'Mentions' },
                { key: 'assignments', label: 'Tasks' },
                { key: 'deadlines', label: 'Deadlines' }
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key)}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: filter === filterOption.key ? '#3b82f6' : 'transparent',
                    color: filter === filterOption.key ? 'white' : '#6b7280',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  {filterOption.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div style={{ 
            maxHeight: '400px', 
            overflowY: 'auto',
            padding: '8px 0'
          }}>
            {filteredNotifications.length === 0 ? (
              <div style={{
                padding: '32px 16px',
                textAlign: 'center',
                color: '#6b7280'
              }}>
                <Bell style={{ width: '24px', height: '24px', margin: '0 auto 8px', opacity: 0.5 }} />
                <div style={{ fontSize: '14px' }}>No notifications</div>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const IconComponent = getNotificationIcon(notification.type);
                const color = getNotificationColor(notification.type, notification.priority);

                return (
                  <div
                    key={notification.id}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #f3f4f6',
                      backgroundColor: notification.read ? 'transparent' : '#eff6ff',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        backgroundColor: `${color}20`,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <IconComponent style={{ width: '16px', height: '16px', color }} />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                          <h4 style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            margin: 0,
                            color: '#111827'
                          }}>
                            {notification.title}
                          </h4>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontSize: '11px', color: '#6b7280' }}>
                              {formatTimestamp(notification.timestamp)}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              style={{
                                padding: '2px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                borderRadius: '2px',
                                cursor: 'pointer',
                                color: '#9ca3af',
                                opacity: 0.6
                              }}
                            >
                              <X style={{ width: '10px', height: '10px' }} />
                            </button>
                          </div>
                        </div>

                        <p style={{
                          fontSize: '12px',
                          color: '#6b7280',
                          margin: 0,
                          marginBottom: '4px',
                          lineHeight: '1.4'
                        }}>
                          {notification.message}
                        </p>

                        {notification.taskTitle && (
                          <div style={{ fontSize: '11px', color: '#3b82f6', fontWeight: '500' }}>
                            {notification.taskTitle}
                          </div>
                        )}

                        {notification.fromUserName && (
                          <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                            From: {notification.fromUserName}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Settings Footer */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid #e5e7eb',
            backgroundColor: '#f8fafc'
          }}>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 8px',
                backgroundColor: 'transparent',
                color: '#6b7280',
                border: 'none',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              <Settings style={{ width: '12px', height: '12px' }} />
              Notification Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartNotifications;