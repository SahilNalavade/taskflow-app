// Google OAuth2 service for Google Sheets write access
class GoogleAuthService {
  constructor() {
    this.CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    this.API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY;
    this.DISCOVERY_DOCS = [
      'https://sheets.googleapis.com/$discovery/rest?version=v4'
    ];
    this.SCOPES = 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly openid profile email';
    this.REDIRECT_URI = import.meta.env.PROD 
      ? window.location.origin + '/oauth/callback'
      : window.location.origin;
    
    this.gapi = null;
    this.tokenClient = null;
    this.isInitialized = false;
    
    // Debug environment variables
    console.log('GoogleAuth Constructor - Environment variables:');
    console.log('CLIENT_ID:', this.CLIENT_ID);
    console.log('API_KEY:', this.API_KEY ? 'Present' : 'Missing');
  }

  async initialize() {
    if (this.isInitialized) return true;

    try {
      console.log('Initializing Google Auth...');
      console.log('Client ID:', this.CLIENT_ID);
      console.log('Scopes:', this.SCOPES);

      // Validate required environment variables
      if (!this.CLIENT_ID) {
        throw new Error('Google Client ID is missing. Please check your .env file.');
      }

      // Load Google APIs with timeout
      console.log('Loading Google APIs...');
      await Promise.race([
        this.loadGoogleAPIs(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout loading Google APIs')), 10000)
        )
      ]);
      console.log('Google APIs loaded successfully');
      
      // Initialize gapi with timeout
      console.log('Initializing GAPI client...');
      await Promise.race([
        new Promise((resolve, reject) => {
          if (!window.gapi) {
            reject(new Error('Google API not available'));
            return;
          }
          
          gapi.load('client', async () => {
            try {
              await gapi.client.init({
                apiKey: this.API_KEY,
                discoveryDocs: this.DISCOVERY_DOCS,
              });
              console.log('GAPI client initialized');
              resolve();
            } catch (error) {
              console.error('GAPI client initialization error:', error);
              reject(error);
            }
          });
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout initializing GAPI client')), 8000)
        )
      ]);

      // Initialize Google Identity Services
      if (!window.google?.accounts) {
        throw new Error('Google Identity Services failed to load');
      }

      console.log('Initializing Google Identity Services...');
      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: this.CLIENT_ID,
        scope: this.SCOPES,
        callback: '', // Will be set when requesting token
        ux_mode: 'popup',
        error_callback: (error) => {
          console.error('Google OAuth error:', error);
        }
      });

      console.log('Google Identity Services initialized');
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize Google Auth:', error);
      this.isInitialized = false;
      return false;
    }
  }

  async loadGoogleAPIs() {
    console.log('Loading Google APIs...');
    
    // Load Google API script
    if (!window.gapi) {
      console.log('Loading Google API script...');
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        script.onload = () => {
          console.log('Google API script loaded successfully');
          resolve();
        };
        script.onerror = (error) => {
          console.error('Failed to load Google API script:', error);
          reject(new Error('Failed to load Google API script. Please check your internet connection.'));
        };
        document.head.appendChild(script);
      });
    } else {
      console.log('Google API script already loaded');
    }

    // Load Google Identity Services
    if (!window.google?.accounts) {
      console.log('Loading Google Identity Services...');
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.onload = () => {
          console.log('Google Identity Services loaded successfully');
          resolve();
        };
        script.onerror = (error) => {
          console.error('Failed to load Google Identity Services:', error);
          reject(new Error('Failed to load Google Identity Services. Please check your internet connection.'));
        };
        document.head.appendChild(script);
      });
    } else {
      console.log('Google Identity Services already loaded');
    }
  }

  async signIn() {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('Failed to initialize Google Auth');
      }
    }

    return new Promise((resolve, reject) => {
      this.tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
          reject(new Error(resp.error));
          return;
        }

        // Store the access token
        localStorage.setItem('google_access_token', resp.access_token);
        localStorage.setItem('google_token_expires', Date.now() + (resp.expires_in * 1000));
        
        console.log('Access token stored, getting user profile...');
        
        // Get and store user profile
        setTimeout(async () => {
          try {
            const profile = await this.getUserProfile();
            if (profile) {
              localStorage.setItem('google_user_profile', JSON.stringify(profile));
              console.log('User profile cached successfully');
            }
          } catch (error) {
            console.error('Error caching user profile:', error);
          }
        }, 100); // Small delay to ensure token is ready
        
        resolve({
          access_token: resp.access_token,
          expires_in: resp.expires_in
        });
      };

      this.tokenClient.requestAccessToken({ 
        prompt: 'consent',
        include_granted_scopes: true 
      });
    });
  }

  async getUserProfile() {
    if (!this.isSignedIn()) {
      console.log('User not signed in, cannot get profile');
      return null;
    }

    try {
      const token = localStorage.getItem('google_access_token');
      console.log('Getting user profile with token:', token ? 'Token exists' : 'No token');
      
      // Use the Google OAuth2 userinfo endpoint
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Profile response status:', response.status);

      if (response.ok) {
        const profile = await response.json();
        console.log('Profile data received:', profile);
        
        // Return profile in a consistent format
        return {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          picture: profile.picture,
          // Also provide methods for compatibility
          getId: () => profile.id,
          getName: () => profile.name,
          getEmail: () => profile.email,
          getImageUrl: () => profile.picture
        };
      } else {
        const errorText = await response.text();
        console.error('Profile fetch failed:', response.status, errorText);
      }
    } catch (error) {
      console.error('Failed to get user profile:', error);
    }

    return null;
  }

  getCachedUserProfile() {
    try {
      const profileData = localStorage.getItem('google_user_profile');
      return profileData ? JSON.parse(profileData) : null;
    } catch (error) {
      return null;
    }
  }

  async signOut() {
    const token = localStorage.getItem('google_access_token');
    if (token && window.google?.accounts?.oauth2) {
      try {
        google.accounts.oauth2.revoke(token);
      } catch (error) {
        console.log('Error revoking token:', error);
      }
    }
    
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_expires');
    localStorage.removeItem('google_user_profile');
  }

  async getUserSheets() {
    if (!this.isSignedIn()) {
      console.log('User not signed in, cannot get sheets');
      return [];
    }

    try {
      console.log('Fetching user\'s Google Sheets...');
      
      // Use direct Drive API REST call instead of gapi.client.drive
      const token = this.getAccessToken();
      const response = await fetch('https://www.googleapis.com/drive/v3/files?' + new URLSearchParams({
        q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
        fields: 'files(id,name,modifiedTime,owners,shared,webViewLink,permissions)',
        orderBy: 'modifiedTime desc',
        pageSize: '50'
      }), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Drive API response status:', response.status);

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Insufficient permissions to access Google Drive. Please sign in again and grant Drive access.');
        }
        throw new Error(`Drive API request failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Sheets response:', data);

      if (data && data.files) {
        const sheets = data.files.map(file => ({
          id: file.id,
          name: file.name,
          url: `https://docs.google.com/spreadsheets/d/${file.id}`,
          webViewLink: file.webViewLink,
          modifiedTime: file.modifiedTime,
          isOwner: file.owners ? file.owners.some(owner => owner.me) : false,
          isShared: file.shared || false,
          lastModified: new Date(file.modifiedTime).toLocaleDateString(),
          permissions: file.permissions || []
        }));

        console.log('Processed sheets:', sheets);
        return sheets;
      }

      return [];
    } catch (error) {
      console.error('Failed to get user sheets:', error);
      throw new Error('Failed to fetch your Google Sheets. Please try again.');
    }
  }

  async createNewSheet(title = 'My Tasks') {
    if (!this.isSignedIn()) {
      throw new Error('User not signed in');
    }

    try {
      console.log('Creating new Google Sheet:', title);
      
      // Create a new spreadsheet using direct API call
      const token = this.getAccessToken();
      const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          properties: {
            title: title
          },
          sheets: [{
            properties: {
              title: 'Sheet1'
            }
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create sheet: ${response.status}`);
      }

      const result = await response.json();
      console.log('Sheet creation response:', result);

      if (result) {
        const sheet = {
          id: result.spreadsheetId,
          name: title,
          url: result.spreadsheetUrl,
          webViewLink: result.spreadsheetUrl,
          modifiedTime: new Date().toISOString(),
          isOwner: true,
          isShared: false,
          lastModified: new Date().toLocaleDateString(),
          isNew: true
        };

        console.log('Created new sheet:', sheet);
        return sheet;
      }

      throw new Error('Failed to create spreadsheet');
    } catch (error) {
      console.error('Failed to create new sheet:', error);
      throw new Error('Failed to create new Google Sheet. Please try again.');
    }
  }

  isSignedIn() {
    const token = localStorage.getItem('google_access_token');
    const expires = localStorage.getItem('google_token_expires');
    
    if (!token || !expires) return false;
    
    // Check if token is expired
    if (Date.now() > parseInt(expires)) {
      this.signOut();
      return false;
    }
    
    return true;
  }

  getAccessToken() {
    if (!this.isSignedIn()) return null;
    return localStorage.getItem('google_access_token');
  }

  async makeAuthenticatedRequest(url, options = {}) {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401) {
      // Token expired, sign out
      this.signOut();
      throw new Error('Authentication expired. Please sign in again.');
    }

    return response;
  }
}

export const googleAuthService = new GoogleAuthService();