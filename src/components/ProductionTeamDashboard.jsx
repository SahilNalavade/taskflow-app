import React, { useState } from 'react';
import { Users, Activity, MessageCircle, Settings, Menu, X, Search, Plus } from 'lucide-react';
import TeamTaskBoard from './TeamTaskBoard';
import ActivityFeed from './ActivityFeed';
import ImprovedTeamMemberManagement from './ImprovedTeamMemberManagement';
import TeamSelector from './TeamSelector';
import { ResponsiveContainer, ResponsiveHeader, ResponsiveButton, ResponsiveCard, useResponsive } from './ui/ResponsiveLayout';
import { useKeyboardShortcuts } from './ui/KeyboardShortcuts';
import { HelpButton } from './ui/HelpSystem';
import { AdvancedSearchBar, useAdvancedSearch } from './ui/AdvancedSearch';
import { LoadingWrapper, DashboardSkeleton } from './ui/LoadingStates';
import { useAnnouncer } from './ui/AccessibleComponents';

const ProductionTeamDashboard = ({ 
  currentUser, 
  currentTeam, 
  onTeamChange, 
  onCreateTeam, 
  onMemberRefresh 
}) => {
  const [activeView, setActiveView] = useState('board');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const { isMobile, isTablet } = useResponsive();
  const { announce } = useAnnouncer();

  const views = [
    { key: 'board', label: 'Task Board', icon: Users, shortcut: '1' },
    { key: 'activity', label: 'Activity Feed', icon: MessageCircle, shortcut: '2' },
    { key: 'team', label: 'Team Management', icon: Settings, shortcut: '3' }
  ];

  // Enhanced keyboard shortcuts
  useKeyboardShortcuts({
    '1': () => {
      setActiveView('board');
      announce('Switched to Task Board', 'polite');
    },
    '2': () => {
      setActiveView('activity');
      announce('Switched to Activity Feed', 'polite');
    },
    '3': () => {
      setActiveView('team');
      announce('Switched to Team Management', 'polite');
    },
    'MOD+K': () => {
      document.querySelector('[data-global-search]')?.focus();
    },
    'ESC': () => {
      setMobileMenuOpen(false);
      setGlobalSearch('');
    }
  });

  const handleViewChange = (viewKey) => {
    setActiveView(viewKey);
    setMobileMenuOpen(false);
    announce(`Switched to ${views.find(v => v.key === viewKey)?.label}`, 'polite');
  };

  if (!currentUser) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <ResponsiveContainer>
          <div style={{ textAlign: 'center' }}>
            <h2>Authentication Required</h2>
            <p>Please sign in to access the team dashboard.</p>
          </div>
        </ResponsiveContainer>
      </div>
    );
  }

  const renderNavigation = () => {
    if (isMobile) {
      return (
        <>
          {/* Mobile Navigation Button */}
          <ResponsiveButton
            variant="ghost"
            size="sm"
            icon={mobileMenuOpen ? <X /> : <Menu />}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? '' : ''}
          </ResponsiveButton>
          
          {/* Mobile Navigation Overlay */}
          {mobileMenuOpen && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-end',
              paddingTop: '64px'
            }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: '8px 0 0 8px',
                padding: '16px',
                minWidth: '200px',
                maxWidth: '280px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                marginRight: '16px'
              }}>
                {views.map((view) => (
                  <button
                    key={view.key}
                    onClick={() => handleViewChange(view.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      padding: '12px 16px',
                      backgroundColor: activeView === view.key ? '#eff6ff' : 'transparent',
                      color: activeView === view.key ? '#3b82f6' : '#374151',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      width: '100%',
                      textAlign: 'left',
                      marginBottom: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <view.icon style={{ width: '20px', height: '20px' }} />
                      {view.label}
                    </div>
                    <span style={{
                      fontSize: '12px',
                      backgroundColor: activeView === view.key ? '#3b82f6' : '#e5e7eb',
                      color: activeView === view.key ? 'white' : '#6b7280',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: '600'
                    }}>
                      {view.shortcut}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      );
    }

    return views.map((view) => (
      <ResponsiveButton
        key={view.key}
        variant={activeView === view.key ? 'primary' : 'ghost'}
        size="sm"
        icon={<view.icon style={{ width: '16px', height: '16px' }} />}
        onClick={() => handleViewChange(view.key)}
        title={`${view.label} (Press ${view.shortcut})`}
        style={{
          position: 'relative'
        }}
      >
        {isTablet ? '' : view.label}
        {!isTablet && (
          <span style={{
            fontSize: '10px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            padding: '1px 4px',
            borderRadius: '2px',
            marginLeft: '4px'
          }}>
            {view.shortcut}
          </span>
        )}
      </ResponsiveButton>
    ));
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      {/* Enhanced Responsive Header */}
      <ResponsiveHeader
        title="TaskFlow"
        subtitle={currentTeam ? `${currentTeam.name} • ${views.find(v => v.key === activeView)?.label}` : 'Team Dashboard'}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Global Search - Desktop */}
            {!isMobile && currentTeam && (
              <div style={{ position: 'relative' }}>
                <AdvancedSearchBar
                  onSearch={setGlobalSearch}
                  placeholder="Search across all views..."
                  data-global-search="true"
                  style={{ 
                    width: '240px',
                    fontSize: '14px'
                  }}
                  compact
                />
                {globalSearch && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                    zIndex: 1000,
                    padding: '8px',
                    marginTop: '4px'
                  }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', padding: '4px 8px' }}>
                      Search results will appear here across tasks, activity, and team members
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {!isMobile && (
              <TeamSelector
                currentTeam={currentTeam}
                currentUser={currentUser}
                onTeamChange={onTeamChange}
                onCreateTeam={onCreateTeam}
              />
            )}
            
            {/* Help Button */}
            <HelpButton
              content={{
                title: "Team Dashboard Help",
                description: "Navigate and manage your team's workspace efficiently.",
                sections: [
                  {
                    title: "Keyboard Shortcuts",
                    items: [
                      "1, 2, 3 - Switch between views",
                      "⌘+K - Focus global search",
                      "ESC - Close menus and clear search"
                    ]
                  },
                  {
                    title: "Views",
                    items: [
                      "Task Board - Manage and organize tasks",
                      "Activity Feed - See team updates",
                      "Team Management - Manage members and settings"
                    ]
                  }
                ]
              }}
            />
            
            {renderNavigation()}
          </div>
        }
        navigation={
          isMobile ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <TeamSelector
                currentTeam={currentTeam}
                currentUser={currentUser}
                onTeamChange={onTeamChange}
                onCreateTeam={onCreateTeam}
              />
              {/* Mobile Global Search */}
              {currentTeam && (
                <AdvancedSearchBar
                  onSearch={setGlobalSearch}
                  placeholder="Search..."
                  data-global-search="true"
                  style={{ fontSize: '14px' }}
                  compact
                />
              )}
            </div>
          ) : null
        }
      />

      {/* Enhanced Main Content */}
      <ResponsiveContainer maxWidth="xl" className="py-6">
        <LoadingWrapper loading={loading}>
          {!currentTeam ? (
            /* Enhanced No Team Selected State */
            <ResponsiveCard padding={true} className="text-center">
              <div style={{ padding: isMobile ? '32px 16px' : '48px 24px' }}>
                <Users style={{ 
                  width: '48px', 
                  height: '48px', 
                  color: '#9ca3af', 
                  margin: '0 auto 16px' 
                }} />
                <h2 style={{
                  fontSize: isMobile ? '18px' : '20px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '8px'
                }}>
                  No Team Selected
                </h2>
                <p style={{
                  color: '#6b7280',
                  marginBottom: '24px',
                  fontSize: isMobile ? '14px' : '16px'
                }}>
                  {isMobile 
                    ? 'Select a team from the dropdown above or create a new team.'
                    : 'Select a team from the dropdown above or create a new team to get started.'
                  }
                </p>
                
                {/* Quick Action Button */}
                <ResponsiveButton
                  variant="primary"
                  icon={<Plus />}
                  onClick={() => onCreateTeam && onCreateTeam()}
                  style={{ marginTop: '16px' }}
                >
                  Create Your First Team
                </ResponsiveButton>
                
                {/* Keyboard Hint */}
                <div style={{
                  marginTop: '24px',
                  padding: '16px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  💡 <strong>Tip:</strong> Use keyboard shortcuts once you have a team: 1, 2, 3 to switch views • ⌘+K for search • ESC to close menus
                </div>
              </div>
            </ResponsiveCard>
          ) : (
            /* Enhanced Team Content with Context */
            <>
              {/* View Context Bar */}
              <div style={{
                marginBottom: '24px',
                padding: '12px 16px',
                backgroundColor: 'white',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {(() => {
                    const currentView = views.find(v => v.key === activeView);
                    return (
                      <>
                        <currentView.icon style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
                        <span style={{ fontWeight: '600', color: '#111827' }}>
                          {currentView.label}
                        </span>
                        <span style={{ color: '#6b7280', fontSize: '14px' }}>
                          • {currentTeam.name}
                        </span>
                      </>
                    );
                  })()}
                </div>
                
                {globalSearch && (
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#6b7280',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Search style={{ width: '12px', height: '12px' }} />
                    Searching for: "{globalSearch}"
                  </div>
                )}
              </div>
              
              {/* Content Views */}
              {activeView === 'board' && (
                <TeamTaskBoard 
                  currentUser={currentUser}
                  currentTeam={currentTeam}
                  globalSearch={globalSearch}
                />
              )}
              
              {activeView === 'activity' && (
                <ActivityFeed 
                  currentUser={currentUser}
                  currentTeam={currentTeam}
                  globalSearch={globalSearch}
                />
              )}
              
              {activeView === 'team' && (
                <ImprovedTeamMemberManagement
                  currentUser={currentUser}
                  currentTeam={currentTeam}
                  onTeamUpdate={(updatedMembers) => {
                    console.log('Team updated:', updatedMembers);
                  }}
                  onMemberRefresh={onMemberRefresh}
                  globalSearch={globalSearch}
                />
              )}
            </>
          )}
        </LoadingWrapper>
      </ResponsiveContainer>
    </div>
  );
};

export default ProductionTeamDashboard;