import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, Check, AlertTriangle, Loader } from 'lucide-react';
import { realtimeEngine } from '../services/realtimeEngine';
import { sheetSyncService } from '../services/sheetSyncService';

const SyncStatusIndicator = ({ compact = true }) => {
  const [syncStatus, setSyncStatus] = useState({
    enabled: false,
    status: 'idle',
    pendingCount: 0,
    lastSync: null
  });
  const [showDetails, setShowDetails] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    // Get initial status
    setSyncStatus(sheetSyncService.getSyncStatus());

    // Listen for sync status changes
    const unsubscribeStatus = realtimeEngine.on('sync_status_changed', (data) => {
      setSyncStatus(prev => ({ ...prev, ...data }));
    });

    const unsubscribeCompleted = realtimeEngine.on('sync_completed', (data) => {
      setRecentActivity(prev => [
        { type: 'success', message: `Synced ${data.changesSynced} changes`, time: new Date() },
        ...prev.slice(0, 4)
      ]);
    });

    const unsubscribeFailed = realtimeEngine.on('sync_failed', (data) => {
      setRecentActivity(prev => [
        { type: 'error', message: `Sync failed: ${data.error}`, time: new Date() },
        ...prev.slice(0, 4)
      ]);
    });

    const unsubscribePending = realtimeEngine.on('sync_pending_changes', (data) => {
      setSyncStatus(prev => ({ ...prev, pendingCount: data.count }));
    });

    const unsubscribeSheetUpdate = realtimeEngine.on('sheet_update_received', (data) => {
      setRecentActivity(prev => [
        { type: 'info', message: 'Received update from Google Sheets', time: new Date() },
        ...prev.slice(0, 4)
      ]);
    });

    return () => {
      unsubscribeStatus();
      unsubscribeCompleted();
      unsubscribeFailed();
      unsubscribePending();
      unsubscribeSheetUpdate();
    };
  }, []);

  const getStatusIcon = () => {
    switch (syncStatus.status) {
      case 'syncing':
        return <Loader style={{ width: '14px', height: '14px', animation: 'spin 1s linear infinite' }} />;
      case 'success':
        return <Check style={{ width: '14px', height: '14px' }} />;
      case 'error':
        return <AlertTriangle style={{ width: '14px', height: '14px' }} />;
      default:
        return syncStatus.enabled ? 
          <Cloud style={{ width: '14px', height: '14px' }} /> : 
          <CloudOff style={{ width: '14px', height: '14px' }} />;
    }
  };

  const getStatusColor = () => {
    switch (syncStatus.status) {
      case 'syncing': return '#3b82f6';
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      default: return syncStatus.enabled ? '#6b7280' : '#9ca3af';
    }
  };

  const getStatusText = () => {
    if (!syncStatus.enabled) return 'Sync disabled';
    
    switch (syncStatus.status) {
      case 'syncing': return `Syncing ${syncStatus.pendingCount} changes...`;
      case 'success': return 'Synced';
      case 'error': return 'Sync error';
      default: 
        return syncStatus.pendingCount > 0 ? 
          `${syncStatus.pendingCount} pending` : 
          'Up to date';
    }
  };

  const formatTime = (time) => {
    return time ? new Date(time).toLocaleTimeString() : 'Never';
  };

  const toggleSync = () => {
    if (syncStatus.enabled) {
      sheetSyncService.disableAutoSync();
    } else {
      sheetSyncService.enableAutoSync();
    }
  };

  if (compact) {
    return (
      <div 
        style={{
          position: 'relative',
          display: 'inline-block'
        }}
        onMouseEnter={() => setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 10px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          fontSize: '12px',
          color: getStatusColor(),
          cursor: 'pointer'
        }}>
          {getStatusIcon()}
          <span>{getStatusText()}</span>
          {syncStatus.pendingCount > 0 && (
            <span style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              borderRadius: '10px',
              padding: '2px 6px',
              fontSize: '10px',
              fontWeight: '600',
              minWidth: '18px',
              textAlign: 'center'
            }}>
              {syncStatus.pendingCount}
            </span>
          )}
        </div>

        {showDetails && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: '0',
            marginTop: '8px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '12px',
            boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            minWidth: '200px',
            fontSize: '12px'
          }}>
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>Google Sheets Sync</div>
              <div style={{ color: '#6b7280' }}>
                Last sync: {formatTime(syncStatus.lastSync)}
              </div>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <button
                onClick={toggleSync}
                style={{
                  padding: '4px 8px',
                  backgroundColor: syncStatus.enabled ? '#ef4444' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  marginRight: '8px'
                }}
              >
                {syncStatus.enabled ? 'Disable' : 'Enable'}
              </button>
              
              <button
                onClick={() => sheetSyncService.triggerManualSync()}
                disabled={!syncStatus.enabled || syncStatus.status === 'syncing'}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '11px',
                  cursor: syncStatus.enabled ? 'pointer' : 'not-allowed',
                  opacity: (!syncStatus.enabled || syncStatus.status === 'syncing') ? 0.5 : 1
                }}
              >
                Sync Now
              </button>
            </div>

            {recentActivity.length > 0 && (
              <div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>Recent Activity</div>
                {recentActivity.map((activity, index) => (
                  <div key={index} style={{
                    padding: '4px 0',
                    borderBottom: index < recentActivity.length - 1 ? '1px solid #f3f4f6' : 'none'
                  }}>
                    <div style={{
                      color: activity.type === 'error' ? '#ef4444' : 
                             activity.type === 'success' ? '#10b981' : '#6b7280',
                      fontSize: '11px'
                    }}>
                      {activity.message}
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: '10px' }}>
                      {activity.time.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Full detail view (for settings page, etc.)
  return (
    <div style={{
      backgroundColor: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>Google Sheets Sync</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: getStatusColor() }}>
          {getStatusIcon()}
          <span style={{ fontSize: '14px' }}>{getStatusText()}</span>
        </div>
      </div>

      <div style={{ marginBottom: '12px', color: '#6b7280', fontSize: '14px' }}>
        Automatically sync team tasks with your Google Sheet in real-time.
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={toggleSync}
          style={{
            padding: '8px 16px',
            backgroundColor: syncStatus.enabled ? '#ef4444' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          {syncStatus.enabled ? 'Disable Sync' : 'Enable Sync'}
        </button>
        
        <button
          onClick={() => sheetSyncService.triggerManualSync()}
          disabled={!syncStatus.enabled || syncStatus.status === 'syncing'}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f3f4f6',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            cursor: syncStatus.enabled ? 'pointer' : 'not-allowed',
            opacity: (!syncStatus.enabled || syncStatus.status === 'syncing') ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <RefreshCw style={{ width: '14px', height: '14px' }} />
          Sync Now
        </button>
      </div>

      <div style={{ fontSize: '12px', color: '#6b7280' }}>
        <div>Last sync: {formatTime(syncStatus.lastSync)}</div>
        <div>Pending changes: {syncStatus.pendingCount}</div>
      </div>
    </div>
  );
};

export default SyncStatusIndicator;