import React, { useState, useEffect, useCallback } from 'react';
import { X, Calendar, User, Flag, Clock, Save, AlertCircle, CheckCircle } from 'lucide-react';
import PresenceIndicator from './PresenceIndicator';
import TaskAssignmentWorkflow from './TaskAssignmentWorkflow';
import { AccessibleModal, AccessibleButton, AccessibleInput, useAnnouncer, VisuallyHidden } from './ui/AccessibleComponents';
import { useResponsive } from './ui/ResponsiveLayout';
import { LoadingWrapper } from './ui/LoadingStates';
import { HelpButton } from './ui/HelpSystem';

const TaskModal = ({ 
  task, 
  isOpen, 
  onClose, 
  onUpdate, 
  teamMembers = [], 
  currentUser 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'Medium',
    assigneeId: '',
    assigneeName: '',
    dueDate: ''
  });
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  
  const { isMobile, isTablet } = useResponsive();
  const { announce } = useAnnouncer();

  // Initialize form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || task.task || '',
        description: task.description || '',
        status: task.status || 'pending',
        priority: task.priority || 'Medium',
        assigneeId: task.assigneeId || '',
        assigneeName: task.assigneeName || '',
        dueDate: task.dueDate || ''
      });
      setIsDirty(false);
      setSaveError(null);
    }
  }, [task]);

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!isDirty || !task || isSaving) return;
    
    // Check for validation errors
    const allErrors = Object.values(validationErrors).filter(Boolean);
    if (allErrors.length > 0) {
      setSaveError('Please fix validation errors before saving');
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);
      
      await onUpdate(task.id, formData);
      
      setIsDirty(false);
      setLastSaved(new Date());
      announce('Task saved successfully', 'polite');
    } catch (error) {
      console.error('Auto-save failed:', error);
      setSaveError('Failed to save changes');
      announce('Failed to save task changes', 'assertive');
    } finally {
      setIsSaving(false);
    }
  }, [isDirty, task, formData, onUpdate, isSaving, validationErrors, announce]);

  // Auto-save debounced
  useEffect(() => {
    if (isDirty) {
      const timeoutId = setTimeout(autoSave, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [isDirty, autoSave]);

  const validateField = (field, value) => {
    const errors = {};
    
    if (field === 'title' && !value.trim()) {
      errors.title = 'Task title is required';
    }
    if (field === 'dueDate' && value && new Date(value) < new Date()) {
      errors.dueDate = 'Due date cannot be in the past';
    }
    
    return errors;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
    
    // Validate field
    const fieldErrors = validateField(field, value);
    if (Object.keys(fieldErrors).length > 0) {
      setValidationErrors(prev => ({
        ...prev,
        ...fieldErrors
      }));
    }
  };

  const handleManualSave = async () => {
    if (!isDirty || !task) return;
    await autoSave();
  };

  const handleClose = async () => {
    // Auto-save before closing if there are unsaved changes
    if (isDirty) {
      await autoSave();
    }
    onClose();
  };

  const handleAssignmentChange = (assigneeId, assigneeName) => {
    handleInputChange('assigneeId', assigneeId);
    handleInputChange('assigneeName', assigneeName);
  };

  const statusOptions = [
    { value: 'pending', label: 'To Do', color: '#6b7280' },
    { value: 'in_progress', label: 'In Progress', color: '#f59e0b' },
    { value: 'done', label: 'Done', color: '#10b981' },
    { value: 'blocked', label: 'Blocked', color: '#ef4444' }
  ];

  const priorityOptions = [
    { value: 'Low', color: '#10b981' },
    { value: 'Medium', color: '#f59e0b' },
    { value: 'High', color: '#ef4444' }
  ];

  if (!isOpen || !task) return null;

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Edit Task: ${formData.title || 'Untitled Task'}`}
      size={isMobile ? 'sm' : 'lg'}
      closeOnOverlayClick={false}
    >
      <LoadingWrapper loading={isSaving}>
        <div style={{
          maxHeight: isMobile ? '70vh' : '80vh',
          overflowY: 'auto',
          padding: isMobile ? '16px' : '0'
        }}>
          {/* Enhanced Header */}
          <div style={{
            padding: isMobile ? '16px' : '24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'stretch' : 'flex-start',
            gap: isMobile ? '16px' : '0'
          }}>
            <div style={{ flex: 1, marginRight: isMobile ? '0' : '16px' }}>
              <AccessibleInput
                label="Task Title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                error={validationErrors.title}
                required
                style={{
                  fontSize: isMobile ? '16px' : '20px',
                  fontWeight: '600',
                  marginBottom: '8px'
                }}
                placeholder="Enter task title..."
              />
              
              {/* Status and Priority Selectors */}
              <div style={{ 
                display: 'flex', 
                gap: isMobile ? '8px' : '16px', 
                alignItems: 'center', 
                flexWrap: 'wrap',
                marginBottom: isMobile ? '16px' : '0'
              }}>
                <div style={{ position: 'relative' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '4px'
                  }}>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: isMobile ? '12px' : '14px',
                      fontWeight: '500',
                      backgroundColor: statusOptions.find(s => s.value === formData.status)?.color + '20',
                      color: statusOptions.find(s => s.value === formData.status)?.color,
                      minWidth: '100px'
                    }}
                  >
                    {statusOptions.map(status => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ position: 'relative' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '4px'
                  }}>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    style={{
                      padding: '6px 8px',
                      borderRadius: '8px',
                      border: '1px solid #d1d5db',
                      fontSize: isMobile ? '12px' : '14px',
                      fontWeight: '500',
                      backgroundColor: priorityOptions.find(p => p.value === formData.priority)?.color + '20',
                      color: priorityOptions.find(p => p.value === formData.priority)?.color,
                      minWidth: '100px'
                    }}
                  >
                    {priorityOptions.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {/* Save Status and Action Buttons */}
            <div style={{ 
              display: 'flex', 
              gap: '8px', 
              alignItems: 'center',
              flexDirection: isMobile ? 'column' : 'row',
              width: isMobile ? '100%' : 'auto'
            }}>
              {/* Save Status */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                fontSize: '12px',
                marginBottom: isMobile ? '8px' : '0'
              }}>
                {isSaving && (
                  <>
                    <Clock style={{ width: '14px', height: '14px', color: '#f59e0b' }} />
                    <span style={{ color: '#f59e0b' }}>Saving...</span>
                    <VisuallyHidden>Saving task changes</VisuallyHidden>
                  </>
                )}
                {!isSaving && isDirty && (
                  <>
                    <AlertCircle style={{ width: '14px', height: '14px', color: '#f59e0b' }} />
                    <span style={{ color: '#6b7280' }}>Unsaved changes</span>
                  </>
                )}
                {!isSaving && !isDirty && lastSaved && (
                  <>
                    <CheckCircle style={{ width: '14px', height: '14px', color: '#10b981' }} />
                    <span style={{ color: '#6b7280' }}>
                      Saved {lastSaved.toLocaleTimeString()}
                    </span>
                  </>
                )}
                {saveError && (
                  <>
                    <AlertCircle style={{ width: '14px', height: '14px', color: '#ef4444' }} />
                    <span style={{ color: '#ef4444', fontSize: '12px' }}>{saveError}</span>
                  </>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {isDirty && (
                  <AccessibleButton
                    onClick={handleManualSave}
                    disabled={isSaving || Object.keys(validationErrors).some(key => validationErrors[key])}
                    loading={isSaving}
                    size="sm"
                    icon={<Save style={{ width: '14px', height: '14px' }} />}
                    ariaLabel="Save task changes"
                  >
                    Save
                  </AccessibleButton>
                )}
                <HelpButton
                  size="sm"
                  content={{
                    title: "Task Editor Help",
                    description: "Edit task details with auto-save and validation.",
                    sections: [
                      {
                        title: "Features",
                        items: [
                          "Auto-save after 2 seconds of inactivity",
                          "Real-time validation",
                          "Smart assignment suggestions",
                          "Due date warnings"
                        ]
                      }
                    ]
                  }}
                />
              </div>
            </div>
          </div>

          {/* Enhanced Content */}
          <div style={{ 
            padding: isMobile ? '16px' : '24px', 
            maxHeight: isMobile ? '50vh' : '60vh', 
            overflowY: 'auto' 
          }}>
            {/* Description */}
            <div style={{ marginBottom: isMobile ? '16px' : '24px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '600', 
                marginBottom: '8px',
                color: '#374151'
              }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Add a detailed description..."
                rows={isMobile ? 3 : 4}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'vertical',
                  minHeight: isMobile ? '80px' : '100px',
                  fontFamily: 'inherit'
                }}
                aria-describedby="description-help"
              />
              <div id="description-help" style={{ 
                fontSize: '12px', 
                color: '#6b7280', 
                marginTop: '4px' 
              }}>
                Provide context and details to help team members understand the task
              </div>
            </div>

            {/* Due Date */}
            <div style={{ marginBottom: isMobile ? '16px' : '24px' }}>
              <AccessibleInput
                type="date"
                label="Due Date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                error={validationErrors.dueDate}
                helpText="Set a deadline for this task"
                style={{
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Enhanced Assignee Section */}
            <div style={{ marginBottom: isMobile ? '16px' : '24px' }}>
              <div style={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between', 
                alignItems: isMobile ? 'flex-start' : 'center', 
                marginBottom: '12px',
                gap: isMobile ? '8px' : '0'
              }}>
                <label style={{ 
                  fontSize: '14px', 
                  fontWeight: '600',
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <User style={{ width: '16px', height: '16px' }} />
                  Assigned to
                </label>
                <TaskAssignmentWorkflow 
                  task={task}
                  teamMembers={teamMembers}
                  onAssignmentChange={handleAssignmentChange}
                  compact={isMobile}
                />
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                {formData.assigneeId ? (
                  <PresenceIndicator
                    userId={formData.assigneeId}
                    size={isMobile ? 'sm' : 'md'}
                    showDetails={true}
                  />
                ) : (
                  <div style={{
                    width: isMobile ? '28px' : '32px',
                    height: isMobile ? '28px' : '32px',
                    backgroundColor: '#6b7280',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    ?
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <span style={{ 
                    color: '#374151', 
                    display: 'block',
                    fontWeight: '500',
                    fontSize: isMobile ? '14px' : '16px'
                  }}>
                    {formData.assigneeName || 'Unassigned'}
                  </span>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    {formData.assigneeId ? 
                      'Click avatar for real-time status' : 
                      'Use Smart Assign button to find the best team member'
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Enhanced Task Metadata */}
            <div style={{
              padding: isMobile ? '12px' : '16px',
              backgroundColor: '#f8fafc',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#6b7280',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: isMobile ? '8px' : '12px'
              }}>
                <div>
                  <strong>Created:</strong> {new Date(task.createdAt || Date.now()).toLocaleString()}
                </div>
                <div>
                  <strong>Last Updated:</strong> {new Date(task.updatedAt || Date.now()).toLocaleString()}
                </div>
                {task.createdByName && (
                  <div>
                    <strong>Created by:</strong> {task.createdByName}
                  </div>
                )}
                {task.sheetMetadata && (
                  <div>
                    <strong>Google Sheet Row:</strong> {task.sheetMetadata.rowIndex}
                  </div>
                )}
              </div>
              
              {/* Task ID for reference */}
              <div style={{ 
                marginTop: '8px', 
                paddingTop: '8px', 
                borderTop: '1px solid #e2e8f0',
                fontSize: '11px'
              }}>
                <strong>Task ID:</strong> {task.id}
              </div>
            </div>
          </div>
        </div>
      </LoadingWrapper>
    </AccessibleModal>
  );
};

export default TaskModal;