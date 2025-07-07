import { useState, useEffect } from 'react';
import SimpleOnboarding from './components/SimpleOnboarding';
import DemoTaskManager from './components/DemoTaskManager';
import DemoCollaboration from './components/DemoCollaboration';
import GoogleSignIn from './components/GoogleSignIn';
import Dashboard from './components/Dashboard';
import InvitationAcceptance from './components/InvitationAcceptance';
import ErrorBoundary from './components/ErrorBoundary';
import { GlobalErrorHandler } from './components/GlobalErrorHandler';
import { demoData } from './services/demoData';
import { enhancedTeamService } from './services/enhancedTeamService';
import type { User, Team } from '@/types';

type AppState = 'landing' | 'demo' | 'auth' | 'dashboard' | 'invitation';
type DemoType = 'personal' | 'team';

function App() {
  // App flow state
  const [appState, setAppState] = useState<AppState>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [invitationToken, setInvitationToken] = useState<string | null>(null);
  const [teamMemberRefreshFn, setTeamMemberRefreshFn] = useState<(() => Promise<void>) | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for invitation URL first
    const urlPath = window.location.pathname;
    const urlMatch = urlPath.match(/\/invite\/(.+)/);
    
    if (urlMatch) {
      const token = urlMatch[1];
      setInvitationToken(token);
      setAppState('invitation');
      return;
    }
    
    // Check for auth redirect from invitation
    const urlParams = new URLSearchParams(window.location.search);
    const authParam = urlParams.get('auth');
    const pendingInvitation = localStorage.getItem('pendingInvitation');
    
    if (authParam === 'true' && pendingInvitation) {
      // Clear the URL parameter
      window.history.replaceState({}, document.title, '/');
      setAppState('auth');
      return;
    }
    
    // Check if user is already authenticated
    const savedUser = localStorage.getItem('user');
    const savedTeam = localStorage.getItem('currentTeam');
    
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      // Restore saved team if available
      if (savedTeam) {
        try {
          const teamData = JSON.parse(savedTeam);
          console.log('Restoring saved team:', teamData);
          setCurrentTeam(teamData);
        } catch (error) {
          console.error('Error parsing saved team:', error);
        }
      }
      
      if (userData.isDemo) {
        setAppState('demo');
      } else {
        // Authenticated user - go to dashboard
        setAppState('dashboard');
        // If no team is set but we have a user ID, load teams
        if (!savedTeam && userData.id) {
          loadUserTeams(userData.id);
        }
      }
    }
  }, []);

  // Team management functions
  const loadUserTeams = async (userId: string) => {
    setIsLoading(true);
    try {
      const teams = await enhancedTeamService.getUserTeams(userId);
      
      // If user has teams, set the first one as current
      if (teams.length > 0) {
        console.log('Setting current team:', teams[0]);
        setCurrentTeam(teams[0]);
        localStorage.setItem('currentTeam', JSON.stringify(teams[0]));
      } else {
        // User has no teams - they need to create one or be invited
        console.log('User has no teams - showing dashboard without team');
        setCurrentTeam(null);
        localStorage.removeItem('currentTeam');
      }
      
      // Always go to dashboard after loading teams (or lack thereof)
      setAppState('dashboard');
    } catch (error) {
      console.error('Error loading user teams:', error);
      // On error, still go to dashboard but without teams
      setAppState('dashboard');
    } finally {
      setIsLoading(false);
    }
  };


  const handleTeamChange = (team: Team | null) => {
    setCurrentTeam(team);
    if (team) {
      localStorage.setItem('currentTeam', JSON.stringify(team));
    } else {
      localStorage.removeItem('currentTeam');
    }
  };

  const handleStartDemo = (demoType: DemoType = 'personal') => {
    // Set demo user and navigate to demo
    const demoUser: User = { ...demoData.user, demoType };
    setUser(demoUser);
    setAppState('demo');
  };

  const handleSignUp = () => {
    setAppState('auth');
  };

  const handleAuthSuccess = async (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    try {
      // Create or get user in database
      let dbUser = await enhancedTeamService.getUserByEmail(userData.email);
      
      if (!dbUser) {
        // Create new user in database
        dbUser = await enhancedTeamService.createUser({
          name: userData.name,
          email: userData.email,
          googleId: userData.id,
          profilePicture: userData.picture || ''
        });
      }

      // Update user data with database ID
      const updatedUser = { ...userData, id: dbUser.id };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Check for pending invitation first
      const pendingInvitation = localStorage.getItem('pendingInvitation');
      if (pendingInvitation) {
        await handlePendingInvitation(JSON.parse(pendingInvitation), dbUser);
        localStorage.removeItem('pendingInvitation');
        return;
      }
      
      // Load user's teams and go to dashboard
      await loadUserTeams(dbUser.id);
    } catch (error) {
      console.error('Error setting up user:', error);
      // Fallback to dashboard without teams
      setAppState('dashboard');
    }
  };


  const handleAuthError = (error: Error) => {
    console.error('Authentication error:', error);
    // Could show error toast here
  };

  const handlePendingInvitation = async (pendingData: any, dbUser: any) => {
    try {
      const { invitationData } = pendingData;
      
      // Add user to team
      await enhancedTeamService.addTeamMember({
        userId: dbUser.id,
        teamId: invitationData.teamId,
        role: invitationData.role
      });

      // Update invitation status if we have invitation ID
      if (invitationData.invitationId) {
        await enhancedTeamService.updateInvitationStatus(invitationData.invitationId, 'Accepted');
      }

      // Load the team user just joined
      const team = await enhancedTeamService.getTeamById(invitationData.teamId);
      if (team) {
        setCurrentTeam(team);
        localStorage.setItem('currentTeam', JSON.stringify(team));
      }

      console.log('User successfully added to team via invitation:', {
        userId: dbUser.id,
        teamId: invitationData.teamId,
        role: invitationData.role
      });

      // Set app to dashboard mode
      setAppState('dashboard');
      
      // Trigger team member list refresh after a short delay
      setTimeout(async () => {
        if (teamMemberRefreshFn) {
          try {
            await teamMemberRefreshFn();
            console.log('Team member list refreshed after invitation acceptance');
          } catch (error) {
            console.error('Error refreshing team member list:', error);
          }
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error processing pending invitation:', error);
      // Still proceed to normal flow
      await loadUserTeams(dbUser.id);
    }
  };


  const handleCreateTeam = async (teamData: { name: string; description?: string }) => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Create new team
      const newTeam = await enhancedTeamService.createTeam({
        name: teamData.name,
        description: teamData.description || '',
        ownerId: user.id
      });

      // Add user as team admin
      await enhancedTeamService.addTeamMember({
        userId: user.id,
        teamId: newTeam.id,
        role: 'Admin'
      });

      // Switch to the new team
      setCurrentTeam(newTeam);
      localStorage.setItem('currentTeam', JSON.stringify(newTeam));
      
      return newTeam;
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Render based on app state with error boundaries
  const renderContent = () => {
    switch (appState) {
      case 'landing':
        return (
          <ErrorBoundary level="page">
            <SimpleOnboarding
              onStartDemo={handleStartDemo}
              onSignIn={handleSignUp}
              onSelectMode={handleSignUp}
            />
          </ErrorBoundary>
        );

      case 'demo':
        return (
          <ErrorBoundary level="page">
            {user?.demoType === 'team' ? (
              <DemoCollaboration onSignUp={handleSignUp} />
            ) : (
              <DemoTaskManager onSignUp={handleSignUp} />
            )}
          </ErrorBoundary>
        );

      case 'auth':
        return (
          <ErrorBoundary level="page">
            <GoogleSignIn
              onAuthSuccess={handleAuthSuccess}
              onError={handleAuthError}
            />
          </ErrorBoundary>
        );

      case 'dashboard':
        return (
          <ErrorBoundary level="page">
            <div style={{ position: 'relative' }}>
              <ErrorBoundary level="component">
                <Dashboard
                  currentUser={user}
                  currentTeam={currentTeam}
                  onTeamChange={handleTeamChange}
                  onCreateTeam={handleCreateTeam}
                  onMemberRefresh={setTeamMemberRefreshFn}
                  isLoading={isLoading}
                />
              </ErrorBoundary>
              
              {/* Sign Out Button (floating) */}
              <button
                onClick={() => {
                  localStorage.clear();
                  setUser(null);
                  setAppState('landing');
                }}
                style={{
                  position: 'fixed',
                  top: '16px',
                  right: '16px',
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  zIndex: 1000
                }}
              >
                Sign Out
              </button>
            </div>
          </ErrorBoundary>
        );

      case 'invitation':
        return (
          <ErrorBoundary level="page">
            <InvitationAcceptance
              token={invitationToken}
              onUserJoin={() => {}} // No longer needed since invitation redirects to auth
            />
          </ErrorBoundary>
        );

      default:
        return (
          <ErrorBoundary level="page">
            <SimpleOnboarding
              onStartDemo={handleStartDemo}
              onSignIn={handleSignUp}
              onSelectMode={handleSignUp}
            />
          </ErrorBoundary>
        );
    }
  };

  return (
    <GlobalErrorHandler>
      <ErrorBoundary level="critical">
        {renderContent()}
      </ErrorBoundary>
    </GlobalErrorHandler>
  );
}

export default App;