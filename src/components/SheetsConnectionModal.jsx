import { useState } from 'react';
import { X, Plus, ExternalLink, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';

const SheetsConnectionModal = ({ isOpen, onClose, onConnect, user }) => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [sheetName, setSheetName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Extract sheet ID from URL
      const urlMatch = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!urlMatch) {
        throw new Error('Invalid Google Sheets URL. Please check the format.');
      }

      const sheetId = urlMatch[1];
      
      // Test connection
      const testUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?key=${apiKey}`;
      const response = await fetch(testUrl);
      
      if (!response.ok) {
        throw new Error('Failed to connect to Google Sheets. Please check your API key and sheet permissions.');
      }

      const sheetData = await response.json();
      
      const newSheet = {
        id: sheetId,
        name: sheetName || sheetData.properties?.title || 'Untitled Sheet',
        url: sheetUrl,
        apiKey: apiKey,
        createdAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString()
      };

      // Save to user's connected sheets
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (!savedUser.connectedSheets) {
        savedUser.connectedSheets = [];
      }
      
      // Check if sheet already exists
      const existingIndex = savedUser.connectedSheets.findIndex(s => s.id === sheetId);
      if (existingIndex >= 0) {
        savedUser.connectedSheets[existingIndex] = newSheet;
      } else {
        savedUser.connectedSheets.push(newSheet);
      }
      
      localStorage.setItem('user', JSON.stringify(savedUser));
      
      onConnect(newSheet);
      resetForm();
      onClose();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSheetUrl('');
    setSheetName('');
    setApiKey('');
    setError('');
    setStep(1);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '2rem',
        width: '100%',
        maxWidth: '500px',
        margin: '1rem',
        boxShadow: '0 24px 48px rgba(0, 0, 0, 0.12)',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            padding: '0.5rem',
            cursor: 'pointer',
            borderRadius: '8px',
            color: '#64748b'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #334155 0%, #475569 100%)',
            borderRadius: '50%',
            padding: '1rem',
            width: '60px',
            height: '60px',
            margin: '0 auto 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileSpreadsheet size={28} style={{ color: 'white' }} />
          </div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '0.5rem'
          }}>
            Connect Google Sheets
          </h2>
          <p style={{
            color: '#64748b',
            fontSize: '0.875rem'
          }}>
            Import your existing Google Sheets to manage tasks directly in TaskFlow
          </p>
        </div>

        {step === 1 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '1rem'
            }}>
              Step 1: Get your Google Sheets API Key
            </h3>
            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1.5rem'
            }}>
              <ol style={{
                margin: 0,
                paddingLeft: '1.5rem',
                color: '#374151',
                fontSize: '0.875rem',
                lineHeight: '1.6'
              }}>
                <li style={{ marginBottom: '0.5rem' }}>Go to <a href="https://console.developers.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#334155', textDecoration: 'underline' }}>Google Cloud Console</a></li>
                <li style={{ marginBottom: '0.5rem' }}>Create a new project or select existing one</li>
                <li style={{ marginBottom: '0.5rem' }}>Enable the "Google Sheets API"</li>
                <li style={{ marginBottom: '0.5rem' }}>Create credentials → API Key</li>
                <li>Copy your API key</li>
              </ol>
            </div>
            <button
              onClick={() => setStep(2)}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: 'linear-gradient(135deg, #334155 0%, #475569 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              I have my API Key
            </button>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Google Sheets URL *
              </label>
              <input
                type="url"
                value={sheetUrl}
                onChange={(e) => setSheetUrl(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box'
                }}
                placeholder="https://docs.google.com/spreadsheets/d/..."
              />
              <p style={{
                fontSize: '0.75rem',
                color: '#64748b',
                marginTop: '0.25rem',
                margin: '0.25rem 0 0 0'
              }}>
                Paste the full URL of your Google Sheet
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Sheet Name (optional)
              </label>
              <input
                type="text"
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box'
                }}
                placeholder="My Project Tasks"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Google Sheets API Key *
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  boxSizing: 'border-box'
                }}
                placeholder="AIzaSy..."
              />
              <p style={{
                fontSize: '0.75rem',
                color: '#64748b',
                marginTop: '0.25rem',
                margin: '0.25rem 0 0 0'
              }}>
                Your API key will be stored securely in your browser
              </p>
            </div>

            <div style={{
              backgroundColor: '#fef3cd',
              border: '1px solid #fde68a',
              borderRadius: '8px',
              padding: '0.75rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} style={{ color: '#92400e', marginTop: '0.125rem' }} />
              <div style={{ fontSize: '0.875rem', color: '#92400e' }}>
                <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500' }}>For editing tasks:</p>
                <p style={{ margin: 0 }}>
                  API keys only allow reading. To edit tasks, you'll need to set up Google Apps Script 
                  (we'll guide you through this after connecting).
                </p>
              </div>
            </div>

            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '0.75rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem'
              }}>
                <AlertCircle size={16} style={{ color: '#ef4444', marginTop: '0.125rem' }} />
                <p style={{
                  fontSize: '0.875rem',
                  color: '#dc2626',
                  margin: 0
                }}>
                  {error}
                </p>
              </div>
            )}

            <div style={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '8px',
              padding: '0.75rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} style={{ color: '#0369a1', marginTop: '0.125rem' }} />
              <div style={{ fontSize: '0.875rem', color: '#0c4a6e' }}>
                <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500' }}>Important:</p>
                <p style={{ margin: 0 }}>
                  Make sure your Google Sheet is publicly viewable or shared with the API service account for read access.
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '0.75rem'
            }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  flex: 1,
                  padding: '0.875rem',
                  background: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  flex: 2,
                  padding: '0.875rem',
                  background: loading ? '#9ca3af' : 'linear-gradient(135deg, #334155 0%, #475569 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Connecting...' : 'Connect Sheet'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SheetsConnectionModal;