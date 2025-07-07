import React, { useState } from 'react';
import { Users, Activity, MessageCircle, Settings, Menu, X } from 'lucide-react';
import TeamTaskBoard from './TeamTaskBoard';
import ActivityFeed from './ActivityFeed';
import ImprovedTeamMemberManagement from './ImprovedTeamMemberManagement';
import TeamSelector from './TeamSelector';
import { ResponsiveContainer, ResponsiveHeader, ResponsiveButton, ResponsiveCard, useResponsive } from './ui/ResponsiveLayout';

const ProductionTeamDashboard = ({ 
  currentUser, 
  currentTeam, 
  onTeamChange, 
  onCreateTeam, 
  onMemberRefresh 
}) => {
  const [activeView, setActiveView] = useState('board');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isMobile, isTablet } = useResponsive();

  const views = [
    { key: 'board', label: 'Task Board', icon: Users },
    { key: 'activity', label: 'Activity Feed', icon: MessageCircle },
    { key: 'team', label: 'Team Management', icon: Settings }
  ];

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
                    onClick={() => {
                      setActiveView(view.key);
                      setMobileMenuOpen(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
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
                    <view.icon style={{ width: '20px', height: '20px' }} />
                    {view.label}
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
        onClick={() => setActiveView(view.key)}
      >
        {isTablet ? '' : view.label}
      </ResponsiveButton>
    ));
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc'
    }}>
      {/* Responsive Header */}
      <ResponsiveHeader
        title="TaskFlow"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {!isMobile && (
              <TeamSelector
                currentTeam={currentTeam}
                currentUser={currentUser}
                onTeamChange={onTeamChange}
                onCreateTeam={onCreateTeam}
              />
            )}
            {renderNavigation()}
          </div>
        }
        navigation={
          isMobile ? (
            <TeamSelector
              currentTeam={currentTeam}
              currentUser={currentUser}
              onTeamChange={onTeamChange}
              onCreateTeam={onCreateTeam}
            />
          ) : null
        }
      />

      {/* Main Content */}
      <ResponsiveContainer maxWidth="xl" className="py-6">
        {!currentTeam ? (
          /* No Team Selected State */
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
            </div>
          </ResponsiveCard>
        ) : (
          /* Team Content */
          <>
            {activeView === 'board' && (
              <TeamTaskBoard 
                currentUser={currentUser}
                currentTeam={currentTeam}
              />
            )}
            
            {activeView === 'activity' && (
              <ActivityFeed 
                currentUser={currentUser}
                currentTeam={currentTeam}
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
              />
            )}
          </>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default ProductionTeamDashboard;