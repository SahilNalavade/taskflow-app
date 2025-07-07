import React, { useState } from 'react';
import { 
  ArrowRight, ArrowLeft, Check, Users, Settings, Mail, 
  Sparkles, Target, Calendar, CheckCircle, X 
} from 'lucide-react';

const TeamOnboardingWizard = ({ 
  currentUser, 
  onComplete, 
  onCancel,
  onCreateTeam 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [teamData, setTeamData] = useState({
    name: '',
    description: '',
    purpose: '',
    size: '',
    inviteMembers: []
  });
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const steps = [
    {
      id: 'basics',
      title: 'Team Basics',
      description: 'Let\'s start with the fundamentals',
      icon: Users
    },
    {
      id: 'purpose',
      title: 'Team Purpose',
      description: 'What will your team focus on?',
      icon: Target
    },
    {
      id: 'members',
      title: 'Invite Members',
      description: 'Add your team members',
      icon: Mail
    },
    {
      id: 'review',
      title: 'Review & Create',
      description: 'Confirm your team setup',
      icon: CheckCircle
    }
  ];

  const purposeOptions = [
    { id: 'project', label: 'Project Management', description: 'Organize tasks and track progress' },
    { id: 'development', label: 'Software Development', description: 'Code collaboration and deployment' },
    { id: 'marketing', label: 'Marketing & Creative', description: 'Campaigns and content creation' },
    { id: 'operations', label: 'Operations & Support', description: 'Day-to-day business operations' },
    { id: 'general', label: 'General Collaboration', description: 'Multi-purpose team workspace' }
  ];

  const sizeOptions = [
    { id: 'small', label: '2-5 people', description: 'Small team or startup' },
    { id: 'medium', label: '6-15 people', description: 'Growing team or department' },
    { id: 'large', label: '16+ people', description: 'Large team or organization' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddMember = () => {
    if (newMemberEmail && !teamData.inviteMembers.includes(newMemberEmail)) {
      setTeamData({
        ...teamData,
        inviteMembers: [...teamData.inviteMembers, newMemberEmail]
      });
      setNewMemberEmail('');
    }
  };

  const handleRemoveMember = (email) => {
    setTeamData({
      ...teamData,
      inviteMembers: teamData.inviteMembers.filter(e => e !== email)
    });
  };

  const handleCreateTeam = async () => {
    setIsCreating(true);
    try {
      // Create the team
      const newTeam = await onCreateTeam({
        name: teamData.name,
        description: teamData.description
      });

      // TODO: Send invitations to members
      // This would involve calling the invitation service for each email

      onComplete(newTeam);
    } catch (error) {
      console.error('Error creating team:', error);
      // TODO: Show error message
    } finally {
      setIsCreating(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: // Basics
        return teamData.name.trim().length >= 2;
      case 1: // Purpose
        return teamData.purpose !== '';
      case 2: // Members
        return true; // This step is optional
      case 3: // Review
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Team Basics
        return (
          <div style={{ textAlign: 'center' }}>
            <Users style={{ 
              width: '48px', 
              height: '48px', 
              color: '#3b82f6', 
              margin: '0 auto 24px' 
            }} />
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              marginBottom: '8px',
              color: '#111827'
            }}>
              What's your team called?
            </h2>
            <p style={{ 
              color: '#6b7280', 
              marginBottom: '32px',
              fontSize: '16px'
            }}>
              Choose a name that represents your team's identity
            </p>
            
            <div style={{ maxWidth: '400px', margin: '0 auto' }}>
              <div style={{ marginBottom: '24px', textAlign: 'left' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Team Name *
                </label>
                <input
                  type="text"
                  value={teamData.name}
                  onChange={(e) => setTeamData({ ...teamData, name: e.target.value })}
                  placeholder="e.g., Design Team, Marketing Squad, Dev Team"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              
              <div style={{ textAlign: 'left' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Description (Optional)
                </label>
                <textarea
                  value={teamData.description}
                  onChange={(e) => setTeamData({ ...teamData, description: e.target.value })}
                  placeholder="Brief description of what your team does"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'vertical',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>
          </div>
        );

      case 1: // Team Purpose
        return (
          <div style={{ textAlign: 'center' }}>
            <Target style={{ 
              width: '48px', 
              height: '48px', 
              color: '#3b82f6', 
              margin: '0 auto 24px' 
            }} />
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              marginBottom: '8px',
              color: '#111827'
            }}>
              What's your team's main focus?
            </h2>
            <p style={{ 
              color: '#6b7280', 
              marginBottom: '32px',
              fontSize: '16px'
            }}>
              This helps us customize your workspace
            </p>
            
            <div style={{ 
              display: 'grid', 
              gap: '16px', 
              maxWidth: '600px', 
              margin: '0 auto' 
            }}>
              {purposeOptions.map((option) => (
                <div
                  key={option.id}
                  onClick={() => setTeamData({ ...teamData, purpose: option.id })}
                  style={{
                    padding: '20px',
                    border: `2px solid ${teamData.purpose === option.id ? '#3b82f6' : '#e5e7eb'}`,
                    borderRadius: '12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    backgroundColor: teamData.purpose === option.id ? '#eff6ff' : 'white',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                  }}>
                    <div>
                      <h3 style={{ 
                        fontSize: '16px', 
                        fontWeight: '600', 
                        marginBottom: '4px',
                        color: '#111827'
                      }}>
                        {option.label}
                      </h3>
                      <p style={{ 
                        color: '#6b7280', 
                        fontSize: '14px', 
                        margin: 0 
                      }}>
                        {option.description}
                      </p>
                    </div>
                    {teamData.purpose === option.id && (
                      <Check style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 2: // Invite Members
        return (
          <div style={{ textAlign: 'center' }}>
            <Mail style={{ 
              width: '48px', 
              height: '48px', 
              color: '#3b82f6', 
              margin: '0 auto 24px' 
            }} />
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              marginBottom: '8px',
              color: '#111827'
            }}>
              Invite your team members
            </h2>
            <p style={{ 
              color: '#6b7280', 
              marginBottom: '32px',
              fontSize: '16px'
            }}>
              Add email addresses to send invitations (you can also do this later)
            </p>
            
            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
              <div style={{ 
                display: 'flex', 
                gap: '12px', 
                marginBottom: '24px' 
              }}>
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
                />
                <button
                  onClick={handleAddMember}
                  disabled={!newMemberEmail.includes('@')}
                  style={{
                    padding: '12px 20px',
                    backgroundColor: newMemberEmail.includes('@') ? '#3b82f6' : '#9ca3af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: newMemberEmail.includes('@') ? 'pointer' : 'not-allowed'
                  }}
                >
                  Add
                </button>
              </div>
              
              {teamData.inviteMembers.length > 0 && (
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '16px'
                }}>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    marginBottom: '12px',
                    color: '#111827'
                  }}>
                    Members to invite ({teamData.inviteMembers.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {teamData.inviteMembers.map((email, index) => (
                      <div 
                        key={index}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 12px',
                          backgroundColor: 'white',
                          border: '1px solid #e5e7eb',
                          borderRadius: '6px'
                        }}
                      >
                        <span style={{ fontSize: '14px', color: '#374151' }}>
                          {email}
                        </span>
                        <button
                          onClick={() => handleRemoveMember(email)}
                          style={{
                            padding: '4px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#6b7280',
                            cursor: 'pointer'
                          }}
                        >
                          <X style={{ width: '16px', height: '16px' }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {teamData.inviteMembers.length === 0 && (
                <div style={{
                  padding: '24px',
                  textAlign: 'center',
                  color: '#9ca3af',
                  fontSize: '14px',
                  fontStyle: 'italic'
                }}>
                  No members added yet. You can skip this step and invite members later.
                </div>
              )}
            </div>
          </div>
        );

      case 3: // Review
        return (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle style={{ 
              width: '48px', 
              height: '48px', 
              color: '#10b981', 
              margin: '0 auto 24px' 
            }} />
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '600', 
              marginBottom: '8px',
              color: '#111827'
            }}>
              Ready to create your team?
            </h2>
            <p style={{ 
              color: '#6b7280', 
              marginBottom: '32px',
              fontSize: '16px'
            }}>
              Review your team setup and create your workspace
            </p>
            
            <div style={{
              maxWidth: '500px',
              margin: '0 auto',
              backgroundColor: '#f8fafc',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '24px',
              textAlign: 'left'
            }}>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#111827',
                  marginBottom: '4px'
                }}>
                  Team Name
                </h3>
                <p style={{ color: '#6b7280', margin: 0 }}>{teamData.name}</p>
              </div>
              
              {teamData.description && (
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    color: '#111827',
                    marginBottom: '4px'
                  }}>
                    Description
                  </h3>
                  <p style={{ color: '#6b7280', margin: 0 }}>{teamData.description}</p>
                </div>
              )}
              
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#111827',
                  marginBottom: '4px'
                }}>
                  Purpose
                </h3>
                <p style={{ color: '#6b7280', margin: 0 }}>
                  {purposeOptions.find(p => p.id === teamData.purpose)?.label || 'Not specified'}
                </p>
              </div>
              
              <div>
                <h3 style={{ 
                  fontSize: '16px', 
                  fontWeight: '600', 
                  color: '#111827',
                  marginBottom: '4px'
                }}>
                  Members to Invite
                </h3>
                <p style={{ color: '#6b7280', margin: 0 }}>
                  {teamData.inviteMembers.length > 0 
                    ? `${teamData.inviteMembers.length} members will be invited`
                    : 'No members to invite (you can add them later)'
                  }
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

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
      zIndex: 3000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: '600', margin: 0, color: '#111827' }}>
                Create Your Team
              </h1>
              <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '14px' }}>
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
            <button
              onClick={onCancel}
              style={{
                padding: '8px',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#6b7280',
                cursor: 'pointer',
                borderRadius: '6px'
              }}
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div style={{
            marginTop: '16px',
            backgroundColor: '#f3f4f6',
            borderRadius: '4px',
            height: '8px',
            overflow: 'hidden'
          }}>
            <div style={{
              backgroundColor: '#3b82f6',
              height: '100%',
              width: `${((currentStep + 1) / steps.length) * 100}%`,
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '40px 32px' }}>
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div style={{
          padding: '24px 32px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: 'transparent',
              color: currentStep === 0 ? '#9ca3af' : '#6b7280',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
              opacity: currentStep === 0 ? 0.5 : 1
            }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            Previous
          </button>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                backgroundColor: isStepValid() ? '#3b82f6' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: isStepValid() ? 'pointer' : 'not-allowed'
              }}
            >
              Next
              <ArrowRight style={{ width: '16px', height: '16px' }} />
            </button>
          ) : (
            <button
              onClick={handleCreateTeam}
              disabled={isCreating || !isStepValid()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                backgroundColor: (!isCreating && isStepValid()) ? '#10b981' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: (!isCreating && isStepValid()) ? 'pointer' : 'not-allowed'
              }}
            >
              {isCreating ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles style={{ width: '16px', height: '16px' }} />
                  Create Team
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamOnboardingWizard;