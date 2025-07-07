import React, { useState, useEffect } from 'react';
import { Users, Sparkles, ArrowRight, User, MessageCircle, Activity, Settings } from 'lucide-react';
import TeamTaskBoard from './TeamTaskBoard';
import ActivityFeed from './ActivityFeed';
import PresenceIndicator from './PresenceIndicator';
import TypingIndicator from './TypingIndicator';
import ConflictResolution from './ConflictResolution';
import SyncStatusIndicator from './SyncStatusIndicator';
import SmartNotifications from './SmartNotifications';
import TeamMemberManagement from './TeamMemberManagement';
import { demoData } from '../services/demoData';
import { realtimeEngine } from '../services/realtimeEngine';
import { sheetSyncService } from '../services/sheetSyncService';

const DemoCollaboration = ({ onSignUp, currentUser, isAuthenticatedMode = false }) => {
  const [activeView, setActiveView] = useState('board'); // 'board', 'activity', 'overview'
  const user = currentUser || demoData.user;

  useEffect(() => {
    // Initialize real-time engine for demo
    realtimeEngine.initialize(user.id, user.name);

    // Simulate other team members being online
    setTimeout(() => {
      demoData.teamMembers.forEach((member, index) => {
        if (member.id !== user.id) {
          setTimeout(() => {
            realtimeEngine.setUserPresence(member.id, {
              sessionId: `demo_session_${member.id}`,
              name: member.name,
              isOnline: Math.random() > 0.3, // 70% chance of being online
              lastSeen: new Date(Date.now() - Math.random() * 3600000).toISOString(), // Random last seen
              currentView: '/team-demo',
              isTyping: false
            });
          }, index * 500); // Stagger the presence updates
        }
      });
    }, 1000);

    // Simulate some typing activity
    const simulateTyping = () => {
      const randomMember = demoData.teamMembers[Math.floor(Math.random() * demoData.teamMembers.length)];
      if (randomMember.id !== user.id && Math.random() > 0.7) {
        realtimeEngine.setTyping(true, 'task_comment');
        setTimeout(() => {
          realtimeEngine.setTyping(false, 'task_comment');
        }, 2000 + Math.random() * 3000);
      }
    };

    // Simulate occasional conflicts for demo purposes
    const simulateConflicts = () => {
      if (Math.random() > 0.8) { // 20% chance
        const randomTask = demoData.teamTasks[Math.floor(Math.random() * demoData.teamTasks.length)];
        const randomMember = demoData.teamMembers[Math.floor(Math.random() * demoData.teamMembers.length)];
        
        if (randomMember.id !== user.id) {
          // Simulate concurrent edit
          realtimeEngine.trackEdit(randomTask.id, 'title', 'Updated task title');
          
          // Simulate remote edit slightly later
          setTimeout(() => {
            realtimeEngine.emit('task_updated', {
              taskId: randomTask.id,
              field: 'title',
              value: 'Different task title update',
              timestamp: new Date().toISOString()
            });
          }, 500);
        }
      }
    };

    const typingInterval = setInterval(simulateTyping, 10000);
    const conflictInterval = setInterval(simulateConflicts, 30000); // Check every 30 seconds

    // Enable auto-sync and start sheet update simulation
    sheetSyncService.enableAutoSync(8000); // Sync every 8 seconds for demo
    sheetSyncService.startSheetUpdateSimulation();

    // Cleanup on unmount
    return () => {
      clearInterval(typingInterval);
      clearInterval(conflictInterval);
      sheetSyncService.destroy();
      realtimeEngine.destroy();
    };
  }, [user.id, user.name]);

  const views = [
    { key: 'overview', label: 'Overview', icon: Activity },
    { key: 'board', label: 'Task Board', icon: Users },
    { key: 'activity', label: 'Activity Feed', icon: MessageCircle },
    { key: 'team', label: 'Team Management', icon: Settings }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '4px'
            }}>
              {isAuthenticatedMode ? 'Team Collaboration' : 'Team Collaboration Demo'}
            </h1>
            <p style={{ color: '#6b7280', margin: 0 }}>
              {isAuthenticatedMode ? 'Your full-featured team workspace' : 'Experience real-time team collaboration features'}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Team Presence Indicators */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px'
            }}>
              <span style={{ fontSize: '12px', color: '#6b7280', marginRight: '4px' }}>Team:</span>
              {demoData.teamMembers.slice(0, 4).map((member) => (
                <PresenceIndicator
                  key={member.id}
                  userId={member.id}
                  size="sm"
                  showDetails={false}
                />
              ))}
              {demoData.teamMembers.length > 4 && (
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  +{demoData.teamMembers.length - 4}
                </span>
              )}
            </div>

            {/* Current User */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: '#e0f2fe',
              borderRadius: '8px',
              border: '1px solid #0891b2'
            }}>
              <PresenceIndicator
                userId={user.id}
                size="sm"
                showDetails={false}
              />
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#0891b2' }}>
                {user.name} (You)
              </span>
            </div>

            {/* Notifications */}
            <SmartNotifications currentUser={user} />

            {/* Sync Status */}
            <SyncStatusIndicator compact={true} />

            <button
              onClick={onSignUp}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <User style={{ width: '16px', height: '16px' }} />
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '0 24px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          gap: '8px'
        }}>
          {views.map((view) => {
            const Icon = view.icon;
            return (
              <button
                key={view.key}
                onClick={() => setActiveView(view.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  backgroundColor: activeView === view.key ? '#3b82f6' : 'transparent',
                  color: activeView === view.key ? 'white' : '#6b7280',
                  border: 'none',
                  borderBottom: activeView === view.key ? '2px solid #3b82f6' : '2px solid transparent',
                  borderRadius: '0',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Icon style={{ width: '16px', height: '16px' }} />
                {view.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Typing Indicator */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '12px 24px 0'
      }}>
        <TypingIndicator context="task_comment" compact={true} />
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '12px 24px 24px'
      }}>
        {activeView === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            {/* Main Stats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Stats Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                {[
                  { label: 'Active Tasks', value: '5', color: '#3b82f6', change: '+2 this week' },
                  { label: 'Completed', value: '1', color: '#10b981', change: 'On track' },
                  { label: 'Team Members', value: '4', color: '#8b5cf6', change: '100% online' },
                  { label: 'Comments', value: '8', color: '#f59e0b', change: '+3 today' }
                ].map((stat, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: 'white',
                      padding: '20px',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <h3 style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: stat.color,
                      marginBottom: '4px'
                    }}>
                      {stat.value}
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#111827',
                      marginBottom: '4px',
                      fontWeight: '500'
                    }}>
                      {stat.label}
                    </p>
                    <p style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      margin: 0
                    }}>
                      {stat.change}
                    </p>
                  </div>
                ))}
              </div>

              {/* Demo Features */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                padding: '24px'
              }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Sparkles style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
                  Collaboration Features Demo
                </h3>
                
                <div style={{ display: 'grid', gap: '12px' }}>
                  {[
                    {
                      title: 'Real-time Task Board',
                      description: 'Drag & drop tasks, assign team members, track progress',
                      demo: 'Try clicking on tasks in the board view →'
                    },
                    {
                      title: 'Smart AI Assignment',
                      description: 'AI-powered task assignment based on skills, workload, and availability',
                      demo: 'Click "Smart Assign" on any task to see AI recommendations'
                    },
                    {
                      title: '@Mentions & Smart Notifications',
                      description: 'Tag team members and get intelligent notifications',
                      demo: 'Check the notification bell for real-time updates'
                    },
                    {
                      title: 'Team Management & Roles',
                      description: 'Manage team members with role-based permissions',
                      demo: 'Visit the Team tab to see member management features'
                    },
                    {
                      title: 'Google Sheets Auto-Sync',
                      description: 'Automatically sync all changes with Google Sheets',
                      demo: 'Watch the sync indicator for real-time updates'
                    },
                    {
                      title: 'Conflict Resolution',
                      description: 'Smart handling of simultaneous edits with user choice',
                      demo: 'Conflicts are automatically detected and resolved'
                    }
                  ].map((feature, index) => (
                    <div
                      key={index}
                      style={{
                        padding: '16px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}
                    >
                      <h4 style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#111827',
                        marginBottom: '4px'
                      }}>
                        {feature.title}
                      </h4>
                      <p style={{
                        fontSize: '13px',
                        color: '#6b7280',
                        marginBottom: '6px'
                      }}>
                        {feature.description}
                      </p>
                      <p style={{
                        fontSize: '12px',
                        color: '#3b82f6',
                        margin: 0,
                        fontStyle: 'italic'
                      }}>
                        💡 {feature.demo}
                      </p>
                    </div>
                  ))}
                </div>

                <div style={{
                  marginTop: '20px',
                  padding: '16px',
                  backgroundColor: '#dbeafe',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <p style={{
                    fontSize: '14px',
                    color: '#1e40af',
                    marginBottom: '12px',
                    fontWeight: '500'
                  }}>
                    Ready to collaborate with your real team?
                  </p>
                  <button
                    onClick={onSignUp}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Sign Up Now
                    <ArrowRight style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>
              </div>
            </div>

            {/* Side Panel */}
            <div>
              <ActivityFeed compact={true} />
            </div>
          </div>
        )}

        {activeView === 'board' && (
          <TeamTaskBoard currentUser={user} />
        )}

        {activeView === 'activity' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <ActivityFeed compact={false} />
          </div>
        )}

        {activeView === 'team' && (
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <TeamMemberManagement
              currentUser={{ ...user, role: 'admin' }}
              onTeamUpdate={(updatedMembers) => {
                console.log('Team updated:', updatedMembers);
              }}
            />
          </div>
        )}
      </div>

      {/* Conflict Resolution Overlay */}
      <ConflictResolution />
    </div>
  );
};

export default DemoCollaboration;