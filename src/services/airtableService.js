// Airtable Database Service for TaskFlow
import Airtable from 'airtable';

class AirtableService {
  constructor() {
    this.baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
    this.apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
    this.isInitialized = false;
    this.base = null;
    
    // Table names
    this.tables = {
      ORGANIZATIONS: 'Organizations',
      TEAMS: 'Teams', 
      USERS: 'Users',
      TEAM_MEMBERS: 'TeamMembers',
      TASKS: 'Tasks',
      INVITATIONS: 'Invitations'
    };
    
    this.initialize();
  }

  initialize() {
    if (!this.baseId || !this.apiKey) {
      console.warn('Airtable configuration missing. Please set VITE_AIRTABLE_BASE_ID and VITE_AIRTABLE_API_KEY');
      return false;
    }

    try {
      Airtable.configure({
        endpointUrl: 'https://api.airtable.com',
        apiKey: this.apiKey
      });
      
      this.base = Airtable.base(this.baseId);
      this.isInitialized = true;
      console.log('Airtable service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Airtable:', error);
      this.isInitialized = false;
      return false;
    }
  }

  // Generic CRUD operations
  async create(tableName, fields) {
    if (!this.isInitialized) {
      throw new Error('Airtable service not initialized');
    }

    try {
      console.log(`Creating record in ${tableName}:`, fields);
      const records = await this.base(tableName).create([{ fields }]);
      const record = records[0];
      
      return {
        id: record.id,
        ...record.fields,
        createdTime: record._rawJson.createdTime
      };
    } catch (error) {
      console.error(`Error creating record in ${tableName}:`, error);
      throw new Error(`Failed to create ${tableName.toLowerCase()} record: ${error.message}`);
    }
  }

  async findById(tableName, recordId) {
    if (!this.isInitialized) {
      throw new Error('Airtable service not initialized');
    }

    try {
      console.log(`Finding record ${recordId} in ${tableName}`);
      const record = await this.base(tableName).find(recordId);
      
      return {
        id: record.id,
        ...record.fields,
        createdTime: record._rawJson.createdTime
      };
    } catch (error) {
      console.error(`Error finding record in ${tableName}:`, error);
      return null;
    }
  }

  async findAll(tableName, options = {}) {
    if (!this.isInitialized) {
      throw new Error('Airtable service not initialized');
    }

    try {
      console.log(`Finding all records in ${tableName} with options:`, options);
      const records = await this.base(tableName).select(options).all();
      
      return records.map(record => ({
        id: record.id,
        ...record.fields,
        createdTime: record._rawJson.createdTime
      }));
    } catch (error) {
      console.error(`Error finding records in ${tableName}:`, error);
      throw new Error(`Failed to fetch ${tableName.toLowerCase()} records: ${error.message}`);
    }
  }

  async update(tableName, recordId, fields) {
    if (!this.isInitialized) {
      throw new Error('Airtable service not initialized');
    }

    try {
      console.log(`Updating record ${recordId} in ${tableName}:`, fields);
      const records = await this.base(tableName).update([
        { id: recordId, fields }
      ]);
      const record = records[0];
      
      return {
        id: record.id,
        ...record.fields,
        createdTime: record._rawJson.createdTime
      };
    } catch (error) {
      console.error(`Error updating record in ${tableName}:`, error);
      throw new Error(`Failed to update ${tableName.toLowerCase()} record: ${error.message}`);
    }
  }

  async delete(tableName, recordId) {
    if (!this.isInitialized) {
      throw new Error('Airtable service not initialized');
    }

    try {
      console.log(`Deleting record ${recordId} from ${tableName}`);
      await this.base(tableName).destroy([recordId]);
      return true;
    } catch (error) {
      console.error(`Error deleting record from ${tableName}:`, error);
      throw new Error(`Failed to delete ${tableName.toLowerCase()} record: ${error.message}`);
    }
  }

  // Organization operations
  async createOrganization(data) {
    const fields = {
      Name: data.name,
      Description: data.description || '',
      Owner: [data.ownerId] // Link to Users table
    };
    
    return await this.create(this.tables.ORGANIZATIONS, fields);
  }

  async getOrganizations() {
    return await this.findAll(this.tables.ORGANIZATIONS, {
      sort: [{ field: 'Name', direction: 'asc' }]
    });
  }

  async getOrganizationById(orgId) {
    return await this.findById(this.tables.ORGANIZATIONS, orgId);
  }

  // Team operations
  async createTeam(data) {
    const fields = {
      Name: data.name,
      Description: data.description || '',
      Organization: [data.organizationId], // Link to Organizations table
      Owner: [data.ownerId] // Link to Users table
    };
    
    return await this.create(this.tables.TEAMS, fields);
  }

  async getTeams(organizationId = null) {
    const options = {
      sort: [{ field: 'Name', direction: 'asc' }]
    };
    
    if (organizationId) {
      options.filterByFormula = `{Organization} = '${organizationId}'`;
    }
    
    return await this.findAll(this.tables.TEAMS, options);
  }

  async getTeamById(teamId) {
    return await this.findById(this.tables.TEAMS, teamId);
  }

  // User operations
  async createUser(data) {
    const fields = {
      Name: data.name,
      Email: data.email,
      'Google ID': data.googleId || '',
      'Profile Picture': data.profilePicture || ''
    };
    
    return await this.create(this.tables.USERS, fields);
  }

  async getUserByEmail(email) {
    try {
      const records = await this.findAll(this.tables.USERS, {
        filterByFormula: `{Email} = '${email}'`,
        maxRecords: 1
      });
      
      return records.length > 0 ? records[0] : null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  async getUserById(userId) {
    return await this.findById(this.tables.USERS, userId);
  }

  // Team member operations
  async addTeamMember(data) {
    const fields = {
      User: [data.userId], // Link to Users table
      Team: [data.teamId], // Link to Teams table
      Role: data.role || 'Member'
    };
    
    return await this.create(this.tables.TEAM_MEMBERS, fields);
  }

  async getTeamMembers(teamId) {
    return await this.findAll(this.tables.TEAM_MEMBERS, {
      filterByFormula: `{Team} = '${teamId}'`
    });
  }

  async getUserTeams(userId) {
    return await this.findAll(this.tables.TEAM_MEMBERS, {
      filterByFormula: `{User} = '${userId}'`
    });
  }

  async removeTeamMember(userId, teamId) {
    try {
      const members = await this.findAll(this.tables.TEAM_MEMBERS, {
        filterByFormula: `AND({User} = '${userId}', {Team} = '${teamId}')`
      });
      
      if (members.length > 0) {
        await this.delete(this.tables.TEAM_MEMBERS, members[0].id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error removing team member:', error);
      throw error;
    }
  }

  // Task operations
  async createTask(data) {
    const fields = {
      Title: data.title,
      Description: data.description || '',
      Status: data.status || 'pending',
      Priority: data.priority || 'medium',
      Team: data.teamId ? [data.teamId] : undefined, // Link to Teams table
      'Created By': [data.createdBy], // Link to Users table
      'Assigned To': data.assignedTo ? [data.assignedTo] : undefined, // Link to Users table
      'Due Date': data.dueDate || undefined
    };
    
    // Remove undefined fields
    Object.keys(fields).forEach(key => {
      if (fields[key] === undefined) {
        delete fields[key];
      }
    });
    
    return await this.create(this.tables.TASKS, fields);
  }

  async getTasks(teamId = null, userId = null) {
    let filterFormula = '';
    
    if (teamId) {
      filterFormula = `{Team} = '${teamId}'`;
    } else if (userId) {
      filterFormula = `OR({Created By} = '${userId}', {Assigned To} = '${userId}')`;
    }
    
    const options = {
      sort: [{ field: 'Title', direction: 'asc' }]
    };
    
    if (filterFormula) {
      options.filterByFormula = filterFormula;
    }
    
    return await this.findAll(this.tables.TASKS, options);
  }

  async getTaskById(taskId) {
    return await this.findById(this.tables.TASKS, taskId);
  }

  async updateTask(taskId, data) {
    const fields = {};
    
    if (data.title !== undefined) fields.Title = data.title;
    if (data.description !== undefined) fields.Description = data.description;
    if (data.status !== undefined) fields.Status = data.status;
    if (data.priority !== undefined) fields.Priority = data.priority;
    if (data.assignedTo !== undefined) fields['Assigned To'] = data.assignedTo ? [data.assignedTo] : [];
    if (data.dueDate !== undefined) fields['Due Date'] = data.dueDate;
    
    return await this.update(this.tables.TASKS, taskId, fields);
  }

  async deleteTask(taskId) {
    return await this.delete(this.tables.TASKS, taskId);
  }

  // Invitation operations
  async createInvitation(data) {
    const fields = {
      Email: data.email,
      Team: [data.teamId], // Link to Teams table
      Role: data.role || 'Member',
      Token: data.token,
      Status: 'Pending'
    };
    
    return await this.create(this.tables.INVITATIONS, fields);
  }

  async getInvitationByToken(token) {
    try {
      const records = await this.findAll(this.tables.INVITATIONS, {
        filterByFormula: `{Token} = '${token}'`,
        maxRecords: 1
      });
      
      return records.length > 0 ? records[0] : null;
    } catch (error) {
      console.error('Error finding invitation by token:', error);
      return null;
    }
  }

  async updateInvitationStatus(invitationId, status) {
    return await this.update(this.tables.INVITATIONS, invitationId, {
      Status: status
    });
  }

  // Utility methods
  async testConnection() {
    try {
      await this.findAll(this.tables.USERS, { maxRecords: 1 });
      return true;
    } catch (error) {
      console.error('Airtable connection test failed:', error);
      return false;
    }
  }

  isAvailable() {
    return this.isInitialized;
  }
}

export const airtableService = new AirtableService();