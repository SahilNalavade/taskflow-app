import React, { useState } from 'react';
import { User, Plus, Settings, Search, HelpCircle } from 'lucide-react';
import TeamSelector from './TeamSelector';
import TeamOnboardingWizard from './TeamOnboardingWizard';
import { ResponsiveContainer, ResponsiveHeader, ResponsiveGrid, ResponsiveCard, useResponsive, ResponsiveButton } from './ui/ResponsiveLayout';
import { useKeyboardShortcuts } from './ui/KeyboardShortcuts';
import { HelpButton } from './ui/HelpSystem';
import { AdvancedSearchBar } from './ui/AdvancedSearch';
import { LoadingWrapper } from './ui/LoadingStates';
import { useAnnouncer } from './ui/AccessibleComponents';

const ProductionPersonalDashboard = ({ 
  currentUser, 
  currentTeam, 
  onTeamChange, 
  onCreateTeam 
}) => {
  const [showCreateTeamHelp, setShowCreateTeamHelp] = useState(false);
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isMobile } = useResponsive();
  const { announce } = useAnnouncer();

  // Enhanced keyboard shortcuts
  useKeyboardShortcuts({
    'MOD+K': () => {
      document.querySelector('[data-search-input]')?.focus();
    },
    'MOD+T': () => {
      setShowOnboardingWizard(true);
      announce('Opening team creation wizard', 'polite');
    },
    'ESC': () => {
      setShowCreateTeamHelp(false);
      setShowOnboardingWizard(false);
      setSearchQuery('');
    }
  });

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
      {/* Enhanced Responsive Header */}
      <ResponsiveHeader
        title="TaskFlow"
        subtitle="Personal Dashboard"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Search Bar - Desktop */}
            {!isMobile && (
              <AdvancedSearchBar
                onSearch={setSearchQuery}
                placeholder="Search teams, guides..."
                data-search-input="true"
                style={{ 
                  width: '200px',
                  fontSize: '14px'
                }}
                compact
              />
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
                title: "Personal Dashboard Help",
                description: "Get started with TaskFlow and manage your teams.",
                sections: [
                  {
                    title: "Keyboard Shortcuts",
                    items: [
                      "⌘+K - Focus search",
                      "⌘+T - Create new team",
                      "ESC - Close dialogs"
                    ]
                  },
                  {
                    title: "Getting Started",
                    items: [
                      "Create your first team to begin",
                      "Invite team members via email",
                      "Use templates for quick setup"
                    ]
                  }
                ]
              }}
            />
            
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <TeamSelector
                currentTeam={currentTeam}
                currentUser={currentUser}
                onTeamChange={onTeamChange}
                onCreateTeam={onCreateTeam}
              />
              {/* Mobile Search */}
              <AdvancedSearchBar
                onSearch={setSearchQuery}
                placeholder="Search..."
                data-search-input="true"
                style={{ fontSize: '14px' }}
                compact
              />
            </div>
          ) : null
        }
      />

      {/* Main Content */}
      <ResponsiveContainer maxWidth="xl" className="py-6">
        <LoadingWrapper loading={loading}>
          {/* Enhanced Welcome Section */}
          <ResponsiveCard padding={true} className="mb-6">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
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
                  marginBottom: isMobile ? '16px' : '0'
                }}>
                  Get started by creating a team or joining an existing one.
                </p>
              </div>
              
              {/* Quick Action Button */}
              {!isMobile && (
                <ResponsiveButton
                  variant="primary"
                  icon={<Plus />}
                  onClick={() => setShowOnboardingWizard(true)}
                  style={{ flexShrink: 0 }}
                >
                  Create Team
                </ResponsiveButton>
              )}
            </div>
            
            {/* Search Results */}
            {searchQuery && (
              <div style={{
                marginTop: '16px',
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Search style={{ width: '12px', height: '12px' }} />
                  Searching for: "{searchQuery}"
                </div>
                <div style={{ marginTop: '8px', fontSize: '14px', color: '#374151' }}>
                  Search functionality will be enhanced to include teams, templates, and help content.
                </div>
              </div>
            )}
          </ResponsiveCard>

        {/* Getting Started Cards */}
        <ResponsiveGrid 
          columns={{ sm: 1, md: 2, lg: 2 }}
          gap={isMobile ? '16px' : '24px'}
        >
          {/* Enhanced Create Team Card */}
          <ResponsiveCard 
            hover={true}
            style={{
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: '2px solid #e5e7eb',
              position: 'relative'
            }}
            onClick={() => setShowOnboardingWizard(true)}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(59, 130, 246, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Keyboard shortcut badge */}
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              backgroundColor: '#f3f4f6',
              color: '#6b7280',
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: '600'
            }}>
              ⌘+T
            </div>
            
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
              lineHeight: '1.5',
              marginBottom: '12px'
            }}>
              Start collaborating by creating your own team workspace. Invite members and manage projects together.
            </p>
            
            {/* Features list */}
            <div style={{
              fontSize: '12px',
              color: '#6b7280'
            }}>
              ✓ Team templates • ✓ Member invitations • ✓ Project organization
            </div>
          </ResponsiveCard>

          {/* Enhanced Join Team Card */}
          <ResponsiveCard
            style={{
              border: '2px solid #e5e7eb',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#059669';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(5, 150, 105, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
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
            
            {/* Enhanced tip section */}
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #d1fae5',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '12px'
            }}>
              <div style={{ fontSize: '12px', color: '#059669', fontWeight: '600', marginBottom: '4px' }}>
                💡 Pro Tips:
              </div>
              <ul style={{ 
                fontSize: '12px', 
                color: '#047857', 
                margin: 0, 
                paddingLeft: '16px',
                lineHeight: '1.4'
              }}>
                <li>Check your email for pending invitations</li>
                <li>Ask for team invite links in Slack/Teams</li>
                <li>Look for team QR codes in meetings</li>
              </ul>
            </div>
            
            {/* Status indicator */}
            <div style={{
              fontSize: '11px',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                backgroundColor: '#f59e0b',
                borderRadius: '50%'
              }} />
              Waiting for team invitation
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
              
              {/* Enhanced Keyboard Shortcuts Help */}
              <div style={{
                marginTop: '24px',
                padding: '16px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <HelpCircle style={{ width: '14px', height: '14px' }} />
                  Keyboard Shortcuts
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '8px',
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  <div><kbd style={{ backgroundColor: '#e5e7eb', padding: '2px 4px', borderRadius: '2px' }}>⌘+T</kbd> Create team</div>
                  <div><kbd style={{ backgroundColor: '#e5e7eb', padding: '2px 4px', borderRadius: '2px' }}>⌘+K</kbd> Search</div>
                  <div><kbd style={{ backgroundColor: '#e5e7eb', padding: '2px 4px', borderRadius: '2px' }}>ESC</kbd> Close dialogs</div>
                </div>
              </div>
            </div>
          </ResponsiveCard>
        </LoadingWrapper>

        {/* Enhanced Team Onboarding Wizard */}
        {showOnboardingWizard && (
          <TeamOnboardingWizard
            currentUser={currentUser}
            onComplete={(newTeam) => {
              setShowOnboardingWizard(false);
              announce(`Team ${newTeam.name} created successfully!`, 'polite');
              // The onTeamChange will be called automatically by the parent
            }}
            onCancel={() => {
              setShowOnboardingWizard(false);
              announce('Team creation cancelled', 'polite');
            }}
            onCreateTeam={onCreateTeam}
          />
        )}
        
        {/* Live Region for Announcements */}
        <div 
          aria-live="polite" 
          aria-atomic="true"
          style={{
            position: 'absolute',
            left: '-10000px',
            width: '1px',
            height: '1px',
            overflow: 'hidden'
          }}
        />
      </div>
    </div>
  );
};

export default ProductionPersonalDashboard;