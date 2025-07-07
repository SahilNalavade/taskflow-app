# Google OAuth Setup Guide

## Current Issue
Your app is getting "access_denied" because it's in testing mode and you're not an approved test user.

## Quick Fix Options

### Option 1: Add Test User (RECOMMENDED for development)
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials/consent)
2. Select your project
3. Go to "OAuth consent screen"
4. Scroll to "Test users" section
5. Click "+ ADD USERS"
6. Add: `sahilnalavade25@gmail.com`
7. Click "Save"

### Option 2: Create New OAuth Client (Alternative)
If you want a fresh start:

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Name: "TaskFlow Development"
5. Add Authorized JavaScript origins:
   - http://localhost:3000
   - http://localhost:5173
   - http://127.0.0.1:3000
6. Add Authorized redirect URIs:
   - http://localhost:3000
   - http://localhost:5173
   - http://127.0.0.1:3000
7. Click "Create"
8. Copy the new Client ID to your .env file

### Option 3: OAuth Consent Screen Configuration
1. Go to OAuth consent screen
2. Fill out required fields:
   - App name: "TaskFlow"
   - User support email: sahil@kaliper.io
   - Developer contact: sahil@kaliper.io
3. Add scopes you need:
   - ../auth/userinfo.email
   - ../auth/userinfo.profile
   - ../auth/spreadsheets
   - ../auth/drive.readonly
4. Save and continue

## Production Deployment
For production, you'll need:
1. Verified domain
2. Privacy policy URL
3. Terms of service URL
4. Google verification process (can take weeks)

## Current OAuth Client Details
- Client ID: 679337391773-stabik9u9olhbei39ue11kt7roqbbkeb.apps.googleusercontent.com
- Status: Testing mode
- JavaScript origins: ✅ Configured correctly
- Redirect URIs: ✅ Configured correctly
- Missing: Test user (sahilnalavade25@gmail.com)