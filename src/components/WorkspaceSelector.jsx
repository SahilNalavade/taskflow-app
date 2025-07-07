import { useState } from 'react';
import { FileSpreadsheet, Plus, ExternalLink, Trash2, RefreshCw } from 'lucide-react';

const WorkspaceSelector = ({ 
  connectedSheets, 
  activeSheet, 
  onSheetSelect, 
  onAddSheet, 
  onRemoveSheet,
  onRefreshSheet 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSheetSelect = (sheet) => {
    onSheetSelect(sheet);
    setShowDropdown(false);
  };

  const handleRemoveSheet = (e, sheetId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to remove this Google Sheet connection?')) {
      onRemoveSheet(sheetId);
    }
  };

  const handleRefreshSheet = (e, sheet) => {
    e.stopPropagation();
    onRefreshSheet(sheet);
  };

  return (
    <div style={{
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(12px)',
      borderRadius: '16px',
      padding: '1.5rem',
      border: '1px solid rgba(226, 232, 240, 0.4)',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
      marginBottom: '2rem'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h3 style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: '#1e293b',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <FileSpreadsheet size={20} />
          Connected Sheets
        </h3>
        
        <button
          onClick={onAddSheet}
          style={{
            background: 'linear-gradient(135deg, #334155 0%, #475569 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          <Plus size={16} />
          Add Sheet
        </button>
      </div>

      {connectedSheets.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '2rem 1rem',
          color: '#64748b'
        }}>
          <FileSpreadsheet size={48} style={{ 
            color: '#cbd5e1', 
            marginBottom: '1rem',
            margin: '0 auto 1rem'
          }} />
          <p style={{
            fontSize: '1rem',
            fontWeight: '500',
            marginBottom: '0.5rem'
          }}>
            No sheets connected yet
          </p>
          <p style={{
            fontSize: '0.875rem',
            color: '#94a3b8'
          }}>
            Connect your Google Sheets to start managing tasks
          </p>
        </div>
      ) : (
        <div>
          {/* Active Sheet Display */}
          {activeSheet && (
            <div style={{
              backgroundColor: 'rgba(59, 130, 246, 0.05)',
              border: '2px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <p style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#1e293b',
                    margin: '0 0 0.25rem 0'
                  }}>
                    📊 {activeSheet.name}
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#64748b',
                    margin: 0
                  }}>
                    Active workspace
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={(e) => handleRefreshSheet(e, activeSheet)}
                    style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Refresh data"
                  >
                    <RefreshCw size={14} style={{ color: '#3b82f6' }} />
                  </button>
                  <a
                    href={activeSheet.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textDecoration: 'none'
                    }}
                    title="Open in Google Sheets"
                  >
                    <ExternalLink size={14} style={{ color: '#3b82f6' }} />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Other Sheets */}
          {connectedSheets.filter(sheet => !activeSheet || sheet.id !== activeSheet.id).length > 0 && (
            <div>
              <p style={{
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#6b7280',
                marginBottom: '0.75rem'
              }}>
                Switch to:
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '0.75rem'
              }}>
                {connectedSheets
                  .filter(sheet => !activeSheet || sheet.id !== activeSheet.id)
                  .map((sheet) => (
                    <div
                      key={sheet.id}
                      onClick={() => handleSheetSelect(sheet)}
                      style={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.borderColor = '#3b82f6';
                        e.target.style.backgroundColor = '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.backgroundColor = 'white';
                      }}
                    >
                      <div>
                        <p style={{
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          color: '#1e293b',
                          margin: '0 0 0.25rem 0'
                        }}>
                          {sheet.name}
                        </p>
                        <p style={{
                          fontSize: '0.75rem',
                          color: '#64748b',
                          margin: 0
                        }}>
                          Added {new Date(sheet.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button
                          onClick={(e) => handleRefreshSheet(e, sheet)}
                          style={{
                            background: 'rgba(107, 114, 128, 0.1)',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '0.25rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Refresh data"
                        >
                          <RefreshCw size={12} style={{ color: '#6b7280' }} />
                        </button>
                        <a
                          href={sheet.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            background: 'rgba(107, 114, 128, 0.1)',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '0.25rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textDecoration: 'none'
                          }}
                          title="Open in Google Sheets"
                        >
                          <ExternalLink size={12} style={{ color: '#6b7280' }} />
                        </a>
                        <button
                          onClick={(e) => handleRemoveSheet(e, sheet.id)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '0.25rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Remove sheet"
                        >
                          <Trash2 size={12} style={{ color: '#ef4444' }} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkspaceSelector;