import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Users, Calendar, Flag, RotateCcw, ChevronDown } from 'lucide-react';

const FilterBar = ({ 
  tasks = [], 
  teamMembers = [], 
  onFiltersChange,
  initialFilters = {}
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: [],
    assignee: [],
    priority: [],
    dueDate: 'all',
    ...initialFilters
  });

  // Load filters from localStorage on mount
  useEffect(() => {
    const savedFilters = localStorage.getItem('taskFilters');
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters);
        setFilters(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to load saved filters:', error);
      }
    }
  }, []);

  // Save filters to localStorage and notify parent
  useEffect(() => {
    localStorage.setItem('taskFilters', JSON.stringify(filters));
    
    // Apply filters to tasks
    const filteredTasks = applyFilters(tasks, filters);
    onFiltersChange(filteredTasks, filters);
  }, [filters, tasks, onFiltersChange]);

  const applyFilters = (tasks, filters) => {
    return tasks.filter(task => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const titleMatch = (task.title || task.task || '').toLowerCase().includes(searchLower);
        const descriptionMatch = (task.description || '').toLowerCase().includes(searchLower);
        if (!titleMatch && !descriptionMatch) return false;
      }

      // Status filter
      if (filters.status.length > 0) {
        if (!filters.status.includes(task.status)) return false;
      }

      // Assignee filter
      if (filters.assignee.length > 0) {
        const includesUnassigned = filters.assignee.includes('unassigned');
        const hasAssignee = task.assigneeId && task.assigneeId.trim();
        
        if (includesUnassigned && !hasAssignee) {
          // Task is unassigned and we're filtering for unassigned
        } else if (hasAssignee && filters.assignee.includes(task.assigneeId)) {
          // Task is assigned and we're filtering for this assignee
        } else {
          return false;
        }
      }

      // Priority filter
      if (filters.priority.length > 0) {
        if (!filters.priority.includes(task.priority || 'Medium')) return false;
      }

      // Due date filter
      if (filters.dueDate !== 'all' && task.dueDate) {
        const taskDate = new Date(task.dueDate);
        const today = new Date();
        const thisWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        switch (filters.dueDate) {
          case 'today':
            if (taskDate.toDateString() !== today.toDateString()) return false;
            break;
          case 'thisWeek':
            if (taskDate > thisWeek) return false;
            break;
          case 'overdue':
            if (taskDate >= today || task.status === 'done') return false;
            break;
          case 'upcoming':
            if (taskDate <= today) return false;
            break;
        }
      }

      return true;
    });
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      if (filterType === 'search' || filterType === 'dueDate') {
        return { ...prev, [filterType]: value };
      } else {
        // For multi-select filters
        const currentValues = prev[filterType] || [];
        const newValues = currentValues.includes(value)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value];
        return { ...prev, [filterType]: newValues };
      }
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: [],
      assignee: [],
      priority: [],
      dueDate: 'all'
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status.length > 0) count++;
    if (filters.assignee.length > 0) count++;
    if (filters.priority.length > 0) count++;
    if (filters.dueDate !== 'all') count++;
    return count;
  };

  const statusOptions = [
    { value: 'pending', label: 'To Do', color: '#6b7280' },
    { value: 'in_progress', label: 'In Progress', color: '#f59e0b' },
    { value: 'done', label: 'Done', color: '#10b981' },
    { value: 'blocked', label: 'Blocked', color: '#ef4444' }
  ];

  const priorityOptions = [
    { value: 'High', color: '#ef4444' },
    { value: 'Medium', color: '#f59e0b' },
    { value: 'Low', color: '#10b981' }
  ];

  const dueDateOptions = [
    { value: 'all', label: 'All Tasks' },
    { value: 'today', label: 'Due Today' },
    { value: 'thisWeek', label: 'Due This Week' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'upcoming', label: 'Upcoming' }
  ];

  const activeFilterCount = getActiveFilterCount();

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      marginBottom: '24px',
      overflow: 'hidden'
    }}>
      {/* Filter Header */}
      <div style={{
        padding: '16px',
        borderBottom: isExpanded ? '1px solid #e5e7eb' : 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer'
      }} onClick={() => setIsExpanded(!isExpanded)}>
        <Filter style={{ width: '16px', height: '16px', color: '#6b7280' }} />
        <span style={{ fontSize: '14px', fontWeight: '500', flex: 1 }}>
          Filters & Search
        </span>
        {activeFilterCount > 0 && (
          <span style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            fontSize: '11px',
            fontWeight: '600',
            padding: '2px 6px',
            borderRadius: '10px',
            minWidth: '18px',
            textAlign: 'center'
          }}>
            {activeFilterCount}
          </span>
        )}
        <ChevronDown 
          style={{ 
            width: '16px', 
            height: '16px', 
            color: '#6b7280',
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }} 
        />
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div style={{ padding: '16px' }}>
          {/* Search Bar */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ position: 'relative' }}>
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
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              {filters.search && (
                <button
                  onClick={() => handleFilterChange('search', '')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280'
                  }}
                >
                  <X style={{ width: '16px', height: '16px' }} />
                </button>
              )}
            </div>
          </div>

          {/* Filter Options Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>
            {/* Status Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Status
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {statusOptions.map(status => (
                  <label key={status.value} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '4px 0'
                  }}>
                    <input
                      type="checkbox"
                      checked={filters.status.includes(status.value)}
                      onChange={() => handleFilterChange('status', status.value)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: status.color,
                      backgroundColor: `${status.color}20`,
                      padding: '2px 6px',
                      borderRadius: '8px'
                    }}>
                      {status.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Priority
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {priorityOptions.map(priority => (
                  <label key={priority.value} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '4px 0'
                  }}>
                    <input
                      type="checkbox"
                      checked={filters.priority.includes(priority.value)}
                      onChange={() => handleFilterChange('priority', priority.value)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '500',
                      color: priority.color,
                      backgroundColor: `${priority.color}20`,
                      padding: '2px 6px',
                      borderRadius: '8px'
                    }}>
                      {priority.value}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Assignee Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Assignee
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {teamMembers.map(member => (
                  <label key={member.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '4px 0'
                  }}>
                    <input
                      type="checkbox"
                      checked={filters.assignee.includes(member.id)}
                      onChange={() => handleFilterChange('assignee', member.id)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '13px', color: '#374151' }}>
                      {member.name}
                    </span>
                  </label>
                ))}
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '4px 0'
                }}>
                  <input
                    type="checkbox"
                    checked={filters.assignee.includes('unassigned')}
                    onChange={() => handleFilterChange('assignee', 'unassigned')}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '13px', color: '#6b7280', fontStyle: 'italic' }}>
                    Unassigned
                  </span>
                </label>
              </div>
            </div>

            {/* Due Date Filter */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Due Date
              </label>
              <select
                value={filters.dueDate}
                onChange={(e) => handleFilterChange('dueDate', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '13px',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                {dueDateOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={clearFilters}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                <RotateCcw style={{ width: '12px', height: '12px' }} />
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar;