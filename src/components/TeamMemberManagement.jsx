import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Settings, Shield, Crown, User,
  Mail, Calendar, BarChart3, Award, AlertTriangle,
  Edit3, Trash2, MoreHorizontal, Check, X, Send,
  Clock, CheckCircle, XCircle, RotateCcw, Eye
} from 'lucide-react';
import { demoData } from '../services/demoData';
import { realtimeEngine } from '../services/realtimeEngine';
import { emailService } from '../services/emailService';
import { enhancedTeamService } from '../services/enhancedTeamService';

const TeamMemberManagement = ({ currentUser, currentTeam, onTeamUpdate, onMemberRefresh }) => {
  const [teamMembers, setTeamMembers] = useState(demoData.teamMembers || []);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    name: '',
    role: 'Member',
    message: ''
  });
  const [sendingInvite, setSendingInvite] = useState(false);
  const [inviteStatus, setInviteStatus] = useState(null);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const roles = [
    {
      id: 'owner',
      name: 'Owner',
      icon: Crown,
      color: '#7c3aed',
      permissions: [
        'Manage team members',
        'Delete projects',
        'Billing and subscriptions',
        'All member permissions'
      ],
      description: 'Full control over team and projects'
    },
    {
      id: 'admin',
      name: 'Admin',
      icon: Shield,
      color: '#dc2626',
      permissions: [
        'Manage team members',
        'Create/delete projects',
        'Manage integrations',
        'View analytics'
      ],
      description: 'Administrative access with most permissions'
    },
    {
      id: 'manager',
      name: 'Manager',
      icon: BarChart3,
      color: '#ea580c',
      permissions: [
        'Assign tasks',
        'View team analytics',
        'Manage project settings',
        'Invite members'
      ],
      description: 'Project management and team oversight'
    },
    {
      id: 'member',
      name: 'Member',
      icon: User,
      color: '#059669',
      permissions: [
        'Create and edit tasks',
        'Comment on tasks',
        'View assigned projects',
        'Update task status'
      ],
      description: 'Standard team member access'
    },
    {
      id: 'viewer',
      name: 'Viewer',
      icon: User,
      color: '#6b7280',
      permissions: [
        'View tasks and projects',
        'Comment on tasks',
        'View team activity'
      ],
      description: 'Read-only access to team content'
    }
  ];

  // Load team members and pending invitations
  useEffect(() => {
    console.log('TeamMemberManagement - currentTeam changed:', currentTeam);
    loadTeamData();
  }, [currentTeam]);

  const loadTeamData = async () => {
    if (!currentTeam?.id) {
      // Use demo data if no team selected
      setTeamMembers(demoData.teamMembers || []);
      const pending = emailService.getPendingInvitations();
      setPendingInvitations(pending);
      return;
    }

    try {
      // Load team members from database
      const members = await enhancedTeamService.getTeamMembers(currentTeam.id);
      console.log('Loaded team members:', members);
      setTeamMembers(members);

      // Load pending invitations (this could be enhanced to filter by team)
      const pending = emailService.getPendingInvitations();
      setPendingInvitations(pending);
    } catch (error) {
      console.error('Error loading team data:', error);
      // Fallback to demo data
      setTeamMembers(demoData.teamMembers || []);
    }
  };

  // Refresh function that can be called externally
  const refreshTeamData = async () => {
    setRefreshing(true);
    try {
      await loadTeamData();
      console.log('Team data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing team data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Expose refresh function to parent component
  useEffect(() => {
    if (onMemberRefresh && typeof onMemberRefresh === 'function') {
      onMemberRefresh(refreshTeamData);
    }
  }, [onMemberRefresh]);

  const memberStats = {
    'sarah_chen': {
      tasksCompleted: 23,
      tasksActive: 4,
      avgCompletionTime: '2.3 days',
      efficiency: 94,
      collaborationScore: 87,
      joinedDate: '2024-01-15'
    },
    'alex_rivera': {
      tasksCompleted: 31,
      tasksActive: 2,
      avgCompletionTime: '1.8 days',
      efficiency: 91,
      collaborationScore: 92,
      joinedDate: '2024-02-01'
    },
    'jordan_smith': {
      tasksCompleted: 18,
      tasksActive: 6,
      avgCompletionTime: '3.1 days',
      efficiency: 88,
      collaborationScore: 89,
      joinedDate: '2024-02-20'
    },
    'mike_johnson': {
      tasksCompleted: 45,
      tasksActive: 3,
      avgCompletionTime: '2.0 days',
      efficiency: 96,
      collaborationScore: 95,
      joinedDate: '2024-01-01'
    }
  };

  const handleInviteMember = async () => {
    if (!inviteForm.email || !inviteForm.name) {
      setInviteStatus({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }

    console.log('Current team in invitation:', currentTeam);
    console.log('Team ID check:', currentTeam?.id);
    console.log('Team keys:', currentTeam ? Object.keys(currentTeam) : 'No team');
    
    if (!currentTeam?.id) {
      setInviteStatus({ type: 'error', message: `No team selected. Team data: ${JSON.stringify(currentTeam)}` });
      return;
    }

    setSendingInvite(true);
    setInviteStatus(null);

    try {
      // Initialize email service
      emailService.initialize();

      // Send invitation email with team service integration
      const result = await emailService.sendInvitationEmail({
        inviteeEmail: inviteForm.email,
        inviteeName: inviteForm.name,
        inviterName: currentUser.name,
        teamName: currentTeam.name || currentTeam.Name || 'TaskFlow Team',
        teamId: currentTeam.id,
        role: inviteForm.role,
        message: inviteForm.message,
        inviterUserId: currentUser.id
      }, enhancedTeamService);

      console.log('Invitation sent successfully:', result);

      // Reload team data to get updated member list
      await loadTeamData();
      
      // Emit invitation event for real-time updates
      realtimeEngine.emit('member_invited', {
        email: inviteForm.email,
        name: inviteForm.name,
        role: inviteForm.role,
        teamId: currentTeam.id,
        invitedBy: currentUser.id,
        message: inviteForm.message,
        invitationUrl: result.invitationUrl
      });

      setInviteStatus({ 
        type: 'success', 
        message: `Invitation sent to ${inviteForm.email}!`,
        invitationUrl: result.invitationUrl 
      });

      // Reset form after 2 seconds
      setTimeout(() => {
        setInviteForm({ email: '', name: '', role: 'Member', message: '' });
        setShowInviteModal(false);
        setInviteStatus(null);
      }, 2000);

      if (onTeamUpdate) {
        onTeamUpdate(teamMembers); // Just pass current members, loadTeamData will refresh
      }

    } catch (error) {
      console.error('Failed to send invitation:', error);
      setInviteStatus({ 
        type: 'error', 
        message: 'Failed to send invitation. Please check EmailJS configuration.' 
      });
    } finally {
      setSendingInvite(false);
    }
  };

  const handleResendInvitation = async (token) => {
    try {
      setSendingInvite(true);
      const result = await emailService.resendInvitation(token);
      setInviteStatus({ 
        type: 'success', 
        message: 'Invitation resent successfully!' 
      });
      
      // Update pending invitations
      const updated = emailService.getPendingInvitations();
      setPendingInvitations(updated);
      
      setTimeout(() => setInviteStatus(null), 3000);
    } catch (error) {
      setInviteStatus({ 
        type: 'error', 
        message: 'Failed to resend invitation' 
      });
      setTimeout(() => setInviteStatus(null), 3000);
    } finally {
      setSendingInvite(false);
    }
  };

  const getInvitationStatus = (email) => {
    const invitation = pendingInvitations.find(inv => inv.email === email);
    return invitation ? invitation.status : null;
  };

  const handleRoleChange = (memberId, newRole) => {
    const updatedMembers = teamMembers.map(member => 
      member.id === memberId ? { ...member, role: newRole } : member
    );
    
    setTeamMembers(updatedMembers);
    
    // Emit role change event
    realtimeEngine.emit('member_role_changed', {
      memberId,
      newRole,
      changedBy: currentUser.id,
      timestamp: new Date().toISOString()
    });

    if (onTeamUpdate) {
      onTeamUpdate(updatedMembers);
    }
  };

  const handleRemoveMember = (memberId) => {
    const updatedMembers = teamMembers.filter(member => member.id !== memberId);
    setTeamMembers(updatedMembers);
    
    // Emit member removal event
    realtimeEngine.emit('member_removed', {
      memberId,
      removedBy: currentUser.id,
      timestamp: new Date().toISOString()
    });

    if (onTeamUpdate) {
      onTeamUpdate(updatedMembers);
    }
  };

  const getRoleInfo = (roleId) => {
    return roles.find(role => role.id === roleId) || roles.find(role => role.id === 'member');
  };

  const canManageMembers = (userRole) => {
    return ['owner', 'admin', 'manager'].includes(userRole);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'inactive': return '#6b7280';
      default: return '#6b7280';
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '24px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              Team Members ({teamMembers.length})
              {refreshing && (
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #e5e7eb',
                  borderTop: '2px solid #3b82f6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              )}
            </h2>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
              Manage team access, roles, and permissions
            </p>
          </div>
          
          {canManageMembers(currentUser.role) && (
            <button
              onClick={() => setShowInviteModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <UserPlus style={{ width: '16px', height: '16px' }} />
              Invite Member
            </button>
          )}
        </div>
      </div>

      {/* Members List */}
      <div style={{ padding: '24px' }}>
        <div style={{ display: 'grid', gap: '16px' }}>
          {teamMembers.filter(member => member && member.id).map((member) => {
            const roleInfo = getRoleInfo(member.role || 'member');
            const stats = memberStats[member.id] || {
              tasksCompleted: 0,
              tasksActive: 0,
              efficiency: 75,
              collaborationScore: 80
            };

            return (
              <div
                key={member.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: '#fafafa'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  {/* Member Info */}
                  <div style={{ display: 'flex', gap: '16px', flex: 1 }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: roleInfo.color,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '600',
                      flexShrink: 0
                    }}>
                      {member.avatar || (member.name ? member.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?')}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
                          {member.name || 'Unknown Member'}
                        </h3>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          backgroundColor: roleInfo.color,
                          color: 'white',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          <roleInfo.icon style={{ width: '10px', height: '10px' }} />
                          {roleInfo.name.toUpperCase()}
                        </div>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          backgroundColor: getStatusColor(member.status || 'active'),
                          borderRadius: '50%'
                        }} />
                        {member.status === 'pending' && (
                          <span style={{
                            fontSize: '10px',
                            color: '#f59e0b',
                            backgroundColor: '#fef3c7',
                            padding: '2px 6px',
                            borderRadius: '8px',
                            fontWeight: '500'
                          }}>
                            PENDING
                          </span>
                        )}
                      </div>

                      <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '12px' }}>
                        {member.email || 'No email'}
                      </div>

                      {/* Stats */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                        gap: '16px',
                        fontSize: '12px'
                      }}>
                        <div>
                          <div style={{ color: '#6b7280' }}>Tasks Completed</div>
                          <div style={{ fontWeight: '600', color: '#111827' }}>
                            {stats.tasksCompleted}
                          </div>
                        </div>
                        <div>
                          <div style={{ color: '#6b7280' }}>Active Tasks</div>
                          <div style={{ fontWeight: '600', color: '#111827' }}>
                            {stats.tasksActive}
                          </div>
                        </div>
                        <div>
                          <div style={{ color: '#6b7280' }}>Efficiency</div>
                          <div style={{ fontWeight: '600', color: '#10b981' }}>
                            {stats.efficiency}%
                          </div>
                        </div>
                        <div>
                          <div style={{ color: '#6b7280' }}>Collaboration</div>
                          <div style={{ fontWeight: '600', color: '#3b82f6' }}>
                            {stats.collaborationScore}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {canManageMembers(currentUser.role) && member.id !== currentUser.id && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {member.status === 'pending' && member.invitationToken && (
                        <button
                          onClick={() => handleResendInvitation(member.invitationToken)}
                          disabled={sendingInvite}
                          style={{
                            padding: '6px',
                            backgroundColor: '#eff6ff',
                            border: '1px solid #dbeafe',
                            borderRadius: '6px',
                            cursor: sendingInvite ? 'not-allowed' : 'pointer',
                            color: '#3b82f6',
                            opacity: sendingInvite ? 0.7 : 1
                          }}
                          title="Resend invitation"
                        >
                          <Send style={{ width: '14px', height: '14px' }} />
                        </button>
                      )}
                      
                      <button
                        onClick={() => {
                          setSelectedMember(member);
                          setShowRoleModal(true);
                        }}
                        style={{
                          padding: '6px',
                          backgroundColor: '#f3f4f6',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: '#6b7280'
                        }}
                      >
                        <Settings style={{ width: '14px', height: '14px' }} />
                      </button>
                      
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        style={{
                          padding: '6px',
                          backgroundColor: '#fef2f2',
                          border: '1px solid #fecaca',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: '#ef4444'
                        }}
                      >
                        <Trash2 style={{ width: '14px', height: '14px' }} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
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
          zIndex: 2000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              Invite Team Member
            </h3>

            {/* Status Message */}
            {inviteStatus && (
              <div style={{
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px',
                backgroundColor: inviteStatus.type === 'success' ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${inviteStatus.type === 'success' ? '#bbf7d0' : '#fecaca'}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {inviteStatus.type === 'success' ? (
                    <CheckCircle style={{ width: '16px', height: '16px', color: '#10b981' }} />
                  ) : (
                    <XCircle style={{ width: '16px', height: '16px', color: '#ef4444' }} />
                  )}
                  <span style={{ 
                    color: inviteStatus.type === 'success' ? '#059669' : '#dc2626',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    {inviteStatus.message}
                  </span>
                </div>
                {inviteStatus.invitationUrl && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                    Invitation link: <a href={inviteStatus.invitationUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>{inviteStatus.invitationUrl}</a>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="colleague@company.com"
                  disabled={sendingInvite}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    opacity: sendingInvite ? 0.6 : 1
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  placeholder="John Doe"
                  disabled={sendingInvite}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    opacity: sendingInvite ? 0.6 : 1
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Role
                </label>
                <select
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                  disabled={sendingInvite}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    opacity: sendingInvite ? 0.6 : 1
                  }}
                >
                  {roles.filter(role => role.id !== 'owner').map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name} - {role.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Personal Message (Optional)
                </label>
                <textarea
                  value={inviteForm.message}
                  onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
                  placeholder="Welcome to our team! Looking forward to working together."
                  rows={3}
                  disabled={sendingInvite}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    resize: 'vertical',
                    opacity: sendingInvite ? 0.6 : 1
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', marginTop: '24px' }}>
              <button
                onClick={() => setShowEmailPreview(true)}
                disabled={!inviteForm.email || !inviteForm.name || sendingInvite}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f8fafc',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: (!inviteForm.email || !inviteForm.name || sendingInvite) ? 'not-allowed' : 'pointer',
                  opacity: (!inviteForm.email || !inviteForm.name || sendingInvite) ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Eye style={{ width: '14px', height: '14px' }} />
                Preview Email
              </button>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteStatus(null);
                  }}
                  disabled={sendingInvite}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: sendingInvite ? 'not-allowed' : 'pointer',
                    opacity: sendingInvite ? 0.5 : 1
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleInviteMember}
                  disabled={!inviteForm.email || !inviteForm.name || sendingInvite}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: (inviteForm.email && inviteForm.name && !sendingInvite) ? '#3b82f6' : '#9ca3af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: (inviteForm.email && inviteForm.name && !sendingInvite) ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {sendingInvite ? (
                    <>
                      <div style={{
                        width: '14px',
                        height: '14px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send style={{ width: '14px', height: '14px' }} />
                      Send Invitation
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {showRoleModal && selectedMember && (
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
          zIndex: 2000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              Change Role for {selectedMember.name}
            </h3>

            <div style={{ display: 'grid', gap: '12px' }}>
              {roles.map((role) => (
                <div
                  key={role.id}
                  onClick={() => handleRoleChange(selectedMember.id, role.id)}
                  style={{
                    padding: '16px',
                    border: `2px solid ${selectedMember.role === role.id ? role.color : '#e5e7eb'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: selectedMember.role === role.id ? `${role.color}10` : 'white'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <role.icon style={{ width: '20px', height: '20px', color: role.color }} />
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>{role.name}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{role.description}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    {role.permissions.map((permission, idx) => (
                      <div key={idx} style={{ marginBottom: '2px' }}>• {permission}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button
                onClick={() => setShowRoleModal(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Preview Modal */}
      {showEmailPreview && (
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
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
                Email Preview
              </h3>
              <button
                onClick={() => setShowEmailPreview(false)}
                style={{
                  padding: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              overflow: 'hidden'
            }}>
              <div style={{
                padding: '12px 16px',
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e5e7eb',
                fontSize: '14px',
                color: '#6b7280'
              }}>
                <div><strong>To:</strong> {inviteForm.email}</div>
                <div><strong>From:</strong> {currentUser.name} (via TaskFlow)</div>
                <div><strong>Subject:</strong> You're invited to join TaskFlow Team</div>
              </div>
              
              <div style={{ padding: '20px' }}>
                <div dangerouslySetInnerHTML={{
                  __html: emailService.getEmailTemplate({
                    inviteeName: inviteForm.name,
                    inviterName: currentUser.name,
                    teamName: 'TaskFlow Team',
                    role: inviteForm.role,
                    message: inviteForm.message,
                    invitationUrl: '#invitation-link-will-be-generated'
                  })
                }} />
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '12px',
              marginTop: '20px'
            }}>
              <button
                onClick={() => setShowEmailPreview(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  setShowEmailPreview(false);
                  handleInviteMember();
                }}
                disabled={sendingInvite}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: sendingInvite ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Send style={{ width: '14px', height: '14px' }} />
                Send This Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMemberManagement;