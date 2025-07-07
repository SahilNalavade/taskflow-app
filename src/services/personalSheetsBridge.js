// Personal Google Sheets Bridge Service
// Connects user's Google Sheets data to the enhanced TeamTaskBoard interface

import { multiSheetService } from './multiSheetService';

class PersonalSheetsBridge {
  constructor() {
    this.connectedSheet = null;
    this.tasks = [];
    this.isLoading = false;
    this.lastSyncTime = null;
    this.syncInterval = null;
    this.eventListeners = new Map();
    
    // Start background sync if a sheet is already connected
    this.initializeIfConnected();
  }

  // Initialize if user already has a connected sheet
  async initializeIfConnected() {
    try {
      const savedSheet = localStorage.getItem('connectedPersonalSheet');
      if (savedSheet) {
        this.connectedSheet = JSON.parse(savedSheet);
        await this.syncFromSheet();
        this.startBackgroundSync();
      }
    } catch (error) {
      console.error('Failed to initialize connected sheet:', error);
    }
  }

  // Connect to a new Google Sheet
  async connectSheet(sheet) {
    try {
      console.log('PersonalSheetsBridge: Connecting to sheet:', sheet);
      
      this.connectedSheet = {
        id: sheet.id,
        name: sheet.name,
        url: sheet.url,
        connectedAt: new Date().toISOString()
      };

      // Save the connection
      localStorage.setItem('connectedPersonalSheet', JSON.stringify(this.connectedSheet));
      
      // Set up the sheet with headers if it's empty
      await this.initializeSheet();
      
      // Initial sync
      await this.syncFromSheet();
      
      // Start background sync
      this.startBackgroundSync();
      
      this.emit('sheetConnected', this.connectedSheet);
      return true;
    } catch (error) {
      console.error('Failed to connect sheet:', error);
      throw error;
    }
  }

  // Initialize sheet with proper headers
  async initializeSheet() {
    try {
      const sheetInstance = multiSheetService.createSheetInstance({
        id: this.connectedSheet.id,
        name: this.connectedSheet.name,
        apiKey: import.meta.env.VITE_GOOGLE_SHEETS_API_KEY
      });

      // Check if sheet is empty and add headers
      const data = await sheetInstance.getAllTasks('Sheet1!A1:B1');
      
      if (!data || !data.values || data.values.length === 0) {
        console.log('PersonalSheetsBridge: Initializing empty sheet with headers');
        
        // Add headers to the sheet
        await sheetInstance.addTask('Task', 'Status');
        
        console.log('PersonalSheetsBridge: Sheet initialized with headers');
      }
    } catch (error) {
      console.error('Failed to initialize sheet:', error);
      // Don't throw - this is not critical
    }
  }

  // Disconnect from current sheet
  disconnectSheet() {
    this.connectedSheet = null;
    this.tasks = [];
    localStorage.removeItem('connectedPersonalSheet');
    this.stopBackgroundSync();
    this.emit('sheetDisconnected');
  }

  // Sync tasks from Google Sheets
  async syncFromSheet() {
    if (!this.connectedSheet) {
      console.warn('PersonalSheetsBridge: No sheet connected, cannot sync');
      return [];
    }

    try {
      this.isLoading = true;
      this.emit('syncStarted');

      console.log('PersonalSheetsBridge: Starting sync from sheet:', {
        id: this.connectedSheet.id,
        name: this.connectedSheet.name,
        url: this.connectedSheet.url
      });
      
      // Validate environment variables
      const apiKey = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
      if (!apiKey) {
        throw new Error('Google Sheets API key is missing. Please check your .env file.');
      }
      
      // Create a sheet instance and get tasks
      const sheetInstance = multiSheetService.createSheetInstance({
        id: this.connectedSheet.id,
        name: this.connectedSheet.name,
        apiKey: apiKey
      });
      
      console.log('PersonalSheetsBridge: Created sheet instance, calling getAllTasks...');
      
      const sheetData = await sheetInstance.getAllTasks();
      console.log('PersonalSheetsBridge: Raw sheet data received:', {
        hasValues: !!sheetData?.values,
        valuesLength: sheetData?.values?.length || 0,
        range: sheetData?.range,
        data: sheetData
      });
      
      if (!sheetData || !sheetData.values) {
        console.log('PersonalSheetsBridge: No data found in sheet, returning empty array');
        this.tasks = [];
        this.lastSyncTime = new Date().toISOString();
        this.emit('tasksUpdated', this.tasks);
        this.emit('syncCompleted');
        return this.tasks;
      }
      
      // Transform the raw sheet data to tasks
      console.log('PersonalSheetsBridge: Transforming sheet data to tasks...');
      const sheetTasks = this.transformSheetDataToTasks(sheetData);
      console.log('PersonalSheetsBridge: Transformed sheet tasks:', sheetTasks);

      // Transform to TeamTaskBoard format
      console.log('PersonalSheetsBridge: Transforming to TeamTaskBoard format...');
      this.tasks = this.transformSheetTasksToTeamFormat(sheetTasks);
      console.log('PersonalSheetsBridge: Final tasks for TeamTaskBoard:', this.tasks);
      
      this.lastSyncTime = new Date().toISOString();

      this.emit('tasksUpdated', this.tasks);
      this.emit('syncCompleted');
      
      console.log('PersonalSheetsBridge: Sync completed successfully, found', this.tasks.length, 'tasks');
      return this.tasks;
    } catch (error) {
      console.error('PersonalSheetsBridge: Failed to sync from sheet:', {
        error: error.message,
        stack: error.stack,
        sheetId: this.connectedSheet?.id,
        sheetName: this.connectedSheet?.name
      });
      
      // Emit detailed error information
      this.emit('syncError', {
        message: error.message,
        details: {
          sheetId: this.connectedSheet?.id,
          sheetName: this.connectedSheet?.name,
          timestamp: new Date().toISOString()
        }
      });
      
      throw new Error(`Sync failed: ${error.message}`);
    } finally {
      this.isLoading = false;
    }
  }

  // Transform raw sheet data (array of arrays) to task objects
  transformSheetDataToTasks(sheetData) {
    console.log('PersonalSheetsBridge: transformSheetDataToTasks input:', sheetData);
    
    if (!sheetData || !sheetData.values) {
      console.log('PersonalSheetsBridge: No values found in sheet data');
      return [];
    }

    const rows = sheetData.values;
    console.log('PersonalSheetsBridge: Raw rows:', rows);

    if (rows.length === 0) {
      console.log('PersonalSheetsBridge: Sheet is empty');
      return [];
    }

    // Check if first row looks like headers
    const firstRow = rows[0];
    const hasHeaders = firstRow && (
      (firstRow[0] && firstRow[0].toLowerCase().includes('task')) ||
      (firstRow[1] && firstRow[1].toLowerCase().includes('status'))
    );

    const headers = hasHeaders ? firstRow : ['Task', 'Status', 'Description', 'Assignee', 'Priority', 'Due Date'];
    const dataRows = hasHeaders ? rows.slice(1) : rows;

    console.log('PersonalSheetsBridge: Headers detected:', hasHeaders);
    console.log('PersonalSheetsBridge: Headers:', headers);
    console.log('PersonalSheetsBridge: Data rows:', dataRows);

    if (dataRows.length === 0) {
      console.log('PersonalSheetsBridge: No data rows found');
      return [];
    }

    return dataRows.map((row, index) => {
      // Handle sheets with different column structures
      const task = (row[0] || '').toString().trim();
      const status = (row[1] || 'pending').toString().trim();
      const description = (row[2] || '').toString().trim();
      const assignee = (row[3] || '').toString().trim();
      const priority = (row[4] || 'medium').toString().trim();
      const dueDate = (row[5] || '').toString().trim();

      console.log(`PersonalSheetsBridge: Processing row ${index + 1}:`, { task, status, description, assignee, priority, dueDate });

      return {
        task,
        title: task, // Alias for consistency
        status: this.normalizeStatus(status),
        description,
        assignee,
        priority: this.normalizePriority(priority),
        dueDate,
        rowIndex: (hasHeaders ? index + 2 : index + 1), // Account for headers and 1-indexed sheets
        originalRow: row
      };
    }).filter(task => task.task && task.task.length > 0); // Filter out empty tasks
  }

  // Transform Google Sheets tasks to TeamTaskBoard format
  transformSheetTasksToTeamFormat(sheetTasks) {
    return sheetTasks.map((sheetTask, index) => {
      // Generate consistent IDs based on sheet row
      const taskId = `sheet-task-${this.connectedSheet.id}-${index}`;
      
      return {
        id: taskId,
        title: sheetTask.task || sheetTask.title || 'Untitled Task',
        description: sheetTask.description || '',
        status: this.normalizeStatus(sheetTask.status),
        priority: sheetTask.priority || 'medium',
        assignee: sheetTask.assignee || null,
        assigneeId: sheetTask.assigneeId || null,
        createdBy: 'current-user', // Since it's personal sheets
        createdAt: sheetTask.createdAt || new Date().toISOString(),
        updatedAt: sheetTask.updatedAt || new Date().toISOString(),
        dueDate: sheetTask.dueDate || null,
        tags: sheetTask.tags || [],
        comments: [],
        
        // Sheet-specific metadata
        sheetMetadata: {
          sheetId: this.connectedSheet.id,
          rowIndex: index + 2, // +2 because sheets are 1-indexed and we skip header
          originalData: sheetTask
        }
      };
    });
  }

  // Normalize status values between sheets and app
  normalizeStatus(status) {
    if (!status) return 'pending';
    
    const statusLower = status.toString().toLowerCase().trim();
    console.log('PersonalSheetsBridge: Normalizing status:', status, '->', statusLower);
    
    const statusMap = {
      // Pending variations
      'pending': 'pending',
      'todo': 'pending',
      'to do': 'pending',
      'not started': 'pending',
      'new': 'pending',
      'open': 'pending',
      
      // In Progress variations
      'in progress': 'in_progress', 
      'in-progress': 'in_progress',
      'inprogress': 'in_progress',
      'working': 'in_progress',
      'doing': 'in_progress',
      'active': 'in_progress',
      'started': 'in_progress',
      
      // Done variations
      'done': 'done',
      'completed': 'done',
      'finished': 'done',
      'complete': 'done',
      'closed': 'done',
      'resolved': 'done',
      
      // Blocked variations
      'blocked': 'blocked',
      'stuck': 'blocked',
      'on hold': 'blocked',
      'waiting': 'blocked',
      'paused': 'blocked',
      'hold': 'blocked'
    };

    const normalizedStatus = statusMap[statusLower] || 'pending';
    console.log('PersonalSheetsBridge: Status normalized to:', normalizedStatus);
    return normalizedStatus;
  }

  // Normalize priority values
  normalizePriority(priority) {
    if (!priority) return 'Medium';
    
    const priorityLower = priority.toString().toLowerCase().trim();
    
    const priorityMap = {
      'high': 'High',
      'urgent': 'High',
      'critical': 'High',
      '3': 'High',
      'medium': 'Medium',
      'normal': 'Medium',
      'med': 'Medium',
      '2': 'Medium',
      'low': 'Low',
      'minor': 'Low',
      '1': 'Low'
    };

    return priorityMap[priorityLower] || 'Medium';
  }

  // Create a new task (add to sheet and local state)
  async createTask(taskData) {
    try {
      if (!this.connectedSheet) {
        throw new Error('No sheet connected. Please connect a Google Sheet first.');
      }

      console.log('PersonalSheetsBridge: Creating task:', taskData);

      // Validate task data
      if (!taskData.title || !taskData.title.trim()) {
        throw new Error('Task title is required');
      }

      // Create sheet instance
      const sheetInstance = multiSheetService.createSheetInstance({
        id: this.connectedSheet.id,
        name: this.connectedSheet.name,
        apiKey: import.meta.env.VITE_GOOGLE_SHEETS_API_KEY
      });

      console.log('PersonalSheetsBridge: Adding task to Google Sheets...');

      // Add to Google Sheets using the instance method
      const result = await sheetInstance.addTask(
        taskData.title,
        taskData.status || 'Pending'
      );

      console.log('PersonalSheetsBridge: Task added to Google Sheets, result:', result);

      // Refresh local data to sync the new task
      console.log('PersonalSheetsBridge: Syncing data after task creation...');
      await this.syncFromSheet();

      this.emit('taskCreated', taskData);
      console.log('PersonalSheetsBridge: Task created successfully');
      return true;
    } catch (error) {
      console.error('PersonalSheetsBridge: Failed to create task:', {
        error: error.message,
        taskData,
        sheetId: this.connectedSheet?.id
      });
      
      this.emit('taskError', {
        operation: 'create',
        message: error.message,
        taskData
      });
      
      throw new Error(`Failed to create task: ${error.message}`);
    }
  }

  // Update an existing task
  async updateTask(taskId, updates) {
    try {
      if (!this.connectedSheet) {
        throw new Error('No sheet connected');
      }

      console.log('PersonalSheetsBridge: Updating task:', taskId, updates);

      // Find the task and its sheet metadata
      const task = this.tasks.find(t => t.id === taskId);
      if (!task || !task.sheetMetadata) {
        throw new Error('Task not found or missing sheet metadata');
      }

      // Create sheet instance
      const sheetInstance = multiSheetService.createSheetInstance({
        id: this.connectedSheet.id,
        name: this.connectedSheet.name,
        apiKey: import.meta.env.VITE_GOOGLE_SHEETS_API_KEY
      });

      // Update in Google Sheets using the instance method
      const newTask = updates.title || task.title;
      const newStatus = updates.status || task.status;
      
      await sheetInstance.updateTask(
        task.sheetMetadata.rowIndex, 
        newTask,
        newStatus
      );

      // Update local task data optimistically to avoid UI revert
      const taskIndex = this.tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates };
        this.emit('tasksUpdated', this.tasks);
      }

      this.emit('taskUpdated', { taskId, updates });
      return true;
    } catch (error) {
      console.error('Failed to update task:', error);
      this.emit('taskError', error);
      throw error;
    }
  }

  // Delete a task
  async deleteTask(taskId) {
    try {
      if (!this.connectedSheet) {
        throw new Error('No sheet connected');
      }

      console.log('PersonalSheetsBridge: Deleting task:', taskId);

      // Find the task and its sheet metadata
      const task = this.tasks.find(t => t.id === taskId);
      if (!task || !task.sheetMetadata) {
        throw new Error('Task not found or missing sheet metadata');
      }

      // Create sheet instance
      const sheetInstance = multiSheetService.createSheetInstance({
        id: this.connectedSheet.id,
        name: this.connectedSheet.name,
        apiKey: import.meta.env.VITE_GOOGLE_SHEETS_API_KEY
      });

      // Delete from Google Sheets using the instance method
      await sheetInstance.deleteTask(task.sheetMetadata.rowIndex);

      // Refresh local data
      await this.syncFromSheet();

      this.emit('taskDeleted', taskId);
      return true;
    } catch (error) {
      console.error('Failed to delete task:', error);
      this.emit('taskError', error);
      throw error;
    }
  }

  // Get current tasks
  getTasks() {
    return this.tasks;
  }

  // Get connected sheet info
  getConnectedSheet() {
    return this.connectedSheet;
  }

  // Check if a sheet is connected
  isConnected() {
    return !!this.connectedSheet;
  }

  // Get sync status
  getSyncStatus() {
    return {
      isLoading: this.isLoading,
      lastSyncTime: this.lastSyncTime,
      connectedSheet: this.connectedSheet,
      taskCount: this.tasks.length
    };
  }

  // Start background sync (every 30 seconds)
  startBackgroundSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      try {
        await this.syncFromSheet();
      } catch (error) {
        console.error('Background sync failed:', error);
      }
    }, 30000); // 30 seconds
  }

  // Stop background sync
  stopBackgroundSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Manual sync trigger
  async manualSync() {
    return await this.syncFromSheet();
  }

  // Event system for components to listen to changes
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const callbacks = this.eventListeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Event listener error:', error);
        }
      });
    }
  }

  // Cleanup
  destroy() {
    this.stopBackgroundSync();
    this.eventListeners.clear();
    this.tasks = [];
    this.connectedSheet = null;
  }
}

// Export singleton instance
export const personalSheetsBridge = new PersonalSheetsBridge();
export default personalSheetsBridge;