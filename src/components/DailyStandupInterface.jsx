import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertTriangle, TrendingUp, Users, MessageSquare, CheckCircle2, XCircle, Loader2, RefreshCw, Filter, Search, BarChart3, Activity, FileSpreadsheet } from 'lucide-react';
import { teamService } from '../services/teamService';
import PersonalTasksManager from './PersonalTasksManager';

const DailyStandupInterface = ({ user, currentTeam }) => {
  const [standupEntries, setStandupEntries] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [userStandupToday, setUserStandupToday] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submittingStandup, setSubmittingStandup] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('today'); // 'today', 'form', 'analytics', 'tasks'
  const [personalTasks, setPersonalTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all'); // 'all', 'submitted', 'pending', 'blockers'

  // Form state for standup submission
  const [standupForm, setStandupForm] = useState({
    yesterday: '',
    today: '',
    blockers: '',
    mood: 'neutral',
    workload: 'normal'
  });

  useEffect(() => {
    if (currentTeam) {
      loadStandupData();
    }
  }, [currentTeam, selectedDate]);

  const loadStandupData = async () => {
    try {
      setLoading(true);
      
      // Load team members
      const members = teamService.getTeamMembers(currentTeam.id);
      setTeamMembers(members);
      
      // Load standup entries for selected date
      const entries = teamService.getStandupEntries(currentTeam.id, selectedDate);
      setStandupEntries(entries);
      
      // Check if current user has submitted standup today
      const userEntry = teamService.getUserStandupToday(currentTeam.id, user.id);
      setUserStandupToday(userEntry);
      
      if (userEntry) {
        setStandupForm({
          yesterday: userEntry.yesterday,
          today: userEntry.today,
          blockers: Array.isArray(userEntry.blockers) ? userEntry.blockers.join('\n') : userEntry.blockers,
          mood: userEntry.mood,
          workload: userEntry.workload
        });
      }
    } catch (error) {
      console.error('Error loading standup data:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitStandup = async () => {
    try {
      setSubmittingStandup(true);
      
      const standupData = {
        yesterday: standupForm.yesterday,
        today: standupForm.today,
        blockers: standupForm.blockers.split('\n').filter(b => b.trim()),
        mood: standupForm.mood,
        workload: standupForm.workload
      };
      
      await teamService.createStandupEntry(currentTeam.id, user.id, standupData);
      await loadStandupData();
      setViewMode('today');
    } catch (error) {
      console.error('Error submitting standup:', error);
    } finally {
      setSubmittingStandup(false);
    }
  };

  const handlePersonalTasksUpdate = (tasks) => {
    setPersonalTasks(tasks);
  };

  const populateFromTasks = () => {
    if (personalTasks.length === 0) return;

    const completedTasks = personalTasks.filter(task => 
      task.status?.toLowerCase() === 'complete' || task.status?.toLowerCase() === 'done'
    );
    const inProgressTasks = personalTasks.filter(task => 
      task.status?.toLowerCase() === 'in progress'
    );
    const blockedTasks = personalTasks.filter(task => 
      task.status?.toLowerCase() === 'blocked'
    );

    const yesterdayText = completedTasks.length > 0 
      ? `Completed: ${completedTasks.map(t => t.task).join(', ')}`
      : 'No tasks completed yesterday';

    const todayText = inProgressTasks.length > 0
      ? `Working on: ${inProgressTasks.map(t => t.task).join(', ')}`
      : 'Planning today\'s tasks';

    const blockersText = blockedTasks.length > 0
      ? blockedTasks.map(t => `${t.task} (blocked)`).join('\n')
      : '';

    setStandupForm({
      ...standupForm,
      yesterday: yesterdayText,
      today: todayText,
      blockers: blockersText
    });
  };

  const getFilteredEntries = () => {
    let filtered = standupEntries;
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(entry => {
        const member = teamMembers.find(m => m.userId === entry.userId);
        const memberName = member ? `${member.name || member.email || 'Unknown User'}` : 'Unknown User';
        return (
          memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.yesterday.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.today.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (entry.blockers && entry.blockers.some(b => b.toLowerCase().includes(searchTerm.toLowerCase())))
        );
      });
    }
    
    // Filter by status
    if (filterBy === 'blockers') {
      filtered = filtered.filter(entry => entry.blockers && entry.blockers.length > 0);
    }
    
    return filtered;
  };

  const getParticipationStats = () => {
    const totalMembers = teamMembers.length;
    const submittedEntries = standupEntries.length;
    const participationRate = totalMembers > 0 ? (submittedEntries / totalMembers) * 100 : 0;
    const pendingMembers = teamMembers.filter(member => 
      !standupEntries.some(entry => entry.userId === member.userId)
    );
    
    return {
      totalMembers,
      submittedEntries,
      participationRate,
      pendingMembers
    };
  };

  const getMoodEmoji = (mood) => {
    const moodEmojis = {
      sad: '😞',
      concerned: '😟',
      neutral: '😐',
      happy: '😊',
      excited: '🤩'
    };
    return moodEmojis[mood] || '😐';
  };

  const getWorkloadColor = (workload) => {
    const colors = {
      light: 'bg-green-100 text-green-800',
      normal: 'bg-blue-100 text-blue-800',
      heavy: 'bg-orange-100 text-orange-800',
      overwhelming: 'bg-red-100 text-red-800'
    };
    return colors[workload] || colors.normal;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <Loader2 style={{ width: '32px', height: '32px', animation: 'spin 1s linear infinite' }} />
        <span style={{ marginLeft: '12px', fontSize: '16px', color: '#6b7280' }}>Loading standup data...</span>
      </div>
    );
  }

  const stats = getParticipationStats();
  const filteredEntries = getFilteredEntries();
  const isManager = teamService.hasPermission(user.id, currentTeam.id, 'manage_team');

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
              Daily Standup - {currentTeam.name}
            </h1>
            <p style={{ color: '#6b7280', fontSize: '16px' }}>
              Team check-in for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
            <button
              onClick={loadStandupData}
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
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {[
            { key: 'today', label: 'Today', icon: MessageSquare },
            { key: 'form', label: 'Submit Standup', icon: CheckCircle2 },
            { key: 'tasks', label: 'My Tasks', icon: FileSpreadsheet },
            { key: 'analytics', label: 'Analytics', icon: BarChart3 }
          ].map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.key}
                onClick={() => setViewMode(mode.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: viewMode === mode.key ? '#3b82f6' : '#f3f4f6',
                  color: viewMode === mode.key ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <Icon style={{ width: '16px', height: '16px' }} />
                {mode.label}
              </button>
            );
          })}
        </div>

        {/* Participation Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px', 
          marginBottom: '24px' 
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '12px', 
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Users style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
              <div>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                  {stats.submittedEntries}/{stats.totalMembers}
                </p>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Submitted</p>
              </div>
            </div>
          </div>
          
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '12px', 
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Activity style={{ width: '24px', height: '24px', color: '#10b981' }} />
              <div>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                  {Math.round(stats.participationRate)}%
                </p>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Participation</p>
              </div>
            </div>
          </div>
          
          <div style={{ 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '12px', 
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertTriangle style={{ 
                width: '24px', 
                height: '24px', 
                color: filteredEntries.filter(e => e.blockers?.length > 0).length > 0 ? '#f59e0b' : '#6b7280' 
              }} />
              <div>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                  {filteredEntries.filter(e => e.blockers?.length > 0).length}
                </p>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Blockers</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'today' && (
        <div>
          {/* Filters */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  width: '16px', 
                  height: '16px', 
                  color: '#6b7280' 
                }} />
                <input
                  type="text"
                  placeholder="Search team members or updates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px 8px 40px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="all">All Updates</option>
              <option value="blockers">With Blockers</option>
            </select>
          </div>

          {/* Slack-style Chat Interface */}
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            maxHeight: '70vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Chat Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: '#f8fafc'
            }}>
              <h3 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#111827', 
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <MessageSquare style={{ width: '16px', height: '16px' }} />
                #{currentTeam.name.toLowerCase().replace(/\s+/g, '-')}-standup
              </h3>
            </div>

            {/* Chat Messages */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              padding: '0',
              minHeight: '400px'
            }}>
              {filteredEntries.map((entry, index) => {
                const member = teamMembers.find(m => m.userId === entry.userId);
                const memberName = member ? `${member.name || member.email || 'Unknown User'}` : 'Unknown User';
                const isCurrentUser = entry.userId === user.id;
                
                return (
                  <div
                    key={entry.id}
                    style={{
                      padding: '12px 20px',
                      borderBottom: index !== filteredEntries.length - 1 ? '1px solid #f1f5f9' : 'none',
                      backgroundColor: isCurrentUser ? '#f0f9ff' : 'transparent',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isCurrentUser) e.target.style.backgroundColor = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrentUser) e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    {/* Message Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        backgroundColor: isCurrentUser ? '#3b82f6' : '#6b7280',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '14px'
                      }}>
                        {memberName.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ 
                          fontSize: '15px', 
                          fontWeight: '600', 
                          color: isCurrentUser ? '#1e40af' : '#111827'
                        }}>
                          {memberName}
                        </span>
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>
                          {new Date(entry.createdAt).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </span>
                        <span style={{ fontSize: '16px' }}>{getMoodEmoji(entry.mood)}</span>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: '500',
                          backgroundColor: entry.workload === 'overwhelming' ? '#fef2f2' :
                                           entry.workload === 'heavy' ? '#fffbeb' :
                                           entry.workload === 'light' ? '#f0fdf4' : '#f0f9ff',
                          color: entry.workload === 'overwhelming' ? '#dc2626' :
                                 entry.workload === 'heavy' ? '#d97706' :
                                 entry.workload === 'light' ? '#16a34a' : '#2563eb'
                        }}>
                          {entry.workload}
                        </span>
                      </div>
                    </div>

                    {/* Message Content */}
                    <div style={{ marginLeft: '40px', fontSize: '14px', lineHeight: '1.5' }}>
                      <div style={{ marginBottom: '12px' }}>
                        <strong style={{ color: '#16a34a' }}>Yesterday:</strong>
                        <div style={{ color: '#374151', marginTop: '2px' }}>
                          {entry.yesterday || 'No updates provided'}
                        </div>
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <strong style={{ color: '#2563eb' }}>Today:</strong>
                        <div style={{ color: '#374151', marginTop: '2px' }}>
                          {entry.today || 'No plans provided'}
                        </div>
                      </div>

                      {entry.blockers && entry.blockers.length > 0 && (
                        <div>
                          <strong style={{ color: '#dc2626' }}>Blockers:</strong>
                          <div style={{ color: '#dc2626', marginTop: '2px' }}>
                            {entry.blockers.map((blocker, idx) => (
                              <div key={idx} style={{ marginBottom: '2px' }}>
                                • {blocker}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredEntries.length === 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '48px', 
                  color: '#6b7280'
                }}>
                  <MessageSquare style={{ width: '48px', height: '48px', color: '#6b7280', margin: '0 auto 16px' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    No messages yet
                  </h3>
                  <p style={{ margin: 0 }}>
                    {searchTerm || filterBy !== 'all' 
                      ? 'No messages match your filters'
                      : 'Team members haven\'t submitted their standup updates yet'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pending Members */}
          {stats.pendingMembers.length > 0 && (
            <div style={{ marginTop: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '16px' }}>
                Pending Submissions ({stats.pendingMembers.length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
                {stats.pendingMembers.map((member) => (
                  <div
                    key={member.id}
                    style={{
                      padding: '16px',
                      backgroundColor: '#fef3c7',
                      border: '1px solid #fbbf24',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}
                  >
                    <Clock style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
                    <span style={{ fontSize: '14px', color: '#92400e' }}>
                      {member.name || member.email || 'Unknown User'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {viewMode === 'tasks' && (
        <PersonalTasksManager
          user={user}
          currentTeam={currentTeam}
          onTasksUpdate={handlePersonalTasksUpdate}
        />
      )}

      {viewMode === 'form' && (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                {userStandupToday ? 'Update Your Standup' : 'Submit Daily Standup'}
              </h2>
              {personalTasks.length > 0 && (
                <button
                  onClick={populateFromTasks}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <FileSpreadsheet style={{ width: '14px', height: '14px' }} />
                  Auto-fill from Tasks
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  What did you accomplish yesterday?
                </label>
                <textarea
                  value={standupForm.yesterday}
                  onChange={(e) => setStandupForm({ ...standupForm, yesterday: e.target.value })}
                  placeholder="Share your key accomplishments from yesterday..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  What are you planning to work on today?
                </label>
                <textarea
                  value={standupForm.today}
                  onChange={(e) => setStandupForm({ ...standupForm, today: e.target.value })}
                  placeholder="Outline your goals and tasks for today..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                  Any blockers or impediments? (one per line)
                </label>
                <textarea
                  value={standupForm.blockers}
                  onChange={(e) => setStandupForm({ ...standupForm, blockers: e.target.value })}
                  placeholder="List any blockers that are preventing your progress..."
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    How are you feeling?
                  </label>
                  <select
                    value={standupForm.mood}
                    onChange={(e) => setStandupForm({ ...standupForm, mood: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="excited">🤩 Excited</option>
                    <option value="happy">😊 Happy</option>
                    <option value="neutral">😐 Neutral</option>
                    <option value="concerned">😟 Concerned</option>
                    <option value="sad">😞 Struggling</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                    Current workload
                  </label>
                  <select
                    value={standupForm.workload}
                    onChange={(e) => setStandupForm({ ...standupForm, workload: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="light">Light</option>
                    <option value="normal">Normal</option>
                    <option value="heavy">Heavy</option>
                    <option value="overwhelming">Overwhelming</option>
                  </select>
                </div>
              </div>

              <button
                onClick={submitStandup}
                disabled={submittingStandup || !standupForm.yesterday.trim() || !standupForm.today.trim()}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: submittingStandup ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: submittingStandup ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {submittingStandup ? (
                  <>
                    <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 style={{ width: '16px', height: '16px' }} />
                    {userStandupToday ? 'Update Standup' : 'Submit Standup'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'analytics' && isManager && (
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '24px' }}>
            Team Analytics
          </h2>
          
          <div style={{ 
            backgroundColor: 'white', 
            padding: '24px', 
            borderRadius: '12px', 
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' 
          }}>
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '48px' }}>
              Team performance analytics coming soon...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyStandupInterface;