import React, { useState } from 'react';
import { User, Users, Settings, Loader2 } from 'lucide-react';
import TeamSelector from './TeamSelector';
import ProductionPersonalDashboard from './ProductionPersonalDashboard';
import ProductionTeamDashboard from './ProductionTeamDashboard';

const Dashboard = ({ 
  currentUser, 
  currentTeam, 
  onTeamChange, 
  onCreateTeam, 
  onMemberRefresh,
  isLoading = false 
}) => {
  // The dashboard automatically switches between personal and team views
  // based on whether a team is selected
  const isTeamView = !!currentTeam;

  if (!currentUser) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Authentication Required</h2>
          <p>Please sign in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 style={{ 
            width: '32px', 
            height: '32px', 
            color: '#3b82f6',
            animation: 'spin 1s linear infinite',
            marginBottom: '16px'
          }} />
          <p style={{ color: '#6b7280' }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (isTeamView) {
    // Show team dashboard when a team is selected
    return (
      <ProductionTeamDashboard
        currentUser={currentUser}
        currentTeam={currentTeam}
        onTeamChange={onTeamChange}
        onCreateTeam={onCreateTeam}
        onMemberRefresh={onMemberRefresh}
      />
    );
  } else {
    // Show personal dashboard when no team is selected
    return (
      <ProductionPersonalDashboard
        currentUser={currentUser}
        currentTeam={currentTeam}
        onTeamChange={onTeamChange}
        onCreateTeam={onCreateTeam}
      />
    );
  }
};

export default Dashboard;