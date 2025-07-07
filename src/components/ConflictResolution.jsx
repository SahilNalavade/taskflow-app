import React, { useState, useEffect } from 'react';
import { AlertTriangle, Check, X, Users, Clock } from 'lucide-react';
import { realtimeEngine } from '../services/realtimeEngine';

const ConflictResolution = () => {
  const [conflicts, setConflicts] = useState([]);

  useEffect(() => {
    // Listen for conflict events
    const unsubscribeConflictRequired = realtimeEngine.on('conflict_resolution_required', (data) => {
      const newConflict = {
        ...data,
        showResolution: true,
        autoResolveTimer: 10
      };
      
      setConflicts(prev => [...prev, newConflict]);
      
      // Start countdown timer
      const timer = setInterval(() => {
        setConflicts(prev => prev.map(c => 
          c.conflictId === data.conflictId 
            ? { ...c, autoResolveTimer: Math.max(0, c.autoResolveTimer - 1) }
            : c
        ));
      }, 1000);
      
      // Clean up timer after 10 seconds
      setTimeout(() => {
        clearInterval(timer);
      }, 10000);
    });

    const unsubscribeConflictResolved = realtimeEngine.on('conflict_auto_resolved', (data) => {
      setConflicts(prev => prev.filter(c => c.conflictId !== data.conflictId));
    });

    const unsubscribeConflictDetected = realtimeEngine.on('conflict_detected', (data) => {
      // Show initial conflict notification
      setConflicts(prev => [...prev, {
        ...data,
        showResolution: false,
        type: 'detected'
      }]);

      // Remove notification after 3 seconds
      setTimeout(() => {
        setConflicts(prev => prev.filter(c => c.timestamp !== data.timestamp));
      }, 3000);
    });

    return () => {
      unsubscribeConflictRequired();
      unsubscribeConflictResolved();
      unsubscribeConflictDetected();
    };
  }, []);

  const handleResolveConflict = (conflictId, resolution, selectedVersion) => {
    realtimeEngine.emit('conflict_resolved', {
      conflictId: conflictId,
      resolution: resolution,
      selectedVersion: selectedVersion,
      resolvedBy: realtimeEngine.userId
    });

    setConflicts(prev => prev.filter(c => c.conflictId !== conflictId));
  };

  const renderConflictNotification = (conflict) => (
    <div
      key={conflict.timestamp}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: '#fef3c7',
        border: '1px solid #f59e0b',
        borderRadius: '8px',
        padding: '12px 16px',
        boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.15)',
        zIndex: 2000,
        maxWidth: '300px',
        animation: 'slide-in 0.3s ease-out'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <AlertTriangle style={{ width: '16px', height: '16px', color: '#f59e0b' }} />
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#92400e' }}>
          Edit Conflict Detected
        </span>
      </div>
      <p style={{ fontSize: '12px', color: '#92400e', margin: 0 }}>
        Multiple users are editing the same task. Resolving automatically...
      </p>
    </div>
  );

  const renderConflictResolution = (conflict) => (
    <div
      key={conflict.conflictId}
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        zIndex: 2000,
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto'
      }}
    >
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          backgroundColor: '#fef3c7',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <AlertTriangle style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
        </div>
        <div>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#111827',
            margin: 0,
            marginBottom: '4px'
          }}>
            Conflict Resolution Required
          </h3>
          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            Multiple users edited the same task simultaneously
          </p>
        </div>
      </div>

      {/* Conflict Details */}
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
          Choose which version to keep:
        </h4>

        {/* Local Version */}
        <div style={{
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '12px',
          backgroundColor: '#f8fafc'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#3b82f6' }}>
              Your Version
            </span>
            <span style={{ fontSize: '11px', color: '#6b7280' }}>
              {new Date(conflict.localChange.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <p style={{ 
            fontSize: '14px', 
            color: '#374151', 
            margin: 0,
            backgroundColor: 'white',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #d1d5db'
          }}>
            {conflict.localChange.field}: "{conflict.localChange.value}"
          </p>
          <button
            onClick={() => handleResolveConflict(conflict.conflictId, 'keep_local', conflict.localChange)}
            style={{
              marginTop: '8px',
              padding: '6px 12px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Check style={{ width: '12px', height: '12px' }} />
            Keep This Version
          </button>
        </div>

        {/* Remote Version */}
        <div style={{
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          padding: '16px',
          backgroundColor: '#fef3c7'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#f59e0b' }}>
              {conflict.remoteChange.userName || 'Other User'}'s Version
            </span>
            <span style={{ fontSize: '11px', color: '#6b7280' }}>
              {new Date(conflict.remoteChange.timestamp).toLocaleTimeString()}
            </span>
          </div>
          <p style={{ 
            fontSize: '14px', 
            color: '#374151', 
            margin: 0,
            backgroundColor: 'white',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #d1d5db'
          }}>
            {conflict.remoteChange.field}: "{conflict.remoteChange.value}"
          </p>
          <button
            onClick={() => handleResolveConflict(conflict.conflictId, 'keep_remote', conflict.remoteChange)}
            style={{
              marginTop: '8px',
              padding: '6px 12px',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Check style={{ width: '12px', height: '12px' }} />
            Keep This Version
          </button>
        </div>
      </div>

      {/* Auto-resolve warning */}
      <div style={{
        backgroundColor: '#f3f4f6',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        padding: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Clock style={{ width: '14px', height: '14px', color: '#6b7280' }} />
        <span style={{ fontSize: '12px', color: '#6b7280' }}>
          This conflict will auto-resolve in {conflict.autoResolveTimer || 10} seconds if no action is taken
        </span>
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );

  return (
    <>
      {conflicts.map(conflict => 
        conflict.showResolution 
          ? renderConflictResolution(conflict)
          : renderConflictNotification(conflict)
      )}
    </>
  );
};

export default ConflictResolution;