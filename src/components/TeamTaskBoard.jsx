import React, { useState, useEffect, useCallback } from 'react';
import { Plus, User, Users, MessageCircle, Calendar, AlertTriangle, Clock, CheckCircle2, MoreHorizontal, Edit3, Trash2, X, Send } from 'lucide-react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { demoTeamService } from '../services/demoTeamService';
import CollaborativeCursor from './CollaborativeCursor';
import PresenceIndicator from './PresenceIndicator';
import TypingIndicator from './TypingIndicator';
import TaskAssignmentWorkflow from './TaskAssignmentWorkflow';
import TaskModal from './TaskModal';
import DraggableTaskCard from './DraggableTaskCard';
import DropZone from './DropZone';
import FilterBar from './FilterBar';
import { realtimeEngine } from '../services/realtimeEngine';
import { useMentions } from '../utils/mentionsParser';
import { TaskCreationModal, QuickActions, BulkOperations } from './ui/EnhancedTaskManagement';
import { AdvancedSearchBar, FilterPanel, useAdvancedSearch } from './ui/AdvancedSearch';
import { useKeyboardShortcuts } from './ui/KeyboardShortcuts';
import { HelpButton } from './ui/HelpSystem';
import { LoadingWrapper, TaskBoardSkeleton } from './ui/LoadingStates';
import { useResponsive } from './ui/ResponsiveLayout';

const TeamTaskBoard = ({ 
  currentUser, 
  teamMembers: externalTeamMembers,
  isPersonalMode = false,
  externalTasks = null,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete
}) => {
  const [tasksByStatus, setTasksByStatus] = useState({});
  const [filteredTasksByStatus, setFilteredTasksByStatus] = useState({});
  const [allTasks, setAllTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    description: '',
    assigneeId: '',
    priority: 'Medium',
    dueDate: ''
  });

  // Enhanced Task Management State
  const [showTaskCreationModal, setShowTaskCreationModal] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const { isMobile } = useResponsive();

  // Initialize mentions functionality
  const { processMentionsInComment, renderMentionsAsHTML } = useMentions(teamMembers);

  // Advanced search and filtering
  const searchConfig = {
    searchFields: ['title', 'description', 'assigneeName']
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
  } = useAdvancedSearch(allTasks, searchConfig);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'MOD+N': () => setShowTaskCreationModal(true),
    'MOD+F': () => document.querySelector('[data-search-input]')?.focus(),
    'MOD+A': () => setSelectedTasks(allTasks.map(t => t.id)),
    'MOD+SHIFT+A': () => setSelectedTasks([]),
    'ESC': () => {
      setShowTaskCreationModal(false);
      setShowTaskModal(false);
      setSelectedTasks([]);
    }
  });

  // Helper function to organize tasks by status
  const organizeTasksByStatus = (tasks) => {
    console.log('TeamTaskBoard: Organizing tasks by status:', tasks);
    
    const organized = {
      pending: [],
      in_progress: [],
      done: [],
      blocked: []
    };

    tasks.forEach(task => {
      const status = (task.status || 'pending').toString().toLowerCase().trim();
      console.log(`TeamTaskBoard: Task "${task.title || task.task}" has status "${task.status}" -> normalized to "${status}"`);
      
      if (organized[status]) {
        organized[status].push(task);
      } else {
        console.log(`TeamTaskBoard: Unknown status "${status}", defaulting to pending`);
        organized.pending.push(task); // Default to pending if status is unknown
      }
    });

    console.log('TeamTaskBoard: Final organized tasks:', organized);
    return organized;
  };

  // Handle filter changes (must be declared with hooks)
  const handleFiltersChange = useCallback((filteredTasks, filters) => {
    console.log('TeamTaskBoard: Applying filters:', filters, 'Filtered tasks:', filteredTasks);
    setActiveFilters(filters);
    
    // Organize filtered tasks by status
    const organizedFiltered = organizeTasksByStatus(filteredTasks);
    setFilteredTasksByStatus(organizedFiltered);
  }, []);

  // Update filtered tasks when search results change
  useEffect(() => {
    const organizedSearchResults = organizeTasksByStatus(searchResults);
    setFilteredTasksByStatus(organizedSearchResults);
  }, [searchResults]);

  const statusColumns = [
    { key: 'pending', title: 'To Do', color: '#6b7280', bgColor: '#f3f4f6' },
    { key: 'in_progress', title: 'In Progress', color: '#f59e0b', bgColor: '#fef3c7' },
    { key: 'done', title: 'Done', color: '#10b981', bgColor: '#d1fae5' },
    { key: 'blocked', title: 'Blocked', color: '#ef4444', bgColor: '#fee2e2' }
  ];

  useEffect(() => {
    loadData();
  }, [externalTasks, externalTeamMembers]);

  // Add effect to update tasks when external tasks change
  useEffect(() => {
    if (externalTasks) {
      console.log('TeamTaskBoard: Using external tasks:', externalTasks);
      setAllTasks(externalTasks);
      const organized = organizeTasksByStatus(externalTasks);
      setTasksByStatus(organized);
      setFilteredTasksByStatus(organized);
    }
  }, [externalTasks]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Use external data when provided (for personal mode with Google Sheets)
      if (externalTasks !== null && externalTeamMembers) {
        console.log('TeamTaskBoard: Loading external data');
        setAllTasks(externalTasks);
        const organized = organizeTasksByStatus(externalTasks);
        setTasksByStatus(organized);
        setFilteredTasksByStatus(organized);
        setTeamMembers(externalTeamMembers);
      } else {
        // Fall back to demo service
        console.log('TeamTaskBoard: Loading demo data');
        const [tasks, members] = await Promise.all([
          demoTeamService.getTasksByStatus(),
          demoTeamService.getTeamMembers()
        ]);
        
        // Convert demo format to flat array for filtering
        const flatTasks = Object.values(tasks).flat();
        setAllTasks(flatTasks);
        setTasksByStatus(tasks);
        setFilteredTasksByStatus(tasks);
        setTeamMembers(members);
      }
    } catch (error) {
      console.error('Error loading team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      if (onTaskUpdate) {
        // Use external handler for Google Sheets integration
        await onTaskUpdate(taskId, { status: newStatus });
      } else {
        // Use demo service
        await demoTeamService.updateTaskStatus(taskId, newStatus);
        await loadData(); // Refresh data
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedTask) return;

    try {
      await demoTeamService.addComment(selectedTask.id, newComment);
      
      // Process mentions in the comment
      processMentionsInComment(newComment, selectedTask.id, currentUser.id, currentUser.name);
      
      // Trigger sync event
      realtimeEngine.emit('comment_added', {
        taskId: selectedTask.id,
        comment: newComment,
        userId: currentUser.id,
        userName: currentUser.name
      });
      
      setNewComment('');
      
      // Refresh task data
      const updatedTasks = await demoTeamService.getTasksByStatus();
      setTasksByStatus(updatedTasks);
      
      // Update selected task
      const updatedTask = Object.values(updatedTasks)
        .flat()
        .find(t => t.id === selectedTask.id);
      setSelectedTask(updatedTask);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleCreateTask = async () => {
    if (!newTaskData.title.trim()) return;

    try {
      if (onTaskCreate) {
        // Use external handler for Google Sheets integration
        await onTaskCreate({
          ...newTaskData,
          createdBy: currentUser.id,
          createdByName: currentUser.name
        });
      } else {
        // Use demo service
        await demoTeamService.createTask(newTaskData);
        
        // Trigger sync event
        realtimeEngine.emit('task_created', {
          ...newTaskData,
          createdBy: currentUser.id,
          createdByName: currentUser.name
        });
        
        await loadData();
      }
      
      setNewTaskData({
        title: '',
        description: '',
        assigneeId: '',
        priority: 'Medium',
        dueDate: ''
      });
      setShowNewTaskForm(false);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  // Enhanced task creation with templates
  const handleEnhancedTaskCreate = async (taskData) => {
    try {
      const enhancedTaskData = {
        ...taskData,
        createdBy: currentUser.id,
        createdByName: currentUser.name,
        status: 'pending', // Default status
        id: Date.now().toString() // Temporary ID generation
      };

      if (onTaskCreate) {
        await onTaskCreate(enhancedTaskData);
      } else {
        await demoTeamService.createTask(enhancedTaskData);
        realtimeEngine.emit('task_created', enhancedTaskData);
        await loadData();
      }
    } catch (error) {
      console.error('Error creating enhanced task:', error);
      throw error;
    }
  };

  // Quick action handler
  const handleQuickCreate = (template) => {
    setShowTaskCreationModal(true);
    // Template will be applied in the modal
  };

  // Bulk operations handlers
  const handleBulkUpdate = async (tasks) => {
    try {
      const promises = tasks.map(task => {
        if (onTaskUpdate) {
          return onTaskUpdate(task.id, task);
        } else {
          return demoTeamService.updateTask(task.id, task);
        }
      });

      await Promise.all(promises);
      
      if (!onTaskUpdate) {
        await loadData();
      }
      
      setSelectedTasks([]);
    } catch (error) {
      console.error('Error updating tasks in bulk:', error);
    }
  };

  const handleBulkDelete = async (tasks) => {
    try {
      const promises = tasks.map(task => {
        if (onTaskDelete) {
          return onTaskDelete(task.id);
        } else {
          return demoTeamService.deleteTask(task.id);
        }
      });

      await Promise.all(promises);
      
      if (!onTaskDelete) {
        await loadData();
      }
      
      setSelectedTasks([]);
    } catch (error) {
      console.error('Error deleting tasks in bulk:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#ef4444';
      case 'Medium': return '#f59e0b';
      case 'Low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getAvatarInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'Complete') return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <LoadingWrapper
        loading={true}
        skeleton={<TaskBoardSkeleton isMobile={isMobile} />}
      />
    );
  }

  const handleTaskUpdate = async (taskId, updates) => {
    try {
      console.log('TeamTaskBoard: Updating task:', taskId, updates);
      
      if (onTaskUpdate) {
        // Use external handler for Google Sheets integration
        await onTaskUpdate(taskId, updates);
      } else {
        // Use demo service for legacy support
        await demoTeamService.updateTask(taskId, updates);
        await loadData(); // Refresh data
      }
      
      // Update selected task if it's the one being updated
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(prev => ({ ...prev, ...updates }));
      }
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };


  // Handle drag and drop
  const handleTaskDrop = async (task, newStatus) => {
    try {
      console.log('TeamTaskBoard: Dropping task:', task.id, 'to status:', newStatus);
      
      // Optimistic update for both filtered and unfiltered tasks
      setTasksByStatus(prev => {
        const updated = { ...prev };
        
        // Remove from old status
        const oldStatus = task.status;
        updated[oldStatus] = updated[oldStatus].filter(t => t.id !== task.id);
        
        // Add to new status
        const updatedTask = { ...task, status: newStatus };
        updated[newStatus] = [...(updated[newStatus] || []), updatedTask];
        
        return updated;
      });

      setFilteredTasksByStatus(prev => {
        const updated = { ...prev };
        
        // Remove from old status
        const oldStatus = task.status;
        if (updated[oldStatus]) {
          updated[oldStatus] = updated[oldStatus].filter(t => t.id !== task.id);
        }
        
        // Add to new status
        const updatedTask = { ...task, status: newStatus };
        if (updated[newStatus]) {
          updated[newStatus] = [...updated[newStatus], updatedTask];
        } else {
          updated[newStatus] = [updatedTask];
        }
        
        return updated;
      });

      // Update in backend
      await handleTaskUpdate(task.id, { status: newStatus });
      
    } catch (error) {
      console.error('Failed to update task status:', error);
      // Revert optimistic update on error
      await loadData();
    }
  };

  return (
    <>
      {/* Enhanced Task Modal */}
      <TaskModal
        task={selectedTask}
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onUpdate={handleTaskUpdate}
        teamMembers={teamMembers}
        currentUser={currentUser}
      />

      {/* New Task Modal */}
      {showNewTaskForm && (
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
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>Create New Task</h3>
              <button
                onClick={() => setShowNewTaskForm(false)}
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Task Title *
                </label>
                <input
                  type="text"
                  value={newTaskData.title}
                  onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })}
                  placeholder="What needs to be done?"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Description
                </label>
                <textarea
                  value={newTaskData.description}
                  onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
                  placeholder="Add more details..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                    Assign to
                  </label>
                  <select
                    value={newTaskData.assigneeId}
                    onChange={(e) => setNewTaskData({ ...newTaskData, assigneeId: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="">Unassigned</option>
                    {teamMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                    Priority
                  </label>
                  <select
                    value={newTaskData.priority}
                    onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                  Due Date
                </label>
                <input
                  type="date"
                  value={newTaskData.dueDate}
                  onChange={(e) => setNewTaskData({ ...newTaskData, dueDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  onClick={() => setShowNewTaskForm(false)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTask}
                  disabled={!newTaskData.title.trim()}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: newTaskData.title.trim() ? '#3b82f6' : '#9ca3af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: newTaskData.title.trim() ? 'pointer' : 'not-allowed'
                  }}
                >
                  Create Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Task Creation Modal */}
      <TaskCreationModal
        isOpen={showTaskCreationModal}
        onClose={() => setShowTaskCreationModal(false)}
        onCreateTask={handleEnhancedTaskCreate}
        teamMembers={teamMembers}
        currentUser={currentUser}
      />

      {/* Bulk Operations */}
      {selectedTasks.length > 0 && (
        <BulkOperations
          selectedTasks={selectedTasks.map(taskId => allTasks.find(t => t.id === taskId)).filter(Boolean)}
          onBulkUpdate={handleBulkUpdate}
          onBulkDelete={handleBulkDelete}
          onCancel={() => setSelectedTasks([])}
          teamMembers={teamMembers}
        />
      )}

      {/* Main Board with Drag & Drop */}
      <DndProvider backend={HTML5Backend}>
        <CollaborativeCursor
          elementId="team_task_board"
          showCursors={true}
        >
          <div style={{ padding: '24px' }}>
            {/* Enhanced Header */}
            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'stretch' : 'center',
              marginBottom: '24px',
              gap: isMobile ? '16px' : '0'
            }}>
              <div>
                <h2 style={{
                  fontSize: isMobile ? '20px' : '24px',
                  fontWeight: 'bold',
                  color: '#111827',
                  marginBottom: '4px'
                }}>
                  Team Task Board
                </h2>
                <p style={{ color: '#6b7280', margin: 0, fontSize: isMobile ? '14px' : '16px' }}>
                  Collaborate with your team • Use ⌘+N to create tasks quickly
                </p>
              </div>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                flexDirection: isMobile ? 'column' : 'row'
              }}>
                <button
                  onClick={() => setShowTaskCreationModal(true)}
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
                    cursor: 'pointer',
                    minHeight: '44px',
                    width: isMobile ? '100%' : 'auto',
                    justifyContent: 'center'
                  }}
                >
                  <Plus style={{ width: '16px', height: '16px' }} />
                  {isMobile ? 'Create Task' : 'New Task'}
                </button>
                <HelpButton
                  content={{
                    title: "Task Board Help",
                    description: "Manage your team's tasks with drag-and-drop, templates, and advanced filtering.",
                    sections: [
                      {
                        title: "Keyboard Shortcuts",
                        items: [
                          "⌘+N - Create new task",
                          "⌘+F - Focus search",
                          "⌘+A - Select all tasks",
                          "ESC - Close modals"
                        ]
                      },
                      {
                        title: "Quick Actions",
                        items: [
                          "Use templates for common task types",
                          "Bulk edit multiple tasks at once",
                          "Drag tasks between columns",
                          "Filter by assignee, priority, or date"
                        ]
                      }
                    ]
                  }}
                />
              </div>
            </div>

            {/* Quick Actions */}
            <QuickActions onQuickCreate={handleQuickCreate} />

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
                placeholder="Search tasks..."
                data-search-input="true"
                style={{ flex: 1 }}
              />
              
              <FilterPanel
                filters={filters}
                onFiltersChange={setFilters}
                options={{
                  assignee: teamMembers.map(member => ({
                    value: member.id,
                    label: member.name
                  }))
                }}
                isOpen={showFilterPanel}
                onToggle={() => setShowFilterPanel(!showFilterPanel)}
              />
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
                  Showing {resultCount} of {searchTotalCount} tasks
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

            {/* Drag & Drop Kanban Board */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px'
            }}>
              {statusColumns.map((column) => (
                <DropZone
                  key={column.key}
                  status={column.key}
                  onDrop={handleTaskDrop}
                  columnConfig={column}
                >
                  {filteredTasksByStatus[column.key]?.map((task) => (
                    <DraggableTaskCard
                      key={task.id}
                      task={task}
                      onClick={handleTaskClick}
                      onTitleUpdate={handleTaskUpdate}
                      getPriorityColor={getPriorityColor}
                      formatDate={formatDate}
                      isOverdue={isOverdue}
                    />
                  ))}
                </DropZone>
              ))}
            </div>
          </div>
        </CollaborativeCursor>
      </DndProvider>
    </>
  );
};

export default TeamTaskBoard;