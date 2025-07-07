import { useState, useEffect } from 'react';
import SimpleOnboarding from './components/SimpleOnboarding';
import DemoTaskManager from './components/DemoTaskManager';
import DemoCollaboration from './components/DemoCollaboration';
import GoogleSignIn from './components/GoogleSignIn';
import EnhancedPersonalManager from './components/EnhancedPersonalManager';
import InvitationAcceptance from './components/InvitationAcceptance';
import ErrorBoundary from './components/ErrorBoundary';
import { GlobalErrorHandler } from './components/GlobalErrorHandler';
import { demoData } from './services/demoData';
import { enhancedTeamService } from './services/enhancedTeamService';
import type { User, Team } from '@/types';

type AppState = 'onboarding' | 'demo' | 'team-demo' | 'auth' | 'personal' | 'team' | 'invitation';
type DemoType = 'personal' | 'team';

function App() {
  // App flow state
  const [appState, setAppState] = useState<AppState>('onboarding');
  const [user, setUser] = useState<User | null>(null);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [invitationToken, setInvitationToken] = useState<string | null>(null);
  const [teamMemberRefreshFn, setTeamMemberRefreshFn] = useState<(() => Promise<void>) | null>(null);

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
    
    // Check if user is already authenticated
    const savedUser = localStorage.getItem('user');
    const savedTeam = localStorage.getItem('currentTeam');
    const savedMode = localStorage.getItem('appMode');
    
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
        if (userData.demoType === 'team') {
          setAppState('team-demo');
        } else {
          setAppState('demo');
        }
      } else if (savedMode === 'team') {
        setAppState('team');
        // If no team is set but user should be in team mode, load teams
        if (!savedTeam && userData.id) {
          loadUserTeams(userData.id);
        }
      } else {
        setAppState('personal');
      }
    }
  }, []);

  // Team management functions
  const loadUserTeams = async (userId: string) => {
    try {
      const teams = await enhancedTeamService.getUserTeams(userId);
      
      // If user has teams, set the first one as current
      if (teams.length > 0) {
        console.log('Setting current team:', teams[0]);
        setCurrentTeam(teams[0]);
        localStorage.setItem('currentTeam', JSON.stringify(teams[0]));
      } else {
        // Auto-create a default team for the user
        await createDefaultTeam(userId);
      }
    } catch (error) {
      console.error('Error loading user teams:', error);
    }
  };

  const createDefaultTeam = async (userId: string) => {
    try {
      const user = await enhancedTeamService.getUserById(userId);
      if (!user) return;
      
      // Create default team
      const defaultTeam = await enhancedTeamService.createTeam({
        name: `${user.Name || user.name || 'My'} Team`,
        description: 'Default team workspace',
        ownerId: userId
      });

      // Add user as team owner
      await enhancedTeamService.addTeamMember({
        userId: userId,
        teamId: defaultTeam.id,
        role: 'Admin'
      });

      console.log('Created default team:', defaultTeam);
      setCurrentTeam(defaultTeam);
      localStorage.setItem('currentTeam', JSON.stringify(defaultTeam));
    } catch (error) {
      console.error('Error creating default team:', error);
    }
  };

  const handleTeamChange = (team: Team | null) => {
    setCurrentTeam(team);
    if (team) {
      localStorage.setItem('currentTeam', JSON.stringify(team));
      if (appState === 'personal') {
        setAppState('team');
      }
    } else {
      localStorage.removeItem('currentTeam');
      if (appState === 'team') {
        setAppState('personal');
      }
    }
  };

  const handleStartDemo = (demoType: DemoType = 'personal') => {
    // Set demo user and navigate to appropriate demo
    const demoUser: User = { ...demoData.user, demoType };
    setUser(demoUser);
    
    if (demoType === 'team') {
      setAppState('team-demo');
    } else {
      setAppState('demo');
    }
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
      
      // Load user's teams and set up team context
      await loadUserTeams(dbUser.id);
      
      // Check if user was invited to a team and should start in team mode
      const savedTeam = localStorage.getItem('currentTeam');
      if (savedTeam) {
        localStorage.setItem('appMode', 'team');
        setAppState('team');
      } else {
        localStorage.setItem('appMode', 'personal');
        setAppState('personal');
      }
    } catch (error) {
      console.error('Error setting up user:', error);
      // Fallback to personal mode
      localStorage.setItem('appMode', 'personal');
      setAppState('personal');
    }
  };

  const handleSelectMode = (mode: string) => {
    localStorage.setItem('appMode', mode);
    setAppState('auth');
  };

  const handleAuthError = (error: Error) => {
    console.error('Authentication error:', error);
    // Could show error toast here
  };

  const handleUserJoin = async (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // If user joined a team, load their teams and set team context
    if (userData.teamId) {
      try {
        const team = await enhancedTeamService.getTeamById(userData.teamId);
        if (team) {
          setCurrentTeam(team);
          localStorage.setItem('currentTeam', JSON.stringify(team));
        }
      } catch (error) {
        console.error('Error loading team after join:', error);
      }
    }
    
    localStorage.setItem('appMode', 'team');
    
    // Clear invitation from URL
    window.history.replaceState({}, document.title, '/');
    setInvitationToken(null);
    setAppState('team');
    
    // Trigger team member list refresh after a short delay to ensure UI is ready
    setTimeout(async () => {
      if (teamMemberRefreshFn) {
        try {
          await teamMemberRefreshFn();
          console.log('Team member list refreshed after user join');
        } catch (error) {
          console.error('Error refreshing team member list:', error);
        }
      }
    }, 1000);
  };

  const handleCreateTeam = async (teamData: { name: string; description?: string }) => {
    if (!user?.id) return;
    
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
      setAppState('team');
      
      return newTeam;
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  };

  // Render based on app state with error boundaries
  const renderContent = () => {
    switch (appState) {
      case 'onboarding':
        return (
          <ErrorBoundary level="page">
            <SimpleOnboarding
              onStartDemo={handleStartDemo}
              onSignIn={handleSignUp}
              onSelectMode={handleSelectMode}
            />
          </ErrorBoundary>
        );

      case 'demo':
        return (
          <ErrorBoundary level="page">
            <DemoTaskManager
              onSignUp={handleSignUp}
            />
          </ErrorBoundary>
        );

      case 'team-demo':
        return (
          <ErrorBoundary level="page">
            <DemoCollaboration
              onSignUp={handleSignUp}
            />
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

      case 'personal':
        return (
          <ErrorBoundary level="page">
            <div style={{ position: 'relative' }}>
              <ErrorBoundary level="component">
                <EnhancedPersonalManager
                  user={user}
                  currentTeam={currentTeam}
                  onTasksUpdate={() => {}}
                />
              </ErrorBoundary>
              
              {/* Sign Out Button (floating) */}
              <button
                onClick={() => {
                  localStorage.clear();
                  setUser(null);
                  setAppState('onboarding');
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
              onUserJoin={handleUserJoin}
            />
          </ErrorBoundary>
        );

      case 'team':
        return (
          <ErrorBoundary level="page">
            <div style={{ position: 'relative' }}>
              <ErrorBoundary level="component">
                <DemoCollaboration
                  currentUser={user}
                  currentTeam={currentTeam}
                  onTeamChange={handleTeamChange}
                  onCreateTeam={handleCreateTeam}
                  onMemberRefresh={setTeamMemberRefreshFn}
                  onSignUp={() => {
                    // Already authenticated, so maybe show upgrade options
                    console.log('User already authenticated, showing team features');
                  }}
                  isAuthenticatedMode={true}
                />
              </ErrorBoundary>
              
              {/* Sign Out Button (floating) */}
              <button
                onClick={() => {
                  localStorage.clear();
                  setUser(null);
                  setAppState('onboarding');
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

      default:
        return (
          <ErrorBoundary level="page">
            <SimpleOnboarding
              onStartDemo={handleStartDemo}
              onSignIn={handleSignUp}
              onSelectMode={handleSelectMode}
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