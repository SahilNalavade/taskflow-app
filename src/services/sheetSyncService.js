// Google Sheets Auto-Sync Service
// Simulates real-time sync between team tasks and Google Sheets

import { realtimeEngine } from './realtimeEngine';

export class SheetSyncService {
  constructor() {
    this.syncEnabled = false;
    this.syncInterval = null;
    this.pendingChanges = new Map();
    this.lastSyncTime = null;
    this.syncStatus = 'idle'; // 'idle', 'syncing', 'error', 'success'
    
    // Listen for task changes
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    // Listen for task updates to queue for sync
    realtimeEngine.on('task_updated', (data) => {
      this.queueChange('task_updated', data);
    });

    realtimeEngine.on('task_created', (data) => {
      this.queueChange('task_created', data);
    });

    realtimeEngine.on('task_deleted', (data) => {
      this.queueChange('task_deleted', data);
    });

    realtimeEngine.on('comment_added', (data) => {
      this.queueChange('comment_added', data);
    });
  }

  // Enable auto-sync with specified interval
  enableAutoSync(intervalMs = 10000) { // Default 10 seconds
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncEnabled = true;
    this.syncInterval = setInterval(() => {
      this.performSync();
    }, intervalMs);

    console.log(`Auto-sync enabled with ${intervalMs}ms interval`);
    
    // Emit sync status
    realtimeEngine.emit('sync_status_changed', {
      enabled: true,
      interval: intervalMs,
      status: 'enabled'
    });
  }

  // Disable auto-sync
  disableAutoSync() {
    this.syncEnabled = false;
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    console.log('Auto-sync disabled');
    
    realtimeEngine.emit('sync_status_changed', {
      enabled: false,
      status: 'disabled'
    });
  }

  // Queue a change for sync
  queueChange(changeType, data) {
    if (!this.syncEnabled) return;

    const changeId = `${changeType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.pendingChanges.set(changeId, {
      id: changeId,
      type: changeType,
      data: data,
      timestamp: new Date().toISOString(),
      retries: 0
    });

    console.log(`Queued change for sync: ${changeType}`, data);
    
    // Emit pending changes count
    realtimeEngine.emit('sync_pending_changes', {
      count: this.pendingChanges.size,
      changes: Array.from(this.pendingChanges.values())
    });
  }

  // Perform sync operation
  async performSync() {
    if (this.pendingChanges.size === 0) {
      this.syncStatus = 'idle';
      return;
    }

    this.syncStatus = 'syncing';
    realtimeEngine.emit('sync_status_changed', {
      enabled: this.syncEnabled,
      status: 'syncing',
      pendingCount: this.pendingChanges.size
    });

    try {
      console.log(`Starting sync of ${this.pendingChanges.size} changes...`);
      
      // Simulate API calls to Google Sheets
      const changes = Array.from(this.pendingChanges.values());
      const batchSize = 5; // Process in batches
      
      for (let i = 0; i < changes.length; i += batchSize) {
        const batch = changes.slice(i, i + batchSize);
        await this.syncBatch(batch);
        
        // Remove successfully synced changes
        batch.forEach(change => {
          this.pendingChanges.delete(change.id);
        });

        // Add delay between batches
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      this.syncStatus = 'success';
      this.lastSyncTime = new Date().toISOString();
      
      console.log('Sync completed successfully');
      
      realtimeEngine.emit('sync_completed', {
        success: true,
        syncTime: this.lastSyncTime,
        changesSynced: changes.length
      });

    } catch (error) {
      console.error('Sync failed:', error);
      this.syncStatus = 'error';
      
      // Retry failed changes (max 3 retries)
      this.retryFailedChanges();
      
      realtimeEngine.emit('sync_failed', {
        error: error.message,
        pendingCount: this.pendingChanges.size
      });
    }

    realtimeEngine.emit('sync_status_changed', {
      enabled: this.syncEnabled,
      status: this.syncStatus,
      lastSync: this.lastSyncTime,
      pendingCount: this.pendingChanges.size
    });
  }

  // Simulate syncing a batch of changes to Google Sheets
  async syncBatch(changes) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simulate occasional failures (5% chance)
    if (Math.random() < 0.05) {
      throw new Error('Network error during sync');
    }

    // Log what would be synced
    changes.forEach(change => {
      console.log(`✓ Synced to Google Sheets: ${change.type}`, change.data);
    });

    // Emit individual sync events
    changes.forEach(change => {
      realtimeEngine.emit('change_synced', {
        changeId: change.id,
        type: change.type,
        data: change.data,
        syncTime: new Date().toISOString()
      });
    });
  }

  // Retry failed changes
  retryFailedChanges() {
    const failedChanges = Array.from(this.pendingChanges.values());
    
    failedChanges.forEach(change => {
      change.retries = (change.retries || 0) + 1;
      
      // Remove changes that have failed too many times
      if (change.retries >= 3) {
        console.log(`Dropping change after 3 failed retries: ${change.type}`);
        this.pendingChanges.delete(change.id);
      }
    });
  }

  // Manual sync trigger
  async triggerManualSync() {
    console.log('Manual sync triggered');
    await this.performSync();
  }

  // Get sync status
  getSyncStatus() {
    return {
      enabled: this.syncEnabled,
      status: this.syncStatus,
      pendingChanges: this.pendingChanges.size,
      lastSync: this.lastSyncTime
    };
  }

  // Simulate receiving updates from Google Sheets (for demo)
  simulateSheetUpdates() {
    if (!this.syncEnabled) return;

    const updateTypes = [
      'task_updated_from_sheet',
      'task_created_from_sheet',
      'comment_added_from_sheet'
    ];

    const randomType = updateTypes[Math.floor(Math.random() * updateTypes.length)];
    
    realtimeEngine.emit('sheet_update_received', {
      type: randomType,
      data: {
        taskId: `task_${Math.random().toString(36).substr(2, 9)}`,
        field: 'status',
        value: 'Updated from Google Sheets',
        updatedBy: 'Google Sheets Sync',
        timestamp: new Date().toISOString()
      }
    });

    console.log('Simulated update from Google Sheets:', randomType);
  }

  // Start simulating sheet updates
  startSheetUpdateSimulation() {
    setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance every interval
        this.simulateSheetUpdates();
      }
    }, 15000); // Check every 15 seconds
  }

  // Cleanup
  destroy() {
    this.disableAutoSync();
    this.pendingChanges.clear();
  }
}

// Singleton instance
export const sheetSyncService = new SheetSyncService();