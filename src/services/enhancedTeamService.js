// Enhanced Team Service with Airtable Integration
import { airtableService } from './airtableService.js';
import { teamService as legacyTeamService } from './teamService.js';

class EnhancedTeamService {
  constructor() {
    this.useAirtable = false;
    this.initializationPromise = this.initialize();
  }

  async initialize() {
    // Check if Airtable is available
    if (airtableService.isAvailable()) {
      try {
        const isConnected = await airtableService.testConnection();
        if (isConnected) {
          this.useAirtable = true;
          console.log('Enhanced Team Service: Using Airtable backend');
        } else {
          console.log('Enhanced Team Service: Airtable connection failed, falling back to localStorage');
        }
      } catch (error) {
        console.log('Enhanced Team Service: Airtable test failed, falling back to localStorage');
      }
    } else {
      console.log('Enhanced Team Service: Airtable not configured, using localStorage');
    }
  }

  async ensureInitialized() {
    await this.initializationPromise;
  }

  // Organization operations (Airtable only)
  async createOrganization(data) {
    await this.ensureInitialized();
    
    if (!this.useAirtable) {
      throw new Error('Organizations require Airtable backend');
    }
    
    return await airtableService.createOrganization(data);
  }

  async getOrganizations() {
    await this.ensureInitialized();
    
    if (!this.useAirtable) {
      return []; // No organizations in localStorage mode
    }
    
    return await airtableService.getOrganizations();
  }

  // User operations
  async createUser(data) {
    await this.ensureInitialized();
    
    if (this.useAirtable) {
      // Check if user already exists
      const existingUser = await airtableService.getUserByEmail(data.email);
      if (existingUser) {
        return existingUser;
      }
      
      return await airtableService.createUser(data);
    } else {
      // Fallback to localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const existingUser = users.find(u => u.email === data.email);
      
      if (existingUser) {
        return existingUser;
      }
      
      const newUser = {
        id: this.generateId(),
        ...data,
        createdTime: new Date().toISOString()
      };
      
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      return newUser;
    }
  }

  async getUserByEmail(email) {
    await this.ensureInitialized();
    
    if (this.useAirtable) {
      return await airtableService.getUserByEmail(email);
    } else {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      return users.find(u => u.email === email) || null;
    }
  }

  async getUserById(userId) {
    await this.ensureInitialized();
    
    if (this.useAirtable) {
      return await airtableService.getUserById(userId);
    } else {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      return users.find(u => u.id === userId) || null;
    }
  }

  // Team operations
  async createTeam(data) {
    await this.ensureInitialized();
    
    if (this.useAirtable) {
      return await airtableService.createTeam(data);
    } else {
      // Use legacy service
      return legacyTeamService.createTeam(data);
    }
  }

  async getTeams(organizationId = null) {
    await this.ensureInitialized();
    
    if (this.useAirtable) {
      return await airtableService.getTeams(organizationId);
    } else {
      return legacyTeamService.getAllTeams();
    }
  }

  async getTeamById(teamId) {
    await this.ensureInitialized();
    
    if (this.useAirtable) {
      return await airtableService.getTeamById(teamId);
    } else {
      return legacyTeamService.getTeamById(teamId);
    }
  }

  // Team member operations
  async addTeamMember(data) {
    await this.ensureInitialized();
    
    if (this.useAirtable) {
      return await airtableService.addTeamMember(data);
    } else {
      return legacyTeamService.addMemberToTeam(data.teamId, {
        userId: data.userId,
        role: data.role
      });
    }
  }

  async getTeamMembers(teamId) {
    await this.ensureInitialized();
    
    if (this.useAirtable) {
      const members = await airtableService.getTeamMembers(teamId);
      
      // Fetch user details for each member
      const membersWithUsers = await Promise.all(
        members.map(async (member) => {
          const user = await this.getUserById(member.User[0]);
          return {
            ...member,
            user: user
          };
        })
      );
      
      return membersWithUsers;
    } else {
      return legacyTeamService.getTeamMembers(teamId);
    }
  }

  async getUserTeams(userId) {
    await this.ensureInitialized();
    
    if (this.useAirtable) {
      const memberships = await airtableService.getUserTeams(userId);
      
      // Fetch team details for each membership
      const teamsWithDetails = await Promise.all(
        memberships.map(async (membership) => {
          const team = await this.getTeamById(membership.Team[0]);
          return {
            ...team,
            userRole: membership.Role,
            membershipId: membership.id
          };
        })
      );
      
      return teamsWithDetails;
    } else {
      return legacyTeamService.getUserTeams(userId);
    }
  }

  async removeTeamMember(userId, teamId) {
    await this.ensureInitialized();
    
    if (this.useAirtable) {
      return await airtableService.removeTeamMember(userId, teamId);
    } else {
      // Legacy implementation
      const members = legacyTeamService.getAllMembers();
      const filtered = members.filter(m => !(m.userId === userId && m.teamId === teamId));
      localStorage.setItem('team_members', JSON.stringify(filtered));
      return true;
    }
  }

  // Task operations
  async createTask(data) {
    await this.ensureInitialized();
    
    if (this.useAirtable) {
      return await airtableService.createTask(data);
    } else {
      // Store in localStorage with legacy format
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      const newTask = {
        id: this.generateId(),
        title: data.title,
        description: data.description || '',
        status: data.status || 'pending',
        priority: data.priority || 'medium',
        teamId: data.teamId,
        createdBy: data.createdBy,
        assignedTo: data.assignedTo,
        dueDate: data.dueDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      tasks.push(newTask);
      localStorage.setItem('tasks', JSON.stringify(tasks));
      return newTask;
    }
  }

  async getTasks(teamId = null, userId = null) {
    await this.ensureInitialized();
    
    if (this.useAirtable) {
      const tasks = await airtableService.getTasks(teamId, userId);
      
      // Fetch user details for assigned users
      const tasksWithUsers = await Promise.all(
        tasks.map(async (task) => {
          let assignedUser = null;
          let createdByUser = null;
          
          if (task['Assigned To'] && task['Assigned To'].length > 0) {
            assignedUser = await this.getUserById(task['Assigned To'][0]);
          }
          
          if (task['Created By'] && task['Created By'].length > 0) {
            createdByUser = await this.getUserById(task['Created By'][0]);
          }
          
          return {
            id: task.id,
            title: task.Title,
            description: task.Description || '',
            status: task.Status,
            priority: task.Priority,
            teamId: task.Team ? task.Team[0] : null,
            assignedTo: assignedUser,
            createdBy: createdByUser,
            dueDate: task['Due Date'],
            createdAt: task.createdTime,
            updatedAt: task.createdTime
          };
        })
      );
      
      return tasksWithUsers;
    } else {
      // Get from localStorage
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      
      if (teamId) {
        return tasks.filter(task => task.teamId === teamId);
      } else if (userId) {
        return tasks.filter(task => task.createdBy === userId || task.assignedTo === userId);
      }
      
      return tasks;
    }
  }

  async updateTask(taskId, data) {
    await this.ensureInitialized();
    
    if (this.useAirtable) {
      return await airtableService.updateTask(taskId, data);
    } else {
      // Update in localStorage
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      const index = tasks.findIndex(t => t.id === taskId);
      
      if (index >= 0) {
        tasks[index] = { 
          ...tasks[index], 
          ...data, 
          updatedAt: new Date().toISOString() 
        };
        localStorage.setItem('tasks', JSON.stringify(tasks));
        return tasks[index];
      }
      
      return null;
    }
  }

  async deleteTask(taskId) {
    await this.ensureInitialized();
    
    if (this.useAirtable) {
      return await airtableService.deleteTask(taskId);
    } else {
      const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      const filtered = tasks.filter(t => t.id !== taskId);
      localStorage.setItem('tasks', JSON.stringify(filtered));
      return true;
    }
  }

  // Invitation operations
  async createInvitation(data) {
    await this.ensureInitialized();
    
    if (this.useAirtable) {
      return await airtableService.createInvitation(data);
    } else {
      // Store in localStorage
      const invitations = JSON.parse(localStorage.getItem('invitations') || '[]');
      const newInvitation = {
        id: this.generateId(),
        email: data.email,
        teamId: data.teamId,
        role: data.role || 'Member',
        token: data.token,
        status: 'Pending',
        createdTime: new Date().toISOString()
      };
      
      invitations.push(newInvitation);
      localStorage.setItem('invitations', JSON.stringify(invitations));
      return newInvitation;
    }
  }

  async getInvitationByToken(token) {
    await this.ensureInitialized();
    
    if (this.useAirtable) {
      return await airtableService.getInvitationByToken(token);
    } else {
      const invitations = JSON.parse(localStorage.getItem('invitations') || '[]');
      return invitations.find(inv => inv.token === token) || null;
    }
  }

  async updateInvitationStatus(invitationId, status) {
    await this.ensureInitialized();
    
    if (this.useAirtable) {
      return await airtableService.updateInvitationStatus(invitationId, status);
    } else {
      const invitations = JSON.parse(localStorage.getItem('invitations') || '[]');
      const index = invitations.findIndex(inv => inv.id === invitationId);
      
      if (index >= 0) {
        invitations[index].status = status;
        localStorage.setItem('invitations', JSON.stringify(invitations));
        return invitations[index];
      }
      
      return null;
    }
  }

  // Utility methods
  generateId() {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  isUsingAirtable() {
    return this.useAirtable;
  }

  // Get data storage info for debugging
  getStorageInfo() {
    return {
      backend: this.useAirtable ? 'Airtable' : 'localStorage',
      airtableAvailable: airtableService.isAvailable(),
      airtableInitialized: airtableService.isInitialized
    };
  }
}

export const enhancedTeamService = new EnhancedTeamService();