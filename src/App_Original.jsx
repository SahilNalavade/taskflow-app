import { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, TrendingUp, Eye, CheckCircle2, Clock, AlertTriangle, XCircle, Calendar, BarChart3, Grid, List, Search, Filter, Zap, Target, Award, Activity, User, Settings, LogOut, Plus, FileSpreadsheet, Shield, Users, MessageSquare } from 'lucide-react';
import { multiSheetService } from './services/multiSheetService';
import { teamService } from './services/teamService';
import { createDemoTeam } from './utils/demoTeamSetup';
import GoogleSignIn from './components/GoogleSignIn';
import OnboardingWizard from './components/OnboardingWizard';
import SheetsConnectionModal from './components/SheetsConnectionModal';
import WorkspaceSelector from './components/WorkspaceSelector';
import EditableTaskCard from './components/EditableTaskCard';
import GoogleAuthSetup from './components/GoogleAuthSetup';
import AddTaskCard from './components/AddTaskCard';
import DailyStandupInterface from './components/DailyStandupInterface';

function App() {
  // Authentication state
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [appMode, setAppMode] = useState(null); // 'personal' or 'team'
  
  // App state
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('dashboard');
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  // Sheet management state
  const [connectedSheets, setConnectedSheets] = useState([]);
  const [activeSheet, setActiveSheet] = useState(null);
  const [showSheetsModal, setShowSheetsModal] = useState(false);
  const [currentSheetService, setCurrentSheetService] = useState(null);
  const [showGoogleAuthSetup, setShowGoogleAuthSetup] = useState(false);
  
  // Team management state
  const [userTeams, setUserTeams] = useState([]);
  const [currentTeam, setCurrentTeam] = useState(null);
  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('user');
    const savedMode = localStorage.getItem('appMode');
    
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsAuthenticated(true);
      
      if (savedMode) {
        setAppMode(savedMode);
        
        // Load app data based on mode
        if (savedMode === 'personal' || savedMode === 'team') {
          loadAppData(userData, savedMode);
        }
      } else {
        // User needs to select mode
        setShowOnboarding(true);
      }
      
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const loadAppData = (userData, mode) => {
    // Load connected sheets
    const sheets = multiSheetService.getUserSheets(userData.id);
    setConnectedSheets(sheets);
    
    // Set active sheet (first one or previously selected)
    if (sheets.length > 0) {
      const lastActiveSheetId = localStorage.getItem('activeSheetId');
      const lastActiveSheet = sheets.find(s => s.id === lastActiveSheetId) || sheets[0];
      setActiveSheet(lastActiveSheet);
      setCurrentSheetService(multiSheetService.getSheetService(lastActiveSheet));
    }
    
    if (mode === 'team') {
      // Load user teams
      const teams = teamService.getUserTeams(userData.id);
      setUserTeams(teams);
      
      // Set active team (first one or previously selected)
      if (teams.length > 0) {
        const lastActiveTeamId = localStorage.getItem('activeTeamId');
        const lastActiveTeam = teams.find(t => t.id === lastActiveTeamId) || teams[0];
        setCurrentTeam(lastActiveTeam);
      }
    }
  };

  useEffect(() => {
    if (isAuthenticated && currentSheetService) {
      loadTasks();
    }
  }, [isAuthenticated, currentSheetService]);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchTerm, statusFilter]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('[data-user-menu]')) {
        setShowUserMenu(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu]);

  const loadTasks = async () => {
    if (!currentSheetService) {
      setTasks([]);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const fetchedTasks = await currentSheetService.getAllTasks();
      setTasks(fetchedTasks);
      setLastRefresh(new Date());
      
      // Update last accessed time
      if (activeSheet && user) {
        multiSheetService.updateSheetAccess(user.id, activeSheet.id);
      }
    } catch (err) {
      setError('Failed to load tasks. Please check your connection and try again.');
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = tasks;

    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.task.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'All') {
      if (statusFilter === 'complete') {
        filtered = filtered.filter(task => 
          task.status?.toLowerCase() === 'complete' || 
          task.status?.toLowerCase() === 'done'
        );
      } else {
        filtered = filtered.filter(task => task.status === statusFilter);
      }
    }

    setFilteredTasks(filtered);
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter(task => 
      task.status?.toLowerCase() === 'complete' || 
      task.status?.toLowerCase() === 'done'
    ).length,
    inProgress: tasks.filter(task => task.status === 'In Progress').length,
    pending: tasks.filter(task => task.status === 'Pending').length,
    blocked: tasks.filter(task => task.status === 'Blocked').length,
    filtered: filteredTasks.length
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  // Authentication handlers
  const handleGetStarted = () => {
    // Landing page will show GoogleSignIn component
  };

  const handleGoogleAuthSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setShowOnboarding(true);
  };

  const handleModeSelect = (selectedMode) => {
    setAppMode(selectedMode);
    setShowOnboarding(false);
    localStorage.setItem('appMode', selectedMode);
    
    if (user) {
      loadAppData(user, selectedMode);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('activeSheetId');
    localStorage.removeItem('activeTeamId');
    localStorage.removeItem('appMode');
    setUser(null);
    setIsAuthenticated(false);
    setAppMode(null);
    setShowOnboarding(false);
    setTasks([]);
    setFilteredTasks([]);
    setConnectedSheets([]);
    setActiveSheet(null);
    setCurrentSheetService(null);
    setUserTeams([]);
    setCurrentTeam(null);
    setShowUserMenu(false);
  };

  // Sheet management handlers
  const handleSheetConnect = async (sheetConfig) => {
    if (!user) return;
    
    try {
      await multiSheetService.addSheetConnection(user.id, sheetConfig);
      const updatedSheets = multiSheetService.getUserSheets(user.id);
      setConnectedSheets(updatedSheets);
      
      // Set as active sheet
      setActiveSheet(sheetConfig);
      setCurrentSheetService(multiSheetService.getSheetService(sheetConfig));
      localStorage.setItem('activeSheetId', sheetConfig.id);
    } catch (error) {
      console.error('Error connecting sheet:', error);
    }
  };

  const handleSheetSelect = (sheet) => {
    setActiveSheet(sheet);
    setCurrentSheetService(multiSheetService.getSheetService(sheet));
    localStorage.setItem('activeSheetId', sheet.id);
  };

  const handleSheetRemove = (sheetId) => {
    if (!user) return;
    
    multiSheetService.removeSheetConnection(user.id, sheetId);
    const updatedSheets = multiSheetService.getUserSheets(user.id);
    setConnectedSheets(updatedSheets);
    
    // If removed sheet was active, switch to first available
    if (activeSheet && activeSheet.id === sheetId) {
      if (updatedSheets.length > 0) {
        const newActiveSheet = updatedSheets[0];
        setActiveSheet(newActiveSheet);
        setCurrentSheetService(multiSheetService.getSheetService(newActiveSheet));
        localStorage.setItem('activeSheetId', newActiveSheet.id);
      } else {
        setActiveSheet(null);
        setCurrentSheetService(null);
        localStorage.removeItem('activeSheetId');
        setTasks([]);
      }
    }
  };

  const handleRefreshSheet = async (sheet) => {
    if (sheet.id === activeSheet?.id) {
      await loadTasks();
    }
  };

  // Task management handlers
  const handleTaskUpdate = async (taskId, updateData) => {
    if (!currentSheetService) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    try {
      await currentSheetService.updateTask(task.rowIndex, updateData.task, updateData.status);
      await loadTasks(); // Refresh tasks
    } catch (error) {
      console.error('Error updating task:', error);
      if (error.message.includes('Please sign in with Google') || error.message.includes('401') || error.message.includes('403')) {
        setShowGoogleAuthSetup(true);
      }
      throw error;
    }
  };

  const handleTaskDelete = async (taskId) => {
    if (!currentSheetService) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    try {
      await currentSheetService.deleteTask(task.rowIndex);
      await loadTasks(); // Refresh tasks
    } catch (error) {
      console.error('Error deleting task:', error);
      if (error.message.includes('Please sign in with Google') || error.message.includes('401') || error.message.includes('403')) {
        setShowGoogleAuthSetup(true);
      }
      throw error;
    }
  };

  const handleAddTask = async (taskText, status = 'Pending') => {
    if (!currentSheetService) return;
    
    try {
      await currentSheetService.addTask(taskText, status);
      await loadTasks(); // Refresh tasks
    } catch (error) {
      console.error('Error adding task:', error);
      if (error.message.includes('Please sign in with Google') || error.message.includes('401') || error.message.includes('403')) {
        setShowGoogleAuthSetup(true);
      }
      throw error;
    }
  };

  // Show Google Sign-In if not authenticated
  if (!isAuthenticated && !loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <GoogleSignIn 
          onAuthSuccess={handleGoogleAuthSuccess}
          onError={(error) => console.error('Auth error:', error)}
        />
      </div>
    );
  }

  // Show onboarding if authenticated but no mode selected
  if (isAuthenticated && showOnboarding && user) {
    return (
      <OnboardingWizard 
        user={user}
        onModeSelect={handleModeSelect}
      />
    );
  }

  const dynamicStyles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 30%, #f1f5f9 100%)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    },
    
    backgroundOrbs: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
      overflow: 'hidden'
    },

    header: {
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 8s ease infinite',
      fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
      fontWeight: '800',
      letterSpacing: '-0.02em',
      lineHeight: '1.1',
      marginBottom: '1rem',
      textAlign: 'center',
      textShadow: '0 4px 20px rgba(0,0,0,0.1)'
    },

    subtitle: {
      fontSize: 'clamp(1rem, 2vw, 1.25rem)',
      fontWeight: '500',
      color: '#64748b',
      textAlign: 'center',
      marginBottom: '3rem',
      letterSpacing: '0.025em'
    },

    megaCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(20px)',
      borderRadius: '32px',
      padding: 'clamp(2rem, 4vw, 4rem)',
      boxShadow: `
        0 32px 64px rgba(0, 0, 0, 0.08),
        0 16px 32px rgba(0, 0, 0, 0.04),
        inset 0 1px 0 rgba(255, 255, 255, 0.9)
      `,
      border: '1px solid rgba(255, 255, 255, 0.6)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      margin: '0 auto 4rem',
      maxWidth: '1400px'
    },

    statCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(16px)',
      borderRadius: '24px',
      padding: '2.5rem',
      boxShadow: `
        0 20px 40px rgba(0, 0, 0, 0.08),
        0 8px 16px rgba(0, 0, 0, 0.04),
        inset 0 1px 0 rgba(255, 255, 255, 0.8)
      `,
      border: '1px solid rgba(255, 255, 255, 0.5)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    },

    taskCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(8px)',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: `
        0 4px 16px rgba(0, 0, 0, 0.04),
        0 2px 4px rgba(0, 0, 0, 0.02)
      `,
      border: '1px solid rgba(226, 232, 240, 0.3)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    },

    progressBar: {
      background: 'rgba(255, 255, 255, 0.96)',
      borderRadius: '20px',
      padding: '2rem',
      color: '#1e293b',
      boxShadow: `
        0 8px 24px rgba(0, 0, 0, 0.06),
        0 4px 8px rgba(0, 0, 0, 0.04)
      `,
      border: '1px solid rgba(226, 232, 240, 0.4)',
      position: 'relative',
      overflow: 'hidden'
    },

    button: {
      background: 'linear-gradient(135deg, #334155 0%, #475569 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '0.75rem 1.5rem',
      fontWeight: '500',
      fontSize: '0.875rem',
      cursor: 'pointer',
      boxShadow: `
        0 4px 12px rgba(71, 85, 105, 0.15),
        0 2px 4px rgba(71, 85, 105, 0.1)
      `,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      position: 'relative',
      overflow: 'hidden'
    },

    input: {
      width: '100%',
      padding: '1rem 1rem 1rem 3rem',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(6px)',
      border: '1px solid rgba(226, 232, 240, 0.3)',
      borderRadius: '12px',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      outline: 'none',
      color: '#1e293b'
    }
  };

  const getStatusConfig = (status) => {
    const normalizedStatus = status?.toLowerCase();
    if (normalizedStatus === 'complete' || normalizedStatus === 'done') {
      return {
        color: '#10b981',
        bgGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        lightBg: 'rgba(16, 185, 129, 0.1)',
        icon: CheckCircle2,
        label: 'Complete'
      };
    }
    
    const configs = {
      'In Progress': {
        color: '#3b82f6',
        bgGradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        lightBg: 'rgba(59, 130, 246, 0.1)',
        icon: Clock,
        label: 'In Progress'
      },
      'Pending': {
        color: '#f59e0b',
        bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        lightBg: 'rgba(245, 158, 11, 0.1)',
        icon: AlertTriangle,
        label: 'Pending'
      },
      'Blocked': {
        color: '#ef4444',
        bgGradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        lightBg: 'rgba(239, 68, 68, 0.1)',
        icon: XCircle,
        label: 'Blocked'
      }
    };
    
    return configs[status] || {
      color: '#6b7280',
      bgGradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
      lightBg: 'rgba(107, 114, 128, 0.1)',
      icon: Calendar,
      label: status || 'Unknown'
    };
  };

  const StatCard = ({ title, value, icon: Icon, gradient, trend, delay = 0 }) => (
    <div 
      style={{
        ...dynamicStyles.statCard,
        animation: `slideUpFade 0.8s ease-out ${delay}s both`
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
        e.currentTarget.style.boxShadow = `
          0 32px 64px rgba(0, 0, 0, 0.12),
          0 16px 32px rgba(0, 0, 0, 0.08),
          inset 0 1px 0 rgba(255, 255, 255, 0.9)
        `;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = dynamicStyles.statCard.boxShadow;
      }}
    >
      <div style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: gradient,
        borderRadius: '24px 24px 0 0'
      }} />
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '1.5rem'
      }}>
        <div style={{ flex: 1 }}>
          <p style={{ 
            fontSize: '0.875rem', 
            fontWeight: '600',
            color: '#64748b', 
            marginBottom: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {title}
          </p>
          <p style={{ 
            fontSize: 'clamp(2rem, 4vw, 3rem)', 
            fontWeight: '800', 
            background: gradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: '1',
            marginBottom: '0.5rem'
          }}>
            {value}
          </p>
          {trend && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#10b981'
            }}>
              <TrendingUp size={16} style={{ marginRight: '0.5rem' }} />
              <span>+{trend}% this week</span>
            </div>
          )}
        </div>
        <div style={{
          background: gradient,
          borderRadius: '20px',
          padding: '1.25rem',
          color: 'white',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
        }}>
          <Icon size={32} />
        </div>
      </div>
    </div>
  );


  if (loading) {
    return (
      <div style={{
        ...dynamicStyles.container,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '80px',
            height: '80px',
            border: '6px solid rgba(102, 126, 234, 0.2)',
            borderTop: '6px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite, pulse 2s ease-in-out infinite',
            marginBottom: '2rem'
          }}></div>
          <p style={{ 
            color: '#64748b', 
            fontWeight: '600', 
            fontSize: '1.5rem',
            marginBottom: '0.5rem'
          }}>
            Loading your amazing dashboard...
          </p>
          <p style={{ 
            color: '#94a3b8', 
            fontWeight: '500', 
            fontSize: '1rem'
          }}>
            Preparing something spectacular
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={dynamicStyles.container}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes slideUpFade {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
      
      {/* Dynamic Background Orbs */}
      <div style={dynamicStyles.backgroundOrbs}>
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(71, 85, 105, 0.03) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 6s ease-in-out infinite'
        }} />
        <div style={{
          position: 'absolute',
          top: '60%',
          right: '10%',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(71, 85, 105, 0.03) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 8s ease-in-out infinite reverse'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          left: '50%',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(71, 85, 105, 0.03) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'float 7s ease-in-out infinite'
        }} />
      </div>
      
      <div style={{ 
        position: 'relative',
        zIndex: 1,
        padding: 'clamp(2rem, 4vw, 4rem) clamp(2rem, 4vw, 3rem)',
        maxWidth: '1600px',
        margin: '0 auto'
      }}>
        {/* Navigation Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          padding: '1rem 0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #334155 0%, #475569 100%)',
              borderRadius: '50%',
              padding: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Zap size={24} style={{ color: 'white' }} />
            </div>
            <div>
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#1e293b',
                margin: 0
              }}>
                TaskFlow
              </h1>
              <p style={{
                fontSize: '0.875rem',
                color: '#64748b',
                margin: 0
              }}>
                Welcome back, {user?.name}
              </p>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '12px',
              padding: '0.5rem 1rem',
              border: '1px solid rgba(226, 232, 240, 0.4)',
              fontSize: '0.875rem',
              color: '#64748b'
            }}>
              {user?.plan === 'starter' ? '🆓 Free Plan' : user?.plan === 'professional' ? '⭐ Pro Plan' : '💎 Enterprise'}
            </div>
            
            <div style={{ position: 'relative' }} data-user-menu>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  background: 'white',
                  border: '1px solid rgba(226, 232, 240, 0.4)',
                  borderRadius: '50%',
                  padding: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <User size={20} style={{ color: '#334155' }} />
              </button>
              
              {showUserMenu && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                  border: '1px solid rgba(226, 232, 240, 0.4)',
                  minWidth: '200px',
                  zIndex: 1000
                }}>
                  <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
                    <p style={{ fontWeight: '600', color: '#1e293b', margin: 0 }}>{user?.name}</p>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>{user?.email}</p>
                  </div>
                  <div style={{ padding: '0.5rem' }}>
                    <button style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '0.75rem',
                      background: 'none',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      color: '#374151'
                    }}>
                      <Settings size={16} />
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.75rem',
                        background: 'none',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        color: '#ef4444'
                      }}
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Workspace Selector */}
        <WorkspaceSelector
          connectedSheets={connectedSheets}
          activeSheet={activeSheet}
          onSheetSelect={handleSheetSelect}
          onAddSheet={() => setShowSheetsModal(true)}
          onRemoveSheet={handleSheetRemove}
          onRefreshSheet={handleRefreshSheet}
        />

        {/* Main Dashboard Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: 'clamp(3rem, 6vw, 6rem)',
          animation: 'slideUpFade 1s ease-out'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #334155 0%, #475569 100%)',
              borderRadius: '50%',
              padding: '1.25rem',
              marginRight: '1.25rem',
              boxShadow: '0 8px 16px rgba(71, 85, 105, 0.15)'
            }}>
              <Zap size={40} style={{ color: 'white' }} />
            </div>
            <h1 style={dynamicStyles.header}>
              Your Productivity Dashboard
            </h1>
          </div>
          
          <p style={dynamicStyles.subtitle}>
            Experience the future of task management with real-time insights and beautiful design
          </p>
          
          {/* Quick Stats Pills */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem',
            marginTop: '2rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(16px)',
              borderRadius: '24px',
              padding: '1rem 2rem',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
              animation: 'slideUpFade 1.2s ease-out'
            }}>
              <Target style={{ color: '#10b981', marginRight: '0.75rem' }} size={20} />
              <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '1.125rem' }}>
                {completionRate}% Complete
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(16px)',
              borderRadius: '24px',
              padding: '1rem 2rem',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
              animation: 'slideUpFade 1.4s ease-out'
            }}>
              <Activity style={{ color: '#3b82f6', marginRight: '0.75rem' }} size={20} />
              <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '1.125rem' }}>
                {stats.filtered} of {stats.total} shown
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(16px)',
              borderRadius: '24px',
              padding: '1rem 2rem',
              border: '1px solid rgba(255, 255, 255, 0.6)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
              animation: 'slideUpFade 1.6s ease-out'
            }}>
              <Award style={{ color: '#f59e0b', marginRight: '0.75rem' }} size={20} />
              <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '1.125rem' }}>
                Updated {lastRefresh.toLocaleTimeString()}
              </span>
            </div>
            
            <button
              style={{
                ...dynamicStyles.button,
                animation: 'slideUpFade 1.8s ease-out'
              }}
              onClick={loadTasks}
              disabled={loading}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px) scale(1.05)';
                e.target.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = dynamicStyles.button.boxShadow;
              }}
            >
              <RefreshCw size={20} />
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            backgroundColor: 'rgba(254, 242, 242, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '2px solid rgba(254, 202, 202, 0.6)',
            color: '#991b1b',
            padding: '2rem',
            borderRadius: '24px',
            marginBottom: '3rem',
            boxShadow: '0 16px 32px rgba(239, 68, 68, 0.1)',
            animation: 'slideUpFade 0.6s ease-out'
          }}>
            <p style={{ fontWeight: '600', fontSize: '1.125rem', textAlign: 'center' }}>{error}</p>
          </div>
        )}

        {/* Mega Control Panel */}
        <div style={{
          ...dynamicStyles.megaCard,
          animation: 'slideUpFade 0.8s ease-out'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2.5rem',
            alignItems: 'end'
          }}>
            {/* Search */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '1rem', 
                fontWeight: '700', 
                color: '#1e293b', 
                marginBottom: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Search Tasks
              </label>
              <div style={{ position: 'relative' }}>
                <Search style={{
                  position: 'absolute',
                  left: '1.25rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b'
                }} size={24} />
                <input
                  type="text"
                  placeholder="Search through your amazing tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={dynamicStyles.input}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 4px rgba(102, 126, 234, 0.1), 0 8px 24px rgba(102, 126, 234, 0.15)';
                    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(226, 232, 240, 0.6)';
                    e.target.style.boxShadow = 'none';
                    e.target.style.backgroundColor = 'rgba(248, 250, 252, 0.8)';
                  }}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '1rem', 
                fontWeight: '700', 
                color: '#1e293b', 
                marginBottom: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Filter by Status
              </label>
              <div style={{ position: 'relative' }}>
                <Filter style={{
                  position: 'absolute',
                  left: '1.25rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748b'
                }} size={24} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    ...dynamicStyles.input,
                    paddingRight: '3rem',
                    cursor: 'pointer',
                    appearance: 'none'
                  }}
                >
                  <option value="All">All Tasks ({stats.total})</option>
                  <option value="complete">✅ Completed ({stats.completed})</option>
                  <option value="In Progress">🔄 In Progress ({stats.inProgress})</option>
                  <option value="Pending">⏳ Pending ({stats.pending})</option>
                  <option value="Blocked">🚫 Blocked ({stats.blocked})</option>
                </select>
              </div>
            </div>

            {/* View Mode */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '1rem', 
                fontWeight: '700', 
                color: '#1e293b', 
                marginBottom: '1rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                View Mode
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                backgroundColor: 'rgba(241, 245, 249, 0.8)',
                borderRadius: '16px',
                padding: '0.5rem',
                gap: '0.5rem'
              }}>
                {(appMode === 'personal' ? [
                  { value: 'dashboard', icon: BarChart3, label: 'Dashboard' },
                  { value: 'grid', icon: Grid, label: 'Grid' },
                  { value: 'list', icon: List, label: 'List' }
                ] : [
                  { value: 'dashboard', icon: BarChart3, label: 'Dashboard' },
                  { value: 'standup', icon: MessageSquare, label: 'Standup' }
                ]).map((mode) => {
                  const Icon = mode.icon;
                  const isActive = viewMode === mode.value;
                  return (
                    <button
                      key={mode.value}
                      onClick={() => setViewMode(mode.value)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: 'none',
                        backgroundColor: isActive ? 'white' : 'transparent',
                        color: isActive ? '#667eea' : '#64748b',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: isActive ? '0 4px 12px rgba(102, 126, 234, 0.15)' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.target.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <Icon size={24} />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Content Based on View Mode */}
        {!activeSheet ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '20px',
            margin: '2rem 0'
          }}>
            <FileSpreadsheet size={64} style={{ 
              color: '#cbd5e1', 
              marginBottom: '2rem',
              margin: '0 auto 2rem'
            }} />
            <h3 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              color: '#1e293b',
              marginBottom: '1rem'
            }}>
              Connect Your First Google Sheet
            </h3>
            <p style={{
              fontSize: '1rem',
              color: '#64748b',
              marginBottom: '2rem',
              maxWidth: '500px',
              margin: '0 auto 2rem'
            }}>
              Get started by connecting your Google Sheets to manage tasks directly in TaskFlow. 
              You can edit, add, and delete tasks right from this interface.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => setShowSheetsModal(true)}
                style={{
                  background: 'linear-gradient(135deg, #334155 0%, #475569 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Plus size={20} />
                Connect Google Sheet
              </button>
              
              <button
                onClick={() => setShowGoogleAuthSetup(true)}
                style={{
                  background: 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '1rem 2rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Shield size={20} />
                Enable Editing
              </button>
            </div>
          </div>
        ) : viewMode === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', marginBottom: '3rem', padding: '1rem' }}>
            {/* Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
              padding: '1rem'
            }}>
              <StatCard 
                title="Total Tasks" 
                value={stats.total} 
                icon={Calendar}
                gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                trend={12}
                delay={0}
              />
              <StatCard 
                title="Completed" 
                value={stats.completed} 
                icon={CheckCircle2}
                gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                trend={8}
                delay={0.1}
              />
              <StatCard 
                title="In Progress" 
                value={stats.inProgress} 
                icon={Clock}
                gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                delay={0.2}
              />
              <StatCard 
                title="Pending" 
                value={stats.pending} 
                icon={AlertTriangle}
                gradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
                delay={0.3}
              />
            </div>

            {/* Mega Progress Card */}
            <div style={{
              ...dynamicStyles.progressBar,
              animation: 'slideUpFade 1s ease-out 0.4s both'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                borderRadius: '28px'
              }} />
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '2rem'
                }}>
                  <h3 style={{ 
                    fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', 
                    fontWeight: '800', 
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <Target size={40} />
                    Project Progress
                  </h3>
                  <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '16px',
                    padding: '1rem 1.5rem',
                    backdropFilter: 'blur(8px)'
                  }}>
                    <span style={{ fontSize: '2rem', fontWeight: '800' }}>{completionRate}%</span>
                  </div>
                </div>
                
                <div style={{ marginBottom: '2rem' }}>
                  <div style={{ 
                    width: '100%', 
                    backgroundColor: 'rgba(255, 255, 255, 0.25)', 
                    borderRadius: '20px', 
                    height: '20px',
                    overflow: 'hidden',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div 
                      style={{
                        backgroundColor: 'white',
                        height: '100%',
                        borderRadius: '20px',
                        width: `${completionRate}%`,
                        transition: 'width 2s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 2px 8px rgba(255, 255, 255, 0.3)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                        animation: 'shimmer 2s ease-in-out infinite'
                      }} />
                    </div>
                  </div>
                </div>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                  gap: '2rem'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                      {stats.completed}
                    </div>
                    <div style={{ fontSize: '1.125rem', opacity: 0.9 }}>Completed</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                      {stats.total - stats.completed}
                    </div>
                    <div style={{ fontSize: '1.125rem', opacity: 0.9 }}>Remaining</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                      {stats.inProgress}
                    </div>
                    <div style={{ fontSize: '1.125rem', opacity: 0.9 }}>Active</div>
                  </div>
                </div>
              </div>
            </div>

            {/* All Tasks Grid */}
            <div style={{ animation: 'slideUpFade 1s ease-out 0.6s both' }}>
              <h3 style={{ 
                fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', 
                fontWeight: '800', 
                color: '#1e293b', 
                marginBottom: '3rem',
                textAlign: 'center'
              }}>
                All Tasks Overview
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '2rem',
                marginBottom: '3rem',
                padding: '1rem'
              }}>
                <AddTaskCard onAdd={handleAddTask} delay={0} />
                {tasks.map((task, index) => (
                  <EditableTaskCard key={task.id} task={task} delay={(index + 1) * 0.1} onUpdate={handleTaskUpdate} onDelete={handleTaskDelete} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem',
            padding: '1rem',
            animation: 'slideUpFade 0.8s ease-out'
          }}>
            <AddTaskCard onAdd={handleAddTask} delay={0} />
            {filteredTasks.map((task, index) => (
              <EditableTaskCard key={task.id} task={task} delay={(index + 1) * 0.05} onUpdate={handleTaskUpdate} onDelete={handleTaskDelete} />
            ))}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.5rem',
            marginBottom: '3rem',
            padding: '1rem',
            animation: 'slideUpFade 0.8s ease-out'
          }}>
            {filteredTasks.map((task, index) => {
              const config = getStatusConfig(task.status);
              const Icon = config.icon;
              
              return (
                <div 
                  key={task.id} 
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: '20px',
                    padding: '2rem',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2rem',
                    animation: `slideUpFade 0.6s ease-out ${index * 0.05}s both`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(8px) scale(1.01)';
                    e.currentTarget.style.boxShadow = '0 16px 48px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.06)';
                  }}
                >
                  <div style={{
                    background: config.bgGradient,
                    borderRadius: '16px',
                    padding: '1rem',
                    color: 'white',
                    flexShrink: 0
                  }}>
                    <Icon size={24} />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <p style={{ 
                      color: '#1e293b', 
                      fontWeight: '600', 
                      marginBottom: '0.5rem',
                      fontSize: '1.125rem'
                    }}>
                      {task.task}
                    </p>
                    <p style={{ 
                      fontSize: '0.875rem', 
                      color: '#64748b',
                      fontWeight: '500'
                    }}>
                      Task #{task.id} • Row {task.rowIndex}
                    </p>
                  </div>
                  
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: config.lightBg,
                    borderRadius: '12px',
                    border: `2px solid ${config.color}30`,
                    flexShrink: 0
                  }}>
                    <span style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: '700',
                      color: config.color
                    }}>
                      {config.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {viewMode === 'standup' && currentTeam && (
          <DailyStandupInterface 
            user={user}
            currentTeam={currentTeam}
          />
        )}

        {viewMode === 'standup' && !currentTeam && (
          <div style={{ 
            textAlign: 'center', 
            padding: '48px', 
            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
            borderRadius: '20px',
            margin: '1rem',
            backdropFilter: 'blur(12px)'
          }}>
            <Users style={{ width: '48px', height: '48px', color: '#6b7280', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#374151', marginBottom: '12px' }}>
              Join a Team to Access Standup
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '16px' }}>
              You need to be part of a team to participate in daily standups. Create a demo team to try out the feature!
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  const demoTeam = createDemoTeam(user.id);
                  setCurrentTeam(demoTeam);
                  setUserTeams([demoTeam]);
                  localStorage.setItem('activeTeamId', demoTeam.id);
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Create Demo Team
              </button>
              <button
                onClick={() => setViewMode('dashboard')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Sheets Connection Modal */}
      <SheetsConnectionModal 
        isOpen={showSheetsModal}
        onClose={() => setShowSheetsModal(false)}
        onConnect={handleSheetConnect}
        user={user}
      />
      
      {/* Google Auth Setup Modal */}
      <GoogleAuthSetup 
        isOpen={showGoogleAuthSetup}
        onClose={() => setShowGoogleAuthSetup(false)}
        onComplete={() => {
          // Auth completed, close modal
          setShowGoogleAuthSetup(false);
        }}
      />
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

export default App;