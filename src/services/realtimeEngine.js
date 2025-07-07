// Real-time Collaboration Engine
// Simulates WebSocket functionality using localStorage events and cross-tab communication

export class RealtimeEngine {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.listeners = new Map();
    this.presence = new Map();
    this.typingStatus = new Map();
    this.conflictQueue = [];
    this.isActive = false;
    
    // Initialize presence tracking
    this.initializePresence();
  }

  // Generate unique session ID for this tab/user
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Initialize the real-time engine
  initialize(userId, userName) {
    this.userId = userId;
    this.userName = userName;
    this.isActive = true;

    // Bind event handlers
    this.boundHandleStorageChange = this.handleStorageChange.bind(this);
    this.boundHandleVisibilityChange = this.handleVisibilityChange.bind(this);

    // Listen for storage changes (cross-tab communication)
    window.addEventListener('storage', this.boundHandleStorageChange);
    
    // Listen for page visibility changes
    document.addEventListener('visibilitychange', this.boundHandleVisibilityChange);
    
    // Initialize presence
    this.setUserPresence(userId, {
      sessionId: this.sessionId,
      name: userName,
      isOnline: true,
      lastSeen: new Date().toISOString(),
      currentView: window.location.pathname,
      isTyping: false
    });

    // Start presence heartbeat
    this.startPresenceHeartbeat();

    console.log(`Real-time engine initialized for ${userName} (${this.sessionId})`);
  }

  // Clean up when user leaves
  destroy() {
    this.isActive = false;
    if (this.boundHandleStorageChange) {
      window.removeEventListener('storage', this.boundHandleStorageChange);
    }
    if (this.boundHandleVisibilityChange) {
      document.removeEventListener('visibilitychange', this.boundHandleVisibilityChange);
    }
    
    if (this.presenceInterval) {
      clearInterval(this.presenceInterval);
    }

    // Mark user as offline
    if (this.userId) {
      this.setUserPresence(this.userId, {
        sessionId: this.sessionId,
        name: this.userName,
        isOnline: false,
        lastSeen: new Date().toISOString(),
        currentView: null,
        isTyping: false
      });
    }
  }

  // Handle storage changes (real-time events)
  handleStorageChange(event) {
    if (!this.isActive) return;

    try {
      if (event.key === 'realtime_events') {
        const eventData = JSON.parse(event.newValue || '[]');
        const latestEvent = eventData[eventData.length - 1];
        
        if (latestEvent && latestEvent.sessionId !== this.sessionId) {
          this.processRealtimeEvent(latestEvent);
        }
      }
      
      if (event.key === 'user_presence') {
        const presenceData = JSON.parse(event.newValue || '{}');
        this.processPresenceUpdate(presenceData);
      }
      
      if (event.key === 'typing_status') {
        const typingData = JSON.parse(event.newValue || '{}');
        this.processTypingUpdate(typingData);
      }
    } catch (error) {
      console.error('Error processing storage change:', error);
    }
  }

  // Handle page visibility changes
  handleVisibilityChange() {
    if (document.hidden) {
      this.setUserPresence(this.userId, {
        sessionId: this.sessionId,
        name: this.userName,
        isOnline: false,
        lastSeen: new Date().toISOString(),
        currentView: null,
        isTyping: false
      });
    } else {
      this.setUserPresence(this.userId, {
        sessionId: this.sessionId,
        name: this.userName,
        isOnline: true,
        lastSeen: new Date().toISOString(),
        currentView: window.location.pathname,
        isTyping: false
      });
    }
  }

  // Emit a real-time event
  emit(eventType, data) {
    const event = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: eventType,
      data: data,
      userId: this.userId,
      userName: this.userName,
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    };

    // Store event in localStorage for cross-tab communication
    const existingEvents = JSON.parse(localStorage.getItem('realtime_events') || '[]');
    existingEvents.push(event);
    
    // Keep only last 50 events to prevent memory bloat
    if (existingEvents.length > 50) {
      existingEvents.splice(0, existingEvents.length - 50);
    }
    
    localStorage.setItem('realtime_events', JSON.stringify(existingEvents));

    // Also emit to local listeners
    this.processRealtimeEvent(event);
  }

  // Listen for specific event types
  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  // Process incoming real-time events
  processRealtimeEvent(event) {
    const callbacks = this.listeners.get(event.type) || [];
    callbacks.forEach(callback => {
      try {
        callback(event.data, event);
      } catch (error) {
        console.error('Error in real-time event callback:', error);
      }
    });

    // Handle conflict detection
    this.detectConflicts(event);
  }

  // Detect and handle conflicts
  detectConflicts(incomingEvent) {
    if (incomingEvent.type === 'task_updated') {
      const existingEdit = this.conflictQueue.find(
        edit => edit.taskId === incomingEvent.data.taskId && 
                edit.userId !== incomingEvent.userId
      );

      if (existingEdit) {
        // Conflict detected!
        this.handleConflict(existingEdit, incomingEvent);
      }
    }
  }

  // Handle conflict resolution
  handleConflict(localEdit, remoteEdit) {
    const conflictEvent = {
      type: 'conflict_detected',
      localEdit: localEdit,
      remoteEdit: remoteEdit,
      timestamp: new Date().toISOString(),
      conflictId: `conflict_${Date.now()}`
    };

    // Emit conflict event for UI to handle
    this.processRealtimeEvent({
      type: 'conflict_detected',
      data: conflictEvent,
      userId: 'system',
      sessionId: 'system'
    });

    // Advanced resolution: show both versions and let user choose
    setTimeout(() => {
      this.emit('conflict_resolution_required', {
        conflictId: conflictEvent.conflictId,
        localChange: localEdit,
        remoteChange: remoteEdit,
        taskId: localEdit.taskId,
        timestamp: conflictEvent.timestamp
      });
    }, 1000);

    // Auto-resolve after 10 seconds if no user action
    setTimeout(() => {
      this.emit('conflict_auto_resolved', {
        resolution: 'last_write_wins',
        winner: remoteEdit.userId,
        conflictId: conflictEvent.conflictId,
        autoResolved: true
      });
    }, 10000);
  }

  // Track editing operations for conflict detection
  trackEdit(taskId, field, value) {
    const editOperation = {
      taskId: taskId,
      field: field,
      value: value,
      userId: this.userId,
      timestamp: new Date().toISOString()
    };

    this.conflictQueue.push(editOperation);
    
    // Clean up old operations
    setTimeout(() => {
      this.conflictQueue = this.conflictQueue.filter(
        op => op.timestamp !== editOperation.timestamp
      );
    }, 5000);
  }

  // Presence management
  setUserPresence(userId, presence) {
    const allPresence = JSON.parse(localStorage.getItem('user_presence') || '{}');
    allPresence[userId] = {
      ...presence,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('user_presence', JSON.stringify(allPresence));
  }

  getUserPresence(userId) {
    const allPresence = JSON.parse(localStorage.getItem('user_presence') || '{}');
    return allPresence[userId] || null;
  }

  getAllPresence() {
    const allPresence = JSON.parse(localStorage.getItem('user_presence') || '{}');
    
    // Filter out stale presence (older than 30 seconds)
    const now = new Date();
    const filtered = {};
    
    Object.keys(allPresence).forEach(userId => {
      const presence = allPresence[userId];
      const lastUpdated = new Date(presence.lastUpdated);
      const diffInSeconds = (now - lastUpdated) / 1000;
      
      if (diffInSeconds < 30) {
        filtered[userId] = presence;
      }
    });
    
    return filtered;
  }

  processPresenceUpdate(presenceData) {
    // Emit presence updates to listeners
    Object.keys(presenceData).forEach(userId => {
      if (userId !== this.userId) {
        this.processRealtimeEvent({
          type: 'user_presence_changed',
          data: {
            userId: userId,
            presence: presenceData[userId]
          },
          sessionId: 'system'
        });
      }
    });
  }

  // Initialize presence tracking
  initializePresence() {
    // Clean up stale presence data on init
    const allPresence = this.getAllPresence();
    localStorage.setItem('user_presence', JSON.stringify(allPresence));
  }

  // Start presence heartbeat
  startPresenceHeartbeat() {
    this.presenceInterval = setInterval(() => {
      if (this.isActive && !document.hidden) {
        this.setUserPresence(this.userId, {
          sessionId: this.sessionId,
          name: this.userName,
          isOnline: true,
          lastSeen: new Date().toISOString(),
          currentView: window.location.pathname,
          isTyping: this.isTyping || false
        });
      }
    }, 10000); // Update every 10 seconds
  }

  // Typing indicators
  setTyping(isTyping, context = null) {
    this.isTyping = isTyping;
    const typingData = JSON.parse(localStorage.getItem('typing_status') || '{}');
    
    if (isTyping) {
      typingData[this.userId] = {
        name: this.userName,
        context: context,
        timestamp: new Date().toISOString()
      };
    } else {
      delete typingData[this.userId];
    }
    
    localStorage.setItem('typing_status', JSON.stringify(typingData));
  }

  getTypingUsers(context = null) {
    const typingData = JSON.parse(localStorage.getItem('typing_status') || '{}');
    const now = new Date();
    const filtered = {};
    
    Object.keys(typingData).forEach(userId => {
      const typing = typingData[userId];
      const timestamp = new Date(typing.timestamp);
      const diffInSeconds = (now - timestamp) / 1000;
      
      // Remove stale typing indicators (older than 10 seconds)
      if (diffInSeconds < 10 && userId !== this.userId) {
        if (!context || typing.context === context) {
          filtered[userId] = typing;
        }
      }
    });
    
    return filtered;
  }

  processTypingUpdate(typingData) {
    this.processRealtimeEvent({
      type: 'typing_status_changed',
      data: typingData,
      sessionId: 'system'
    });
  }

  // Simulate cursor positions for collaborative editing
  setCursorPosition(elementId, position) {
    this.emit('cursor_moved', {
      elementId: elementId,
      position: position,
      timestamp: new Date().toISOString()
    });
  }

  // Auto-sync helpers
  syncWithGoogleSheets(sheetId, changes) {
    this.emit('sheet_sync_requested', {
      sheetId: sheetId,
      changes: changes,
      requestId: `sync_${Date.now()}`
    });
  }

  // Utility methods
  getCurrentOnlineUsers() {
    const presence = this.getAllPresence();
    return Object.keys(presence).filter(userId => presence[userId].isOnline);
  }

  getUserActivity(userId, timeRange = 3600000) { // 1 hour default
    const events = JSON.parse(localStorage.getItem('realtime_events') || '[]');
    const since = new Date(Date.now() - timeRange);
    
    return events.filter(event => 
      event.userId === userId && 
      new Date(event.timestamp) > since
    );
  }
}

// Singleton instance
export const realtimeEngine = new RealtimeEngine();