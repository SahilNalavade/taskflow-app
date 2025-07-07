import { teamService } from '../services/teamService';

export const createDemoTeam = (userId) => {
  // Check if demo team already exists
  const existingTeams = teamService.getUserTeams(userId);
  if (existingTeams.length > 0) {
    return existingTeams[0];
  }

  // Create demo team
  const demoTeam = teamService.createTeam({
    name: 'Development Team',
    description: 'Demo team for testing standup functionality',
    department: 'Engineering',
    leadId: userId
  });

  // Add current user as manager
  teamService.addMemberToTeam(demoTeam.id, {
    userId: userId,
    role: 'manager',
    name: 'Demo User',
    email: 'demo@example.com',
    permissions: ['read', 'write', 'admin', 'manage_team']
  });

  // Add some demo team members
  const demoMembers = [
    {
      userId: 'user_2',
      role: 'developer',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      permissions: ['read', 'write']
    },
    {
      userId: 'user_3',
      role: 'designer',
      name: 'Bob Smith',
      email: 'bob@example.com', 
      permissions: ['read', 'write']
    },
    {
      userId: 'user_4',
      role: 'qa',
      name: 'Carol Wilson',
      email: 'carol@example.com',
      permissions: ['read', 'write', 'test']
    }
  ];

  demoMembers.forEach(member => {
    teamService.addMemberToTeam(demoTeam.id, member);
  });

  // Add some demo standup entries for today
  const today = new Date().toISOString().split('T')[0];
  
  // Add demo standup for Alice
  teamService.createStandupEntry(demoTeam.id, 'user_2', {
    yesterday: 'Completed the user authentication module and fixed bugs in the login flow.',
    today: 'Working on the dashboard components and implementing the navigation system.',
    blockers: ['Waiting for API documentation from backend team'],
    mood: 'happy',
    workload: 'normal'
  });

  // Add demo standup for Bob  
  teamService.createStandupEntry(demoTeam.id, 'user_3', {
    yesterday: 'Designed mockups for the new task management interface and updated the style guide.',
    today: 'Creating icons and illustrations for the standup feature.',
    blockers: [],
    mood: 'excited',
    workload: 'light'
  });

  return demoTeam;
};

export const addDemoStandupEntry = (teamId, userId) => {
  // Check if user already submitted today
  const existingEntry = teamService.getUserStandupToday(teamId, userId);
  if (existingEntry) {
    return existingEntry;
  }

  // Add standup entry for current user
  return teamService.createStandupEntry(teamId, userId, {
    yesterday: 'Worked on integrating Google Sheets API and implemented the task management features.',
    today: 'Building the daily standup interface and team management system.',
    blockers: ['Need approval for new UI design changes'],
    mood: 'happy',
    workload: 'normal'
  });
};