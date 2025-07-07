// Temporary type declarations for JavaScript modules
// These will be replaced as we convert components to TypeScript

declare module './components/SimpleOnboarding' {
  interface SimpleOnboardingProps {
    onStartDemo: (demoType?: 'personal' | 'team') => void;
    onSignIn: () => void;
    onSelectMode: (mode: string) => void;
  }
  const SimpleOnboarding: React.FC<SimpleOnboardingProps>;
  export default SimpleOnboarding;
}

declare module './components/DemoTaskManager' {
  interface DemoTaskManagerProps {
    onSignUp: () => void;
  }
  const DemoTaskManager: React.FC<DemoTaskManagerProps>;
  export default DemoTaskManager;
}

declare module './components/DemoCollaboration' {
  interface DemoCollaborationProps {
    onSignUp: () => void;
    currentUser?: any;
    isAuthenticatedMode?: boolean;
  }
  const DemoCollaboration: React.FC<DemoCollaborationProps>;
  export default DemoCollaboration;
}

declare module './components/GoogleSignIn' {
  interface GoogleSignInProps {
    onAuthSuccess: (userData: any) => void;
    onError: (error: Error) => void;
  }
  const GoogleSignIn: React.FC<GoogleSignInProps>;
  export default GoogleSignIn;
}

declare module './components/PersonalTasksManager' {
  const PersonalTasksManager: React.FC<any>;
  export default PersonalTasksManager;
}

declare module './components/DailyStandupInterface' {
  const DailyStandupInterface: React.FC<any>;
  export default DailyStandupInterface;
}

declare module './components/EnhancedPersonalManager' {
  interface EnhancedPersonalManagerProps {
    user: any;
    currentTeam: any;
    onTasksUpdate: () => void;
  }
  const EnhancedPersonalManager: React.FC<EnhancedPersonalManagerProps>;
  export default EnhancedPersonalManager;
}

declare module './services/demoData' {
  export const demoData: {
    user: any;
    [key: string]: any;
  };
}