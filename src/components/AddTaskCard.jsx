import { useState } from 'react';
import { Plus, Save, X } from 'lucide-react';

const AddTaskCard = ({ onAdd, delay = 0 }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [taskText, setTaskText] = useState('');
  const [status, setStatus] = useState('Pending');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!taskText.trim()) return;
    
    setLoading(true);
    try {
      await onAdd(taskText.trim(), status);
      setTaskText('');
      setStatus('Pending');
      setIsAdding(false);
    } catch (error) {
      console.error('Failed to add task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setTaskText('');
    setStatus('Pending');
    setIsAdding(false);
  };

  const statusOptions = ['Pending', 'In Progress', 'Complete', 'Blocked'];

  if (!isAdding) {
    return (
      <div 
        style={{
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          backdropFilter: 'blur(8px)',
          borderRadius: '16px',
          padding: '1.5rem',
          border: '2px dashed rgba(59, 130, 246, 0.3)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          animation: `slideUpFade 0.6s ease-out ${delay}s both`,
          minHeight: '200px'
        }}
        onClick={() => setIsAdding(true)}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
          e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.08)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
          e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          borderRadius: '50%',
          padding: '1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Plus size={24} style={{ color: 'white' }} />
        </div>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: '#1e293b',
          marginBottom: '0.5rem'
        }}>
          Add New Task
        </h3>
        <p style={{
          color: '#64748b',
          fontSize: '0.875rem',
          margin: 0
        }}>
          Click to create a new task
        </p>
      </div>
    );
  }

  return (
    <div 
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(8px)',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
        border: '2px solid rgba(59, 130, 246, 0.3)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        animation: `slideUpFade 0.6s ease-out ${delay}s both`,
        opacity: loading ? 0.6 : 1
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h3 style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: '#1e293b',
          margin: 0
        }}>
          New Task
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleSave}
            disabled={loading || !taskText.trim()}
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem',
              cursor: (loading || !taskText.trim()) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: (loading || !taskText.trim()) ? 0.5 : 1
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
        </div>
      </div>

      {/* Status */}
      <div style={{ marginBottom: '1rem' }}>
        <label style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '0.5rem'
        }}>
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '0.875rem',
            fontWeight: '600',
            backgroundColor: 'white',
            cursor: 'pointer',
            boxSizing: 'border-box'
          }}
        >
          {statusOptions.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      {/* Task Content */}
      <div style={{ flex: 1, marginBottom: '1rem' }}>
        <label style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '0.5rem'
        }}>
          Task Description
        </label>
        <textarea
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          placeholder="Enter task description..."
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
          autoFocus
        />
      </div>

      {/* Footer */}
      <div style={{
        paddingTop: '1rem',
        borderTop: '1px solid #e2e8f0',
        textAlign: 'center'
      }}>
        <p style={{
          fontSize: '0.75rem',
          color: '#94a3b8',
          margin: 0
        }}>
          {loading ? 'Adding task...' : 'Fill in the details and save'}
        </p>
      </div>
    </div>
  );
};

export default AddTaskCard;