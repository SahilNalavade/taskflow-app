import React, { useState } from 'react';
import { Play, User, Users, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

const SimpleOnboarding = ({ onStartDemo, onSignIn, onSelectMode }) => {
  const [step, setStep] = useState('welcome'); // 'welcome', 'mode-select'

  if (step === 'mode-select') {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '20px',
          padding: '48px',
          maxWidth: '600px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          <h2 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '16px'
          }}>
            Choose Your Workflow
          </h2>
          <p style={{
            color: '#6b7280',
            fontSize: '18px',
            marginBottom: '40px'
          }}>
            How would you like to use TaskFlow?
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '24px',
            marginBottom: '32px'
          }}>
            {/* Personal Mode */}
            <div
              onClick={() => onSelectMode('personal')}
              style={{
                padding: '32px 24px',
                border: '2px solid #e5e7eb',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: 'white'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.transform = 'translateY(-4px)';
                e.target.style.boxShadow = '0 10px 25px -5px rgba(59, 130, 246, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <User style={{
                width: '48px',
                height: '48px',
                color: '#3b82f6',
                margin: '0 auto 16px'
              }} />
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '8px'
              }}>
                Personal Tasks
              </h3>
              <p style={{
                color: '#6b7280',
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                Manage your personal to-do list and track your individual productivity.
              </p>
            </div>

            {/* Team Mode */}
            <div
              onClick={() => onSelectMode('team')}
              style={{
                padding: '32px 24px',
                border: '2px solid #e5e7eb',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: 'white'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#10b981';
                e.target.style.transform = 'translateY(-4px)';
                e.target.style.boxShadow = '0 10px 25px -5px rgba(16, 185, 129, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <Users style={{
                width: '48px',
                height: '48px',
                color: '#10b981',
                margin: '0 auto 16px'
              }} />
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '8px'
              }}>
                Team Collaboration
              </h3>
              <p style={{
                color: '#6b7280',
                fontSize: '14px',
                lineHeight: '1.5'
              }}>
                Daily standups, team tasks, and collaborative project management.
              </p>
            </div>
          </div>

          <button
            onClick={() => setStep('welcome')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              color: '#6b7280',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '48px',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Logo/Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#3b82f6',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px'
        }}>
          <Sparkles style={{ width: '40px', height: '40px', color: 'white' }} />
        </div>

        <h1 style={{
          fontSize: '36px',
          fontWeight: 'bold',
          color: '#111827',
          marginBottom: '16px'
        }}>
          Welcome to TaskFlow
        </h1>
        
        <p style={{
          color: '#6b7280',
          fontSize: '18px',
          lineHeight: '1.6',
          marginBottom: '32px'
        }}>
          The smart task manager that connects to your Google Sheets and helps teams collaborate seamlessly.
        </p>

        {/* Feature highlights */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '40px',
          textAlign: 'left'
        }}>
          {[
            'Connect your Google Sheets instantly',
            'Track personal and team tasks',
            'Daily standup automation',
            'Real-time collaboration'
          ].map((feature, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <CheckCircle2 style={{ width: '20px', height: '20px', color: '#10b981' }} />
              <span style={{ color: '#374151', fontSize: '16px' }}>{feature}</span>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={onStartDemo}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                width: '100%',
                padding: '16px 24px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#2563eb';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#3b82f6';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <User style={{ width: '20px', height: '20px' }} />
              Try Personal Tasks Demo
              <ArrowRight style={{ width: '20px', height: '20px' }} />
            </button>

            <button
              onClick={() => onStartDemo('team')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                width: '100%',
                padding: '16px 24px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#059669';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#10b981';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <Users style={{ width: '20px', height: '20px' }} />
              Try Team Collaboration Demo
              <ArrowRight style={{ width: '20px', height: '20px' }} />
            </button>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            margin: '16px 0'
          }}>
            <div style={{ height: '1px', backgroundColor: '#d1d5db', flex: 1 }} />
            <span style={{ color: '#6b7280', fontSize: '14px' }}>or</span>
            <div style={{ height: '1px', backgroundColor: '#d1d5db', flex: 1 }} />
          </div>

          <button
            onClick={() => setStep('mode-select')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              width: '100%',
              padding: '14px 24px',
              backgroundColor: 'white',
              color: '#374151',
              border: '2px solid #d1d5db',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.color = '#3b82f6';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#d1d5db';
              e.target.style.color = '#374151';
            }}
          >
            <User style={{ width: '20px', height: '20px' }} />
            Sign In with Google
          </button>
        </div>

        <p style={{
          fontSize: '12px',
          color: '#9ca3af',
          marginTop: '24px',
          lineHeight: '1.4'
        }}>
          Try the demo to see TaskFlow in action, no sign-up required.
          Your demo data stays private and local.
        </p>
      </div>
    </div>
  );
};

export default SimpleOnboarding;