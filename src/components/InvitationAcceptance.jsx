import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, User, Shield, BarChart3, Crown } from 'lucide-react';
import { emailService } from '../services/emailService';
import { enhancedTeamService } from '../services/enhancedTeamService';

const InvitationAcceptance = ({ token, onUserJoin }) => {
  const [invitationData, setInvitationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (token) {
      validateInvitation();
    }
  }, [token]);

  const validateInvitation = async () => {
    try {
      // First check if invitation exists in database
      const dbInvitation = await enhancedTeamService.getInvitationByToken(token);
      
      if (dbInvitation) {
        // Use database invitation data
        if (dbInvitation.Status === 'Accepted') {
          setError('This invitation has already been accepted');
          setLoading(false);
          return;
        }
        
        if (dbInvitation.Status === 'Expired') {
          setError('This invitation has expired');
          setLoading(false);
          return;
        }
        
        // Get team details
        const team = await enhancedTeamService.getTeamById(dbInvitation.Team[0]);
        
        setInvitationData({
          email: dbInvitation.Email,
          role: dbInvitation.Role,
          teamId: dbInvitation.Team[0],
          teamName: team ? team.Name : 'Team',
          invitationId: dbInvitation.id
        });
        setLoading(false);
        return;
      }
      
      // Fallback to token-based validation
      const decodedData = emailService.decodeInvitationToken(token);
      
      if (!decodedData) {
        setError('Invalid or expired invitation link');
        setLoading(false);
        return;
      }

      setInvitationData(decodedData);
      setUserInfo(prev => ({ ...prev, name: decodedData.name || '' }));
      setLoading(false);
    } catch (error) {
      console.error('Error validating invitation:', error);
      setError('Invalid invitation link');
      setLoading(false);
    }
  };

  const handleAcceptInvitation = () => {
    // Store invitation data for after authentication
    localStorage.setItem('pendingInvitation', JSON.stringify({
      invitationData,
      token
    }));
    
    // Redirect to Google Sign-In
    window.location.href = '/?auth=true';
  };

  const getRoleIcon = (role) => {
    const icons = {
      'owner': Crown,
      'admin': Shield,
      'manager': BarChart3,
      'member': User,
      'viewer': User
    };
    return icons[role] || User;
  };

  const getRoleColor = (role) => {
    const colors = {
      'owner': '#7c3aed',
      'admin': '#dc2626',
      'manager': '#ea580c',
      'member': '#059669',
      'viewer': '#6b7280'
    };
    return colors[role] || '#6b7280';
  };

  const getRolePermissions = (role) => {
    const permissions = {
      'admin': [
        'Manage team members and permissions',
        'Create and delete projects',
        'View team analytics and reports',
        'Manage integrations and settings'
      ],
      'manager': [
        'Assign and manage tasks',
        'View team analytics',
        'Invite new team members',
        'Manage project settings'
      ],
      'member': [
        'Create and edit tasks',
        'Collaborate with comments',
        'Update task status',
        'View assigned projects'
      ],
      'viewer': [
        'View tasks and projects',
        'Add comments to tasks',
        'View team activity',
        'Export reports'
      ]
    };
    
    return permissions[role] || permissions['member'];
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid #f3f4f6',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#6b7280' }}>Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (error && !invitationData) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        padding: '20px'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: '400px',
          width: '100%'
        }}>
          <XCircle style={{ 
            width: '48px', 
            height: '48px', 
            color: '#ef4444', 
            margin: '0 auto 20px' 
          }} />
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#111827', 
            marginBottom: '8px' 
          }}>
            Invalid Invitation
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            {error}
          </p>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Go to TaskFlow
          </button>
        </div>
      </div>
    );
  }

  if (accepting) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: '400px',
          width: '100%'
        }}>
          <CheckCircle style={{ 
            width: '48px', 
            height: '48px', 
            color: '#10b981', 
            margin: '0 auto 20px' 
          }} />
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            color: '#111827', 
            marginBottom: '8px' 
          }}>
            Welcome to the team!
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Your invitation has been accepted. Redirecting to TaskFlow...
          </p>
        </div>
      </div>
    );
  }

  const RoleIcon = getRoleIcon(invitationData.role);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '40px 20px',
        textAlign: 'center',
        color: 'white'
      }}>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: '600', 
          margin: '0 0 8px 0' 
        }}>
          You're Invited!
        </h1>
        <p style={{ 
          fontSize: '18px', 
          opacity: 0.9, 
          margin: 0 
        }}>
          Join TaskFlow and start collaborating
        </p>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '600px',
        margin: '-20px auto 0',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '40px' }}>
          {/* Invitation Details */}
          <div style={{
            textAlign: 'center',
            marginBottom: '32px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: getRoleColor(invitationData.role),
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <RoleIcon style={{ width: '32px', height: '32px', color: 'white' }} />
            </div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '8px'
            }}>
              Join as {invitationData.role}
            </h2>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              You've been invited to collaborate on TaskFlow
            </p>
          </div>

          {/* Role Permissions */}
          <div style={{
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '32px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '12px'
            }}>
              As a {invitationData.role}, you'll be able to:
            </h3>
            <ul style={{
              margin: 0,
              paddingLeft: '20px',
              color: '#6b7280'
            }}>
              {getRolePermissions(invitationData.role).map((permission, index) => (
                <li key={index} style={{ marginBottom: '4px' }}>
                  {permission}
                </li>
              ))}
            </ul>
          </div>

          {/* Invitation Details */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{
              backgroundColor: '#f0f9ff',
              borderRadius: '8px',
              padding: '20px',
              border: '1px solid #e0f2fe'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#0369a1',
                marginBottom: '8px'
              }}>
                You're invited to join {invitationData.teamName}
              </h3>
              <p style={{
                color: '#0284c7',
                fontSize: '14px',
                margin: 0
              }}>
                Email: {invitationData.email}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '24px'
            }}>
              <p style={{ color: '#ef4444', margin: 0, fontSize: '14px' }}>
                {error}
              </p>
            </div>
          )}

          {/* Accept Button */}
          <button
            onClick={handleAcceptInvitation}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <CheckCircle style={{ width: '16px', height: '16px' }} />
            Sign in with Google to Accept
          </button>

          {/* Expiration Notice */}
          <div style={{
            textAlign: 'center',
            marginTop: '24px',
            padding: '16px',
            backgroundColor: '#fffbeb',
            borderRadius: '8px',
            border: '1px solid #fed7aa'
          }}>
            <Clock style={{ 
              width: '16px', 
              height: '16px', 
              color: '#f59e0b', 
              display: 'inline',
              marginRight: '8px' 
            }} />
            <span style={{ color: '#f59e0b', fontSize: '14px' }}>
              This invitation expires in 7 days
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvitationAcceptance;