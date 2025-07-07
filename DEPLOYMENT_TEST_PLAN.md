# TaskFlow Deployment Test Plan

## After Vercel Deployment

### Step 1: Basic App Testing
1. **Visit your Vercel URL** (e.g., https://taskflow-app-sahilnalavade.vercel.app)
2. **Verify app loads** without errors
3. **Test navigation** through different screens
4. **Check browser console** for any errors

### Step 2: Invitation System Testing
1. **Go to Team Demo or Personal Mode**
2. **Navigate to Team Management**
3. **Click "Invite Member"**
4. **Fill out invitation form** with your own email
5. **Send invitation**
6. **Check for success message**

### Step 3: Email Verification
1. **Check your email inbox** (including spam)
2. **Verify invitation email received**
3. **Check invitation URL** - should be https://your-app.vercel.app/invite/...
4. **NOT localhost anymore!**

### Step 4: Invitation Acceptance Testing
1. **Click invitation link** in email
2. **Should open your deployed app** at /invite/token
3. **Complete acceptance form**
4. **Verify user joins team**
5. **Check redirect** to main app

### Step 5: Cross-Device Testing
1. **Send invitation** to different email
2. **Open invitation** on different device/browser
3. **Complete acceptance flow**
4. **Verify everything works**

## Expected Results

### ✅ Success Indicators:
- App loads without errors
- Invitation emails contain production URLs
- Invitation acceptance works from any device
- Users can successfully join team
- No localhost references anywhere

### 🚨 Potential Issues:
- **CORS errors**: Usually auto-resolved by Vercel
- **Environment variables**: Check if all are set correctly
- **Build errors**: Check Vercel build logs
- **EmailJS errors**: Verify template variables match

## Troubleshooting

### If Build Fails:
1. Check Vercel build logs
2. Verify environment variables are set
3. Try deploying from a different branch

### If Emails Don't Send:
1. Check browser console for EmailJS errors
2. Verify EmailJS credentials in Vercel env vars
3. Test EmailJS template in their dashboard

### If Invitation Links Don't Work:
1. Check URL format in email
2. Verify base URL detection in emailService.js
3. Test invitation acceptance page directly

## Manual URL Testing

Test these URLs directly on your deployed app:
- `https://your-app.vercel.app/` - Main app
- `https://your-app.vercel.app/invite/test` - Should show invalid invitation page
- Main navigation and features

## Production Environment Verification

Verify these work in production:
- ✅ EmailJS sending
- ✅ Google Sheets integration (if used)
- ✅ All app features
- ✅ Responsive design
- ✅ Loading states
- ✅ Error handling