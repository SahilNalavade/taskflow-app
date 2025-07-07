# Task Manager - Google Sheets Integration

A modern React application for managing tasks stored in Google Sheets. Built with Vite, Tailwind CSS, and the Google Sheets API.

## Features

- 📊 **Real-time Google Sheets Integration** - Connect directly to your Google Sheets
- ✅ **CRUD Operations** - Create, read, update, and delete tasks
- 🔍 **Search & Filter** - Find tasks quickly with search and status filters
- 📈 **Progress Tracking** - Visual dashboard showing task completion stats
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile
- 🎨 **Modern UI** - Clean, intuitive interface with Tailwind CSS
- ⚡ **Fast Performance** - Built with Vite for optimal development and build speed

## Quick Start

### 1. Clone and Install

```bash
git clone [your-repo-url]
cd task-manager-app
npm install
```

### 2. Set Up Google Sheets API

#### Enable Google Sheets API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

#### Get API Key
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy your API key

#### Configure Your Sheet
1. Open your Google Sheet: [Your Sheet](https://docs.google.com/spreadsheets/d/15oHiyYMnE-kFx-VUTWIMTEPlqCRD2dR4eFBvfqAIugI/edit)
2. **For READ-ONLY access** (View tasks only):
   - Click "Share" button
   - Set permissions to "Anyone with the link can view"
3. **For WRITE access** (Add/Edit/Delete tasks):
   - Click "Share" button
   - Set permissions to "Anyone with the link can edit"
   - ⚠️ **Security Note**: This makes your sheet publicly editable
4. Ensure your sheet has columns:
   - Column A: Task descriptions
   - Column B: Status (Done, In Progress, Pending, Blocked)

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` file:
```env
VITE_GOOGLE_SHEETS_API_KEY=your_api_key_here
VITE_GOOGLE_SHEET_ID=15oHiyYMnE-kFx-VUTWIMTEPlqCRD2dR4eFBvfqAIugI
```

### 4. Run the Application

```bash
npm run dev
```

Visit `http://localhost:5173` to view the application.

## Project Structure

```
src/
├── components/
│   ├── AddTaskForm.jsx      # Form for adding new tasks
│   ├── TaskFilters.jsx      # Search and filter controls
│   ├── TaskStats.jsx        # Progress dashboard
│   └── TaskTable.jsx        # Main task display table
├── services/
│   └── googleSheets.js      # Google Sheets API integration
├── App.jsx                  # Main application component
├── index.css               # Tailwind CSS imports
└── main.jsx                # React entry point
```

## API Configuration

### Google Sheets API Endpoints Used

- **Read Data**: `GET /v4/spreadsheets/{spreadsheetId}/values/{range}`
- **Update Data**: `PUT /v4/spreadsheets/{spreadsheetId}/values/{range}`
- **Append Data**: `POST /v4/spreadsheets/{spreadsheetId}/values/{range}:append`
- **Delete Rows**: `POST /v4/spreadsheets/{spreadsheetId}:batchUpdate`

### Rate Limiting

The Google Sheets API has the following limits:
- 100 requests per 100 seconds per user
- 500 requests per 100 seconds

The app handles rate limiting gracefully with error messages.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Task Status Options

The application supports these task statuses:
- **Pending** - Not yet started
- **In Progress** - Currently being worked on
- **Done** - Completed
- **Blocked** - Cannot proceed due to dependencies

## Write Access Solutions

### Option 1: Public Edit Access (Simple but Less Secure)
Set your Google Sheet to "Anyone with the link can edit". This allows the app to write data but makes your sheet publicly editable.

### Option 2: OAuth 2.0 Authentication (Recommended for Production)
For better security, implement OAuth 2.0 authentication:

1. **Enable OAuth in Google Cloud Console**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Select "Web application"
   - Add your domain to authorized origins

2. **Install OAuth dependencies**:
   ```bash
   npm install google-auth-library
   ```

3. **Update your .env file**:
   ```env
   VITE_GOOGLE_CLIENT_ID=your_oauth_client_id
   VITE_GOOGLE_CLIENT_SECRET=your_oauth_client_secret
   ```

4. **The app will then require users to sign in with Google for write access**

## Security Notes

- API keys are exposed in the frontend (normal for Google Sheets API with public sheets)
- For sensitive data, always use OAuth 2.0 authentication
- Never commit actual API keys to version control
- Consider using environment-specific API keys for development vs production

## Advanced Configuration

### Custom Sheet Structure

To use a different sheet structure, modify `src/services/googleSheets.js`:

```javascript
const RANGE = 'YourSheetName!A:C'; // Adjust range
const STATUS_COLUMN = 2; // Adjust status column index
```

### OAuth Implementation

For private sheets, implement OAuth 2.0:

```javascript
// Add to googleSheets.js
import { GoogleAuth } from 'google-auth-library';

const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  credentials: {
    // Your OAuth credentials
  }
});
```

## Troubleshooting

### Common Issues

1. **"Failed to load tasks"**
   - Check your API key is correct
   - Verify the sheet is publicly readable
   - Ensure the sheet ID matches your actual sheet

2. **"403 Forbidden"**
   - API key may be restricted
   - Check Google Cloud Console API restrictions

3. **"404 Not Found"**
   - Sheet ID is incorrect
   - Sheet may have been deleted or moved

### Debug Mode

Add to your `.env` file:
```env
VITE_DEBUG=true
```

This enables console logging for API requests.

## Deployment

### Vercel
```bash
npm run build
npx vercel --prod
```

### Netlify
```bash
npm run build
# Upload dist/ folder to Netlify
```

### Environment Variables for Production
Remember to set environment variables in your hosting platform:
- `VITE_GOOGLE_SHEETS_API_KEY`
- `VITE_GOOGLE_SHEET_ID`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check this README
2. Review the troubleshooting section
3. Open an issue on GitHub