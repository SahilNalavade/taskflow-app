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
import type { User, Team } from '@/types';

type AppState = 'onboarding' | 'demo' | 'team-demo' | 'auth' | 'personal' | 'team' | 'invitation';
type DemoType = 'personal' | 'team';

function App() {
  // App flow state
  const [appState, setAppState] = useState<AppState>('onboarding');
  const [user, setUser] = useState<User | null>(null);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [invitationToken, setInvitationToken] = useState<string | null>(null);

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
    const savedMode = localStorage.getItem('appMode');
    
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      
      if (userData.isDemo) {
        if (userData.demoType === 'team') {
          setAppState('team-demo');
        } else {
          setAppState('demo');
        }
      } else if (savedMode === 'team') {
        setAppState('team');
      } else {
        setAppState('personal');
      }
    }
  }, []);

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

  const handleAuthSuccess = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // For now, default to personal mode - we can add mode selection later
    localStorage.setItem('appMode', 'personal');
    setAppState('personal');
  };

  const handleSelectMode = (mode: string) => {
    localStorage.setItem('appMode', mode);
    setAppState('auth');
  };

  const handleAuthError = (error: Error) => {
    console.error('Authentication error:', error);
    // Could show error toast here
  };

  const handleUserJoin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('appMode', 'team');
    
    // Clear invitation from URL
    window.history.replaceState({}, document.title, '/');
    setInvitationToken(null);
    setAppState('team');
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