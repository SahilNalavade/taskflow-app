import React, { useState, useEffect, useCallback } from 'react';
import { X, Calendar, User, Flag, Clock, Save } from 'lucide-react';
import PresenceIndicator from './PresenceIndicator';
import TaskAssignmentWorkflow from './TaskAssignmentWorkflow';

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

    try {
      setIsSaving(true);
      setSaveError(null);
      
      await onUpdate(task.id, formData);
      
      setIsDirty(false);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
      setSaveError('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  }, [isDirty, task, formData, onUpdate, isSaving]);

  // Auto-save debounced
  useEffect(() => {
    if (isDirty) {
      const timeoutId = setTimeout(autoSave, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [isDirty, autoSave]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
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
        padding: '0',
        maxWidth: '700px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{ flex: 1, marginRight: '16px' }}>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              style={{
                width: '100%',
                fontSize: '20px',
                fontWeight: '600',
                color: '#111827',
                border: '2px solid transparent',
                borderRadius: '4px',
                padding: '4px 8px',
                backgroundColor: 'transparent',
                marginBottom: '8px'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = 'transparent'}
              placeholder="Task title..."
            />
            
            {/* Status and Save Indicator */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Status Selector */}
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  border: '1px solid #d1d5db',
                  fontSize: '12px',
                  fontWeight: '500',
                  backgroundColor: statusOptions.find(s => s.value === formData.status)?.color + '20',
                  color: statusOptions.find(s => s.value === formData.status)?.color
                }}
              >
                {statusOptions.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>

              {/* Priority Selector */}
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '12px',
                  border: '1px solid #d1d5db',
                  fontSize: '12px',
                  fontWeight: '500',
                  backgroundColor: priorityOptions.find(p => p.value === formData.priority)?.color + '20',
                  color: priorityOptions.find(p => p.value === formData.priority)?.color
                }}
              >
                {priorityOptions.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.value} Priority
                  </option>
                ))}
              </select>

              {/* Save Status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                {isSaving && (
                  <>
                    <Clock style={{ width: '12px', height: '12px', color: '#f59e0b' }} />
                    <span style={{ color: '#f59e0b' }}>Saving...</span>
                  </>
                )}
                {!isSaving && isDirty && (
                  <>
                    <div style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      backgroundColor: '#f59e0b' 
                    }} />
                    <span style={{ color: '#6b7280' }}>Unsaved changes</span>
                  </>
                )}
                {!isSaving && !isDirty && lastSaved && (
                  <>
                    <div style={{ 
                      width: '8px', 
                      height: '8px', 
                      borderRadius: '50%', 
                      backgroundColor: '#10b981' 
                    }} />
                    <span style={{ color: '#6b7280' }}>
                      Saved {lastSaved.toLocaleTimeString()}
                    </span>
                  </>
                )}
                {saveError && (
                  <span style={{ color: '#ef4444', fontSize: '12px' }}>{saveError}</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {isDirty && (
              <button
                onClick={handleManualSave}
                disabled={isSaving}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  opacity: isSaving ? 0.7 : 1
                }}
              >
                <Save style={{ width: '12px', height: '12px' }} />
                Save
              </button>
            )}
            <button
              onClick={handleClose}
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
        </div>

        {/* Content */}
        <div style={{ padding: '24px', maxHeight: '60vh', overflowY: 'auto' }}>
          {/* Description */}
          <div style={{ marginBottom: '24px' }}>
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
              placeholder="Add a description..."
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical',
                minHeight: '100px'
              }}
            />
          </div>

          {/* Due Date */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '600', 
              marginBottom: '8px',
              color: '#374151'
            }}>
              <Calendar style={{ width: '14px', height: '14px', display: 'inline', marginRight: '4px' }} />
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Assignee */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '8px' 
            }}>
              <label style={{ 
                fontSize: '14px', 
                fontWeight: '600',
                color: '#374151'
              }}>
                <User style={{ width: '14px', height: '14px', display: 'inline', marginRight: '4px' }} />
                Assigned to
              </label>
              <TaskAssignmentWorkflow 
                task={task}
                teamMembers={teamMembers}
                onAssignmentChange={handleAssignmentChange}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {formData.assigneeId ? (
                <PresenceIndicator
                  userId={formData.assigneeId}
                  size="md"
                  showDetails={true}
                />
              ) : (
                <div style={{
                  width: '32px',
                  height: '32px',
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
              <div>
                <span style={{ color: '#374151', display: 'block' }}>
                  {formData.assigneeName || 'Unassigned'}
                </span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  {formData.assigneeId ? 
                    'Click avatar for status details' : 
                    'Use Smart Assign to find the best team member'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Task Metadata */}
          <div style={{
            padding: '16px',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#6b7280'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>Created:</strong> {new Date(task.createdAt || Date.now()).toLocaleString()}
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>Last Updated:</strong> {new Date(task.updatedAt || Date.now()).toLocaleString()}
            </div>
            {task.sheetMetadata && (
              <div>
                <strong>Google Sheet Row:</strong> {task.sheetMetadata.rowIndex}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;