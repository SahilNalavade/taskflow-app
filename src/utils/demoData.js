import { teamService } from '../services/teamService';
import { multiSheetService } from '../services/multiSheetService';

export const createPersonalDemoData = (userId) => {
  // Create demo personal sheet
  const demoSheet = {
    id: 'demo_personal_sheet_' + userId,
    name: 'My Personal Tasks (Demo)',
    url: 'https://docs.google.com/spreadsheets/d/demo',
    isPersonal: true,
    isDemo: true
  };

  // Add demo sheet to user's connected sheets
  multiSheetService.addSheetConnection(userId, demoSheet);

  // Create demo tasks in localStorage (simulating Google Sheets data)
  const demoTasks = [
    { id: '1', task: 'Review and update project documentation', status: 'Pending', rowIndex: 2 },
    { id: '2', task: 'Implement user authentication system', status: 'In Progress', rowIndex: 3 },
    { id: '3', task: 'Design new landing page mockups', status: 'Complete', rowIndex: 4 },
    { id: '4', task: 'Setup CI/CD pipeline for deployment', status: 'Pending', rowIndex: 5 },
    { id: '5', task: 'Write unit tests for core functions', status: 'In Progress', rowIndex: 6 }
  ];

  localStorage.setItem(`demo_tasks_${userId}`, JSON.stringify(demoTasks));

  return { sheet: demoSheet, tasks: demoTasks };
};

export const createTeamDemoData = (userId) => {
  // Create demo team
  const demoTeam = teamService.createTeam({
    name: 'Development Team',
    description: 'Demo team for testing collaboration features',
    department: 'Engineering',
    leadId: userId
  });

  // Add current user as manager
  teamService.addMemberToTeam(demoTeam.id, {
    userId: userId,
    role: 'manager',
    name: 'You (Demo User)',
    email: 'demo@example.com',
    permissions: ['read', 'write', 'admin', 'manage_team']
  });

  // Add demo team members
  const demoMembers = [
    {
      userId: 'demo_user_1',
      role: 'developer',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      permissions: ['read', 'write']
    },
    {
      userId: 'demo_user_2',
      role: 'designer',
      name: 'Bob Smith', 
      email: 'bob@example.com',
      permissions: ['read', 'write']
    },
    {
      userId: 'demo_user_3',
      role: 'qa',
      name: 'Carol Wilson',
      email: 'carol@example.com',
      permissions: ['read', 'write', 'test']
    }
  ];

  demoMembers.forEach(member => {
    teamService.addMemberToTeam(demoTeam.id, member);
  });

  // Add demo standup entries
  teamService.createStandupEntry(demoTeam.id, 'demo_user_1', {
    yesterday: 'Completed the user authentication module and fixed login flow bugs.',
    today: 'Working on the dashboard components and implementing the navigation system.',
    blockers: ['Waiting for API documentation from backend team'],
    mood: 'happy',
    workload: 'normal'
  });

  teamService.createStandupEntry(demoTeam.id, 'demo_user_2', {
    yesterday: 'Designed mockups for the new task management interface and updated style guide.',
    today: 'Creating icons and illustrations for the standup feature.',
    blockers: [],
    mood: 'excited',
    workload: 'light'
  });

  teamService.createStandupEntry(demoTeam.id, 'demo_user_3', {
    yesterday: 'Tested the Google Sheets integration and reported 3 minor bugs.',
    today: 'Writing automated tests for the authentication flow.',
    blockers: ['Need staging environment setup'],
    mood: 'neutral',
    workload: 'heavy'
  });

  return demoTeam;
};

export const loadDemoTasks = (userId) => {
  try {
    const tasks = localStorage.getItem(`demo_tasks_${userId}`);
    return tasks ? JSON.parse(tasks) : [];
  } catch (error) {
    console.error('Error loading demo tasks:', error);
    return [];
  }
};

export const updateDemoTask = (userId, taskId, updates) => {
  try {
    const tasks = loadDemoTasks(userId);
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex >= 0) {
      tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
      localStorage.setItem(`demo_tasks_${userId}`, JSON.stringify(tasks));
      return tasks[taskIndex];
    }
    
    return null;
  } catch (error) {
    console.error('Error updating demo task:', error);
    return null;
  }
};

export const addDemoTask = (userId, task, status = 'Pending') => {
  try {
    const tasks = loadDemoTasks(userId);
    const newTask = {
      id: Date.now().toString(),
      task,
      status,
      rowIndex: tasks.length + 2 // Account for header row
    };
    
    tasks.push(newTask);
    localStorage.setItem(`demo_tasks_${userId}`, JSON.stringify(tasks));
    return newTask;
  } catch (error) {
    console.error('Error adding demo task:', error);
    return null;
  }
};

export const deleteDemoTask = (userId, taskId) => {
  try {
    const tasks = loadDemoTasks(userId);
    const filteredTasks = tasks.filter(t => t.id !== taskId);
    localStorage.setItem(`demo_tasks_${userId}`, JSON.stringify(filteredTasks));
    return true;
  } catch (error) {
    console.error('Error deleting demo task:', error);
    return false;
  }
};