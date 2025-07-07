# Enable Write Access for Google Sheets Task Manager

The Google Sheets API **requires OAuth2 authentication for write operations** (add, edit, delete). API keys only work for reading data.

## Quick Solution: Google Apps Script Proxy

Here's the easiest way to enable write access without complex OAuth setup:

### Step 1: Create a Google Apps Script

1. Go to [Google Apps Script](https://script.google.com/)
2. Click "New Project"
3. Replace the default code with this:

```javascript
function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const action = data.action;
  const spreadsheetId = '15oHiyYMnE-kFx-VUTWIMTEPlqCRD2dR4eFBvfqAIugI';
  const sheet = SpreadsheetApp.openById(spreadsheetId).getActiveSheet();
  
  try {
    switch(action) {
      case 'ADD':
        sheet.appendRow([data.task, data.status]);
        return ContentService
          .createTextOutput(JSON.stringify({success: true, message: 'Task added'}))
          .setMimeType(ContentService.MimeType.JSON);
          
      case 'UPDATE':
        const rowIndex = data.rowIndex;
        sheet.getRange(rowIndex, 1).setValue(data.task);
        sheet.getRange(rowIndex, 2).setValue(data.status);
        return ContentService
          .createTextOutput(JSON.stringify({success: true, message: 'Task updated'}))
          .setMimeType(ContentService.MimeType.JSON);
          
      case 'DELETE':
        sheet.deleteRow(data.rowIndex);
        return ContentService
          .createTextOutput(JSON.stringify({success: true, message: 'Task deleted'}))
          .setMimeType(ContentService.MimeType.JSON);
          
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput('Google Sheets Task Manager API is running')
    .setMimeType(ContentService.MimeType.TEXT);
}
```

### Step 2: Deploy the Script

1. Click "Deploy" > "New deployment"
2. Choose type: "Web app"
3. Set execute as: "Me"
4. Set access to: "Anyone"
5. Click "Deploy"
6. Copy the web app URL (it will look like: `https://script.google.com/macros/s/ABC123.../exec`)

### Step 3: Update Your App

Add this URL to your `.env` file:
```env
VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### Step 4: Use the Updated Service

The app will automatically detect the Apps Script URL and use it for write operations while still using the Sheets API for reading.

## Alternative: Full OAuth2 Implementation

For production applications, implement OAuth2:

1. **Google Cloud Console Setup**:
   - Enable Google Sheets API
   - Create OAuth 2.0 credentials
   - Add authorized domains

2. **Install OAuth Library**:
   ```bash
   npm install @google-cloud/auth-library
   ```

3. **Implement OAuth Flow**:
   - User authentication
   - Token management
   - API calls with access tokens

## Security Considerations

- **Apps Script Proxy**: Simple but exposes your script URL
- **OAuth2**: More secure, requires user authentication
- **Public Edit Access**: Least secure, anyone can edit your sheet

Choose the option that best fits your security requirements.