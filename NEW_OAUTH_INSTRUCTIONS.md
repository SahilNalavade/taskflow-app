# Create New OAuth Client (If Current One Doesn't Work)

## Step 1: Create New OAuth Client
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Application type: "Web application"
4. Name: "TaskFlow Dev"

## Step 2: Configure URLs
**Authorized JavaScript origins:**
```
http://localhost:3000
http://localhost:5173
http://127.0.0.1:3000
```

**Authorized redirect URIs:**
```
http://localhost:3000
http://localhost:5173
http://127.0.0.1:3000
```

## Step 3: Configure OAuth Consent Screen
1. Go to "OAuth consent screen"
2. User Type: "External" (then click Create)
3. Fill required fields:
   - App name: TaskFlow
   - User support email: sahil@kaliper.io
   - Developer contact: sahil@kaliper.io
4. Click "Save and Continue"

## Step 4: Add Scopes
Add these scopes:
- userinfo.email
- userinfo.profile  
- https://www.googleapis.com/auth/spreadsheets
- https://www.googleapis.com/auth/drive.readonly

## Step 5: Add Test Users
Add: sahilnalavade25@gmail.com

## Step 6: Update .env file
Replace the VITE_GOOGLE_CLIENT_ID in your .env with the new Client ID