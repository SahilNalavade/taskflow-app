import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@/test/utils';
import App from './App';

// Mock the components to avoid dependency issues during testing
vi.mock('./components/SimpleOnboarding', () => ({
  default: ({ onStartDemo, onSignIn }: any) => (
    <div data-testid="simple-onboarding">
      <button onClick={() => onStartDemo('personal')}>Start Personal Demo</button>
      <button onClick={onSignIn}>Sign In</button>
    </div>
  ),
}));

vi.mock('./components/DemoTaskManager', () => ({
  default: ({ onSignUp }: any) => (
    <div data-testid="demo-task-manager">
      <button onClick={onSignUp}>Sign Up</button>
    </div>
  ),
}));

vi.mock('./components/GoogleSignIn', () => ({
  default: ({ onAuthSuccess, onError }: any) => (
    <div data-testid="google-signin">
      <button onClick={() => onAuthSuccess({ id: 'test', name: 'Test User', email: 'test@example.com' })}>
        Complete Auth
      </button>
    </div>
  ),
}));

vi.mock('./components/EnhancedPersonalManager', () => ({
  default: ({ user }: any) => (
    <div data-testid="enhanced-personal-manager">
      Welcome {user?.name || 'Unknown User'}
    </div>
  ),
}));

vi.mock('./services/demoData', () => ({
  demoData: {
    user: {
      id: 'demo-user',
      name: 'Demo User',
      email: 'demo@example.com',
      isDemo: true,
    },
  },
}));

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders onboarding screen by default', () => {
    render(<App />);
    expect(screen.getByTestId('simple-onboarding')).toBeInTheDocument();
  });

  it('navigates to demo mode when starting personal demo', async () => {
    const { user } = render(<App />);
    
    const startDemoButton = screen.getByText('Start Personal Demo');
    await user.click(startDemoButton);
    
    expect(screen.getByTestId('demo-task-manager')).toBeInTheDocument();
  });

  it('navigates to auth screen when signing in', async () => {
    const { user } = render(<App />);
    
    const signInButton = screen.getByText('Sign In');
    await user.click(signInButton);
    
    expect(screen.getByTestId('google-signin')).toBeInTheDocument();
  });

  it('navigates to personal manager after successful authentication', async () => {
    const { user } = render(<App />);
    
    // Go to sign in
    const signInButton = screen.getByText('Sign In');
    await user.click(signInButton);
    
    // Complete authentication
    const completeAuthButton = screen.getByText('Complete Auth');
    await user.click(completeAuthButton);
    
    expect(screen.getByTestId('enhanced-personal-manager')).toBeInTheDocument();
    expect(screen.getByText('Welcome Test User')).toBeInTheDocument();
  });

  it('restores user state from localStorage', () => {
    const userData = {
      id: 'stored-user',
      name: 'Stored User',
      email: 'stored@example.com',
    };
    
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('appMode', 'personal');
    
    render(<App />);
    
    expect(screen.getByTestId('enhanced-personal-manager')).toBeInTheDocument();
    expect(screen.getByText('Welcome Stored User')).toBeInTheDocument();
  });

  it('handles sign out correctly', async () => {
    const userData = {
      id: 'test-user',
      name: 'Test User',
      email: 'test@example.com',
    };
    
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('appMode', 'personal');
    
    const { user } = render(<App />);
    
    // Should show personal manager
    expect(screen.getByTestId('enhanced-personal-manager')).toBeInTheDocument();
    
    // Click sign out button
    const signOutButton = screen.getByText('Sign Out');
    await user.click(signOutButton);
    
    // Should return to onboarding
    expect(screen.getByTestId('simple-onboarding')).toBeInTheDocument();
    expect(localStorage.getItem('user')).toBeNull();
  });
});