import { useState } from 'react';
import { CheckCircle2, Clock, AlertTriangle, XCircle, Edit2, Save, X, Trash2 } from 'lucide-react';

const EditableTaskCard = ({ task, delay, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    task: task.task || '',
    status: task.status || 'Pending'
  });
  const [loading, setLoading] = useState(false);

  const getStatusConfig = (status) => {
    const normalizedStatus = status?.toLowerCase();
    if (normalizedStatus === 'complete' || normalizedStatus === 'done') {
      return {
        color: '#10b981',
        bgGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        lightBg: 'rgba(16, 185, 129, 0.1)',
        icon: CheckCircle2,
        label: 'Complete'
      };
    }
    
    const configs = {
      'In Progress': {
        color: '#3b82f6',
        bgGradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        lightBg: 'rgba(59, 130, 246, 0.1)',
        icon: Clock,
        label: 'In Progress'
      },
      'Pending': {
        color: '#f59e0b',
        bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        lightBg: 'rgba(245, 158, 11, 0.1)',
        icon: AlertTriangle,
        label: 'Pending'
      },
      'Blocked': {
        color: '#ef4444',
        bgGradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        lightBg: 'rgba(239, 68, 68, 0.1)',
        icon: XCircle,
        label: 'Blocked'
      }
    };
    
    return configs[status] || configs['Pending'];
  };

  const config = getStatusConfig(isEditing ? editData.status : task.status);
  const Icon = config.icon;

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdate(task.id, editData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update task:', error);
      // You could add error handling here
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      task: task.task || '',
      status: task.status || 'Pending'
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setLoading(true);
      try {
        await onDelete(task.id);
      } catch (error) {
        console.error('Failed to delete task:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const statusOptions = ['Pending', 'In Progress', 'Complete', 'Blocked'];

  return (
    <div 
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(8px)',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
        border: '1px solid rgba(226, 232, 240, 0.3)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: isEditing ? 'default' : 'pointer',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        animation: `slideUpFade 0.6s ease-out ${delay}s both`,
        opacity: loading ? 0.6 : 1
      }}
      onMouseEnter={(e) => {
        if (!isEditing) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.08)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isEditing) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.04)';
        }
      }}
    >
      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '0.5rem',
        marginBottom: '1rem'
      }}>
        {!isEditing ? (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Edit2 size={14} style={{ color: '#3b82f6' }} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete();
              }}
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Trash2 size={14} style={{ color: '#ef4444' }} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleSave}
              disabled={loading}
              style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Save size={14} style={{ color: '#10b981' }} />
            </button>
            <button
              onClick={handleCancel}
              style={{
                background: 'rgba(107, 114, 128, 0.1)',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={14} style={{ color: '#6b7280' }} />
            </button>
          </>
        )}
      </div>

      {/* Status Badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem'
      }}>
        {isEditing ? (
          <select
            value={editData.status}
            onChange={(e) => setEditData({ ...editData, status: e.target.value })}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid #d1d5db',
              fontSize: '0.875rem',
              fontWeight: '600',
              backgroundColor: 'white',
              cursor: 'pointer'
            }}
          >
            {statusOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        ) : (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 0.75rem',
            backgroundColor: config.lightBg,
            borderRadius: '8px',
            border: `1px solid ${config.color}20`
          }}>
            <Icon size={18} style={{ color: config.color }} />
            <span style={{ 
              fontSize: '0.875rem', 
              fontWeight: '600',
              color: config.color
            }}>
              {config.label}
            </span>
          </div>
        )}
        
        <span style={{ 
          fontSize: '0.75rem', 
          fontWeight: '600',
          color: '#94a3b8',
          backgroundColor: '#f1f5f9',
          padding: '0.5rem 0.75rem',
          borderRadius: '8px'
        }}>
          #{task.id}
        </span>
      </div>
      
      {/* Task Content */}
      <div style={{ flex: 1 }}>
        {isEditing ? (
          <textarea
            value={editData.task}
            onChange={(e) => setEditData({ ...editData, task: e.target.value })}
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '500',
              resize: 'vertical',
              fontFamily: 'inherit',
              boxSizing: 'border-box'
            }}
            placeholder="Enter task description..."
          />
        ) : (
          <p style={{ 
            color: '#1e293b', 
            fontWeight: '600', 
            lineHeight: '1.6',
            fontSize: '1.125rem',
            marginBottom: '1rem'
          }}>
            {task.task}
          </p>
        )}
      </div>
      
      {/* Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '1rem',
        borderTop: '1px solid #e2e8f0'
      }}>
        <span style={{ 
          fontSize: '0.875rem', 
          color: '#64748b',
          fontWeight: '500'
        }}>
          Row {task.rowIndex}
        </span>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: config.bgGradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          <Icon size={16} />
        </div>
      </div>
    </div>
  );
};

export default EditableTaskCard;