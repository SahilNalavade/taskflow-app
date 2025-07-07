import React, { useState, useEffect } from 'react';
import { Activity, MessageCircle, CheckCircle2, UserPlus, FileText, Clock, Users, Search, Filter, RefreshCw, Download, Calendar, Eye, EyeOff } from 'lucide-react';
import { demoTeamService } from '../services/demoTeamService';
import { ResponsiveContainer, ResponsiveCard, ResponsiveButton, useResponsive } from './ui/ResponsiveLayout';
import { AdvancedSearchBar, FilterPanel, useAdvancedSearch } from './ui/AdvancedSearch';
import { LoadingWrapper, ActivityFeedSkeleton } from './ui/LoadingStates';
import { useKeyboardShortcuts } from './ui/KeyboardShortcuts';
import { HelpButton } from './ui/HelpSystem';
import { useAnnouncer } from './ui/AccessibleComponents';

const ActivityFeed = ({ compact = false, currentUser, currentTeam, globalSearch = '' }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const { isMobile } = useResponsive();
  const { announce } = useAnnouncer();
  
  // Enhanced search and filtering
  const searchConfig = {
    searchFields: ['message', 'userDisplayName', 'taskTitle']
  };
  
  const {
    query,
    setQuery,
    filters,
    setFilters,
    results: searchResults,
    resultCount,
    totalCount: searchTotalCount,
    clearFilters: clearSearchFilters
  } = useAdvancedSearch(activities, searchConfig);
  
  // Update search when global search changes
  useEffect(() => {
    if (globalSearch !== query) {
      setQuery(globalSearch);
    }
  }, [globalSearch, query, setQuery]);
  
  // Enhanced keyboard shortcuts
  useKeyboardShortcuts({
    'MOD+R': () => {
      handleRefresh();
    },
    'MOD+F': () => {
      document.querySelector('[data-activity-search]')?.focus();
    },
    'MOD+T': () => {
      setRealTimeEnabled(!realTimeEnabled);
      announce(`Real-time updates ${!realTimeEnabled ? 'enabled' : 'disabled'}`, 'polite');
    },
    'ESC': () => {
      setShowFilters(false);
      setQuery('');
      setFilters({});
    }
  });

  useEffect(() => {
    loadActivityFeed();
    
    // Real-time updates with user control
    let interval;
    if (realTimeEnabled && !compact) {
      interval = setInterval(() => {
        loadActivityFeed(false);
      }, 30000); // Update every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [realTimeEnabled, compact]);

  const loadActivityFeed = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const [activityData, membersData] = await Promise.all([
        demoTeamService.getRecentActivity(compact ? 5 : 50),
        demoTeamService.getTeamMembers()
      ]);
      setActivities(activityData);
      setTeamMembers(membersData);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading activity feed:', error);
      announce('Failed to load activity feed', 'assertive');
    } finally {
      if (showLoading) setLoading(false);
    }
  };
  
  const handleRefresh = async () => {
    await loadActivityFeed(false);
    announce('Activity feed refreshed', 'polite');
  };
  
  const exportActivities = () => {
    const displayActivities = query || Object.keys(filters).length > 0 ? searchResults : activities;
    const data = displayActivities.map(activity => ({
      timestamp: activity.timestamp,
      type: activity.type,
      user: activity.userDisplayName,
      message: activity.message,
      taskTitle: activity.taskTitle || '',
      taskId: activity.taskId || ''
    }));
    
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTeam?.name || 'team'}-activity-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    announce('Activity data exported successfully', 'polite');
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
      <LoadingWrapper
        loading={true}
        skeleton={<ActivityFeedSkeleton compact={compact} />}
      />
    );
  }
  
  const displayActivities = query || Object.keys(filters).length > 0 ? searchResults : activities;

  return (
    <ResponsiveContainer maxWidth={compact ? 'md' : 'xl'}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        {/* Enhanced Header */}
        <div style={{
          padding: isMobile ? '12px 16px' : '16px 20px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              color: '#6b7280'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                backgroundColor: realTimeEnabled ? '#10b981' : '#9ca3af',
                borderRadius: '50%'
              }} />
              <span style={{ fontWeight: '500' }}>
                {realTimeEnabled ? 'Live' : 'Paused'}
              </span>
            </div>
          </div>
          
          {!compact && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              {/* Last refresh time */}
              <span style={{ fontSize: '11px', color: '#6b7280' }}>
                Updated {formatTimestamp(lastRefresh)}
              </span>
              
              {/* Real-time toggle */}
              <button
                onClick={() => {
                  setRealTimeEnabled(!realTimeEnabled);
                  announce(`Real-time updates ${!realTimeEnabled ? 'enabled' : 'disabled'}`, 'polite');
                }}
                style={{
                  padding: '4px 8px',
                  backgroundColor: 'transparent',
                  border: '1px solid #cbd5e1',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                title={`${realTimeEnabled ? 'Disable' : 'Enable'} real-time updates`}
              >
                {realTimeEnabled ? <EyeOff style={{ width: '12px', height: '12px' }} /> : <Eye style={{ width: '12px', height: '12px' }} />}
                {realTimeEnabled ? 'Pause' : 'Resume'}
              </button>
              
              {/* Refresh button */}
              <ResponsiveButton
                variant="ghost"
                size="sm"
                icon={<RefreshCw />}
                onClick={handleRefresh}
                title="Refresh activity feed (⌘+R)"
              />
              
              {/* Export button */}
              <ResponsiveButton
                variant="ghost"
                size="sm"
                icon={<Download />}
                onClick={exportActivities}
                disabled={activities.length === 0}
                title="Export activity data"
              />
              
              {/* Help button */}
              <HelpButton
                size="sm"
                content={{
                  title: "Activity Feed Help",
                  description: "Track team activity with real-time updates and advanced filtering.",
                  sections: [
                    {
                      title: "Keyboard Shortcuts",
                      items: [
                        "⌘+R - Refresh feed",
                        "⌘+F - Focus search",
                        "⌘+T - Toggle real-time updates",
                        "ESC - Clear filters"
                      ]
                    },
                    {
                      title: "Features",
                      items: [
                        "Search activity by user or content",
                        "Filter by activity type",
                        "Export activity data",
                        "Real-time updates with pause/resume"
                      ]
                    }
                  ]
                }}
              />
            </div>
          )}
        </div>
        
        {/* Enhanced Search and Filter Bar */}
        {!compact && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#fafbfc',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <AdvancedSearchBar
              onSearch={setQuery}
              placeholder="Search activity..."
              data-activity-search="true"
              style={{ flex: 1, minWidth: '200px' }}
              compact
            />
            
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              options={{
                type: [
                  { value: 'task_completed', label: 'Task Completed' },
                  { value: 'comment_added', label: 'Comment Added' },
                  { value: 'task_assigned', label: 'Task Assigned' },
                  { value: 'task_created', label: 'Task Created' },
                  { value: 'status_changed', label: 'Status Changed' }
                ],
                user: teamMembers.map(member => ({
                  value: member.id,
                  label: member.name
                }))
              }}
              isOpen={showFilters}
              onToggle={() => setShowFilters(!showFilters)}
              compact
            />
            
            {(query || Object.keys(filters).length > 0) && (
              <div style={{
                fontSize: '12px',
                color: '#6b7280',
                padding: '4px 8px',
                backgroundColor: '#e5e7eb',
                borderRadius: '4px'
              }}>
                {resultCount} of {searchTotalCount} activities
              </div>
            )}
          </div>
        )}

        {/* Enhanced Activity List */}
        <div style={{
          maxHeight: compact ? '300px' : '500px',
          overflowY: 'auto',
          padding: '12px'
        }}>
          {displayActivities.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px 24px',
              color: '#6b7280'
            }}>
              {(query || Object.keys(filters).length > 0) ? (
                <>
                  <Search style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#9ca3af' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#111827' }}>
                    No activities found
                  </h3>
                  <p style={{ marginBottom: '16px', fontSize: '14px' }}>
                    Try adjusting your search or filter criteria
                  </p>
                  <ResponsiveButton
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setQuery('');
                      setFilters({});
                    }}
                  >
                    Clear Search
                  </ResponsiveButton>
                </>
              ) : (
                <>
                  <Activity style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#9ca3af' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', color: '#111827' }}>
                    No recent activity
                  </h3>
                  <p style={{ fontSize: '14px' }}>
                    Team activity will appear here as members work on tasks
                  </p>
                </>
              )}
            </div>
          ) : (
            displayActivities.map((activity, index) => (
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
            ))
          )}
        </div>

        {/* Enhanced Team Members Online Footer */}
        {!compact && teamMembers.length > 0 && (
          <div style={{
            padding: '12px 20px',
            borderTop: '1px solid #e5e7eb',
            backgroundColor: '#f8fafc'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '8px',
              marginBottom: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                  Team Members Online ({teamMembers.filter(m => m.isOnline).length})
                </span>
              </div>
              
              <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                {displayActivities.length} recent activities
              </div>
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
    </ResponsiveContainer>
  );
};

export default ActivityFeed;