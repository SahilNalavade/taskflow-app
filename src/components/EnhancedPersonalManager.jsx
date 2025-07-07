import React, { useState, useEffect } from 'react';
import { 
  Plus, Users, Settings, Bell, FileSpreadsheet, 
  RefreshCw, ExternalLink, User, Activity, MessageCircle 
} from 'lucide-react';
import { multiSheetService } from '../services/multiSheetService';
import { teamService } from '../services/teamService';
import { realtimeEngine } from '../services/realtimeEngine';
import { sheetSyncService } from '../services/sheetSyncService';
import personalSheetsBridge from '../services/personalSheetsBridge';
import SheetBrowser from './SheetBrowser';
import SmartNotifications from './SmartNotifications';
import SyncStatusIndicator from './SyncStatusIndicator';
import PresenceIndicator from './PresenceIndicator';
import TeamTaskBoard from './TeamTaskBoard';
import TeamMemberManagement from './TeamMemberManagement';
import ActivityFeed from './ActivityFeed';

const EnhancedPersonalManager = ({ user, currentTeam, onTasksUpdate }) => {
  const [activeView, setActiveView] = useState('tasks');
  const [personalSheet, setPersonalSheet] = useState(null);
  const [showSheetBrowser, setShowSheetBrowser] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheetTasks, setSheetTasks] = useState([]);
  const [syncStatus, setSyncStatus] = useState({ isLoading: false, lastSyncTime: null });

  const views = [
    { key: 'tasks', label: 'My Tasks', icon: User },
    { key: 'team', label: 'Team Board', icon: Users },
    { key: 'activity', label: 'Activity', icon: Activity },
    { key: 'members', label: 'Team', icon: Settings }
  ];

  useEffect(() => {
    initializeEnhancedMode();
    initializeSheetsBridge();
    
    return () => {
      // Cleanup event listeners
      personalSheetsBridge.off('tasksUpdated', handleTasksUpdated);
      personalSheetsBridge.off('syncCompleted', handleSyncCompleted);
      personalSheetsBridge.off('syncError', handleSyncError);
    };
  }, [user, currentTeam]);

  const initializeSheetsBridge = () => {
    // Set up event listeners for real-time updates
    personalSheetsBridge.on('tasksUpdated', handleTasksUpdated);
    personalSheetsBridge.on('syncCompleted', handleSyncCompleted);
    personalSheetsBridge.on('syncError', handleSyncError);
    personalSheetsBridge.on('sheetConnected', handleSheetConnected);
    personalSheetsBridge.on('sheetDisconnected', handleSheetDisconnected);

    // Load existing data if already connected
    const connectedSheet = personalSheetsBridge.getConnectedSheet();
    if (connectedSheet) {
      setPersonalSheet(connectedSheet);
      setSheetTasks(personalSheetsBridge.getTasks());
    }
    
    setSyncStatus(personalSheetsBridge.getSyncStatus());
  };

  const handleTasksUpdated = (tasks) => {
    console.log('EnhancedPersonalManager: Tasks updated from bridge:', tasks);
    setSheetTasks(tasks);
    onTasksUpdate?.(tasks);
  };

  const handleSyncCompleted = () => {
    console.log('EnhancedPersonalManager: Sync completed');
    setSyncStatus(personalSheetsBridge.getSyncStatus());
  };

  const handleSyncError = (error) => {
    console.error('EnhancedPersonalManager: Sync error:', error);
    setSyncStatus(personalSheetsBridge.getSyncStatus());
  };

  const handleSheetConnected = (sheet) => {
    console.log('EnhancedPersonalManager: Sheet connected:', sheet);
    setPersonalSheet(sheet);
  };

  const handleSheetDisconnected = () => {
    console.log('EnhancedPersonalManager: Sheet disconnected');
    setPersonalSheet(null);
    setSheetTasks([]);
  };

  const initializeEnhancedMode = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Initialize real-time engine with user data
      realtimeEngine.initialize(user.id, user.name);

      // Load or create team context
      let team = currentTeam;
      if (!team && user.teams && user.teams.length > 0) {
        team = user.teams[0]; // Use first team if available
      }

      if (!team) {
        // Create a default personal team for the user
        team = {
          id: `personal_team_${user.id}`,
          name: `${user.name}'s Personal Workspace`,
          ownerId: user.id,
          members: [{ 
            ...user, 
            role: 'owner',
            status: 'active'
          }]
        };
      }

      // Set up team members (including user as first member)
      const members = team.members || [{ 
        ...user, 
        role: 'owner',
        status: 'active',
        title: 'Owner'
      }];
      setTeamMembers(members);

      // Load personal sheet
      await loadPersonalSheet();

      // Enable auto-sync
      sheetSyncService.enableAutoSync(10000);

      // Initialize presence for all team members
      members.forEach((member, index) => {
        setTimeout(() => {
          realtimeEngine.setUserPresence(member.id, {
            sessionId: `session_${member.id}`,
            name: member.name,
            isOnline: member.id === user.id ? true : Math.random() > 0.3,
            lastSeen: new Date().toISOString(),
            currentView: '/enhanced-personal',
            isTyping: false
          });
        }, index * 200);
      });

    } catch (error) {
      console.error('Error initializing enhanced mode:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPersonalSheet = async () => {
    try {
      // Check if bridge already has a connected sheet
      if (personalSheetsBridge.isConnected()) {
        const connectedSheet = personalSheetsBridge.getConnectedSheet();
        setPersonalSheet(connectedSheet);
        setSheetTasks(personalSheetsBridge.getTasks());
      } else {
        // No sheets connected, show browser to set up
        setShowSheetBrowser(true);
      }
    } catch (error) {
      console.error('Error loading personal sheet:', error);
      setShowSheetBrowser(true);
    }
  };

  const handleSheetSelected = async (sheet) => {
    try {
      console.log('EnhancedPersonalManager: Connecting to sheet:', sheet);
      
      // Connect through the bridge
      await personalSheetsBridge.connectSheet(sheet);
      
      // Update local state
      setPersonalSheet(sheet);
      setShowSheetBrowser(false);
      
      // Sync initial data
      const tasks = personalSheetsBridge.getTasks();
      setSheetTasks(tasks);
      
    } catch (error) {
      console.error('Error connecting to sheet:', error);
      // Show error to user (you could add a toast notification here)
    }
  };

  const handleManualSync = async () => {
    try {
      await personalSheetsBridge.manualSync();
    } catch (error) {
      console.error('Manual sync failed:', error);
    }
  };

  const handleDisconnectSheet = () => {
    personalSheetsBridge.disconnectSheet();
    setPersonalSheet(null);
    setSheetTasks([]);
    setShowSheetBrowser(true);
  };

  // Task CRUD handlers that interface with Google Sheets
  const handleTaskCreate = async (taskData) => {
    try {
      await personalSheetsBridge.createTask(taskData);
      // Tasks will be updated via the event listener
    } catch (error) {
      console.error('Failed to create task:', error);
      // Show error to user
    }
  };

  const handleTaskUpdate = async (taskId, updates) => {
    try {
      await personalSheetsBridge.updateTask(taskId, updates);
      // Tasks will be updated via the event listener
    } catch (error) {
      console.error('Failed to update task:', error);
      // Show error to user
    }
  };

  const handleTaskDelete = async (taskId) => {
    try {
      await personalSheetsBridge.deleteTask(taskId);
      // Tasks will be updated via the event listener
    } catch (error) {
      console.error('Failed to delete task:', error);
      // Show error to user
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: '#6b7280' }}>
          <RefreshCw style={{ 
            width: '32px', 
            height: '32px', 
            margin: '0 auto 16px',
            animation: 'spin 1s linear infinite'
          }} />
          <div>Setting up your enhanced workspace...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      {/* Enhanced Header */}
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
              Welcome back, {user.name}!
            </h1>
            <p style={{ color: '#6b7280', margin: 0 }}>
              Your enhanced workspace with real-time collaboration
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Team Presence */}
            {teamMembers.length > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px'
              }}>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>Team:</span>
                {teamMembers.slice(0, 4).map((member) => (
                  <PresenceIndicator
                    key={member.id}
                    userId={member.id}
                    size="sm"
                    showDetails={false}
                  />
                ))}
              </div>
            )}

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

            {/* Smart Notifications */}
            <SmartNotifications currentUser={user} />

            {/* Sync Status */}
            <SyncStatusIndicator compact={true} />

            {/* Sheet Access */}
            {personalSheet && (
              <a
                href={personalSheet.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '12px',
                  textDecoration: 'none'
                }}
              >
                <FileSpreadsheet style={{ width: '14px', height: '14px' }} />
                View Sheet
                <ExternalLink style={{ width: '12px', height: '12px' }} />
              </a>
            )}
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

      {/* Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px'
      }}>
        {activeView === 'tasks' && (
          <div>
            {personalSheet ? (
              <div>
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '24px',
                  border: '1px solid #e5e7eb'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
                      Personal Tasks - Enhanced Mode
                    </h2>
                    <button
                      onClick={() => setShowSheetBrowser(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 12px',
                        backgroundColor: '#f3f4f6',
                        color: '#6b7280',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      <Settings style={{ width: '14px', height: '14px' }} />
                      Change Sheet
                    </button>
                  </div>
                  
                  <div style={{
                    padding: '16px',
                    backgroundColor: '#dbeafe',
                    borderRadius: '8px',
                    marginBottom: '16px'
                  }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af', marginBottom: '8px' }}>
                      🎉 Enhanced Features Active
                    </h3>
                    <ul style={{ margin: 0, paddingLeft: '16px', color: '#1e40af', fontSize: '13px' }}>
                      <li>Real-time collaboration with team members</li>
                      <li>Smart notifications and @mentions</li>
                      <li>AI-powered task assignment</li>
                      <li>Auto-sync with Google Sheets</li>
                      <li>Team presence indicators</li>
                    </ul>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileSpreadsheet style={{ width: '16px', height: '16px', color: '#10b981' }} />
                      Connected to: <strong>{personalSheet.name}</strong>
                      <a
                        href={personalSheet.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ 
                          color: '#3b82f6', 
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        Open in Sheets
                        <ExternalLink style={{ width: '12px', height: '12px' }} />
                      </a>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {syncStatus.lastSyncTime && (
                        <span style={{ fontSize: '12px', color: '#10b981' }}>
                          Synced: {new Date(syncStatus.lastSyncTime).toLocaleTimeString()}
                        </span>
                      )}
                      <button
                        onClick={handleManualSync}
                        disabled={syncStatus.isLoading}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: syncStatus.isLoading ? '#e5e7eb' : '#3b82f6',
                          color: syncStatus.isLoading ? '#6b7280' : 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: syncStatus.isLoading ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <RefreshCw 
                          style={{ 
                            width: '12px', 
                            height: '12px',
                            animation: syncStatus.isLoading ? 'spin 1s linear infinite' : 'none'
                          }} 
                        />
                        {syncStatus.isLoading ? 'Syncing...' : 'Sync'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Use TeamTaskBoard for personal tasks with enhanced features */}
                <TeamTaskBoard 
                  currentUser={user}
                  teamMembers={teamMembers}
                  isPersonalMode={true}
                  externalTasks={sheetTasks}
                  onTaskCreate={handleTaskCreate}
                  onTaskUpdate={handleTaskUpdate}
                  onTaskDelete={handleTaskDelete}
                />
              </div>
            ) : (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '48px',
                textAlign: 'center',
                border: '1px solid #e5e7eb'
              }}>
                <FileSpreadsheet style={{ 
                  width: '48px', 
                  height: '48px', 
                  color: '#6b7280',
                  margin: '0 auto 16px'
                }} />
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                  Connect Your Google Sheet
                </h3>
                <p style={{ color: '#6b7280', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>
                  Get started by connecting a Google Sheet to sync your tasks in real-time with enhanced collaboration features.
                </p>
                <button
                  onClick={() => setShowSheetBrowser(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  <Plus style={{ width: '16px', height: '16px' }} />
                  Connect Google Sheet
                </button>
              </div>
            )}
          </div>
        )}

        {activeView === 'team' && (
          <TeamTaskBoard 
            currentUser={user}
            teamMembers={teamMembers}
            isPersonalMode={false}
            externalTasks={sheetTasks}
            onTaskCreate={handleTaskCreate}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
          />
        )}

        {activeView === 'activity' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <ActivityFeed compact={false} />
          </div>
        )}

        {activeView === 'members' && (
          <TeamMemberManagement
            currentUser={{ ...user, role: 'owner' }}
            teamMembers={teamMembers}
            onTeamUpdate={(updatedMembers) => {
              setTeamMembers(updatedMembers);
              console.log('Team updated:', updatedMembers);
            }}
          />
        )}
      </div>

      {/* Sheet Browser Modal */}
      {showSheetBrowser && (
        <SheetBrowser
          onSheetSelect={handleSheetSelected}
          onClose={() => setShowSheetBrowser(false)}
        />
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default EnhancedPersonalManager;