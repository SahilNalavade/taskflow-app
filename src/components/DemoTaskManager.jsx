import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Clock, AlertTriangle, Edit3, Trash2, X, Save, Sparkles, ArrowRight, User } from 'lucide-react';
import { demoTaskService, demoData } from '../services/demoData';

const DemoTaskManager = ({ onSignUp }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [showSignUpPrompt, setShowSignUpPrompt] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const demoTasks = await demoTaskService.getAllTasks();
      setTasks(demoTasks);
    } catch (error) {
      console.error('Error loading demo tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!newTask.trim()) return;

    try {
      setLoading(true);
      const task = await demoTaskService.addTask(newTask);
      setTasks(prev => [...prev, task]);
      setNewTask('');
      
      // Show sign-up prompt after user adds a few tasks
      if (tasks.length >= 2) {
        setTimeout(() => setShowSignUpPrompt(true), 1000);
      }
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (taskId, newTaskText, newStatus) => {
    try {
      setLoading(true);
      await demoTaskService.updateTask(taskId, newTaskText, newStatus);
      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { ...t, task: newTaskText, status: newStatus }
          : t
      ));
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      setLoading(true);
      await demoTaskService.deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'complete':
      case 'done':
        return <CheckCircle2 style={{ width: '16px', height: '16px', color: '#10b981' }} />;
      case 'in progress':
        return <Clock style={{ width: '16px', height: '16px', color: '#f59e0b' }} />;
      case 'blocked':
        return <AlertTriangle style={{ width: '16px', height: '16px', color: '#ef4444' }} />;
      default:
        return <Clock style={{ width: '16px', height: '16px', color: '#6b7280' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'complete':
      case 'done':
        return '#10b981';
      case 'in progress':
        return '#f59e0b';
      case 'blocked':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <>
      {/* Sign-up prompt modal */}
      {showSignUpPrompt && (
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
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <Sparkles style={{
              width: '48px',
              height: '48px',
              color: '#3b82f6',
              margin: '0 auto 16px'
            }} />
            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '12px'
            }}>
              Love what you see?
            </h3>
            <p style={{
              color: '#6b7280',
              marginBottom: '24px',
              lineHeight: '1.5'
            }}>
              Sign up now to save your tasks, connect your Google Sheets, and unlock team collaboration features!
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={onSignUp}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <User style={{ width: '16px', height: '16px' }} />
                Sign Up Now
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </button>
              <button
                onClick={() => setShowSignUpPrompt(false)}
                style={{
                  padding: '12px 16px',
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Continue Demo
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        padding: '24px'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#111827',
                marginBottom: '4px'
              }}>
                TaskFlow Demo
              </h1>
              <p style={{ color: '#6b7280', fontSize: '16px' }}>
                Try adding, editing, and managing tasks below
              </p>
            </div>
            <button
              onClick={onSignUp}
              style={{
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <User style={{ width: '16px', height: '16px' }} />
              Sign Up
            </button>
          </div>
        </div>

        {/* Add Task */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
            Add New Task
          </h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="What needs to be done?"
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px'
              }}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
            />
            <button
              onClick={addTask}
              disabled={loading || !newTask.trim()}
              style={{
                padding: '12px 20px',
                backgroundColor: loading ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Plus style={{ width: '16px', height: '16px' }} />
              Add Task
            </button>
          </div>
        </div>

        {/* Tasks List */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: '#f8fafc',
            borderRadius: '12px 12px 0 0'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>
              My Tasks ({tasks.length})
            </h3>
          </div>

          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {tasks.map((task, index) => (
              <div
                key={task.id}
                style={{
                  padding: '16px 24px',
                  borderBottom: index !== tasks.length - 1 ? '1px solid #f1f5f9' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  backgroundColor: 'white',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
              >
                {getStatusIcon(task.status)}
                
                {editingTask === task.id ? (
                  <div style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      defaultValue={task.task}
                      ref={(input) => input && input.focus()}
                      style={{
                        flex: 1,
                        padding: '6px 8px',
                        border: '1px solid #3b82f6',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          updateTask(task.id, e.target.value, task.status);
                        }
                        if (e.key === 'Escape') {
                          setEditingTask(null);
                        }
                      }}
                    />
                    <select
                      defaultValue={task.status}
                      onChange={(e) => updateTask(task.id, task.task, e.target.value)}
                      style={{
                        padding: '6px 8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Complete">Complete</option>
                      <option value="Blocked">Blocked</option>
                    </select>
                    <button
                      onClick={() => setEditingTask(null)}
                      style={{
                        padding: '4px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6b7280'
                      }}
                    >
                      <X style={{ width: '16px', height: '16px' }} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ flex: 1 }}>
                      <p style={{
                        margin: 0,
                        fontSize: '16px',
                        color: '#111827',
                        textDecoration: task.status?.toLowerCase() === 'complete' ? 'line-through' : 'none',
                        opacity: task.status?.toLowerCase() === 'complete' ? 0.7 : 1
                      }}>
                        {task.task}
                      </p>
                    </div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: getStatusColor(task.status),
                      backgroundColor: `${getStatusColor(task.status)}20`,
                      padding: '4px 8px',
                      borderRadius: '12px'
                    }}>
                      {task.status}
                    </span>
                    <button
                      onClick={() => setEditingTask(task.id)}
                      style={{
                        padding: '4px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6b7280'
                      }}
                    >
                      <Edit3 style={{ width: '16px', height: '16px' }} />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      style={{
                        padding: '4px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#ef4444'
                      }}
                    >
                      <Trash2 style={{ width: '16px', height: '16px' }} />
                    </button>
                  </>
                )}
              </div>
            ))}

            {tasks.length === 0 && !loading && (
              <div style={{
                padding: '48px 24px',
                textAlign: 'center',
                color: '#6b7280'
              }}>
                <Sparkles style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#d1d5db' }} />
                <p style={{ margin: 0, fontSize: '16px' }}>No tasks yet</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>Add your first task above to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DemoTaskManager;