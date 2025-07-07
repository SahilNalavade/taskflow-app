import React, { useState } from 'react';
import { Users, Activity, MessageCircle, Settings } from 'lucide-react';
import TeamTaskBoard from './TeamTaskBoard';
import ActivityFeed from './ActivityFeed';
import TeamMemberManagement from './TeamMemberManagement';
import TeamSelector from './TeamSelector';

const ProductionTeamDashboard = ({ 
  currentUser, 
  currentTeam, 
  onTeamChange, 
  onCreateTeam, 
  onMemberRefresh 
}) => {
  const [activeView, setActiveView] = useState('board');

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
        <div style={{ textAlign: 'center' }}>
          <h2>Authentication Required</h2>
          <p>Please sign in to access the team dashboard.</p>
        </div>
      </div>
    );
  }

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#111827',
              margin: 0
            }}>
              TaskFlow
            </h1>
            
            {/* Team Selector */}
            <TeamSelector
              currentTeam={currentTeam}
              currentUser={currentUser}
              onTeamChange={onTeamChange}
              onCreateTeam={onCreateTeam}
            />
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {views.map((view) => (
              <button
                key={view.key}
                onClick={() => setActiveView(view.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: activeView === view.key ? '#3b82f6' : 'transparent',
                  color: activeView === view.key ? 'white' : '#6b7280',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                <view.icon style={{ width: '16px', height: '16px' }} />
                {view.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px'
      }}>
        {!currentTeam ? (
          /* No Team Selected State */
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '48px 24px',
            textAlign: 'center',
            border: '1px solid #e5e7eb'
          }}>
            <Users style={{ 
              width: '48px', 
              height: '48px', 
              color: '#9ca3af', 
              margin: '0 auto 16px' 
            }} />
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '8px'
            }}>
              No Team Selected
            </h2>
            <p style={{
              color: '#6b7280',
              marginBottom: '24px',
              fontSize: '16px'
            }}>
              Select a team from the dropdown above or create a new team to get started.
            </p>
          </div>
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
              <TeamMemberManagement
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
      </div>
    </div>
  );
};

export default ProductionTeamDashboard;