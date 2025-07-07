import React, { useState, useEffect } from 'react';
import { Search, Plus, FileSpreadsheet, Clock, Users, User, ExternalLink, RefreshCw, Loader2, Filter } from 'lucide-react';
import { googleAuthService } from '../services/googleAuth';

const SheetBrowser = ({ onSheetSelect, onClose }) => {
  console.log('SheetBrowser component is rendering!');
  
  const [sheets, setSheets] = useState([]);
  const [filteredSheets, setFilteredSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'owned', 'shared'
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadUserSheets();
  }, []);

  useEffect(() => {
    filterSheets();
  }, [sheets, searchTerm, filterType]);

  const loadUserSheets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('SheetBrowser: Starting to load user sheets...');
      console.log('SheetBrowser: Auth service signed in?', googleAuthService.isSignedIn());
      
      const userSheets = await googleAuthService.getUserSheets();
      console.log('SheetBrowser: Received sheets:', userSheets);
      setSheets(userSheets);
    } catch (err) {
      console.error('SheetBrowser: Error loading sheets:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterSheets = () => {
    let filtered = sheets;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(sheet =>
        sheet.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType === 'owned') {
      filtered = filtered.filter(sheet => sheet.isOwner);
    } else if (filterType === 'shared') {
      filtered = filtered.filter(sheet => !sheet.isOwner || sheet.isShared);
    }

    setFilteredSheets(filtered);
  };

  const handleCreateNewSheet = async () => {
    try {
      setCreating(true);
      const newSheet = await googleAuthService.createNewSheet('My Tasks');
      
      // Add to the beginning of the list
      const updatedSheets = [newSheet, ...sheets];
      setSheets(updatedSheets);
      
      // Auto-select the new sheet
      if (onSheetSelect) {
        onSheetSelect({
          id: newSheet.id,
          name: newSheet.name,
          url: newSheet.url
        });
      }
    } catch (err) {
      setError('Failed to create new sheet: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleSheetSelect = (sheet) => {
    if (onSheetSelect) {
      onSheetSelect({
        id: sheet.id,
        name: sheet.name,
        url: sheet.url
      });
    }
  };

  const getSheetTypeIcon = (sheet) => {
    if (sheet.isOwner && !sheet.isShared) {
      return <User style={{ width: '14px', height: '14px', color: '#10b981' }} />;
    } else {
      return <Users style={{ width: '14px', height: '14px', color: '#3b82f6' }} />;
    }
  };

  const getSheetTypeLabel = (sheet) => {
    if (sheet.isOwner && !sheet.isShared) {
      return 'Personal';
    } else if (sheet.isOwner && sheet.isShared) {
      return 'Owned & Shared';
    } else {
      return 'Shared with me';
    }
  };

  console.log('SheetBrowser render - sheets:', sheets.length, 'filteredSheets:', filteredSheets.length, 'loading:', loading, 'error:', error);

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
      padding: '20px'
    }}
    onClick={(e) => {
      // Close modal if clicking on backdrop
      if (e.target === e.currentTarget) {
        console.log('Backdrop clicked, closing modal');
        onClose();
      }
    }}
    >
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '0',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '80vh',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
              Choose a Google Sheet
            </h2>
            <button
              onClick={onClose}
              style={{
                padding: '8px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              ✕
            </button>
          </div>

          {/* Search and Filters */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                color: '#6b7280'
              }} />
              <input
                type="text"
                placeholder="Search your sheets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 40px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="all">All Sheets</option>
              <option value="owned">My Sheets</option>
              <option value="shared">Shared</option>
            </select>

            <button
              onClick={loadUserSheets}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <RefreshCw style={{ width: '14px', height: '14px' }} />
              Refresh
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', maxHeight: '60vh', overflowY: 'auto' }}>
          {/* Create New Sheet Button */}
          <button
            onClick={handleCreateNewSheet}
            disabled={creating}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              width: '100%',
              padding: '16px',
              backgroundColor: creating ? '#f3f4f6' : '#f0f9ff',
              border: '2px dashed #3b82f6',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              color: creating ? '#9ca3af' : '#3b82f6',
              cursor: creating ? 'not-allowed' : 'pointer',
              marginBottom: '24px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!creating) {
                e.target.style.backgroundColor = '#dbeafe';
              }
            }}
            onMouseLeave={(e) => {
              if (!creating) {
                e.target.style.backgroundColor = '#f0f9ff';
              }
            }}
          >
            {creating ? (
              <>
                <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
                Creating new sheet...
              </>
            ) : (
              <>
                <Plus style={{ width: '20px', height: '20px' }} />
                Create New Task Sheet
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px'
            }}>
              <div style={{ marginBottom: '8px' }}>{error}</div>
              <button
                onClick={async () => {
                  try {
                    console.log('Re-authorizing with fresh permissions...');
                    setLoading(true);
                    setError(null);
                    
                    // Clear all stored auth data
                    await googleAuthService.signOut();
                    
                    // Reinitialize and sign in
                    await googleAuthService.initialize();
                    await googleAuthService.signIn();
                    
                    // Reload sheets
                    await loadUserSheets();
                  } catch (err) {
                    console.error('Re-authorization error:', err);
                    setError(`Re-authorization failed: ${err.message}`);
                    setLoading(false);
                  }
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Re-authorize Google Account
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '48px',
              color: '#6b7280'
            }}>
              <Loader2 style={{ width: '24px', height: '24px', animation: 'spin 1s linear infinite', marginRight: '12px' }} />
              Loading your Google Sheets...
            </div>
          )}

          {/* Sheets Grid */}
          {!loading && filteredSheets.length > 0 && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '16px'
            }}>
              {filteredSheets.map((sheet) => (
                <div
                  key={sheet.id}
                  onClick={() => handleSheetSelect(sheet)}
                  style={{
                    padding: '16px',
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px 0 rgba(59, 130, 246, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                  }}
                >
                  {/* Sheet Header */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                      <FileSpreadsheet style={{ width: '20px', height: '20px', color: '#10b981', flexShrink: 0 }} />
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#111827',
                        margin: 0,
                        lineHeight: '1.2',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {sheet.name}
                      </h3>
                    </div>
                    <a
                      href={sheet.webViewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        padding: '4px',
                        color: '#6b7280',
                        textDecoration: 'none'
                      }}
                    >
                      <ExternalLink style={{ width: '14px', height: '14px' }} />
                    </a>
                  </div>

                  {/* Sheet Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    {getSheetTypeIcon(sheet)}
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                      {getSheetTypeLabel(sheet)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>
                      Modified {sheet.lastModified}
                    </span>
                  </div>

                  {sheet.isNew && (
                    <div style={{
                      marginTop: '8px',
                      padding: '4px 8px',
                      backgroundColor: '#10b981',
                      color: 'white',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: '600',
                      display: 'inline-block'
                    }}>
                      NEW
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredSheets.length === 0 && !error && (
            <div style={{
              textAlign: 'center',
              padding: '48px',
              color: '#6b7280'
            }}>
              <FileSpreadsheet style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#d1d5db' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                {searchTerm ? 'No sheets found' : 'No Google Sheets yet'}
              </h3>
              <p style={{ margin: 0, fontSize: '14px' }}>
                {searchTerm 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Create your first sheet or check if you have permission to view shared sheets'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SheetBrowser;