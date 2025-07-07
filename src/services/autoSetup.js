// Auto-setup service for new users
import { googleAuthService } from './googleAuth';

export class AutoSetupService {
  
  // Auto-create a Google Sheet for new users
  async createPersonalSheet(user) {
    try {
      console.log('Auto-creating personal sheet for user:', user.name);
      
      // Create a new sheet with user's name
      const sheetTitle = `${user.name}'s Tasks`;
      const newSheet = await googleAuthService.createNewSheet(sheetTitle);
      
      if (newSheet) {
        // Set up the sheet with headers
        await this.setupSheetHeaders(newSheet.id);
        
        return {
          id: newSheet.id,
          name: sheetTitle,
          url: newSheet.url,
          isPersonal: true,
          isAutoCreated: true
        };
      }
      
      throw new Error('Failed to create sheet');
    } catch (error) {
      console.error('Auto-setup failed:', error);
      return null;
    }
  }
  
  // Set up proper headers in the new sheet
  async setupSheetHeaders(sheetId) {
    try {
      const response = await googleAuthService.makeAuthenticatedRequest(
        `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A1:B1?valueInputOption=RAW`,
        {
          method: 'PUT',
          body: JSON.stringify({
            values: [['Task', 'Status']]
          })
        }
      );
      
      if (response.ok) {
        console.log('Sheet headers set up successfully');
        return true;
      }
      
      throw new Error('Failed to set up headers');
    } catch (error) {
      console.error('Error setting up sheet headers:', error);
      return false;
    }
  }
  
  // Create smart defaults for different user types
  getSmartDefaults(userProfile) {
    const defaults = {
      theme: 'light',
      notifications: true,
      autoSync: true,
      defaultView: 'dashboard'
    };
    
    // Customize based on user's Google profile or preferences
    if (userProfile?.email?.includes('gmail.com')) {
      defaults.integration = 'google';
    }
    
    return defaults;
  }
  
  // Set up a complete workspace for new users
  async setupCompleteWorkspace(user) {
    try {
      console.log('Setting up complete workspace for:', user.name);
      
      const workspace = {
        user: user,
        personalSheet: null,
        preferences: this.getSmartDefaults(user),
        setupComplete: false
      };
      
      // Try to auto-create personal sheet if user has Google auth
      if (user.isGoogleAuthenticated && googleAuthService.isSignedIn()) {
        workspace.personalSheet = await this.createPersonalSheet(user);
      }
      
      // Add some sample tasks if no sheet was created
      if (!workspace.personalSheet) {
        workspace.sampleTasks = [
          { task: 'Welcome to TaskFlow!', status: 'Complete' },
          { task: 'Connect your Google Sheet', status: 'Pending' },
          { task: 'Invite team members', status: 'Pending' }
        ];
      }
      
      workspace.setupComplete = true;
      
      // Store workspace in localStorage
      localStorage.setItem('workspace', JSON.stringify(workspace));
      
      return workspace;
    } catch (error) {
      console.error('Complete workspace setup failed:', error);
      return null;
    }
  }
  
  // Quick onboarding flow
  async quickOnboard(user) {
    const steps = [];
    
    // Step 1: Check authentication
    if (user.isGoogleAuthenticated) {
      steps.push({
        id: 'auth',
        title: 'Authentication',
        status: 'complete',
        description: 'Connected to Google account'
      });
    } else {
      steps.push({
        id: 'auth',
        title: 'Connect Google Account',
        status: 'pending',
        description: 'Sign in to sync with Google Sheets',
        action: 'auth'
      });
    }
    
    // Step 2: Sheet setup
    if (user.isGoogleAuthenticated) {
      steps.push({
        id: 'sheet',
        title: 'Create Personal Sheet',
        status: 'pending',
        description: 'Auto-create your task management sheet',
        action: 'createSheet'
      });
    }
    
    // Step 3: First task
    steps.push({
      id: 'task',
      title: 'Add Your First Task',
      status: 'pending',
      description: 'Get started with task management',
      action: 'addTask'
    });
    
    return steps;
  }
}

export const autoSetupService = new AutoSetupService();