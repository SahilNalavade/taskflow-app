# Airtable Setup Guide for TaskFlow

## Step 1: Create Airtable Account & Base

1. Go to https://airtable.com/ and create a free account
2. Click "Create a base" → "Start from scratch"
3. Name your base "TaskFlow"

## Step 2: Create Tables & Fields

### Table 1: Organizations
**Fields:**
- Name (Single line text) - Primary field
- Description (Long text)
- Owner (Link to another record → Users table)

### Table 2: Teams
**Fields:**
- Name (Single line text) - Primary field
- Description (Long text)
- Organization (Link to another record → Organizations table)
- Owner (Link to another record → Users table)

### Table 3: Users
**Fields:**
- Name (Single line text) - Primary field
- Email (Email)
- Google ID (Single line text)
- Profile Picture (URL)

### Table 4: TeamMembers
**Fields:**
- User (Link to another record → Users table) - Primary field
- Team (Link to another record → Teams table)
- Role (Single select: Admin, Member)

### Table 5: Tasks
**Fields:**
- Title (Single line text) - Primary field
- Description (Long text)
- Status (Single select: pending, in_progress, done, blocked, cancelled)
- Priority (Single select: low, medium, high, urgent)
- Team (Link to another record → Teams table)
- Created By (Link to another record → Users table)
- Assigned To (Link to another record → Users table)
- Due Date (Date)

### Table 6: Invitations
**Fields:**
- Email (Email) - Primary field
- Team (Link to another record → Teams table)
- Role (Single select: Admin, Member)
- Token (Single line text)
- Status (Single select: Pending, Accepted, Expired)

## Step 3: Get API Credentials

1. Go to https://airtable.com/developers/web/api/introduction
2. Click "Create token"
3. Give it a name like "TaskFlow App"
4. Select your TaskFlow base
5. Grant these permissions:
   - data.records:read
   - data.records:write
   - schema.bases:read
6. Copy the generated token

## Step 4: Get Base ID

1. Go to https://airtable.com/api
2. Select your TaskFlow base
3. Copy the Base ID from the introduction section (starts with "app...")

## Step 5: Update Environment Variables

Update your `.env` file:
```
VITE_AIRTABLE_BASE_ID=your_base_id_here
VITE_AIRTABLE_API_KEY=your_api_token_here
```

## Step 6: Test Connection

1. Start your development server: `npm run dev`
2. Open browser console
3. Look for "Airtable service initialized successfully" message
4. If you see errors, check your API key and base ID

## Rate Limits & Usage

- **Free tier**: 1,200 records total across all tables
- **API rate limit**: 5 requests per second
- **Monthly API calls**: Unlimited on free tier

## Security Notes

- Never commit your API key to git
- The API key has full access to your base
- Consider using environment-specific keys for production

## Troubleshooting

**"Airtable configuration missing" error:**
- Check that your .env file has the correct variables
- Restart your development server after adding variables

**"Permission denied" error:**
- Ensure your API token has the correct permissions
- Check that you selected the right base when creating the token

**"Base not found" error:**
- Verify your base ID is correct
- Make sure the base isn't deleted or moved