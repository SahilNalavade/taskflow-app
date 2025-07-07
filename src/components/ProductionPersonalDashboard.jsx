import React, { useState } from 'react';
import { User, Plus, Settings } from 'lucide-react';
import TeamSelector from './TeamSelector';
import TeamOnboardingWizard from './TeamOnboardingWizard';
import { ResponsiveContainer, ResponsiveHeader, ResponsiveGrid, ResponsiveCard, useResponsive } from './ui/ResponsiveLayout';

const ProductionPersonalDashboard = ({ 
  currentUser, 
  currentTeam, 
  onTeamChange, 
  onCreateTeam 
}) => {
  const [showCreateTeamHelp, setShowCreateTeamHelp] = useState(false);
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);
  const { isMobile } = useResponsive();

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
          <p>Please sign in to access your personal dashboard.</p>
        </div>
      </div>
    );
  }

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
            {/* User Info */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              color: '#6b7280',
              fontSize: '14px'
            }}>
              <User style={{ width: '16px', height: '16px' }} />
              {isMobile ? currentUser.name?.split(' ')[0] : currentUser.name}
            </div>
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
        {/* Welcome Section */}
        <ResponsiveCard padding={true} className="mb-6">
          <h2 style={{
            fontSize: isMobile ? '24px' : '28px',
            fontWeight: '700',
            color: '#111827',
            marginBottom: '8px'
          }}>
            Welcome to TaskFlow, {currentUser.name?.split(' ')[0]}!
          </h2>
          <p style={{
            color: '#6b7280',
            fontSize: isMobile ? '14px' : '16px',
            marginBottom: '24px'
          }}>
            Get started by creating a team or joining an existing one.
          </p>
        </ResponsiveCard>

        {/* Getting Started Cards */}
        <ResponsiveGrid 
          columns={{ sm: 1, md: 2, lg: 2 }}
          gap={isMobile ? '16px' : '24px'}
        >
          {/* Create Team Card */}
          <ResponsiveCard 
            hover={true}
            style={{
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onClick={() => setShowOnboardingWizard(true)}
          >
            <div style={{
              width: isMobile ? '40px' : '48px',
              height: isMobile ? '40px' : '48px',
              backgroundColor: '#eff6ff',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Plus style={{ 
                width: isMobile ? '20px' : '24px', 
                height: isMobile ? '20px' : '24px', 
                color: '#3b82f6' 
              }} />
            </div>
            <h3 style={{
              fontSize: isMobile ? '16px' : '18px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '8px'
            }}>
              Create a Team
            </h3>
            <p style={{
              color: '#6b7280',
              fontSize: '14px',
              lineHeight: '1.5'
            }}>
              Start collaborating by creating your own team workspace. Invite members and manage projects together.
            </p>
          </ResponsiveCard>

          {/* Join Team Card */}
          <ResponsiveCard>
            <div style={{
              width: isMobile ? '40px' : '48px',
              height: isMobile ? '40px' : '48px',
              backgroundColor: '#f0fdf4',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <User style={{ 
                width: isMobile ? '20px' : '24px', 
                height: isMobile ? '20px' : '24px', 
                color: '#059669' 
              }} />
            </div>
            <h3 style={{
              fontSize: isMobile ? '16px' : '18px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '8px'
            }}>
              Join a Team
            </h3>
            <p style={{
              color: '#6b7280',
              fontSize: '14px',
              lineHeight: '1.5',
              marginBottom: '16px'
            }}>
              Ask a team admin to send you an invitation link via email to join their team.
            </p>
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '12px',
              color: '#6b7280'
            }}>
              💡 Tip: Check your email for any pending invitations
            </div>
          </ResponsiveCard>
        </ResponsiveGrid>

        {/* Create Team Help Modal */}
        {showCreateTeamHelp && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '20px'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '16px'
              }}>
                Create Your Team
              </h3>
              <p style={{
                color: '#6b7280',
                marginBottom: '24px',
                fontSize: '14px'
              }}>
                Use the team selector in the top navigation bar (next to "TaskFlow") to create a new team. Click on it and select "Create New Team".
              </p>
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => setShowCreateTeamHelp(false)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Team Onboarding Wizard */}
        {showOnboardingWizard && (
          <TeamOnboardingWizard
            currentUser={currentUser}
            onComplete={(newTeam) => {
              setShowOnboardingWizard(false);
              // The onTeamChange will be called automatically by the parent
            }}
            onCancel={() => setShowOnboardingWizard(false)}
            onCreateTeam={onCreateTeam}
          />
        )}
      </div>
    </div>
  );
};

export default ProductionPersonalDashboard;