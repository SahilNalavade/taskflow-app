import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, AlertCircle, User } from 'lucide-react';
import { googleAuthService } from '../services/googleAuth';

const GoogleSignIn = ({ onAuthSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeGoogleAuth();
  }, []);

  const initializeGoogleAuth = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Starting Google Auth initialization...');
      const initialized = await googleAuthService.initialize();
      
      if (!initialized) {
        throw new Error('Google authentication services failed to initialize. Please check your internet connection and try again.');
      }
      
      setIsInitialized(initialized);
      console.log('Google Auth initialized successfully');
      
      // Check if user is already signed in
      if (googleAuthService.isSignedIn()) {
        console.log('User already signed in, getting profile...');
        let profile = await googleAuthService.getUserProfile();
        
        // Try cached profile if direct fetch fails
        if (!profile) {
          profile = googleAuthService.getCachedUserProfile();
        }
        
        if (profile) {
          handleSuccessfulAuth(profile);
        }
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to initialize Google authentication';
      setError(errorMessage);
      console.error('Google Auth initialization error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isInitialized) {
      setError('Google authentication is not ready. Please refresh the page.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Force sign out and re-authorize with new permissions
      await googleAuthService.signOut();
      console.log('Signed out to refresh permissions');
      
      const authResult = await googleAuthService.signIn();
      console.log('Auth result:', authResult);
      
      if (authResult) {
        // Try to get profile from auth service
        let profile = await googleAuthService.getUserProfile();
        console.log('Profile from getUserProfile:', profile);
        
        // If profile fetch fails, use cached profile or create fallback
        if (!profile) {
          profile = googleAuthService.getCachedUserProfile();
          console.log('Cached profile:', profile);
        }
        
        // If still no profile, create a basic one
        if (!profile) {
          console.log('No profile found, creating fallback');
          profile = null; // Will trigger fallback in handleSuccessfulAuth
        }
        
        handleSuccessfulAuth(profile);
      } else {
        throw new Error('Sign-in was cancelled or failed');
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google');
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessfulAuth = (googleProfile) => {
    console.log('handleSuccessfulAuth called with:', googleProfile);
    
    // Handle different profile object formats
    let profileData;
    
    if (googleProfile && typeof googleProfile.getId === 'function') {
      // Google profile object with methods
      try {
        profileData = {
          id: googleProfile.getId(),
          name: googleProfile.getName(),
          email: googleProfile.getEmail(),
          profilePicture: googleProfile.getImageUrl()
        };
      } catch (error) {
        console.error('Error calling profile methods:', error);
        profileData = null;
      }
    } else if (googleProfile && googleProfile.id) {
      // Direct profile data object
      profileData = {
        id: googleProfile.id,
        name: googleProfile.name,
        email: googleProfile.email,
        profilePicture: googleProfile.picture
      };
    }
    
    // If no valid profile data, create fallback
    if (!profileData) {
      console.log('Creating fallback profile data');
      profileData = {
        id: `user_${Date.now()}`,
        name: 'Demo User',
        email: 'demo@taskflow.com',
        profilePicture: null
      };
    }

    // Create user data
    const userData = {
      ...profileData,
      isGoogleAuthenticated: true,
      plan: 'starter',
      connectedSheets: [],
      teams: []
    };

    // Store user data
    localStorage.setItem('user', JSON.stringify(userData));
    
    if (onAuthSuccess) {
      onAuthSuccess(userData);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '20px',
      padding: '32px',
      backgroundColor: 'white',
      borderRadius: '16px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      maxWidth: '400px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '64px',
          height: '64px',
          backgroundColor: '#3b82f6',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px'
        }}>
          <User style={{ width: '32px', height: '32px', color: 'white' }} />
        </div>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: '8px'
        }}>
          Welcome to TaskFlow
        </h2>
        <p style={{
          color: '#6b7280',
          fontSize: '16px',
          lineHeight: '1.5'
        }}>
          Sign in with Google to access your personal tasks and team collaboration features.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          backgroundColor: '#fef2f2',
          color: '#dc2626',
          borderRadius: '8px',
          fontSize: '14px',
          width: '100%'
        }}>
          <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
          {error}
        </div>
      )}

      {/* Google Sign-In Button */}
      <button
        onClick={handleGoogleSignIn}
        disabled={loading || !isInitialized}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          width: '100%',
          padding: '12px 24px',
          backgroundColor: loading || !isInitialized ? '#f3f4f6' : '#ffffff',
          color: loading || !isInitialized ? '#9ca3af' : '#374151',
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: loading || !isInitialized ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          marginBottom: '12px'
        }}
        onMouseEnter={(e) => {
          if (!loading && isInitialized) {
            e.target.style.borderColor = '#3b82f6';
            e.target.style.backgroundColor = '#f8fafc';
          }
        }}
        onMouseLeave={(e) => {
          if (!loading && isInitialized) {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.backgroundColor = '#ffffff';
          }
        }}
      >
        {loading ? (
          <>
            <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
            {isInitialized ? 'Signing in...' : 'Initializing...'}
          </>
        ) : (
          <>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </>
        )}
      </button>

      {/* Troubleshooting section */}
      {error && (
        <div style={{
          textAlign: 'center',
          padding: '16px',
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#92400e',
          lineHeight: '1.4'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>Having trouble signing in?</p>
          <p style={{ margin: '0 0 12px 0' }}>
            Make sure your browser allows popups and try refreshing the page. 
            If the issue persists, you can try the demo mode below.
          </p>
          
          {/* Demo Mode Button (smaller, less prominent) */}
          <button
            onClick={() => {
              const demoUser = {
                id: `demo_${Date.now()}`,
                name: 'Demo User',
                email: 'demo@taskflow.com',
                profilePicture: null,
                isGoogleAuthenticated: false,
                plan: 'starter',
                connectedSheets: [],
                teams: []
              };
              
              localStorage.setItem('user', JSON.stringify(demoUser));
              if (onAuthSuccess) {
                onAuthSuccess(demoUser);
              }
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#92400e',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Continue with Demo Mode
          </button>
        </div>
      )}

      {/* Benefits */}
      <div style={{
        display: 'grid',
        gap: '8px',
        width: '100%',
        fontSize: '14px',
        color: '#6b7280'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 style={{ width: '16px', height: '16px', color: '#10b981' }} />
          Secure Google OAuth authentication
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 style={{ width: '16px', height: '16px', color: '#10b981' }} />
          Connect your Google Sheets instantly
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 style={{ width: '16px', height: '16px', color: '#10b981' }} />
          Team collaboration features
        </div>
      </div>

      {/* Privacy Note */}
      <p style={{
        fontSize: '12px',
        color: '#9ca3af',
        textAlign: 'center',
        lineHeight: '1.4'
      }}>
        We only access your Google Sheets that you choose to connect. 
        Your data stays secure and private.
      </p>
    </div>
  );
};

export default GoogleSignIn;