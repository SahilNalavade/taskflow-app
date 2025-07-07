import { googleAuthService } from './googleAuth';

const BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

export class MultiSheetService {
  constructor() {
    this.sheets = new Map(); // Cache for sheet instances
  }

  // Create a service instance for a specific sheet
  createSheetInstance(sheetConfig) {
    const { id, apiKey, name, appsScriptUrl } = sheetConfig;
    
    return {
      id,
      name,
      apiKey,
      
      async getAllTasks(range = 'Sheet1!A:Z') {
        try {
          console.log(`MultiSheetService: Getting tasks from sheet ${id}, range: ${range}`);
          
          // Use OAuth if available, fallback to API key
          let response;
          if (googleAuthService.isSignedIn()) {
            console.log('MultiSheetService: Using OAuth authentication');
            response = await googleAuthService.makeAuthenticatedRequest(
              `${BASE_URL}/${id}/values/${range}`
            );
          } else if (apiKey) {
            console.log('MultiSheetService: Using API key authentication');
            response = await fetch(
              `${BASE_URL}/${id}/values/${range}?key=${apiKey}`
            );
          } else {
            throw new Error('No authentication method available. Please sign in with Google or provide an API key.');
          }
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('MultiSheetService: API response error:', response.status, errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
          }
          
          const data = await response.json();
          console.log('MultiSheetService: Raw sheet data:', data);
          
          // Return raw sheet data format that personalSheetsBridge expects
          // This includes the complete Google Sheets API response structure
          return {
            values: data.values || [],
            range: data.range,
            majorDimension: data.majorDimension || 'ROWS'
          };
        } catch (error) {
          console.error('MultiSheetService: Error fetching tasks:', error);
          throw error;
        }
      },

      async updateTask(rowIndex, task, status) {
        // Use OAuth2 authentication for direct API access
        if (googleAuthService.isSignedIn()) {
          try {
            const range = `Sheet1!A${rowIndex}:B${rowIndex}`;
            const response = await googleAuthService.makeAuthenticatedRequest(
              `${BASE_URL}/${id}/values/${range}?valueInputOption=RAW`,
              {
                method: 'PUT',
                body: JSON.stringify({
                  values: [[task, status]]
                })
              }
            );
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
          } catch (error) {
            console.error('Error updating task via OAuth:', error);
            throw error;
          }
        }
        
        // Use Apps Script if available
        if (appsScriptUrl) {
          try {
            const response = await fetch(appsScriptUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                action: 'UPDATE',
                rowIndex,
                task,
                status
              })
            });
            
            const result = await response.json();
            if (!result.success) {
              throw new Error(result.error || 'Apps Script operation failed');
            }
            
            return result;
          } catch (error) {
            console.error('Error updating task via Apps Script:', error);
            throw error;
          }
        }
        
        // No authentication available
        throw new Error('Please sign in with Google or set up Apps Script to edit tasks.');
      },

      async addTask(task, status = 'Pending') {
        // Use OAuth2 authentication for direct API access
        if (googleAuthService.isSignedIn()) {
          try {
            const appendRange = 'Sheet1!A:B';
            const response = await googleAuthService.makeAuthenticatedRequest(
              `${BASE_URL}/${id}/values/${appendRange}:append?valueInputOption=RAW`,
              {
                method: 'POST',
                body: JSON.stringify({
                  values: [[task, status]]
                })
              }
            );
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
          } catch (error) {
            console.error('Error adding task via OAuth:', error);
            throw error;
          }
        }
        
        // Use Apps Script if available
        if (appsScriptUrl) {
          try {
            const response = await fetch(appsScriptUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                action: 'ADD',
                task,
                status
              })
            });
            
            const result = await response.json();
            if (!result.success) {
              throw new Error(result.error || 'Apps Script operation failed');
            }
            
            return result;
          } catch (error) {
            console.error('Error adding task via Apps Script:', error);
            throw error;
          }
        }
        
        // No authentication available
        throw new Error('Please sign in with Google or set up Apps Script to edit tasks.');
      },

      async deleteTask(rowIndex) {
        // Use OAuth2 authentication for direct API access
        if (googleAuthService.isSignedIn()) {
          try {
            // Get sheet metadata to find the sheet ID
            const sheetMetaResponse = await googleAuthService.makeAuthenticatedRequest(`${BASE_URL}/${id}`);
            const sheetMeta = await sheetMetaResponse.json();
            const sheetId = sheetMeta.sheets[0].properties.sheetId;

            const response = await googleAuthService.makeAuthenticatedRequest(
              `${BASE_URL}/${id}:batchUpdate`,
              {
                method: 'POST',
                body: JSON.stringify({
                  requests: [{
                    deleteDimension: {
                      range: {
                        sheetId: sheetId,
                        dimension: 'ROWS',
                        startIndex: rowIndex - 1,
                        endIndex: rowIndex
                      }
                    }
                  }]
                })
              }
            );
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
          } catch (error) {
            console.error('Error deleting task via OAuth:', error);
            throw error;
          }
        }
        
        // Use Apps Script if available
        if (appsScriptUrl) {
          try {
            const response = await fetch(appsScriptUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                action: 'DELETE',
                rowIndex
              })
            });
            
            const result = await response.json();
            if (!result.success) {
              throw new Error(result.error || 'Apps Script operation failed');
            }
            
            return result;
          } catch (error) {
            console.error('Error deleting task via Apps Script:', error);
            throw error;
          }
        }
        
        // No authentication available
        throw new Error('Please sign in with Google or set up Apps Script to delete tasks.');
      },

      async testConnection() {
        try {
          let response;
          if (googleAuthService.isSignedIn()) {
            response = await googleAuthService.makeAuthenticatedRequest(`${BASE_URL}/${id}`);
          } else if (apiKey) {
            response = await fetch(`${BASE_URL}/${id}?key=${apiKey}`);
          } else {
            throw new Error('No authentication method available. Please sign in with Google or provide an API key.');
          }
          
          if (!response.ok) {
            throw new Error(`Connection failed: ${response.status}`);
          }
          const data = await response.json();
          return {
            success: true,
            title: data.properties?.title,
            sheets: data.sheets?.map(sheet => sheet.properties.title)
          };
        } catch (error) {
          return {
            success: false,
            error: error.message
          };
        }
      }
    };
  }

  // Get or create a sheet service instance
  getSheetService(sheetConfig) {
    const cacheKey = sheetConfig.id;
    
    if (!this.sheets.has(cacheKey)) {
      this.sheets.set(cacheKey, this.createSheetInstance(sheetConfig));
    }
    
    return this.sheets.get(cacheKey);
  }

  // Load user's connected sheets from localStorage
  getUserSheets(userId) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.connectedSheets || [];
    } catch (error) {
      console.error('Error loading user sheets:', error);
      return [];
    }
  }

  // Save user's connected sheets to localStorage
  saveUserSheets(userId, sheets) {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.connectedSheets = sheets;
      localStorage.setItem('user', JSON.stringify(user));
      return true;
    } catch (error) {
      console.error('Error saving user sheets:', error);
      return false;
    }
  }

  // Add a new sheet connection
  async addSheetConnection(userId, sheetConfig) {
    const sheets = this.getUserSheets(userId);
    
    // Check if sheet already exists
    const existingIndex = sheets.findIndex(s => s.id === sheetConfig.id);
    if (existingIndex >= 0) {
      sheets[existingIndex] = { ...sheetConfig, lastAccessed: new Date().toISOString() };
    } else {
      sheets.push({ ...sheetConfig, createdAt: new Date().toISOString() });
    }
    
    return this.saveUserSheets(userId, sheets);
  }

  // Remove a sheet connection
  removeSheetConnection(userId, sheetId) {
    const sheets = this.getUserSheets(userId);
    const filteredSheets = sheets.filter(s => s.id !== sheetId);
    
    // Clear from cache
    this.sheets.delete(sheetId);
    
    return this.saveUserSheets(userId, filteredSheets);
  }

  // Update last accessed time for a sheet
  updateSheetAccess(userId, sheetId) {
    const sheets = this.getUserSheets(userId);
    const sheetIndex = sheets.findIndex(s => s.id === sheetId);
    
    if (sheetIndex >= 0) {
      sheets[sheetIndex].lastAccessed = new Date().toISOString();
      this.saveUserSheets(userId, sheets);
    }
  }
}

export const multiSheetService = new MultiSheetService();