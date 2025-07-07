import { useState, useEffect } from 'react';
import { X, Shield, ExternalLink, AlertCircle, CheckCircle, Play } from 'lucide-react';
import { googleAuthService } from '../services/googleAuth';

const GoogleAuthSetup = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsSignedIn(googleAuthService.isSignedIn());
    }
  }, [isOpen]);

  const handleSignIn = async () => {
    setLoading(true);
    setError('');
    
    try {
      await googleAuthService.signIn();
      setIsSignedIn(true);
      onComplete();
      onClose();
    } catch (error) {
      setError('Failed to sign in: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await googleAuthService.signOut();
    setIsSignedIn(false);
  };

  if (!isOpen) return null;

  return (
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
      zIndex: 1000,
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '2rem',
        width: '100%',
        maxWidth: '500px',
        margin: '1rem',
        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.12)',
        position: 'relative'
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            padding: '0.5rem',
            cursor: 'pointer',
            borderRadius: '8px',
            color: '#64748b'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)',
            borderRadius: '50%',
            padding: '1rem',
            width: '60px',
            height: '60px',
            margin: '0 auto 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Shield size={28} style={{ color: 'white' }} />
          </div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '0.5rem'
          }}>
            Enable Google Sheets Editing
          </h2>
          <p style={{
            color: '#64748b',
            fontSize: '0.875rem'
          }}>
            Sign in with Google to edit your spreadsheets directly
          </p>
        </div>

        {!isSignedIn ? (
          <>
            {step === 1 && (
              <div>
                <div style={{
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '2rem'
                }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#0c4a6e',
                    margin: '0 0 0.5rem 0'
                  }}>
                    Why do I need to sign in?
                  </h3>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#0c4a6e',
                    margin: 0,
                    lineHeight: '1.5'
                  }}>
                    Google requires authentication for editing spreadsheets. This is more secure than API keys and gives you full editing capabilities.
                  </p>
                </div>

                <div style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginBottom: '2rem'
                }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#1e293b',
                    margin: '0 0 1rem 0'
                  }}>
                    ✅ What you'll get:
                  </h3>
                  <ul style={{
                    margin: 0,
                    paddingLeft: '1.5rem',
                    color: '#374151',
                    fontSize: '0.875rem',
                    lineHeight: '1.6'
                  }}>
                    <li style={{ marginBottom: '0.5rem' }}>Edit tasks directly in your Google Sheets</li>
                    <li style={{ marginBottom: '0.5rem' }}>Add new tasks that appear in your spreadsheet</li>
                    <li style={{ marginBottom: '0.5rem' }}>Delete tasks and update status</li>
                    <li>Real-time synchronization between TaskFlow and Google Sheets</li>
                  </ul>
                </div>

                <div style={{
                  backgroundColor: '#fef3cd',
                  border: '1px solid #fde68a',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '2rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem'
                }}>
                  <Shield size={16} style={{ color: '#92400e', marginTop: '0.125rem' }} />
                  <div style={{ fontSize: '0.875rem', color: '#92400e' }}>
                    <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500' }}>Secure & Private:</p>
                    <p style={{ margin: 0 }}>
                      We only request access to your Google Sheets. Your data stays private and secure.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  style={{
                    width: '100%',
                    padding: '0.875rem',
                    background: 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Continue to Sign In
                </button>
              </div>
            )}

            {step === 2 && (
              <div>
                <div style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginBottom: '2rem',
                  textAlign: 'center'
                }}>
                  <Play size={48} style={{ color: '#4285f4', marginBottom: '1rem' }} />
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '0.5rem'
                  }}>
                    Ready to Sign In
                  </h3>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#64748b',
                    margin: 0
                  }}>
                    Click the button below to sign in with your Google account
                  </p>
                </div>

                {error && (
                  <div style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    padding: '1rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem'
                  }}>
                    <AlertCircle size={16} style={{ color: '#ef4444', marginTop: '0.125rem' }} />
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#dc2626',
                      margin: 0
                    }}>
                      {error}
                    </p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => setStep(1)}
                    style={{
                      flex: 1,
                      padding: '0.875rem',
                      background: 'white',
                      color: '#374151',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSignIn}
                    disabled={loading}
                    style={{
                      flex: 2,
                      padding: '0.875rem',
                      background: loading ? '#9ca3af' : 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading ? 'Signing In...' : 'Sign In with Google'}
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '12px',
              padding: '2rem',
              marginBottom: '2rem'
            }}>
              <CheckCircle size={48} style={{ color: '#16a34a', marginBottom: '1rem' }} />
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: '#15803d',
                marginBottom: '0.5rem'
              }}>
                Successfully Signed In!
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: '#15803d',
                margin: 0
              }}>
                You can now edit your Google Sheets directly from TaskFlow
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={handleSignOut}
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  background: 'white',
                  color: '#ef4444',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Sign Out
              </button>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Start Editing
              </button>
            </div>
          </div>
        )}

        <div style={{
          textAlign: 'center',
          marginTop: '1rem'
        }}>
          <a
            href="https://developers.google.com/sheets/api/guides/authorizing"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#334155',
              fontSize: '0.875rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <ExternalLink size={14} />
            Learn about Google Sheets permissions
          </a>
        </div>
      </div>
    </div>
  );
};

export default GoogleAuthSetup;