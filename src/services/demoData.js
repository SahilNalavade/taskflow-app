// Demo data service for try-before-auth experience
export const demoData = {
  user: {
    id: 'demo_user',
    name: 'Demo User',
    email: 'demo@taskflow.com',
    profilePicture: null,
    isDemo: true,
    plan: 'starter'
  },

  personalTasks: [
    {
      id: 'demo_1',
      task: 'Review project requirements',
      status: 'Complete',
      rowIndex: 2,
      sheetId: 'demo_sheet'
    },
    {
      id: 'demo_2', 
      task: 'Schedule team meeting for next week',
      status: 'In Progress',
      rowIndex: 3,
      sheetId: 'demo_sheet'
    },
    {
      id: 'demo_3',
      task: 'Update project documentation',
      status: 'Pending',
      rowIndex: 4,
      sheetId: 'demo_sheet'
    },
    {
      id: 'demo_4',
      task: 'Test new features',
      status: 'Pending',
      rowIndex: 5,
      sheetId: 'demo_sheet'
    },
    {
      id: 'demo_5',
      task: 'Prepare presentation for client',
      status: 'Blocked',
      rowIndex: 6,
      sheetId: 'demo_sheet'
    }
  ],

  personalSheet: {
    id: 'demo_sheet',
    name: 'My Demo Tasks',
    url: 'https://docs.google.com/spreadsheets/d/demo',
    isDemo: true,
    isPersonal: true
  },

  teamMembers: [
    {
      id: 'demo_user',
      name: 'Demo User',
      email: 'demo@taskflow.com',
      role: 'member',
      title: 'Developer',
      avatar: null,
      isOnline: true,
      lastSeen: new Date().toISOString(),
      skills: ['React', 'JavaScript', 'Full Stack'],
      status: 'active'
    },
    {
      id: 'sarah_chen',
      name: 'Sarah Chen',
      email: 'sarah@taskflow.com',
      role: 'manager',
      title: 'Team Lead',
      avatar: null,
      isOnline: true,
      lastSeen: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
      skills: ['Leadership', 'Frontend', 'Management'],
      status: 'active'
    },
    {
      id: 'mike_johnson',
      name: 'Mike Johnson',
      email: 'mike@taskflow.com',
      role: 'admin',
      title: 'Developer',
      avatar: null,
      isOnline: false,
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      skills: ['Backend', 'DevOps', 'Security'],
      status: 'active'
    },
    {
      id: 'alex_kim',
      name: 'Alex Kim',
      email: 'alex@taskflow.com',
      role: 'member',
      title: 'Designer',
      avatar: null,
      isOnline: true,
      lastSeen: new Date().toISOString(),
      skills: ['UI/UX', 'Design', 'Figma'],
      status: 'active'
    }
  ],

  teamTasks: [
    {
      id: 'team_1',
      task: 'Deploy new version to staging',
      description: 'Deploy the latest features to staging environment for QA testing',
      status: 'Complete',
      assigneeId: 'sarah_chen',
      assigneeName: 'Sarah Chen',
      priority: 'High',
      dueDate: '2025-07-05',
      createdAt: '2025-07-03T10:00:00Z',
      updatedAt: '2025-07-05T14:30:00Z',
      comments: [
        {
          id: 'c1',
          userId: 'sarah_chen',
          userName: 'Sarah Chen',
          message: 'Deployment completed successfully! QA can start testing.',
          createdAt: '2025-07-05T14:30:00Z'
        }
      ]
    },
    {
      id: 'team_2',
      task: 'Code review for authentication module',
      description: 'Review the OAuth implementation and security measures',
      status: 'In Progress', 
      assigneeId: 'mike_johnson',
      assigneeName: 'Mike Johnson',
      priority: 'Medium',
      dueDate: '2025-07-07',
      createdAt: '2025-07-04T09:00:00Z',
      updatedAt: '2025-07-06T11:00:00Z',
      comments: [
        {
          id: 'c2',
          userId: 'demo_user',
          userName: 'Demo User',
          message: '@Mike Johnson The OAuth flow looks good, just need to check the token refresh logic',
          createdAt: '2025-07-06T11:00:00Z'
        }
      ]
    },
    {
      id: 'team_3',
      task: 'Design user onboarding flow',
      description: 'Create wireframes and mockups for the new user experience',
      status: 'In Progress',
      assigneeId: 'alex_kim',
      assigneeName: 'Alex Kim',
      priority: 'High',
      dueDate: '2025-07-08',
      createdAt: '2025-07-05T14:00:00Z',
      updatedAt: '2025-07-06T16:00:00Z',
      comments: [
        {
          id: 'c3',
          userId: 'alex_kim',
          userName: 'Alex Kim',
          message: 'Working on the mobile-first approach. Will share prototypes tomorrow.',
          createdAt: '2025-07-06T16:00:00Z'
        },
        {
          id: 'c4',
          userId: 'sarah_chen',
          userName: 'Sarah Chen',
          message: 'Great! Make sure to include the demo-first concept we discussed.',
          createdAt: '2025-07-06T16:15:00Z'
        }
      ]
    },
    {
      id: 'team_4',
      task: 'Set up CI/CD pipeline',
      description: 'Automate testing and deployment process',
      status: 'Pending',
      assigneeId: 'demo_user',
      assigneeName: 'Demo User',
      priority: 'Medium',
      dueDate: '2025-07-10',
      createdAt: '2025-07-06T10:00:00Z',
      updatedAt: '2025-07-06T10:00:00Z',
      comments: []
    },
    {
      id: 'team_5',
      task: 'Update project documentation',
      description: 'Document the new collaboration features and API changes',
      status: 'Pending',
      assigneeId: null,
      assigneeName: 'Unassigned',
      priority: 'Low',
      dueDate: '2025-07-12',
      createdAt: '2025-07-06T15:00:00Z',
      updatedAt: '2025-07-06T15:00:00Z',
      comments: []
    }
  ],

  recentActivity: [
    {
      id: 'a1',
      type: 'task_completed',
      userId: 'sarah_chen',
      userName: 'Sarah Chen',
      message: 'marked "Deploy new version to staging" as complete',
      taskId: 'team_1',
      timestamp: '2025-07-05T14:30:00Z'
    },
    {
      id: 'a2',
      type: 'comment_added',
      userId: 'demo_user',
      userName: 'Demo User',
      message: 'commented on "Code review for authentication module"',
      taskId: 'team_2',
      timestamp: '2025-07-06T11:00:00Z'
    },
    {
      id: 'a3',
      type: 'task_assigned',
      userId: 'sarah_chen',
      userName: 'Sarah Chen',
      message: 'assigned "Set up CI/CD pipeline" to Demo User',
      taskId: 'team_4',
      timestamp: '2025-07-06T10:00:00Z'
    },
    {
      id: 'a4',
      type: 'task_created',
      userId: 'sarah_chen',
      userName: 'Sarah Chen',
      message: 'created "Update project documentation"',
      taskId: 'team_5',
      timestamp: '2025-07-06T15:00:00Z'
    }
  ],

  standupEntries: [
    {
      id: 'standup_1',
      userId: 'demo_user',
      date: new Date().toISOString().split('T')[0],
      yesterday: 'Completed project requirements review and started documentation updates',
      today: 'Will focus on testing new features and preparing client presentation',
      blockers: 'Waiting for client feedback on design mockups',
      submitted: true
    }
  ]
};

export class DemoTaskService {
  constructor() {
    this.tasks = [...demoData.personalTasks];
  }

  async getAllTasks() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...this.tasks];
  }

  async addTask(taskText, status = 'Pending') {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const newTask = {
      id: `demo_${Date.now()}`,
      task: taskText,
      status,
      rowIndex: this.tasks.length + 2,
      sheetId: 'demo_sheet'
    };
    
    this.tasks.push(newTask);
    return newTask;
  }

  async updateTask(taskId, newTaskText, newStatus) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex >= 0) {
      this.tasks[taskIndex] = {
        ...this.tasks[taskIndex],
        task: newTaskText,
        status: newStatus
      };
      return this.tasks[taskIndex];
    }
    throw new Error('Task not found');
  }

  async deleteTask(taskId) {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex >= 0) {
      this.tasks.splice(taskIndex, 1);
      return true;
    }
    throw new Error('Task not found');
  }

  async testConnection() {
    return {
      success: true,
      title: 'Demo Task Sheet',
      sheets: ['Sheet1']
    };
  }
}

export const demoTaskService = new DemoTaskService();