import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, Filter, X, Calendar, User, Flag, 
  Tag, Clock, CheckCircle, AlertCircle,
  ChevronDown, ChevronUp, SortAsc, SortDesc,
  MoreHorizontal, Eye, EyeOff
} from 'lucide-react';
import { AccessibleButton, AccessibleInput } from './AccessibleComponents';
import { ResponsiveCard, useResponsive } from './ResponsiveLayout';
import { useKeyboardShortcuts } from './KeyboardShortcuts';

// Search and filter hook
export const useAdvancedSearch = (items = [], searchConfig = {}) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('created');
  const [sortOrder, setSortOrder] = useState('desc');

  // Search function
  const searchItems = useMemo(() => {
    if (!query && Object.keys(filters).length === 0) {
      return items;
    }

    return items.filter(item => {
      // Text search
      if (query) {
        const searchFields = searchConfig.searchFields || ['title', 'description'];
        const matchesQuery = searchFields.some(field => {
          const value = item[field];
          return value && value.toString().toLowerCase().includes(query.toLowerCase());
        });
        if (!matchesQuery) return false;
      }

      // Filters
      for (const [filterKey, filterValue] of Object.entries(filters)) {
        if (!filterValue || filterValue === 'all') continue;

        switch (filterKey) {
          case 'status':
            if (item.status !== filterValue) return false;
            break;
          case 'priority':
            if (item.priority !== filterValue) return false;
            break;
          case 'assignee':
            if (item.assigneeId !== filterValue) return false;
            break;
          case 'dueDate':
            if (!matchesDateFilter(item.dueDate, filterValue)) return false;
            break;
          case 'tags':
            if (!item.tags || !item.tags.includes(filterValue)) return false;
            break;
          default:
            if (item[filterKey] !== filterValue) return false;
        }
      }

      return true;
    });
  }, [items, query, filters, searchConfig.searchFields]);

  // Sort function
  const sortedItems = useMemo(() => {
    const sorted = [...searchItems].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle special cases
      switch (sortBy) {
        case 'priority':
          const priorityOrder = { 'Urgent': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
          aValue = priorityOrder[aValue] || 0;
          bValue = priorityOrder[bValue] || 0;
          break;
        case 'dueDate':
        case 'created':
        case 'updated':
          aValue = new Date(aValue || 0).getTime();
          bValue = new Date(bValue || 0).getTime();
          break;
        default:
          aValue = aValue?.toString().toLowerCase() || '';
          bValue = bValue?.toString().toLowerCase() || '';
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [searchItems, sortBy, sortOrder]);

  // Date filter helper
  const matchesDateFilter = (itemDate, filterValue) => {
    if (!itemDate) return filterValue === 'none';
    
    const now = new Date();
    const date = new Date(itemDate);
    
    switch (filterValue) {
      case 'today':
        return date.toDateString() === now.toDateString();
      case 'tomorrow':
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return date.toDateString() === tomorrow.toDateString();
      case 'this-week':
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return date >= weekStart && date <= weekEnd;
      case 'overdue':
        return date < now;
      case 'none':
        return false;
      default:
        return true;
    }
  };

  return {
    query,
    setQuery,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    results: sortedItems,
    resultCount: sortedItems.length,
    totalCount: items.length,
    clearFilters: () => {
      setQuery('');
      setFilters({});
    }
  };
};

// Advanced Search Bar Component
export const AdvancedSearchBar = ({ 
  onSearch,
  onFilter,
  placeholder = "Search tasks...",
  shortcuts = true,
  className = ''
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const searchInputRef = useRef(null);
  const { isMobile } = useResponsive();

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'MOD+F': () => {
      searchInputRef.current?.focus();
    },
    'ESC': () => {
      if (isFocused) {
        setQuery('');
        onSearch('');
        searchInputRef.current?.blur();
      }
    }
  }, shortcuts);

  useEffect(() => {
    onSearch(query);
  }, [query, onSearch]);

  return (
    <div className={className} style={{
      position: 'relative',
      width: '100%',
      maxWidth: isMobile ? '100%' : '400px'
    }}>
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Search style={{
          position: 'absolute',
          left: '12px',
          width: '20px',
          height: '20px',
          color: '#6b7280',
          zIndex: 1
        }} />
        
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          style={{
            width: '100%',
            padding: '12px 40px 12px 44px',
            border: `2px solid ${isFocused ? '#3b82f6' : '#e5e7eb'}`,
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none',
            transition: 'border-color 0.2s ease',
            backgroundColor: 'white'
          }}
        />
        
        {query && (
          <button
            onClick={() => {
              setQuery('');
              onSearch('');
            }}
            style={{
              position: 'absolute',
              right: '12px',
              padding: '4px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#6b7280',
              borderRadius: '4px'
            }}
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        )}
      </div>

      {/* Search shortcuts hint */}
      {!isMobile && shortcuts && !isFocused && !query && (
        <div style={{
          position: 'absolute',
          right: '48px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '12px',
          color: '#9ca3af',
          pointerEvents: 'none'
        }}>
          ⌘+F
        </div>
      )}
    </div>
  );
};

// Filter Panel Component
export const FilterPanel = ({ 
  filters = {},
  onFiltersChange,
  options = {},
  isOpen = false,
  onToggle
}) => {
  const { isMobile } = useResponsive();

  const filterOptions = {
    status: [
      { value: 'all', label: 'All Statuses' },
      { value: 'pending', label: 'Pending' },
      { value: 'in-progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' }
    ],
    priority: [
      { value: 'all', label: 'All Priorities' },
      { value: 'Urgent', label: 'Urgent' },
      { value: 'High', label: 'High' },
      { value: 'Medium', label: 'Medium' },
      { value: 'Low', label: 'Low' }
    ],
    dueDate: [
      { value: 'all', label: 'All Dates' },
      { value: 'overdue', label: 'Overdue' },
      { value: 'today', label: 'Due Today' },
      { value: 'tomorrow', label: 'Due Tomorrow' },
      { value: 'this-week', label: 'This Week' },
      { value: 'none', label: 'No Due Date' }
    ],
    ...options
  };

  const activeFilterCount = Object.values(filters).filter(
    value => value && value !== 'all'
  ).length;

  const updateFilter = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'all' ? undefined : value
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Filter Toggle Button */}
      <AccessibleButton
        variant="secondary"
        size="sm"
        onClick={onToggle}
        icon={<Filter style={{ width: '16px', height: '16px' }} />}
        ariaLabel="Toggle filters"
      >
        {!isMobile && 'Filters'}
        {activeFilterCount > 0 && (
          <span style={{
            marginLeft: '4px',
            padding: '2px 6px',
            backgroundColor: '#3b82f6',
            color: 'white',
            borderRadius: '10px',
            fontSize: '11px',
            fontWeight: '600'
          }}>
            {activeFilterCount}
          </span>
        )}
      </AccessibleButton>

      {/* Filter Panel */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '8px',
          zIndex: 1000,
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          minWidth: isMobile ? '280px' : '320px',
          maxWidth: isMobile ? '90vw' : '400px'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px',
            borderBottom: '1px solid #f3f4f6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              margin: 0,
              color: '#111827'
            }}>
              Filters
            </h3>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                Clear all
              </button>
            )}
          </div>

          {/* Filter Options */}
          <div style={{ padding: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {Object.entries(filterOptions).map(([filterKey, options]) => (
                <div key={filterKey}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px',
                    textTransform: 'capitalize'
                  }}>
                    {filterKey.replace(/([A-Z])/g, ' $1').trim()}
                  </label>
                  <select
                    value={filters[filterKey] || 'all'}
                    onChange={(e) => updateFilter(filterKey, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                      backgroundColor: 'white'
                    }}
                  >
                    {options.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sort Control Component
export const SortControl = ({ 
  sortBy,
  sortOrder,
  onSortChange,
  options = []
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const defaultOptions = [
    { value: 'created', label: 'Date Created' },
    { value: 'updated', label: 'Last Updated' },
    { value: 'title', label: 'Title' },
    { value: 'priority', label: 'Priority' },
    { value: 'dueDate', label: 'Due Date' }
  ];

  const sortOptions = options.length > 0 ? options : defaultOptions;
  const currentOption = sortOptions.find(opt => opt.value === sortBy);

  return (
    <div style={{ position: 'relative' }}>
      <AccessibleButton
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        icon={sortOrder === 'asc' ? 
          <SortAsc style={{ width: '16px', height: '16px' }} /> :
          <SortDesc style={{ width: '16px', height: '16px' }} />
        }
      >
        {currentOption?.label || 'Sort'}
      </AccessibleButton>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '4px',
          zIndex: 1000,
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          minWidth: '180px'
        }}>
          {sortOptions.map(option => (
            <button
              key={option.value}
              onClick={() => {
                if (sortBy === option.value) {
                  onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc');
                } else {
                  onSortChange(option.value, 'desc');
                }
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                textAlign: 'left',
                border: 'none',
                backgroundColor: sortBy === option.value ? '#f3f4f6' : 'transparent',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              {option.label}
              {sortBy === option.value && (
                sortOrder === 'asc' ? 
                  <SortAsc style={{ width: '14px', height: '14px' }} /> :
                  <SortDesc style={{ width: '14px', height: '14px' }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Search Results Summary
export const SearchResultsSummary = ({ 
  query,
  resultCount,
  totalCount,
  filters = {},
  onClearQuery,
  onClearFilters
}) => {
  const activeFilters = Object.entries(filters).filter(
    ([key, value]) => value && value !== 'all'
  );

  if (!query && activeFilters.length === 0) return null;

  return (
    <ResponsiveCard style={{ marginBottom: '16px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <span style={{ fontSize: '14px', color: '#374151' }}>
            Showing {resultCount} of {totalCount} tasks
          </span>
          
          {query && (
            <span style={{ fontSize: '14px', color: '#6b7280' }}>
              {' '}for "{query}"
            </span>
          )}
          
          {activeFilters.length > 0 && (
            <span style={{ fontSize: '14px', color: '#6b7280' }}>
              {' '}with {activeFilters.length} filter{activeFilters.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {query && (
            <button
              onClick={onClearQuery}
              style={{
                fontSize: '12px',
                color: '#6b7280',
                backgroundColor: 'transparent',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                padding: '4px 8px',
                cursor: 'pointer'
              }}
            >
              Clear search
            </button>
          )}
          
          {activeFilters.length > 0 && (
            <button
              onClick={onClearFilters}
              style={{
                fontSize: '12px',
                color: '#6b7280',
                backgroundColor: 'transparent',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                padding: '4px 8px',
                cursor: 'pointer'
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <div style={{
          marginTop: '12px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px'
        }}>
          {activeFilters.map(([key, value]) => (
            <span
              key={key}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                backgroundColor: '#eff6ff',
                color: '#1e40af',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500'
              }}
            >
              {key}: {value}
              <button
                onClick={() => onClearFilters({ [key]: undefined })}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#1e40af',
                  cursor: 'pointer',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X style={{ width: '12px', height: '12px' }} />
              </button>
            </span>
          ))}
        </div>
      )}
    </ResponsiveCard>
  );
};

export default {
  useAdvancedSearch,
  AdvancedSearchBar,
  FilterPanel,
  SortControl,
  SearchResultsSummary
};