// Team Management Service for Startup Platform
export class TeamService {
  constructor() {
    this.storageKeys = {
      teams: 'startup_teams',
      members: 'team_members',
      roles: 'user_roles'
    };
  }

  // Team CRUD Operations
  createTeam(teamData) {
    const teams = this.getAllTeams();
    const newTeam = {
      id: this.generateId(),
      name: teamData.name,
      description: teamData.description,
      department: teamData.department,
      leadId: teamData.leadId,
      members: teamData.members || [],
      sheets: teamData.sheets || [],
      createdAt: new Date().toISOString(),
      ...teamData
    };
    
    teams.push(newTeam);
    localStorage.setItem(this.storageKeys.teams, JSON.stringify(teams));
    return newTeam;
  }

  getAllTeams() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKeys.teams)) || [];
    } catch {
      return [];
    }
  }

  getTeamById(teamId) {
    const teams = this.getAllTeams();
    return teams.find(team => team.id === teamId);
  }

  updateTeam(teamId, updates) {
    const teams = this.getAllTeams();
    const index = teams.findIndex(team => team.id === teamId);
    if (index >= 0) {
      teams[index] = { ...teams[index], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem(this.storageKeys.teams, JSON.stringify(teams));
      return teams[index];
    }
    return null;
  }

  deleteTeam(teamId) {
    const teams = this.getAllTeams();
    const filtered = teams.filter(team => team.id !== teamId);
    localStorage.setItem(this.storageKeys.teams, JSON.stringify(filtered));
    return true;
  }

  // Team Member Management
  addMemberToTeam(teamId, memberData) {
    const member = {
      id: this.generateId(),
      userId: memberData.userId,
      teamId: teamId,
      role: memberData.role || 'member',
      joinedAt: new Date().toISOString(),
      permissions: memberData.permissions || ['read'],
      ...memberData
    };

    const members = this.getAllMembers();
    members.push(member);
    localStorage.setItem(this.storageKeys.members, JSON.stringify(members));

    // Add to team's members array
    const team = this.getTeamById(teamId);
    if (team) {
      team.members.push(member.id);
      this.updateTeam(teamId, { members: team.members });
    }

    return member;
  }

  getAllMembers() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKeys.members)) || [];
    } catch {
      return [];
    }
  }

  getTeamMembers(teamId) {
    const members = this.getAllMembers();
    return members.filter(member => member.teamId === teamId);
  }

  getUserTeams(userId) {
    const members = this.getAllMembers();
    const userMemberships = members.filter(member => member.userId === userId);
    const teams = this.getAllTeams();
    
    return userMemberships.map(membership => {
      const team = teams.find(team => team.id === membership.teamId);
      return {
        ...team,
        userRole: membership.role,
        permissions: membership.permissions
      };
    });
  }

  // Role and Permission Management
  getUserRole(userId, teamId) {
    const members = this.getAllMembers();
    const membership = members.find(m => m.userId === userId && m.teamId === teamId);
    return membership ? membership.role : null;
  }

  updateMemberRole(userId, teamId, newRole, permissions = []) {
    const members = this.getAllMembers();
    const index = members.findIndex(m => m.userId === userId && m.teamId === teamId);
    
    if (index >= 0) {
      members[index].role = newRole;
      members[index].permissions = permissions;
      members[index].updatedAt = new Date().toISOString();
      localStorage.setItem(this.storageKeys.members, JSON.stringify(members));
      return members[index];
    }
    return null;
  }

  hasPermission(userId, teamId, permission) {
    const members = this.getAllMembers();
    const membership = members.find(m => m.userId === userId && m.teamId === teamId);
    
    if (!membership) return false;
    
    // Managers and leads have all permissions
    if (['manager', 'team_lead'].includes(membership.role)) return true;
    
    return membership.permissions.includes(permission);
  }

  // Standup and Meeting Management
  createStandupEntry(teamId, userId, data) {
    const standups = this.getStandupEntries(teamId);
    const today = new Date().toISOString().split('T')[0];
    
    const entry = {
      id: this.generateId(),
      teamId,
      userId,
      date: today,
      yesterday: data.yesterday || '',
      today: data.today || '',
      blockers: data.blockers || [],
      mood: data.mood || 'neutral',
      workload: data.workload || 'normal',
      createdAt: new Date().toISOString(),
      ...data
    };

    standups.push(entry);
    localStorage.setItem(`standups_${teamId}`, JSON.stringify(standups));
    return entry;
  }

  getStandupEntries(teamId, date = null) {
    try {
      const standups = JSON.parse(localStorage.getItem(`standups_${teamId}`)) || [];
      if (date) {
        return standups.filter(entry => entry.date === date);
      }
      return standups;
    } catch {
      return [];
    }
  }

  getTodaysStandups(teamId) {
    const today = new Date().toISOString().split('T')[0];
    return this.getStandupEntries(teamId, today);
  }

  getUserStandupToday(teamId, userId) {
    const today = new Date().toISOString().split('T')[0];
    const standups = this.getStandupEntries(teamId, today);
    return standups.find(entry => entry.userId === userId);
  }

  // Analytics and Reporting
  getTeamPerformanceData(teamId, days = 7) {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);

    const standups = this.getStandupEntries(teamId);
    const filtered = standups.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= startDate && entryDate <= endDate;
    });

    // Calculate metrics
    const totalEntries = filtered.length;
    const uniqueUsers = new Set(filtered.map(entry => entry.userId)).size;
    const avgMoodScore = this.calculateAverageMood(filtered);
    const blockerCount = filtered.reduce((sum, entry) => sum + (entry.blockers?.length || 0), 0);
    const workloadDistribution = this.calculateWorkloadDistribution(filtered);

    return {
      totalEntries,
      uniqueUsers,
      avgMoodScore,
      blockerCount,
      workloadDistribution,
      participationRate: uniqueUsers / this.getTeamMembers(teamId).length,
      period: { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
    };
  }

  calculateAverageMood(entries) {
    if (entries.length === 0) return 0;
    
    const moodValues = { sad: 1, concerned: 2, neutral: 3, happy: 4, excited: 5 };
    const total = entries.reduce((sum, entry) => sum + (moodValues[entry.mood] || 3), 0);
    return (total / entries.length).toFixed(1);
  }

  calculateWorkloadDistribution(entries) {
    const distribution = { light: 0, normal: 0, heavy: 0, overwhelming: 0 };
    entries.forEach(entry => {
      const workload = entry.workload || 'normal';
      distribution[workload] = (distribution[workload] || 0) + 1;
    });
    return distribution;
  }

  // Utility Methods
  generateId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  // Predefined Roles
  getAvailableRoles() {
    return [
      { id: 'manager', name: 'Manager', permissions: ['read', 'write', 'admin', 'manage_team'] },
      { id: 'team_lead', name: 'Team Lead', permissions: ['read', 'write', 'manage_tasks'] },
      { id: 'senior_dev', name: 'Senior Developer', permissions: ['read', 'write', 'review'] },
      { id: 'developer', name: 'Developer', permissions: ['read', 'write'] },
      { id: 'designer', name: 'Designer', permissions: ['read', 'write'] },
      { id: 'qa', name: 'QA Engineer', permissions: ['read', 'write', 'test'] },
      { id: 'intern', name: 'Intern', permissions: ['read'] }
    ];
  }
}

export const teamService = new TeamService();