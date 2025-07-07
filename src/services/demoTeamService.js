// Demo Team Collaboration Service
import { demoData } from './demoData';

export class DemoTeamService {
  constructor() {
    this.teamTasks = [...demoData.teamTasks];
    this.teamMembers = [...demoData.teamMembers];
    this.recentActivity = [...demoData.recentActivity];
    this.currentUser = demoData.user;
  }

  // Get all team tasks
  async getTeamTasks() {
    await this.simulateDelay(500);
    return [...this.teamTasks];
  }

  // Get team members
  async getTeamMembers() {
    await this.simulateDelay(300);
    return [...this.teamMembers];
  }

  // Get recent activity feed
  async getRecentActivity(limit = 10) {
    await this.simulateDelay(400);
    return this.recentActivity
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  // Add comment to task
  async addComment(taskId, message) {
    await this.simulateDelay(600);
    
    const task = this.teamTasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    const newComment = {
      id: `c_${Date.now()}`,
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      message: message,
      createdAt: new Date().toISOString()
    };

    task.comments.push(newComment);
    task.updatedAt = new Date().toISOString();

    // Add to activity feed
    this.addActivity('comment_added', `commented on "${task.task}"`, taskId);

    return newComment;
  }

  // Assign task to team member
  async assignTask(taskId, assigneeId) {
    await this.simulateDelay(500);
    
    const task = this.teamTasks.find(t => t.id === taskId);
    const assignee = this.teamMembers.find(m => m.id === assigneeId);
    
    if (!task) throw new Error('Task not found');
    if (!assignee) throw new Error('Assignee not found');

    const oldAssignee = task.assigneeName;
    task.assigneeId = assigneeId;
    task.assigneeName = assignee.name;
    task.updatedAt = new Date().toISOString();

    // Add to activity feed
    const message = oldAssignee === 'Unassigned' 
      ? `assigned "${task.task}" to ${assignee.name}`
      : `reassigned "${task.task}" from ${oldAssignee} to ${assignee.name}`;
    
    this.addActivity('task_assigned', message, taskId);

    return task;
  }

  // Update task status
  async updateTaskStatus(taskId, newStatus) {
    await this.simulateDelay(400);
    
    const task = this.teamTasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');

    const oldStatus = task.status;
    task.status = newStatus;
    task.updatedAt = new Date().toISOString();

    // Add to activity feed
    if (newStatus === 'Complete') {
      this.addActivity('task_completed', `marked "${task.task}" as complete`, taskId);
    } else {
      this.addActivity('status_changed', `changed "${task.task}" from ${oldStatus} to ${newStatus}`, taskId);
    }

    return task;
  }

  // Create new team task
  async createTask(taskData) {
    await this.simulateDelay(700);
    
    const newTask = {
      id: `team_${Date.now()}`,
      task: taskData.title,
      description: taskData.description || '',
      status: 'Pending',
      assigneeId: taskData.assigneeId || null,
      assigneeName: taskData.assigneeId ? this.teamMembers.find(m => m.id === taskData.assigneeId)?.name || 'Unknown' : 'Unassigned',
      priority: taskData.priority || 'Medium',
      dueDate: taskData.dueDate || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: []
    };

    this.teamTasks.unshift(newTask);

    // Add to activity feed
    this.addActivity('task_created', `created "${newTask.task}"`, newTask.id);

    return newTask;
  }

  // Delete task
  async deleteTask(taskId) {
    await this.simulateDelay(400);
    
    const taskIndex = this.teamTasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) throw new Error('Task not found');

    const task = this.teamTasks[taskIndex];
    this.teamTasks.splice(taskIndex, 1);

    // Add to activity feed
    this.addActivity('task_deleted', `deleted "${task.task}"`, taskId);

    return true;
  }

  // Get tasks grouped by status (for Kanban view)
  async getTasksByStatus() {
    await this.simulateDelay(500);
    
    const statuses = ['Pending', 'In Progress', 'Complete', 'Blocked'];
    const grouped = {};
    
    statuses.forEach(status => {
      grouped[status] = this.teamTasks.filter(task => task.status === status);
    });

    return grouped;
  }

  // Get user's assigned tasks
  async getUserTasks(userId) {
    await this.simulateDelay(400);
    return this.teamTasks.filter(task => task.assigneeId === userId);
  }

  // Simulate online presence
  simulatePresence() {
    // Randomly update member presence
    this.teamMembers.forEach(member => {
      if (Math.random() < 0.1) { // 10% chance to change status
        member.isOnline = !member.isOnline;
        member.lastSeen = new Date().toISOString();
      }
    });

    return this.teamMembers;
  }

  // Add activity to feed
  addActivity(type, message, taskId = null) {
    const activity = {
      id: `a_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type,
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      message: message,
      taskId: taskId,
      timestamp: new Date().toISOString()
    };

    this.recentActivity.unshift(activity);
    
    // Keep only last 50 activities
    if (this.recentActivity.length > 50) {
      this.recentActivity = this.recentActivity.slice(0, 50);
    }

    return activity;
  }

  // Simulate API delay
  async simulateDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get task statistics
  async getTaskStats() {
    await this.simulateDelay(300);
    
    const stats = {
      total: this.teamTasks.length,
      pending: this.teamTasks.filter(t => t.status === 'Pending').length,
      inProgress: this.teamTasks.filter(t => t.status === 'In Progress').length,
      complete: this.teamTasks.filter(t => t.status === 'Complete').length,
      blocked: this.teamTasks.filter(t => t.status === 'Blocked').length,
      overdue: this.teamTasks.filter(t => {
        if (!t.dueDate) return false;
        return new Date(t.dueDate) < new Date() && t.status !== 'Complete';
      }).length
    };

    return stats;
  }

  // Process mentions in messages
  processMentions(message) {
    const mentionRegex = /@(\w+\s*\w*)/g;
    const mentions = [];
    let match;

    while ((match = mentionRegex.exec(message)) !== null) {
      const mentionedName = match[1].trim();
      const member = this.teamMembers.find(m => 
        m.name.toLowerCase().includes(mentionedName.toLowerCase())
      );
      
      if (member) {
        mentions.push({
          userId: member.id,
          userName: member.name,
          position: match.index,
          length: match[0].length
        });
      }
    }

    return mentions;
  }
}

export const demoTeamService = new DemoTeamService();