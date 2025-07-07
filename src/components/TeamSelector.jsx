import React, { useState, useEffect } from 'react';
import { ChevronDown, Users, Plus, Building2 } from 'lucide-react';
import { enhancedTeamService } from '../services/enhancedTeamService';

const TeamSelector = ({ currentUser, currentTeam, onTeamChange, onCreateTeam }) => {
  const [userTeams, setUserTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [storageInfo, setStorageInfo] = useState({});

  useEffect(() => {
    loadUserTeams();
    getStorageInfo();
  }, [currentUser]);

  const loadUserTeams = async () => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    try {
      const teams = await enhancedTeamService.getUserTeams(currentUser.id);
      setUserTeams(teams);
    } catch (error) {
      console.error('Error loading user teams:', error);
      setUserTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const getStorageInfo = async () => {
    const info = enhancedTeamService.getStorageInfo();
    setStorageInfo(info);
  };

  const handleTeamSelect = (team) => {
    setShowDropdown(false);
    if (onTeamChange) {
      onTeamChange(team);
    }
  };

  const handlePersonalMode = () => {
    setShowDropdown(false);
    if (onTeamChange) {
      onTeamChange(null); // null indicates personal mode
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
        <div className="w-6 h-6 bg-gray-300 rounded animate-pulse"></div>
        <div className="w-24 h-4 bg-gray-300 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Current Selection */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors min-w-[200px]"
      >
        <div className="flex-shrink-0">
          {currentTeam ? (
            <Users className="w-5 h-5 text-blue-600" />
          ) : (
            <Building2 className="w-5 h-5 text-gray-600" />
          )}
        </div>
        
        <div className="flex-1 text-left">
          <div className="font-medium text-sm">
            {currentTeam ? currentTeam.name || currentTeam.Name || 'Team' : 'Personal'}
          </div>
          <div className="text-xs text-gray-500">
            {currentTeam ? `${currentTeam.userRole || 'Member'}` : 'Personal workspace'}
          </div>
        </div>
        
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Personal Mode */}
          <button
            onClick={handlePersonalMode}
            className={`w-full flex items-center gap-2 p-3 hover:bg-gray-50 transition-colors ${
              !currentTeam ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
            }`}
          >
            <Building2 className="w-4 h-4 text-gray-600" />
            <div className="flex-1 text-left">
              <div className="font-medium text-sm">Personal</div>
              <div className="text-xs text-gray-500">Your personal workspace</div>
            </div>
          </button>

          {/* Teams */}
          {userTeams.length > 0 && (
            <>
              <div className="border-t border-gray-100 my-1"></div>
              <div className="px-3 py-2">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Teams</div>
              </div>
              
              {userTeams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => handleTeamSelect(team)}
                  className={`w-full flex items-center gap-2 p-3 hover:bg-gray-50 transition-colors ${
                    currentTeam?.id === team.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                  }`}
                >
                  <Users className="w-4 h-4 text-blue-600" />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-sm">{team.name || team.Name}</div>
                    <div className="text-xs text-gray-500">{team.userRole || 'Member'}</div>
                  </div>
                </button>
              ))}
            </>
          )}

          {/* Create Team Option */}
          {onCreateTeam && (
            <>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={() => {
                  setShowDropdown(false);
                  onCreateTeam();
                }}
                className="w-full flex items-center gap-2 p-3 hover:bg-gray-50 transition-colors text-blue-600"
              >
                <Plus className="w-4 h-4" />
                <div className="text-sm font-medium">Create Team</div>
              </button>
            </>
          )}

          {/* Storage Info (Debug) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="border-t border-gray-100 p-2">
              <div className="text-xs text-gray-400">
                Backend: {storageInfo.backend || 'Unknown'}
                {storageInfo.airtableAvailable && (
                  <span className={`ml-2 ${storageInfo.backend === 'Airtable' ? 'text-green-600' : 'text-orange-600'}`}>
                    ●
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default TeamSelector;