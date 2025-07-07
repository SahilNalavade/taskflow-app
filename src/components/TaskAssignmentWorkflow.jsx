import React, { useState, useEffect } from 'react';
import { 
  Users, User, Brain, Clock, Target, TrendingUp, 
  CheckCircle2, AlertTriangle, ArrowRight, Calendar,
  Zap, Award, BarChart3, MessageSquare 
} from 'lucide-react';
import { demoData } from '../services/demoData';
import { realtimeEngine } from '../services/realtimeEngine';

const TaskAssignmentWorkflow = ({ task, onAssignmentChange, teamMembers = [] }) => {
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState(task?.assigneeId || '');
  const [assignmentReason, setAssignmentReason] = useState('');
  const [smartSuggestions, setSmartSuggestions] = useState([]);
  const [workloadData, setWorkloadData] = useState({});
  const [assignmentHistory, setAssignmentHistory] = useState([]);

  useEffect(() => {
    if (showAssignmentModal) {
      generateSmartSuggestions();
      loadWorkloadData();
      loadAssignmentHistory();
    }
  }, [showAssignmentModal, task]);

  const generateSmartSuggestions = () => {
    const suggestions = [];
    const members = teamMembers.length > 0 ? teamMembers : demoData.teamMembers;

    members.forEach(member => {
      let score = 0;
      let reasons = [];

      // Skill matching (simulated)
      if (task.priority === 'High' && member.skills?.includes('leadership')) {
        score += 30;
        reasons.push('Strong leadership skills for high-priority task');
      }

      // Workload consideration
      const memberTasks = demoData.teamTasks.filter(t => t.assigneeId === member.id);
      const activeTasks = memberTasks.filter(t => t.status !== 'Complete');
      
      if (activeTasks.length < 3) {
        score += 25;
        reasons.push(`Light workload (${activeTasks.length} active tasks)`);
      } else if (activeTasks.length > 5) {
        score -= 20;
        reasons.push(`Heavy workload (${activeTasks.length} active tasks)`);
      }

      // Availability (simulated based on presence)
      if (member.isOnline !== false) {
        score += 15;
        reasons.push('Currently online and available');
      }

      // Previous task completion rate (simulated)
      const completedTasks = memberTasks.filter(t => t.status === 'Complete');
      const completionRate = memberTasks.length > 0 ? (completedTasks.length / memberTasks.length) * 100 : 75;
      
      if (completionRate > 80) {
        score += 20;
        reasons.push(`Excellent completion rate (${completionRate.toFixed(0)}%)`);
      }

      // Domain expertise (simulated)
      if (task.description?.toLowerCase().includes('frontend') && member.role?.includes('Frontend')) {
        score += 25;
        reasons.push('Frontend expertise matches task requirements');
      }

      if (task.description?.toLowerCase().includes('backend') && member.role?.includes('Backend')) {
        score += 25;
        reasons.push('Backend expertise matches task requirements');
      }

      // Recent collaboration
      const recentComments = demoData.teamTasks
        .flatMap(t => t.comments || [])
        .filter(c => c.userId === member.id && 
                new Date(c.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
      
      if (recentComments.length > 5) {
        score += 10;
        reasons.push('Active team contributor');
      }

      suggestions.push({
        member,
        score: Math.max(0, Math.min(100, score)),
        reasons: reasons.slice(0, 3), // Top 3 reasons
        confidence: score > 60 ? 'high' : score > 40 ? 'medium' : 'low'
      });
    });

    // Sort by score and take top suggestions
    setSmartSuggestions(suggestions.sort((a, b) => b.score - a.score).slice(0, 5));
  };

  const loadWorkloadData = () => {
    const workload = {};
    const members = teamMembers.length > 0 ? teamMembers : demoData.teamMembers;

    members.forEach(member => {
      const memberTasks = demoData.teamTasks.filter(t => t.assigneeId === member.id);
      const activeTasks = memberTasks.filter(t => t.status !== 'Complete');
      const highPriorityTasks = activeTasks.filter(t => t.priority === 'High');
      const overdueTasks = activeTasks.filter(t => 
        t.dueDate && new Date(t.dueDate) < new Date()
      );

      workload[member.id] = {
        total: activeTasks.length,
        highPriority: highPriorityTasks.length,
        overdue: overdueTasks.length,
        capacity: activeTasks.length < 3 ? 'available' : 
                 activeTasks.length < 6 ? 'moderate' : 'busy',
        efficiency: Math.random() * 30 + 70 // Simulated efficiency score
      };
    });

    setWorkloadData(workload);
  };

  const loadAssignmentHistory = () => {
    // Simulated assignment history
    const history = [
      {
        taskId: 'task_001',
        taskTitle: 'User Authentication System',
        assignedTo: 'sarah_chen',
        assignedBy: 'mike_johnson',
        assignedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        reason: 'Frontend expertise and availability',
        outcome: 'completed_on_time'
      },
      {
        taskId: 'task_002', 
        taskTitle: 'Database Optimization',
        assignedTo: 'alex_rivera',
        assignedBy: 'mike_johnson',
        assignedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        reason: 'Backend specialization',
        outcome: 'completed_early'
      },
      {
        taskId: 'task_003',
        taskTitle: 'Mobile App Testing',
        assignedTo: 'jordan_smith',
        assignedBy: 'mike_johnson', 
        assignedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        reason: 'QA expertise and light workload',
        outcome: 'in_progress'
      }
    ];

    setAssignmentHistory(history);
  };

  const handleAssignment = () => {
    const assignee = (teamMembers.length > 0 ? teamMembers : demoData.teamMembers)
      .find(m => m.id === selectedAssignee);

    if (!assignee) return;

    // Trigger assignment event
    realtimeEngine.emit('task_assigned', {
      taskId: task.id,
      assigneeId: selectedAssignee,
      assigneeName: assignee.name,
      reason: assignmentReason,
      assignedBy: 'current_user',
      timestamp: new Date().toISOString()
    });

    // Update task assignment
    if (onAssignmentChange) {
      onAssignmentChange(selectedAssignee, assignee.name);
    }

    setShowAssignmentModal(false);
    setAssignmentReason('');
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'high': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'low': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getCapacityColor = (capacity) => {
    switch (capacity) {
      case 'available': return '#10b981';
      case 'moderate': return '#f59e0b';
      case 'busy': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <>
      {/* Assignment Trigger Button */}
      <button
        onClick={() => setShowAssignmentModal(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '12px',
          cursor: 'pointer'
        }}
      >
        <Brain style={{ width: '14px', height: '14px' }} />
        Smart Assign
      </button>

      {/* Assignment Modal */}
      {showAssignmentModal && (
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
          zIndex: 2000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            {/* Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #e5e7eb',
              backgroundColor: '#f8fafc'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '600', margin: 0, marginBottom: '4px' }}>
                    Smart Task Assignment
                  </h2>
                  <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
                    AI-powered suggestions based on skills, workload, and availability
                  </p>
                </div>
                <button
                  onClick={() => setShowAssignmentModal(false)}
                  style={{
                    padding: '8px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: '#6b7280'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 300px',
              height: '600px'
            }}>
              {/* Main Content */}
              <div style={{ padding: '24px', overflowY: 'auto' }}>
                {/* Task Info */}
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '24px'
                }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                    {task.task || task.title}
                  </h3>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#6b7280' }}>
                    <span>Priority: <strong style={{ color: task.priority === 'High' ? '#ef4444' : '#f59e0b' }}>
                      {task.priority}
                    </strong></span>
                    {task.dueDate && (
                      <span>Due: <strong>{new Date(task.dueDate).toLocaleDateString()}</strong></span>
                    )}
                  </div>
                </div>

                {/* Smart Suggestions */}
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: '600', 
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Zap style={{ width: '18px', height: '18px', color: '#3b82f6' }} />
                    AI Recommendations
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {smartSuggestions.map((suggestion, index) => (
                      <div
                        key={suggestion.member.id}
                        onClick={() => setSelectedAssignee(suggestion.member.id)}
                        style={{
                          padding: '16px',
                          border: `2px solid ${selectedAssignee === suggestion.member.id ? '#3b82f6' : '#e5e7eb'}`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          backgroundColor: selectedAssignee === suggestion.member.id ? '#eff6ff' : 'white',
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              backgroundColor: '#3b82f6',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '14px',
                              fontWeight: '600'
                            }}>
                              {suggestion.member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', fontSize: '14px' }}>
                                {suggestion.member.name}
                              </div>
                              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                {suggestion.member.role || 'Team Member'}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {index === 0 && (
                              <span style={{
                                backgroundColor: '#10b981',
                                color: 'white',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontSize: '10px',
                                fontWeight: '600'
                              }}>
                                BEST MATCH
                              </span>
                            )}
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              color: getConfidenceColor(suggestion.confidence)
                            }}>
                              <Target style={{ width: '12px', height: '12px' }} />
                              {suggestion.score}%
                            </div>
                          </div>
                        </div>

                        {/* Workload Info */}
                        <div style={{ 
                          display: 'flex', 
                          gap: '16px', 
                          marginBottom: '8px',
                          fontSize: '12px'
                        }}>
                          <span style={{ 
                            color: getCapacityColor(workloadData[suggestion.member.id]?.capacity)
                          }}>
                            {workloadData[suggestion.member.id]?.total || 0} active tasks
                          </span>
                          <span style={{ color: '#6b7280' }}>
                            {workloadData[suggestion.member.id]?.efficiency?.toFixed(0) || 75}% efficiency
                          </span>
                        </div>

                        {/* Reasons */}
                        <div style={{ fontSize: '12px' }}>
                          {suggestion.reasons.map((reason, idx) => (
                            <div key={idx} style={{ 
                              color: '#6b7280', 
                              marginBottom: '2px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <CheckCircle2 style={{ width: '10px', height: '10px', color: '#10b981' }} />
                              {reason}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Assignment Reason */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    marginBottom: '8px' 
                  }}>
                    Assignment Reason (Optional)
                  </label>
                  <textarea
                    value={assignmentReason}
                    onChange={(e) => setAssignmentReason(e.target.value)}
                    placeholder="Why is this person the best fit for this task?"
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>

              {/* Sidebar */}
              <div style={{
                backgroundColor: '#f8fafc',
                borderLeft: '1px solid #e5e7eb',
                padding: '24px',
                overflowY: 'auto'
              }}>
                {/* Team Workload Overview */}
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <BarChart3 style={{ width: '14px', height: '14px' }} />
                    Team Workload
                  </h4>
                  
                  {Object.entries(workloadData).map(([memberId, data]) => {
                    const member = (teamMembers.length > 0 ? teamMembers : demoData.teamMembers)
                      .find(m => m.id === memberId);
                    if (!member) return null;

                    return (
                      <div key={memberId} style={{ marginBottom: '8px' }}>
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          marginBottom: '4px'
                        }}>
                          <span style={{ fontSize: '12px', fontWeight: '500' }}>
                            {member.name.split(' ')[0]}
                          </span>
                          <span style={{ 
                            fontSize: '10px', 
                            color: getCapacityColor(data.capacity),
                            fontWeight: '600'
                          }}>
                            {data.total}
                          </span>
                        </div>
                        <div style={{
                          height: '4px',
                          backgroundColor: '#e5e7eb',
                          borderRadius: '2px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            height: '100%',
                            backgroundColor: getCapacityColor(data.capacity),
                            width: `${Math.min(100, (data.total / 8) * 100)}%`,
                            transition: 'width 0.3s'
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Recent Assignments */}
                <div>
                  <h4 style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Clock style={{ width: '14px', height: '14px' }} />
                    Recent History
                  </h4>
                  
                  {assignmentHistory.slice(0, 3).map((assignment, index) => (
                    <div key={index} style={{
                      padding: '8px',
                      backgroundColor: 'white',
                      borderRadius: '6px',
                      marginBottom: '8px',
                      fontSize: '11px'
                    }}>
                      <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                        {assignment.taskTitle}
                      </div>
                      <div style={{ color: '#6b7280', marginBottom: '4px' }}>
                        → {(teamMembers.length > 0 ? teamMembers : demoData.teamMembers)
                          .find(m => m.id === assignment.assignedTo)?.name || 'Unknown'}
                      </div>
                      <div style={{ 
                        color: assignment.outcome === 'completed_early' ? '#10b981' : 
                               assignment.outcome === 'completed_on_time' ? '#3b82f6' : '#f59e0b'
                      }}>
                        {assignment.outcome.replace('_', ' ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div style={{
              padding: '24px',
              borderTop: '1px solid #e5e7eb',
              backgroundColor: '#f8fafc',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                {selectedAssignee ? `Assigning to ${(teamMembers.length > 0 ? teamMembers : demoData.teamMembers)
                  .find(m => m.id === selectedAssignee)?.name}` : 'Select an assignee'}
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowAssignmentModal(false)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignment}
                  disabled={!selectedAssignee}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: selectedAssignee ? '#3b82f6' : '#9ca3af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: selectedAssignee ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <ArrowRight style={{ width: '14px', height: '14px' }} />
                  Assign Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskAssignmentWorkflow;