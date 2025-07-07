import React, { useState } from 'react';
import { User, Users, CheckCircle2, ArrowRight, FileSpreadsheet, MessageSquare, Star } from 'lucide-react';
import { createPersonalDemoData, createTeamDemoData } from '../utils/demoData';

const OnboardingWizard = ({ user, onModeSelect }) => {
  const [selectedMode, setSelectedMode] = useState(null);

  const modes = [
    {
      id: 'personal',
      title: 'Personal Task Management',
      description: 'Manage your individual tasks with Google Sheets integration',
      icon: User,
      features: [
        'Connect your personal Google Sheet',
        'Add, edit, and organize tasks',
        'Track task status and progress',
        'Sync across all devices'
      ],
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
    },
    {
      id: 'team',
      title: 'Team Collaboration',
      description: 'Collaborate with your team using daily standups and shared tasks',
      icon: Users,
      features: [
        'Daily standup meetings',
        'Team task coordination',
        'Manager dashboard',
        'Performance analytics',
        'Real-time collaboration'
      ],
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
      popular: true
    }
  ];

  const handleModeSelect = (mode) => {
    setSelectedMode(mode.id);
  };

  const handleContinue = () => {
    if (selectedMode && onModeSelect) {
      // Create demo data for the selected mode
      if (selectedMode === 'personal') {
        createPersonalDemoData(user.id);
      } else if (selectedMode === 'team') {
        createTeamDemoData(user.id);
      }
      
      onModeSelect(selectedMode);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '40px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '900px',
        width: '100%'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '48px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle2 style={{ width: '24px', height: '24px', color: 'white' }} />
            </div>
            {user.profilePicture && (
              <img
                src={user.profilePicture}
                alt={user.name}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  border: '3px solid white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
            )}
          </div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '8px'
          }}>
            Welcome, {user.name}! 👋
          </h1>
          <p style={{
            fontSize: '18px',
            color: '#6b7280',
            lineHeight: '1.6'
          }}>
            How would you like to use TaskFlow? Choose the mode that best fits your needs.
          </p>
        </div>

        {/* Mode Selection */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isSelected = selectedMode === mode.id;
            
            return (
              <div
                key={mode.id}
                onClick={() => handleModeSelect(mode)}
                style={{
                  position: 'relative',
                  padding: '32px',
                  backgroundColor: 'white',
                  borderRadius: '16px',
                  border: `2px solid ${isSelected ? mode.color : '#e5e7eb'}`,
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isSelected ? 'translateY(-4px)' : 'translateY(0)',
                  boxShadow: isSelected 
                    ? `0 20px 25px -5px ${mode.color}20, 0 10px 10px -5px ${mode.color}10`
                    : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.borderColor = mode.color;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.borderColor = '#e5e7eb';
                  }
                }}
              >
                {/* Popular Badge */}
                {mode.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 12px',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    <Star style={{ width: '12px', height: '12px' }} />
                    Popular
                  </div>
                )}

                {/* Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    background: mode.gradient,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Icon style={{ width: '28px', height: '28px', color: 'white' }} />
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#111827',
                      marginBottom: '4px'
                    }}>
                      {mode.title}
                    </h3>
                    <p style={{
                      fontSize: '14px',
                      color: '#6b7280'
                    }}>
                      {mode.description}
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div style={{
                  display: 'grid',
                  gap: '8px'
                }}>
                  {mode.features.map((feature, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        color: '#374151'
                      }}
                    >
                      <CheckCircle2 style={{ 
                        width: '16px', 
                        height: '16px', 
                        color: mode.color,
                        flexShrink: 0
                      }} />
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    width: '24px',
                    height: '24px',
                    backgroundColor: mode.color,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CheckCircle2 style={{ width: '16px', height: '16px', color: 'white' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Continue Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'center'
        }}>
          <button
            onClick={handleContinue}
            disabled={!selectedMode}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 32px',
              fontSize: '18px',
              fontWeight: '600',
              color: 'white',
              backgroundColor: selectedMode ? '#3b82f6' : '#9ca3af',
              border: 'none',
              borderRadius: '12px',
              cursor: selectedMode ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              boxShadow: selectedMode 
                ? '0 4px 14px 0 rgba(59, 130, 246, 0.4)'
                : 'none'
            }}
            onMouseEnter={(e) => {
              if (selectedMode) {
                e.target.style.backgroundColor = '#2563eb';
                e.target.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedMode) {
                e.target.style.backgroundColor = '#3b82f6';
                e.target.style.transform = 'translateY(0)';
              }
            }}
          >
            Continue
            <ArrowRight style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Help Text */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px'
        }}>
          <p style={{
            fontSize: '14px',
            color: '#9ca3af'
          }}>
            Don't worry, you can always switch modes later in your settings
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;