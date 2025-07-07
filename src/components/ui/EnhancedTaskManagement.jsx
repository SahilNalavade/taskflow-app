import React, { useState, useEffect } from 'react';
import { 
  Plus, Template, Copy, Trash2, Edit3, CheckSquare,
  Square, MoreHorizontal, Filter, Search, Star,
  Calendar, User, Flag, Clock, ArrowRight,
  Zap, FileText, Code, PaintBucket, MessageSquare,
  ShoppingCart, Target, Users, Settings
} from 'lucide-react';
import { AccessibleButton, AccessibleModal, AccessibleInput, AccessibleDropdown } from './AccessibleComponents';
import { ResponsiveCard, ResponsiveGrid, useResponsive } from './ResponsiveLayout';
import { EmptyTaskBoard } from './ErrorStates';

// Task templates for different use cases
const TASK_TEMPLATES = [
  {
    id: 'bug-fix',
    name: 'Bug Fix',
    icon: Code,
    color: '#ef4444',
    category: 'Development',
    template: {
      title: '🐛 Fix: [Brief description]',
      description: `## Problem
Describe the bug and its impact

## Steps to Reproduce
1. 
2. 
3. 

## Expected Behavior

## Actual Behavior

## Solution
- [ ] Investigate root cause
- [ ] Implement fix
- [ ] Test solution
- [ ] Update documentation`,
      priority: 'High',
      tags: ['bug', 'fix']
    }
  },
  {
    id: 'feature',
    name: 'New Feature',
    icon: Star,
    color: '#3b82f6',
    category: 'Development',
    template: {
      title: '✨ Feature: [Feature name]',
      description: `## Overview
Brief description of the feature

## Requirements
- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

## Acceptance Criteria
- [ ] Criteria 1
- [ ] Criteria 2

## Implementation Notes
- Design considerations
- Technical approach
- Dependencies`,
      priority: 'Medium',
      tags: ['feature', 'development']
    }
  },
  {
    id: 'design-task',
    name: 'Design Task',
    icon: PaintBucket,
    color: '#8b5cf6',
    category: 'Design',
    template: {
      title: '🎨 Design: [Component/Feature name]',
      description: `## Design Brief
What needs to be designed and why

## Requirements
- Target audience:
- Use cases:
- Constraints:

## Deliverables
- [ ] Wireframes
- [ ] Visual designs
- [ ] Prototype
- [ ] Design system updates

## Research & References
- User research findings
- Competitor analysis
- Design inspiration`,
      priority: 'Medium',
      tags: ['design', 'ui', 'ux']
    }
  },
  {
    id: 'content',
    name: 'Content Creation',
    icon: FileText,
    color: '#059669',
    category: 'Content',
    template: {
      title: '📝 Content: [Title]',
      description: `## Content Brief
Purpose and goals of this content

## Target Audience

## Key Messages
- Message 1
- Message 2
- Message 3

## Deliverables
- [ ] Research and outline
- [ ] First draft
- [ ] Review and feedback
- [ ] Final version
- [ ] Publish/distribute

## SEO Keywords
- Keyword 1
- Keyword 2`,
      priority: 'Medium',
      tags: ['content', 'writing', 'marketing']
    }
  },
  {
    id: 'meeting',
    name: 'Meeting/Event',
    icon: Calendar,
    color: '#f59e0b',
    category: 'Planning',
    template: {
      title: '📅 Meeting: [Meeting topic]',
      description: `## Objective
What we want to achieve in this meeting

## Agenda
1. Welcome and introductions (5 min)
2. Topic 1 (15 min)
3. Topic 2 (20 min)
4. Action items and next steps (10 min)

## Attendees
- [ ] Person 1
- [ ] Person 2
- [ ] Person 3

## Preparation
- [ ] Send calendar invite
- [ ] Prepare materials
- [ ] Book meeting room/setup video call

## Follow-up
- [ ] Send meeting notes
- [ ] Track action items`,
      priority: 'Medium',
      tags: ['meeting', 'planning', 'collaboration']
    }
  },
  {
    id: 'research',
    name: 'Research Task',
    icon: Target,
    color: '#06b6d4',
    category: 'Research',
    template: {
      title: '🔍 Research: [Topic]',
      description: `## Research Question
What specific question are we trying to answer?

## Methodology
How will we conduct this research?

## Scope
- Time frame:
- Resources needed:
- Target participants:

## Deliverables
- [ ] Research plan
- [ ] Data collection
- [ ] Analysis
- [ ] Report/presentation

## Success Metrics
How will we measure success?`,
      priority: 'Medium',
      tags: ['research', 'analysis', 'data']
    }
  }
];

// Priority configurations
const PRIORITIES = [
  { value: 'Low', label: 'Low Priority', color: '#6b7280', icon: '●' },
  { value: 'Medium', label: 'Medium Priority', color: '#f59e0b', icon: '●' },
  { value: 'High', label: 'High Priority', color: '#ef4444', icon: '●' },
  { value: 'Urgent', label: 'Urgent', color: '#dc2626', icon: '🔥' }
];

// Enhanced Task Creation Modal
export const TaskCreationModal = ({ 
  isOpen, 
  onClose, 
  onCreateTask,
  teamMembers = [],
  defaultTemplate = null
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState(defaultTemplate);
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    assigneeId: '',
    dueDate: '',
    tags: []
  });
  const [showTemplates, setShowTemplates] = useState(!defaultTemplate);
  const { isMobile } = useResponsive();

  useEffect(() => {
    if (selectedTemplate) {
      setTaskData(prev => ({
        ...prev,
        ...selectedTemplate.template,
        tags: selectedTemplate.template.tags || []
      }));
      setShowTemplates(false);
    }
  }, [selectedTemplate]);

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
  };

  const handleCreateTask = () => {
    if (!taskData.title.trim()) return;
    
    onCreateTask({
      ...taskData,
      templateId: selectedTemplate?.id,
      templateCategory: selectedTemplate?.category
    });
    
    // Reset form
    setTaskData({
      title: '',
      description: '',
      priority: 'Medium',
      assigneeId: '',
      dueDate: '',
      tags: []
    });
    setSelectedTemplate(null);
    setShowTemplates(true);
    onClose();
  };

  const TemplateSelector = () => (
    <div>
      <h3 style={{
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '16px',
        color: '#111827'
      }}>
        Choose a Template
      </h3>
      
      <ResponsiveGrid 
        columns={{ sm: 1, md: 2, lg: 3 }} 
        gap="12px"
      >
        {TASK_TEMPLATES.map(template => (
          <ResponsiveCard
            key={template.id}
            hover={true}
            style={{
              cursor: 'pointer',
              border: selectedTemplate?.id === template.id ? `2px solid ${template.color}` : '1px solid #e5e7eb',
              transition: 'all 0.2s ease'
            }}
            onClick={() => handleTemplateSelect(template)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: `${template.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <template.icon style={{ width: '20px', height: '20px', color: template.color }} />
              </div>
              <div>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  margin: 0,
                  color: '#111827'
                }}>
                  {template.name}
                </h4>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  {template.category}
                </p>
              </div>
            </div>
          </ResponsiveCard>
        ))}
      </ResponsiveGrid>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        marginTop: '24px' 
      }}>
        <AccessibleButton
          variant="secondary"
          onClick={() => {
            setSelectedTemplate({ 
              id: 'blank', 
              name: 'Blank Task',
              template: { title: '', description: '', priority: 'Medium', tags: [] }
            });
          }}
        >
          Start Blank
        </AccessibleButton>
        
        {selectedTemplate && (
          <AccessibleButton
            onClick={() => setShowTemplates(false)}
            icon={<ArrowRight style={{ width: '16px', height: '16px' }} />}
          >
            Continue
          </AccessibleButton>
        )}
      </div>
    </div>
  );

  const TaskForm = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {selectedTemplate && selectedTemplate.id !== 'blank' && (
        <div style={{
          padding: '12px',
          backgroundColor: `${selectedTemplate.color}10`,
          border: `1px solid ${selectedTemplate.color}30`,
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <selectedTemplate.icon style={{ 
            width: '16px', 
            height: '16px', 
            color: selectedTemplate.color 
          }} />
          <span style={{ fontSize: '14px', fontWeight: '500' }}>
            Using {selectedTemplate.name} template
          </span>
          <AccessibleButton
            variant="ghost"
            size="sm"
            onClick={() => setShowTemplates(true)}
          >
            Change
          </AccessibleButton>
        </div>
      )}

      <AccessibleInput
        label="Task Title"
        value={taskData.title}
        onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
        placeholder="Enter task title..."
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
          Description
        </label>
        <textarea
          value={taskData.description}
          onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
          placeholder="Task description and details..."
          rows={6}
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '14px',
            outline: 'none',
            fontFamily: 'inherit',
            resize: 'vertical'
          }}
        />
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
        gap: '16px' 
      }}>
        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '6px'
          }}>
            Priority
          </label>
          <select
            value={taskData.priority}
            onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '2px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none'
            }}
          >
            {PRIORITIES.map(priority => (
              <option key={priority.value} value={priority.value}>
                {priority.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '6px'
          }}>
            Assignee
          </label>
          <select
            value={taskData.assigneeId}
            onChange={(e) => setTaskData({ ...taskData, assigneeId: e.target.value })}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '2px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none'
            }}
          >
            <option value="">Unassigned</option>
            {teamMembers.map(member => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <AccessibleInput
        label="Due Date (Optional)"
        type="date"
        value={taskData.dueDate}
        onChange={(e) => setTaskData({ ...taskData, dueDate: e.target.value })}
      />

      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        justifyContent: 'flex-end',
        marginTop: '8px'
      }}>
        <AccessibleButton
          variant="secondary"
          onClick={onClose}
        >
          Cancel
        </AccessibleButton>
        <AccessibleButton
          onClick={handleCreateTask}
          disabled={!taskData.title.trim()}
          icon={<Plus style={{ width: '16px', height: '16px' }} />}
        >
          Create Task
        </AccessibleButton>
      </div>
    </div>
  );

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title={showTemplates ? "Create New Task" : "Task Details"}
      size="lg"
    >
      {showTemplates ? <TemplateSelector /> : <TaskForm />}
    </AccessibleModal>
  );
};

// Bulk Operations Component
export const BulkOperations = ({ 
  selectedTasks, 
  onBulkUpdate, 
  onBulkDelete,
  onClearSelection,
  teamMembers = []
}) => {
  const [showBulkMenu, setShowBulkMenu] = useState(false);
  const { isMobile } = useResponsive();

  if (selectedTasks.length === 0) return null;

  const handleBulkStatusChange = (newStatus) => {
    onBulkUpdate(selectedTasks.map(task => ({ ...task, status: newStatus })));
    setShowBulkMenu(false);
  };

  const handleBulkPriorityChange = (newPriority) => {
    onBulkUpdate(selectedTasks.map(task => ({ ...task, priority: newPriority })));
    setShowBulkMenu(false);
  };

  const handleBulkAssignment = (assigneeId) => {
    onBulkUpdate(selectedTasks.map(task => ({ ...task, assigneeId })));
    setShowBulkMenu(false);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      zIndex: 1000,
      maxWidth: isMobile ? '90vw' : 'auto'
    }}>
      <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
        {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''} selected
      </span>

      <div style={{ display: 'flex', gap: '8px' }}>
        <AccessibleDropdown
          trigger={
            <AccessibleButton
              variant="secondary"
              size="sm"
              icon={<Edit3 style={{ width: '14px', height: '14px' }} />}
            >
              {isMobile ? '' : 'Actions'}
            </AccessibleButton>
          }
          isOpen={showBulkMenu}
          onToggle={() => setShowBulkMenu(!showBulkMenu)}
          onClose={() => setShowBulkMenu(false)}
        >
          <div style={{ padding: '8px 0', minWidth: '200px' }}>
            {/* Status Changes */}
            <div style={{ padding: '8px 16px', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
              Change Status
            </div>
            {['pending', 'in-progress', 'completed'].map(status => (
              <button
                key={status}
                onClick={() => handleBulkStatusChange(status)}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  textAlign: 'left',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textTransform: 'capitalize'
                }}
              >
                {status.replace('-', ' ')}
              </button>
            ))}

            <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '8px 0' }} />

            {/* Priority Changes */}
            <div style={{ padding: '8px 16px', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
              Change Priority
            </div>
            {PRIORITIES.map(priority => (
              <button
                key={priority.value}
                onClick={() => handleBulkPriorityChange(priority.value)}
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
              >
                <span style={{ color: priority.color }}>{priority.icon}</span>
                {priority.label}
              </button>
            ))}

            <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '8px 0' }} />

            {/* Assignment */}
            <div style={{ padding: '8px 16px', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
              Assign To
            </div>
            <button
              onClick={() => handleBulkAssignment('')}
              style={{
                width: '100%',
                padding: '8px 16px',
                textAlign: 'left',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Unassigned
            </button>
            {teamMembers.map(member => (
              <button
                key={member.id}
                onClick={() => handleBulkAssignment(member.id)}
                style={{
                  width: '100%',
                  padding: '8px 16px',
                  textAlign: 'left',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {member.name}
              </button>
            ))}

            <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '8px 0' }} />

            <button
              onClick={() => {
                if (window.confirm(`Delete ${selectedTasks.length} selected tasks?`)) {
                  onBulkDelete(selectedTasks);
                }
                setShowBulkMenu(false);
              }}
              style={{
                width: '100%',
                padding: '8px 16px',
                textAlign: 'left',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Trash2 style={{ width: '14px', height: '14px' }} />
              Delete Selected
            </button>
          </div>
        </AccessibleDropdown>

        <AccessibleButton
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          icon={<X style={{ width: '14px', height: '14px' }} />}
        >
          {isMobile ? '' : 'Clear'}
        </AccessibleButton>
      </div>
    </div>
  );
};

// Quick Action Buttons
export const QuickActions = ({ onQuickCreate }) => {
  const { isMobile } = useResponsive();
  
  const quickTemplates = TASK_TEMPLATES.slice(0, isMobile ? 3 : 6);

  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{
        fontSize: '16px',
        fontWeight: '600',
        marginBottom: '12px',
        color: '#111827'
      }}>
        Quick Create
      </h3>
      
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '8px'
      }}>
        {quickTemplates.map(template => (
          <button
            key={template.id}
            onClick={() => onQuickCreate(template)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: `${template.color}10`,
              border: `1px solid ${template.color}30`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              color: template.color,
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = `${template.color}20`;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = `${template.color}10`;
            }}
          >
            <template.icon style={{ width: '16px', height: '16px' }} />
            {isMobile ? '' : template.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default {
  TaskCreationModal,
  BulkOperations,
  QuickActions,
  TASK_TEMPLATES,
  PRIORITIES
};