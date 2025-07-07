import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Settings, Shield, Crown, User,
  Mail, MoreHorizontal, ChevronDown, ChevronUp,
  Send, Trash2, Edit3, Eye, Clock, CheckCircle,
  BarChart3, Award, Calendar, Search, Filter,
  Download, Upload, Copy, Check, X, AlertCircle,
  Grid, List, RotateCcw
} from 'lucide-react';
import { realtimeEngine } from '../services/realtimeEngine';
import { emailService } from '../services/emailService';
import { enhancedTeamService } from '../services/enhancedTeamService';
import { ResponsiveContainer, ResponsiveCard, ResponsiveButton, ResponsiveGrid, useResponsive } from './ui/ResponsiveLayout';
import { AccessibleButton, AccessibleModal, AccessibleDropdown, AccessibleInput, useAnnouncer } from './ui/AccessibleComponents';
import { LoadingWrapper, TeamListSkeleton } from './ui/LoadingStates';
import { EmptyState } from './ui/ErrorStates';
import { AdvancedSearchBar, FilterPanel, useAdvancedSearch } from './ui/AdvancedSearch';
import { BulkOperations } from './ui/EnhancedTaskManagement';
import { useKeyboardShortcuts } from './ui/KeyboardShortcuts';
import { HelpButton } from './ui/HelpSystem';

const ImprovedTeamMemberManagement = ({ currentUser, currentTeam, onTeamUpdate, onMemberRefresh, globalSearch = '' }) => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [expandedMembers, setExpandedMembers] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    name: '',
    role: 'Member',
    message: ''
  });
  const [sendingInvite, setSendingInvite] = useState(false);
  const [inviteStatus, setInviteStatus] = useState(null);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const { isMobile } = useResponsive();
  const { announce } = useAnnouncer();
  
  // Enhanced search and filtering
  const searchConfig = {
    searchFields: ['name', 'email', 'role']
  };
  
  const {
    query,
    setQuery,
    filters,
    setFilters,
    results: searchResults,
    resultCount,
    totalCount: searchTotalCount,
    clearFilters: clearSearchFilters
  } = useAdvancedSearch(teamMembers, searchConfig);
  
  // Update search when global search changes
  useEffect(() => {
    if (globalSearch !== query) {
      setQuery(globalSearch);
    }
  }, [globalSearch, query, setQuery]);
  
  // Enhanced keyboard shortcuts
  useKeyboardShortcuts({
    'MOD+I': () => {
      if (canManageMembers(currentUser.role)) {
        setShowInviteModal(true);
        announce('Opening invite member modal', 'polite');
      }
    },
    'MOD+F': () => {
      document.querySelector('[data-member-search]')?.focus();
    },
    'MOD+A': () => {
      const displayMembers = query || Object.keys(filters).length > 0 ? searchResults : teamMembers;
      if (selectedMembers.length === displayMembers.length) {
        setSelectedMembers([]);
        announce('Deselected all members', 'polite');
      } else {
        setSelectedMembers(displayMembers.map(m => m.id));
        announce(`Selected ${displayMembers.length} members`, 'polite');
      }
    },
    'MOD+D': () => {
      setShowBulkActions(!showBulkActions);
    },
    'ESC': () => {
      setShowInviteModal(false);
      setShowFilterPanel(false);
      setSelectedMembers([]);
      setQuery('');
      setFilters({});
    }
  });

  const roles = [
    {
      id: 'Owner',
      name: 'Owner',
      icon: Crown,
      color: '#7c3aed',
      description: 'Full control over team and projects'
    },
    {
      id: 'Admin',
      name: 'Admin',
      icon: Shield,
      color: '#dc2626',
      description: 'Manage team members and projects'
    },
    {
      id: 'Member',
      name: 'Member',
      icon: User,
      color: '#059669',
      description: 'Create and manage own tasks'
    }
  ];

  useEffect(() => {
    loadTeamData();
    
    if (onMemberRefresh) {
      onMemberRefresh(loadTeamData);
    }
  }, [currentTeam, onMemberRefresh]);

  const loadTeamData = async () => {
    if (!currentTeam?.id) return;
    
    setLoading(true);
    try {
      const members = await enhancedTeamService.getTeamMembers(currentTeam.id);
      console.log('Loaded team members:', members);
      setTeamMembers(members || []);
    } catch (error) {
      console.error('Error loading team members:', error);
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const canManageMembers = (userRole) => {
    return ['Owner', 'Admin'].includes(userRole);
  };
  
  const handleBulkInvite = async (invites) => {
    try {
      const promises = invites.map(invite => 
        emailService.sendInvitationEmail({
          ...invite,
          inviterName: currentUser.name,
          teamName: currentTeam.name || currentTeam.Name || 'TaskFlow Team',
          teamId: currentTeam.id,
          inviterUserId: currentUser.id
        }, enhancedTeamService)
      );
      
      await Promise.all(promises);
      await loadTeamData();
      announce(`Sent ${invites.length} invitations successfully`, 'polite');
    } catch (error) {
      console.error('Error sending bulk invites:', error);
      announce('Failed to send some invitations', 'assertive');
    }
  };
  
  const handleBulkRoleUpdate = async (memberIds, newRole) => {
    try {
      const promises = memberIds.map(memberId => 
        enhancedTeamService.updateMemberRole(currentTeam.id, memberId, newRole)
      );
      
      await Promise.all(promises);
      await loadTeamData();
      setSelectedMembers([]);
      announce(`Updated ${memberIds.length} member roles to ${newRole}`, 'polite');
    } catch (error) {
      console.error('Error updating member roles:', error);
      announce('Failed to update member roles', 'assertive');
    }
  };
  
  const handleBulkRemove = async (memberIds) => {
    try {
      const promises = memberIds.map(memberId => 
        enhancedTeamService.removeMember(currentTeam.id, memberId)
      );
      
      await Promise.all(promises);
      await loadTeamData();
      setSelectedMembers([]);
      announce(`Removed ${memberIds.length} members from team`, 'polite');
    } catch (error) {
      console.error('Error removing members:', error);
      announce('Failed to remove some members', 'assertive');
    }
  };
  
  const exportTeamData = () => {
    const displayMembers = query || Object.keys(filters).length > 0 ? searchResults : teamMembers;
    const data = displayMembers.map(member => ({
      name: member.name,
      email: member.email,
      role: member.role,
      joinedDate: member.joinedDate,
      lastActive: member.lastActive,
      ...generateMemberStats(member)
    }));
    
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTeam.name || 'team'}-members.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    announce('Team data exported successfully', 'polite');
  };

  const getRoleInfo = (roleName) => {
    return roles.find(role => role.id === roleName) || roles[2]; // Default to Member
  };

  const generateMemberStats = (member) => {
    // Mock stats for demo purposes
    const baseStats = {
      tasksCompleted: Math.floor(Math.random() * 50) + 10,
      tasksActive: Math.floor(Math.random() * 10) + 1,
      efficiency: Math.floor(Math.random() * 30) + 70,
      collaborationScore: Math.floor(Math.random() * 40) + 60,
      lastActive: member.lastActive || 'Recently'
    };
    return baseStats;
  };

  const toggleMemberExpanded = (memberId) => {
    const newExpanded = new Set(expandedMembers);
    if (newExpanded.has(memberId)) {
      newExpanded.delete(memberId);
    } else {
      newExpanded.add(memberId);
    }
    setExpandedMembers(newExpanded);
  };

  const handleInviteMember = async () => {
    if (!inviteForm.email || !inviteForm.name) return;
    
    setSendingInvite(true);
    setInviteStatus(null);

    try {
      emailService.initialize();
      
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

      await loadTeamData();
      
      setInviteStatus({ 
        type: 'success', 
        message: `Invitation sent to ${inviteForm.email}!`
      });

      setTimeout(() => {
        setInviteForm({ email: '', name: '', role: 'Member', message: '' });
        setShowInviteModal(false);
        setInviteStatus(null);
      }, 2000);

    } catch (error) {
      console.error('Failed to send invitation:', error);
      setInviteStatus({ 
        type: 'error', 
        message: 'Failed to send invitation. Please try again.' 
      });
    } finally {
      setSendingInvite(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    
    try {
      await enhancedTeamService.removeTeamMember(memberId);
      await loadTeamData();
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const MemberCard = ({ member, isSelected = false, onSelect, canManage = false, viewMode = 'card' }) => {
    const roleInfo = getRoleInfo(member.role);
    const stats = generateMemberStats(member);
    const isExpanded = expandedMembers.has(member.id);
    const isPending = member.status === 'pending';

    return (
      <ResponsiveCard 
        padding={false}
        style={{ 
          transition: 'all 0.2s ease',
          border: isSelected ? '2px solid #3b82f6' : (isExpanded ? '2px solid #3b82f6' : '1px solid #e5e7eb'),
          backgroundColor: isSelected ? '#f0f9ff' : 'white'
        }}
      >
        {/* Primary Member Info */}
        <div style={{ 
          padding: isMobile ? '16px' : '20px',
          borderBottom: isExpanded ? '1px solid #f3f4f6' : 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Selection Checkbox */}
            {canManage && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => onSelect && onSelect(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer',
                  accentColor: '#3b82f6'
                }}
                aria-label={`Select ${member.name}`}
              />
            )}
            
            {/* Avatar */}
            <div style={{
              width: isMobile ? '48px' : '56px',
              height: isMobile ? '48px' : '56px',
              borderRadius: '50%',
              backgroundColor: isSelected ? '#dbeafe' : '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              fontSize: isMobile ? '18px' : '20px',
              fontWeight: '600',
              color: isSelected ? '#3b82f6' : '#6b7280',
              border: isSelected ? '2px solid #3b82f6' : 'none'
            }}>
              {isSelected ? (
                <Check style={{ width: '20px', height: '20px' }} />
              ) : (
                member.name?.charAt(0)?.toUpperCase() || '?'
              )}
            </div>

            {/* Member Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <h3 style={{
                  fontSize: isMobile ? '16px' : '18px',
                  fontWeight: '600',
                  color: '#111827',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {member.name || 'Unknown User'}
                </h3>
                
                {isPending && (
                  <span style={{
                    fontSize: '11px',
                    padding: '2px 6px',
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                    borderRadius: '4px',
                    fontWeight: '500'
                  }}>
                    PENDING
                  </span>
                )}
              </div>
              
              <p style={{
                color: '#6b7280',
                fontSize: '14px',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {member.email || 'No email'}
              </p>
              
              {/* Role Badge */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                marginTop: '6px' 
              }}>
                <roleInfo.icon style={{ 
                  width: '14px', 
                  height: '14px', 
                  color: roleInfo.color 
                }} />
                <span style={{
                  fontSize: '12px',
                  fontWeight: '500',
                  color: roleInfo.color
                }}>
                  {roleInfo.name}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Expand/Collapse Button */}
              <AccessibleButton
                variant="ghost"
                size="sm"
                onClick={() => toggleMemberExpanded(member.id)}
                ariaLabel={isExpanded ? 'Hide details' : 'Show details'}
                icon={isExpanded ? 
                  <ChevronUp style={{ width: '16px', height: '16px' }} /> : 
                  <ChevronDown style={{ width: '16px', height: '16px' }} />
                }
              />

              {/* More Actions Menu */}
              {canManageMembers(currentUser.role) && member.id !== currentUser.id && (
                <AccessibleDropdown
                  trigger={
                    <AccessibleButton
                      variant="ghost"
                      size="sm"
                      ariaLabel="More actions"
                      icon={<MoreHorizontal style={{ width: '16px', height: '16px' }} />}
                    />
                  }
                  isOpen={false}
                  onToggle={() => {}}
                  onClose={() => {}}
                >
                  <div style={{ padding: '8px 0' }}>
                    <button
                      style={{
                        width: '100%',
                        padding: '8px 16px',
                        textAlign: 'left',
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onClick={() => {
                        // Handle role change
                      }}
                    >
                      <Edit3 style={{ width: '14px', height: '14px' }} />
                      Change Role
                    </button>
                    
                    {isPending && (
                      <button
                        style={{
                          width: '100%',
                          padding: '8px 16px',
                          textAlign: 'left',
                          border: 'none',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          fontSize: '14px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onClick={() => {
                          // Handle resend invitation
                        }}
                      >
                        <Send style={{ width: '14px', height: '14px' }} />
                        Resend Invitation
                      </button>
                    )}
                    
                    <button
                      style={{
                        width: '100%',
                        padding: '8px 16px',
                        textAlign: 'left',
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#ef4444'
                      }}
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      <Trash2 style={{ width: '14px', height: '14px' }} />
                      Remove Member
                    </button>
                  </div>
                </AccessibleDropdown>
              )}
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div style={{ 
            padding: isMobile ? '16px' : '20px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #f3f4f6'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: '#10b981',
                  marginBottom: '4px'
                }}>
                  {stats.tasksCompleted}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  Tasks Completed
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: '#3b82f6',
                  marginBottom: '4px'
                }}>
                  {stats.tasksActive}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  Active Tasks
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: '#f59e0b',
                  marginBottom: '4px'
                }}>
                  {stats.efficiency}%
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  Efficiency
                </div>
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: '700', 
                  color: '#8b5cf6',
                  marginBottom: '4px'
                }}>
                  {stats.collaborationScore}%
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  Team Score
                </div>
              </div>
            </div>
            
            {/* Additional Info */}
            <div style={{
              padding: '12px',
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  Last active: {stats.lastActive}
                </span>
              </div>
            </div>
          </div>
        )}
      </ResponsiveCard>
    );
  };

  if (!currentTeam) {
    return (
      <EmptyState
        icon={Users}
        title="No Team Selected"
        message="Select a team to manage members."
      />
    );
  }

  return (
    <ResponsiveContainer maxWidth="xl">
      {/* Enhanced Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'stretch' : 'center',
        marginBottom: '24px',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '16px' : '0'
      }}>
        <div>
          <h1 style={{
            fontSize: isMobile ? '24px' : '28px',
            fontWeight: '700',
            color: '#111827',
            margin: 0,
            marginBottom: '4px'
          }}>
            Team Members
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            margin: 0,
            marginBottom: isMobile ? '16px' : '0'
          }}>
            Manage your team members and their roles • {teamMembers.length} total
          </p>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexDirection: isMobile ? 'column' : 'row',
          width: isMobile ? '100%' : 'auto'
        }}>
          {/* Export Button */}
          <ResponsiveButton
            variant="secondary"
            size="sm"
            icon={<Download />}
            onClick={exportTeamData}
            disabled={teamMembers.length === 0}
            title="Export team data to CSV"
          >
            {isMobile ? 'Export' : 'Export CSV'}
          </ResponsiveButton>
          
          {/* View Mode Toggle */}
          <div style={{
            display: 'flex',
            backgroundColor: '#f3f4f6',
            borderRadius: '6px',
            padding: '2px'
          }}>
            <button
              onClick={() => setViewMode('card')}
              style={{
                padding: '6px 12px',
                backgroundColor: viewMode === 'card' ? 'white' : 'transparent',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: viewMode === 'card' ? '#3b82f6' : '#6b7280'
              }}
              title="Card view"
            >
              <Grid style={{ width: '14px', height: '14px' }} />
              {!isMobile && 'Cards'}
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                padding: '6px 12px',
                backgroundColor: viewMode === 'table' ? 'white' : 'transparent',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: viewMode === 'table' ? '#3b82f6' : '#6b7280'
              }}
              title="Table view"
            >
              <List style={{ width: '14px', height: '14px' }} />
              {!isMobile && 'Table'}
            </button>
          </div>
          
          {/* Help Button */}
          <HelpButton
            size="sm"
            content={{
              title: "Team Management Help",
              description: "Manage team members with advanced search, bulk operations, and role management.",
              sections: [
                {
                  title: "Keyboard Shortcuts",
                  items: [
                    "⌘+I - Invite new member",
                    "⌘+F - Focus search",
                    "⌘+A - Select all members", 
                    "⌘+D - Toggle bulk actions",
                    "ESC - Clear selections"
                  ]
                },
                {
                  title: "Features",
                  items: [
                    "Search members by name, email, or role",
                    "Bulk invite multiple members",
                    "Update roles in bulk",
                    "Export team data to CSV",
                    "Real-time member statistics"
                  ]
                }
              ]
            }}
          />
          
          {canManageMembers(currentUser.role) && (
            <AccessibleButton
              onClick={() => setShowInviteModal(true)}
              icon={<UserPlus style={{ width: '16px', height: '16px' }} />}
              size={isMobile ? 'md' : 'sm'}
              style={{ width: isMobile ? '100%' : 'auto' }}
            >
              Invite Member
            </AccessibleButton>
          )}
        </div>
      </div>
      
      {/* Enhanced Search and Filter Bar */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '12px',
        marginBottom: '24px',
        alignItems: isMobile ? 'stretch' : 'center'
      }}>
        <AdvancedSearchBar
          onSearch={setQuery}
          placeholder="Search members by name, email, or role..."
          data-member-search="true"
          style={{ flex: 1 }}
        />
        
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          options={{
            role: [
              { value: 'Owner', label: 'Owner' },
              { value: 'Admin', label: 'Admin' },
              { value: 'Member', label: 'Member' }
            ],
            status: [
              { value: 'active', label: 'Active' },
              { value: 'pending', label: 'Pending' }
            ]
          }}
          isOpen={showFilterPanel}
          onToggle={() => setShowFilterPanel(!showFilterPanel)}
        />
        
        {selectedMembers.length > 0 && (
          <ResponsiveButton
            variant="primary"
            size="sm"
            icon={<Settings />}
            onClick={() => setShowBulkActions(true)}
          >
            Bulk Actions ({selectedMembers.length})
          </ResponsiveButton>
        )}
      </div>
      
      {/* Search Results Summary */}
      {(query || Object.keys(filters).length > 0) && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '14px',
            color: '#64748b'
          }}>
            Showing {resultCount} of {searchTotalCount} members
            {query && ` for "${query}"`}
            {Object.keys(filters).length > 0 && ` with ${Object.keys(filters).length} filter${Object.keys(filters).length !== 1 ? 's' : ''}`}
            <button
              onClick={() => {
                setQuery('');
                setFilters({});
              }}
              style={{
                marginLeft: '12px',
                padding: '4px 8px',
                backgroundColor: 'transparent',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
                fontSize: '12px',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Bulk Operations Modal */}
      {showBulkActions && selectedMembers.length > 0 && (
        <BulkOperations
          selectedTasks={selectedMembers.map(id => teamMembers.find(m => m.id === id)).filter(Boolean)}
          onBulkUpdate={(members) => {
            // Handle bulk role updates
            const memberIds = members.map(m => m.id);
            const newRole = members[0].role; // Assuming same role for all
            handleBulkRoleUpdate(memberIds, newRole);
          }}
          onBulkDelete={(members) => {
            const memberIds = members.map(m => m.id);
            handleBulkRemove(memberIds);
          }}
          onCancel={() => {
            setShowBulkActions(false);
            setSelectedMembers([]);
          }}
          teamMembers={teamMembers}
          type="members"
        />
      )}

      {/* Enhanced Member List */}
      <LoadingWrapper
        loading={loading}
        skeleton={<TeamListSkeleton count={3} isMobile={isMobile} />}
      >
        {teamMembers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No team members yet"
            message="Start building your team by inviting the first member."
            actions={canManageMembers(currentUser.role) ? [
              <AccessibleButton
                key="invite"
                onClick={() => setShowInviteModal(true)}
                icon={<UserPlus style={{ width: '16px', height: '16px' }} />}
              >
                Invite First Member
              </AccessibleButton>
            ] : []}
          />
        ) : (
          <>
            {/* Member count and selection info */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              padding: '12px 16px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                {(query || Object.keys(filters).length > 0 ? searchResults : teamMembers).length} members
                {selectedMembers.length > 0 && ` • ${selectedMembers.length} selected`}
              </div>
              
              {selectedMembers.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    onClick={() => setSelectedMembers([])}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: 'transparent',
                      border: '1px solid #cbd5e1',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer',
                      color: '#6b7280',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <X style={{ width: '12px', height: '12px' }} />
                    Clear
                  </button>
                </div>
              )}
            </div>
            
            {/* Member Cards/Table */}
            <div style={{
              display: viewMode === 'table' ? 'block' : 'flex',
              flexDirection: viewMode === 'table' ? 'column' : 'column',
              gap: '16px'
            }}>
              {(query || Object.keys(filters).length > 0 ? searchResults : teamMembers).map((member) => (
                <MemberCard 
                  key={member.id} 
                  member={member}
                  isSelected={selectedMembers.includes(member.id)}
                  onSelect={(selected) => {
                    if (selected) {
                      setSelectedMembers(prev => [...prev, member.id]);
                    } else {
                      setSelectedMembers(prev => prev.filter(id => id !== member.id));
                    }
                  }}
                  canManage={canManageMembers(currentUser.role)}
                  viewMode={viewMode}
                />
              ))}
            </div>
            
            {/* No search results */}
            {(query || Object.keys(filters).length > 0) && searchResults.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '48px 24px',
                color: '#6b7280'
              }}>
                <Search style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#9ca3af' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#111827' }}>
                  No members found
                </h3>
                <p style={{ marginBottom: '24px' }}>
                  Try adjusting your search or filter criteria
                </p>
                <ResponsiveButton
                  variant="secondary"
                  icon={<RotateCcw />}
                  onClick={() => {
                    setQuery('');
                    setFilters({});
                  }}
                >
                  Clear Search
                </ResponsiveButton>
              </div>
            )}
          </>
        )}
      </LoadingWrapper>

      {/* Invite Modal */}
      {showInviteModal && (
        <AccessibleModal
          isOpen={showInviteModal}
          onClose={() => {
            setShowInviteModal(false);
            setInviteStatus(null);
            setInviteForm({ email: '', name: '', role: 'Member', message: '' });
          }}
          title="Invite Team Member"
          size="md"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <AccessibleInput
              label="Email Address"
              type="email"
              value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              placeholder="colleague@company.com"
              required
            />
            
            <AccessibleInput
              label="Full Name"
              value={inviteForm.name}
              onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
              placeholder="John Doe"
              required
            />
            
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Role
              </label>
              <select
                value={inviteForm.role}
                onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none'
                }}
              >
                {roles.map(role => (
                  <option key={role.id} value={role.id}>
                    {role.name} - {role.description}
                  </option>
                ))}
              </select>
            </div>
            
            <AccessibleInput
              label="Personal Message (Optional)"
              value={inviteForm.message}
              onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
              placeholder="Welcome to our team!"
              helpText="Add a personal note to the invitation email"
            />

            {inviteStatus && (
              <div style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: inviteStatus.type === 'success' ? '#f0fdf4' : '#fef2f2',
                border: `1px solid ${inviteStatus.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                color: inviteStatus.type === 'success' ? '#166534' : '#dc2626',
                fontSize: '14px'
              }}>
                {inviteStatus.message}
              </div>
            )}
            
            <div style={{ 
              display: 'flex', 
              gap: '12px', 
              justifyContent: 'flex-end',
              marginTop: '8px'
            }}>
              <AccessibleButton
                variant="secondary"
                onClick={() => setShowInviteModal(false)}
                disabled={sendingInvite}
              >
                Cancel
              </AccessibleButton>
              <AccessibleButton
                onClick={handleInviteMember}
                loading={sendingInvite}
                disabled={!inviteForm.email || !inviteForm.name || sendingInvite}
                icon={<Send style={{ width: '16px', height: '16px' }} />}
              >
                Send Invitation
              </AccessibleButton>
            </div>
          </div>
        </AccessibleModal>
      )}
    </ResponsiveContainer>
  );
};

export default ImprovedTeamMemberManagement;