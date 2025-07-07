import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, FileSpreadsheet, RefreshCw, ExternalLink, CheckCircle2, Clock, AlertTriangle, User, Save, X, Search } from 'lucide-react';
import { multiSheetService } from '../services/multiSheetService';
import { teamService } from '../services/teamService';
import { autoSetupService } from '../services/autoSetup';
import SheetBrowser from './SheetBrowser';

const PersonalTasksManager = ({ user, currentTeam, onTasksUpdate }) => {
  const [personalTasks, setPersonalTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSheetSetup, setShowSheetSetup] = useState(false);
  const [showSheetBrowser, setShowSheetBrowser] = useState(false);
  const [personalSheet, setPersonalSheet] = useState(null);

  // Debug logging
  console.log('PersonalTasksManager - Component state:', {
    showSheetBrowser,
    showSheetSetup,
    personalSheet: personalSheet ? 'exists' : 'null',
    user: user ? 'exists' : 'null',
    currentTeam: currentTeam ? 'exists' : 'null'
  });
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({ task: '', status: 'Pending' });
  const [sheetConfig, setSheetConfig] = useState({
    sheetUrl: '',
    sheetName: ''
  });

  useEffect(() => {
    loadPersonalSheet();
  }, [user, currentTeam]);

  useEffect(() => {
    if (personalSheet) {
      loadPersonalTasks();
    }
  }, [personalSheet]);

  const loadPersonalSheet = () => {
    if (!user || !currentTeam) return;

    // Check if user has a personal sheet configured for this team
    const teamMember = teamService.getTeamMembers(currentTeam.id).find(m => m.userId === user.id);
    if (teamMember && teamMember.personalSheetId) {
      const userSheets = multiSheetService.getUserSheets(user.id);
      const sheet = userSheets.find(s => s.id === teamMember.personalSheetId);
      if (sheet) {
        setPersonalSheet(sheet);
      }
    }
  };

  const loadPersonalTasks = async () => {
    if (!personalSheet) return;

    try {
      setLoading(true);
      setError(null);
      const sheetService = multiSheetService.getSheetService(personalSheet);
      const tasks = await sheetService.getAllTasks();
      setPersonalTasks(tasks);
      
      // Notify parent component about tasks update
      if (onTasksUpdate) {
        onTasksUpdate(tasks);
      }
    } catch (err) {
      setError('Failed to load personal tasks');
      console.error('Error loading personal tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const extractSheetId = (url) => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  const handleSheetSelection = async (selectedSheet) => {
    try {
      setLoading(true);
      setError(null);
      
      const newSheetConfig = {
        id: selectedSheet.id,
        name: selectedSheet.name,
        url: selectedSheet.url,
        isPersonal: true,
        teamId: currentTeam?.id
      };

      // Test connection
      const sheetService = multiSheetService.getSheetService(newSheetConfig);
      const testResult = await sheetService.testConnection();
      
      if (!testResult.success) {
        throw new Error(testResult.error);
      }

      // Save sheet connection
      await multiSheetService.addSheetConnection(user.id, newSheetConfig);
      
      // Update team member with personal sheet ID if in team mode
      if (currentTeam) {
        const members = teamService.getAllMembers();
        const memberIndex = members.findIndex(m => m.userId === user.id && m.teamId === currentTeam.id);
        if (memberIndex >= 0) {
          members[memberIndex].personalSheetId = selectedSheet.id;
          localStorage.setItem('team_members', JSON.stringify(members));
        }
      }

      setPersonalSheet(newSheetConfig);
      setShowSheetBrowser(false);
      await loadPersonalTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setupPersonalSheet = async () => {
    const sheetId = extractSheetId(sheetConfig.sheetUrl);
    if (!sheetId) {
      setError('Invalid Google Sheets URL');
      return;
    }

    try {
      setLoading(true);
      const newSheetConfig = {
        id: sheetId,
        name: sheetConfig.sheetName || `${user.name || user.email}'s Tasks`,
        url: sheetConfig.sheetUrl,
        isPersonal: true,
        teamId: currentTeam?.id
      };

      // Test connection
      const sheetService = multiSheetService.getSheetService(newSheetConfig);
      const testResult = await sheetService.testConnection();
      
      if (!testResult.success) {
        throw new Error(testResult.error);
      }

      // Save sheet connection
      await multiSheetService.addSheetConnection(user.id, newSheetConfig);
      
      // Update team member with personal sheet ID if in team mode
      if (currentTeam) {
        const members = teamService.getAllMembers();
        const memberIndex = members.findIndex(m => m.userId === user.id && m.teamId === currentTeam.id);
        if (memberIndex >= 0) {
          members[memberIndex].personalSheetId = sheetId;
          localStorage.setItem('team_members', JSON.stringify(members));
        }
      }

      setPersonalSheet(newSheetConfig);
      setShowSheetSetup(false);
      setSheetConfig({ sheetUrl: '', sheetName: '' });
      await loadPersonalTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (!personalSheet || !newTask.task.trim()) return;

    try {
      setLoading(true);
      const sheetService = multiSheetService.getSheetService(personalSheet);
      await sheetService.addTask(newTask.task, newTask.status);
      setNewTask({ task: '', status: 'Pending' });
      await loadPersonalTasks();
    } catch (err) {
      setError('Failed to add task');
      console.error('Error adding task:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (task, newTaskText, newStatus) => {
    if (!personalSheet) return;

    try {
      setLoading(true);
      const sheetService = multiSheetService.getSheetService(personalSheet);
      await sheetService.updateTask(task.rowIndex, newTaskText, newStatus);
      setEditingTask(null);
      await loadPersonalTasks();
    } catch (err) {
      setError('Failed to update task');
      console.error('Error updating task:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (task) => {
    if (!personalSheet || !confirm('Delete this task?')) return;

    try {
      setLoading(true);
      const sheetService = multiSheetService.getSheetService(personalSheet);
      await sheetService.deleteTask(task.rowIndex);
      await loadPersonalTasks();
    } catch (err) {
      setError('Failed to delete task');
      console.error('Error deleting task:', err);
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

  if (!personalSheet) {
    return (
      <>
        {/* Sheet Browser Modal */}
        {showSheetBrowser ? (
          <>
            {console.log('Rendering SheetBrowser modal - showSheetBrowser is true')}
            <SheetBrowser
              onSheetSelect={handleSheetSelection}
              onClose={() => {
                console.log('Closing SheetBrowser modal');
                setShowSheetBrowser(false);
              }}
            />
          </>
        ) : (
          <>
            {console.log('NOT rendering SheetBrowser modal - showSheetBrowser is false')}
          </>
        )}
        
        <div style={{ padding: '24px' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            padding: '32px',
            textAlign: 'center'
          }}>
          <FileSpreadsheet style={{ width: '48px', height: '48px', color: '#6b7280', margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
            Connect Your Personal Google Sheet
          </h3>
          <p style={{ color: '#6b7280', marginBottom: '24px' }}>
            Connect your personal Google Sheet to manage your tasks and sync them with team standups. 
            Make sure you're signed in with Google OAuth for full access.
          </p>
          
          {!showSheetSetup ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
              <button
                onClick={() => setShowSheetBrowser(true)}
                style={{
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
                  gap: '8px'
                }}
              >
                <Search style={{ width: '20px', height: '20px' }} />
                Choose from My Sheets
              </button>
              
              <button
                onClick={async () => {
                  try {
                    setLoading(true);
                    setError(null);
                    console.log('Auto-setting up personal sheet...');
                    
                    const autoSheet = await autoSetupService.createPersonalSheet(user);
                    if (autoSheet) {
                      console.log('Auto-created sheet:', autoSheet);
                      
                      // Save the auto-created sheet
                      await multiSheetService.addSheetConnection(user.id, autoSheet);
                      
                      // Update team member with personal sheet ID if in team mode
                      if (currentTeam) {
                        const members = teamService.getAllMembers();
                        const memberIndex = members.findIndex(m => m.userId === user.id && m.teamId === currentTeam.id);
                        if (memberIndex >= 0) {
                          members[memberIndex].personalSheetId = autoSheet.id;
                          localStorage.setItem('team_members', JSON.stringify(members));
                        }
                      }
                      
                      setPersonalSheet(autoSheet);
                      await loadPersonalTasks();
                    } else {
                      setError('Unable to auto-create sheet. Please try manual setup.');
                    }
                  } catch (err) {
                    console.error('Auto-setup error:', err);
                    setError('Auto-setup failed. Please try manual setup.');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                style={{
                  padding: '12px 24px',
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
                <Plus style={{ width: '20px', height: '20px' }} />
                {loading ? 'Creating...' : 'Auto-Create Sheet'}
              </button>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                color: '#6b7280',
                fontSize: '14px'
              }}>
                <div style={{ height: '1px', backgroundColor: '#d1d5db', flex: 1 }} />
                <span>or</span>
                <div style={{ height: '1px', backgroundColor: '#d1d5db', flex: 1 }} />
              </div>
              
              <button
                onClick={() => setShowSheetSetup(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FileSpreadsheet style={{ width: '16px', height: '16px' }} />
                Enter Sheet URL Manually
              </button>
            </div>
          ) : (
            <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'left' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Google Sheet URL
                </label>
                <input
                  type="url"
                  value={sheetConfig.sheetUrl}
                  onChange={(e) => setSheetConfig({ ...sheetConfig, sheetUrl: e.target.value })}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                  Sheet Name (optional)
                </label>
                <input
                  type="text"
                  value={sheetConfig.sheetName}
                  onChange={(e) => setSheetConfig({ ...sheetConfig, sheetName: e.target.value })}
                  placeholder="My Personal Tasks"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              {error && (
                <div style={{
                  padding: '8px 12px',
                  backgroundColor: '#fef2f2',
                  color: '#dc2626',
                  borderRadius: '6px',
                  fontSize: '14px',
                  marginBottom: '16px'
                }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={setupPersonalSheet}
                  disabled={loading || !sheetConfig.sheetUrl}
                  style={{
                    flex: 1,
                    padding: '8px 16px',
                    backgroundColor: loading ? '#9ca3af' : '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Connecting...' : 'Connect'}
                </button>
                <button
                  onClick={() => {
                    setShowSheetSetup(false);
                    setError(null);
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      </>
    );
  }

  console.log('PersonalTasksManager render - showSheetBrowser:', showSheetBrowser, 'personalSheet:', personalSheet);

  return (
    <>
      {/* Sheet Browser Modal */}
      {showSheetBrowser ? (
        <>
          {console.log('Rendering SheetBrowser modal - showSheetBrowser is true')}
          <SheetBrowser
            onSheetSelect={handleSheetSelection}
            onClose={() => {
              console.log('Closing SheetBrowser modal');
              setShowSheetBrowser(false);
            }}
          />
        </>
      ) : (
        <>
          {console.log('NOT rendering SheetBrowser modal - showSheetBrowser is false')}
        </>
      )}
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>
            My Personal Tasks
          </h2>
          <p style={{ color: '#6b7280', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileSpreadsheet style={{ width: '16px', height: '16px' }} />
            {personalSheet.name}
            <a 
              href={personalSheet.url} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ color: '#3b82f6', textDecoration: 'none' }}
            >
              <ExternalLink style={{ width: '14px', height: '14px' }} />
            </a>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={loadPersonalTasks}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <RefreshCw style={{ width: '16px', height: '16px' }} />
            Refresh
          </button>
          
          <button
            onClick={() => {
              console.log('Change Sheet button clicked');
              setPersonalSheet(null);
              setPersonalTasks([]);
              setError(null);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <FileSpreadsheet style={{ width: '16px', height: '16px' }} />
            Change Sheet
          </button>
        </div>
      </div>

      {/* Add New Task */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>Add New Task</h3>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'end' }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              value={newTask.task}
              onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
              placeholder="Enter task description..."
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
            />
          </div>
          <select
            value={newTask.status}
            onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Complete">Complete</option>
            <option value="Blocked">Blocked</option>
          </select>
          <button
            onClick={addTask}
            disabled={loading || !newTask.task.trim()}
            style={{
              padding: '8px 16px',
              backgroundColor: loading ? '#9ca3af' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            Add
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#fef2f2',
          color: '#dc2626',
          borderRadius: '8px',
          marginBottom: '24px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {/* Tasks List */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f8fafc'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
            My Tasks ({personalTasks.length})
          </h3>
        </div>

        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {personalTasks.map((task, index) => (
            <div
              key={task.id}
              style={{
                padding: '16px 20px',
                borderBottom: index !== personalTasks.length - 1 ? '1px solid #f1f5f9' : 'none',
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
                        updateTask(task, e.target.value, task.status);
                      }
                      if (e.key === 'Escape') {
                        setEditingTask(null);
                      }
                    }}
                  />
                  <select
                    defaultValue={task.status}
                    onChange={(e) => updateTask(task, task.task, e.target.value)}
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
                      fontSize: '14px',
                      color: '#111827',
                      textDecoration: task.status?.toLowerCase() === 'complete' || task.status?.toLowerCase() === 'done' ? 'line-through' : 'none',
                      opacity: task.status?.toLowerCase() === 'complete' || task.status?.toLowerCase() === 'done' ? 0.7 : 1
                    }}>
                      {task.task}
                    </p>
                  </div>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '500',
                    color: getStatusColor(task.status),
                    backgroundColor: `${getStatusColor(task.status)}20`,
                    padding: '2px 8px',
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
                    onClick={() => deleteTask(task)}
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

          {personalTasks.length === 0 && !loading && (
            <div style={{
              padding: '48px 20px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <User style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#d1d5db' }} />
              <p style={{ margin: 0, fontSize: '16px' }}>No tasks yet</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>Add your first task above</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default PersonalTasksManager;