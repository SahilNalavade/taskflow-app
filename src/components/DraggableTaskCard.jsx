import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { MessageCircle, Calendar } from 'lucide-react';
import PresenceIndicator from './PresenceIndicator';

const DraggableTaskCard = ({ 
  task, 
  onClick, 
  onTitleUpdate,
  getPriorityColor, 
  formatDate, 
  isOverdue 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title || task.task || '');

  // Drag setup
  const [{ isDragging }, drag] = useDrag({
    type: 'TASK',
    item: { 
      id: task.id, 
      status: task.status,
      task: task 
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleTitleDoubleClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditTitle(task.title || task.task || '');
  };

  const handleTitleSave = async (e) => {
    if (e.key === 'Enter' || e.type === 'blur') {
      setIsEditing(false);
      if (editTitle.trim() && editTitle !== (task.title || task.task) && onTitleUpdate) {
        try {
          await onTitleUpdate(task.id, { title: editTitle.trim() });
        } catch (error) {
          console.error('Failed to update title:', error);
          // Revert on error
          setEditTitle(task.title || task.task || '');
        }
      }
    }
    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditTitle(task.title || task.task || '');
    }
  };

  const cardStyle = {
    padding: '12px',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    marginBottom: '8px',
    cursor: isDragging ? 'grabbing' : 'grab',
    transition: 'all 0.2s',
    boxShadow: isDragging 
      ? '0 8px 25px 0 rgba(59, 130, 246, 0.3)' 
      : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    opacity: isDragging ? 0.8 : 1,
    transform: isDragging ? 'rotate(5deg)' : 'rotate(0deg)',
    borderColor: isDragging ? '#3b82f6' : '#e5e7eb'
  };

  return (
    <div
      ref={drag}
      style={cardStyle}
      onClick={() => !isEditing && onClick(task)}
      onMouseEnter={(e) => {
        if (!isDragging) {
          e.target.style.borderColor = '#3b82f6';
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = '0 4px 12px 0 rgba(59, 130, 246, 0.15)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragging) {
          e.target.style.borderColor = '#e5e7eb';
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
        }
      }}
    >
      {/* Task Title */}
      {isEditing ? (
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onKeyDown={handleTitleSave}
          onBlur={handleTitleSave}
          autoFocus
          style={{
            width: '100%',
            fontSize: '14px',
            fontWeight: '500',
            color: '#111827',
            border: '1px solid #3b82f6',
            borderRadius: '4px',
            padding: '4px 6px',
            marginBottom: '8px',
            backgroundColor: 'white'
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <h4 
          style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#111827',
            marginBottom: '8px',
            lineHeight: '1.3',
            cursor: 'text'
          }}
          onDoubleClick={handleTitleDoubleClick}
          title="Double-click to edit"
        >
          {task.title || task.task}
        </h4>
      )}

      {/* Task Metadata */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
      }}>
        <span style={{
          fontSize: '10px',
          fontWeight: '500',
          color: getPriorityColor(task.priority),
          backgroundColor: `${getPriorityColor(task.priority)}20`,
          padding: '2px 6px',
          borderRadius: '8px'
        }}>
          {task.priority}
        </span>
        {task.comments && task.comments.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#6b7280'
          }}>
            <MessageCircle style={{ width: '12px', height: '12px' }} />
            <span style={{ fontSize: '12px' }}>{task.comments.length}</span>
          </div>
        )}
      </div>

      {/* Assignee and Due Date */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          {task.assigneeId ? (
            <PresenceIndicator
              userId={task.assigneeId}
              size="sm"
              showDetails={false}
            />
          ) : (
            <div style={{
              width: '20px',
              height: '20px',
              backgroundColor: '#6b7280',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '8px',
              fontWeight: '600'
            }}>
              ?
            </div>
          )}
          <span style={{ fontSize: '12px', color: '#6b7280' }}>
            {task.assigneeName}
          </span>
        </div>

        {task.dueDate && (
          <span style={{
            fontSize: '10px',
            color: isOverdue(task.dueDate, task.status) ? '#ef4444' : '#6b7280',
            display: 'flex',
            alignItems: 'center',
            gap: '2px'
          }}>
            <Calendar style={{ width: '10px', height: '10px' }} />
            {formatDate(task.dueDate)}
          </span>
        )}
      </div>

      {/* Drag Indicator */}
      {isDragging && (
        <div style={{
          position: 'absolute',
          top: '4px',
          right: '4px',
          fontSize: '10px',
          color: '#3b82f6',
          fontWeight: '600'
        }}>
          ⋮⋮
        </div>
      )}
    </div>
  );
};

export default DraggableTaskCard;