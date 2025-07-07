import React, { useEffect, useCallback, useState } from 'react';
import { Keyboard, Command } from 'lucide-react';
import { AccessibleModal, AccessibleButton } from './AccessibleComponents';
import { useResponsive } from './ResponsiveLayout';

// Keyboard shortcut definitions
export const SHORTCUTS = {
  // Navigation
  'MOD+1': { description: 'Switch to Task Board', category: 'Navigation' },
  'MOD+2': { description: 'Switch to Activity Feed', category: 'Navigation' },
  'MOD+3': { description: 'Switch to Team Management', category: 'Navigation' },
  'MOD+K': { description: 'Open Command Palette', category: 'Navigation' },
  'MOD+/': { description: 'Show Keyboard Shortcuts', category: 'Navigation' },
  
  // Task Management
  'MOD+N': { description: 'Create New Task', category: 'Task Management' },
  'MOD+E': { description: 'Edit Selected Task', category: 'Task Management' },
  'MOD+D': { description: 'Duplicate Selected Task', category: 'Task Management' },
  'DELETE': { description: 'Delete Selected Task', category: 'Task Management' },
  'ENTER': { description: 'Open Selected Task', category: 'Task Management' },
  'ESC': { description: 'Close Modal/Deselect', category: 'Task Management' },
  
  // Bulk Operations
  'MOD+A': { description: 'Select All Tasks', category: 'Bulk Operations' },
  'MOD+SHIFT+A': { description: 'Deselect All Tasks', category: 'Bulk Operations' },
  'MOD+SHIFT+C': { description: 'Mark Selected as Complete', category: 'Bulk Operations' },
  'MOD+SHIFT+P': { description: 'Change Priority of Selected', category: 'Bulk Operations' },
  
  // Search & Filters
  'MOD+F': { description: 'Focus Search', category: 'Search & Filters' },
  'MOD+G': { description: 'Find Next', category: 'Search & Filters' },
  'MOD+SHIFT+G': { description: 'Find Previous', category: 'Search & Filters' },
  'MOD+SHIFT+F': { description: 'Toggle Filters', category: 'Search & Filters' },
  
  // Quick Actions
  'MOD+S': { description: 'Save Current Changes', category: 'Quick Actions' },
  'MOD+Z': { description: 'Undo Last Action', category: 'Quick Actions' },
  'MOD+SHIFT+Z': { description: 'Redo Last Action', category: 'Quick Actions' },
  'MOD+R': { description: 'Refresh Data', category: 'Quick Actions' }
};

// Helper to detect Mac vs PC
const isMac = typeof navigator !== 'undefined' && navigator.platform.indexOf('Mac') > -1;
const MOD_KEY = isMac ? 'cmd' : 'ctrl';

// Convert shortcut string to readable format
const formatShortcut = (shortcut) => {
  return shortcut
    .replace('MOD', isMac ? '⌘' : 'Ctrl')
    .replace('SHIFT', isMac ? '⇧' : 'Shift')
    .replace('ALT', isMac ? '⌥' : 'Alt')
    .split('+')
    .join(isMac ? '' : ' + ');
};

// Parse shortcut string for event matching
const parseShortcut = (shortcut) => {
  const parts = shortcut.split('+');
  return {
    key: parts[parts.length - 1].toLowerCase(),
    ctrlKey: parts.includes('MOD') && !isMac,
    metaKey: parts.includes('MOD') && isMac,
    shiftKey: parts.includes('SHIFT'),
    altKey: parts.includes('ALT')
  };
};

// Check if event matches shortcut
const matchesShortcut = (event, shortcut) => {
  const parsed = parseShortcut(shortcut);
  
  // Handle special keys
  let eventKey = event.key.toLowerCase();
  if (eventKey === 'delete') eventKey = 'delete';
  if (eventKey === 'escape') eventKey = 'esc';
  if (eventKey === 'enter') eventKey = 'enter';
  
  return (
    eventKey === parsed.key &&
    event.ctrlKey === parsed.ctrlKey &&
    event.metaKey === parsed.metaKey &&
    event.shiftKey === parsed.shiftKey &&
    event.altKey === parsed.altKey
  );
};

// Hook for keyboard shortcuts
export const useKeyboardShortcuts = (shortcuts = {}, enabled = true) => {
  const [pressedKeys, setPressedKeys] = useState(new Set());

  const handleKeyDown = useCallback((event) => {
    if (!enabled) return;
    
    // Don't trigger shortcuts when typing in inputs
    if (event.target.tagName === 'INPUT' || 
        event.target.tagName === 'TEXTAREA' || 
        event.target.contentEditable === 'true') {
      return;
    }

    // Check for matching shortcuts
    Object.entries(shortcuts).forEach(([shortcut, handler]) => {
      if (matchesShortcut(event, shortcut)) {
        event.preventDefault();
        event.stopPropagation();
        handler(event);
      }
    });

    // Track pressed keys for visual feedback
    setPressedKeys(prev => new Set([...prev, event.key.toLowerCase()]));
  }, [shortcuts, enabled]);

  const handleKeyUp = useCallback((event) => {
    setPressedKeys(prev => {
      const newSet = new Set(prev);
      newSet.delete(event.key.toLowerCase());
      return newSet;
    });
  }, []);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp, enabled]);

  return { pressedKeys };
};

// Keyboard Shortcuts Help Modal
export const KeyboardShortcutsModal = ({ isOpen, onClose }) => {
  const { isMobile } = useResponsive();

  // Group shortcuts by category
  const groupedShortcuts = Object.entries(SHORTCUTS).reduce((acc, [shortcut, config]) => {
    const category = config.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push({ shortcut, ...config });
    return acc;
  }, {});

  const categories = Object.keys(groupedShortcuts);

  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      title="Keyboard Shortcuts"
      size="lg"
    >
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
        gap: '24px',
        maxHeight: '60vh',
        overflowY: 'auto'
      }}>
        {categories.map(category => (
          <div key={category}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '12px',
              color: '#111827',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Keyboard style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
              {category}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {groupedShortcuts[category].map(({ shortcut, description }) => (
                <div 
                  key={shortcut}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <span style={{ 
                    fontSize: '14px', 
                    color: '#374151',
                    flex: 1
                  }}>
                    {description}
                  </span>
                  <kbd style={{
                    padding: '4px 8px',
                    backgroundColor: '#111827',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    fontWeight: '500',
                    border: '1px solid #374151',
                    boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.25)',
                    minWidth: '60px',
                    textAlign: 'center'
                  }}>
                    {formatShortcut(shortcut)}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop: '24px',
        padding: '16px',
        backgroundColor: '#eff6ff',
        border: '1px solid #dbeafe',
        borderRadius: '8px'
      }}>
        <h4 style={{
          fontSize: '14px',
          fontWeight: '600',
          marginBottom: '8px',
          color: '#1e40af'
        }}>
          Pro Tip
        </h4>
        <p style={{
          fontSize: '14px',
          color: '#1e40af',
          margin: 0,
          lineHeight: '1.5'
        }}>
          Press <kbd style={{ 
            padding: '2px 6px', 
            backgroundColor: '#1e40af',
            color: 'white',
            borderRadius: '3px',
            fontSize: '12px'
          }}>
            {formatShortcut('MOD+/')}
          </kbd> anytime to open this help panel quickly!
        </p>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end',
        marginTop: '24px'
      }}>
        <AccessibleButton onClick={onClose}>
          Got it!
        </AccessibleButton>
      </div>
    </AccessibleModal>
  );
};

// Command Palette for quick actions
export const CommandPalette = ({ 
  isOpen, 
  onClose, 
  commands = [],
  onExecuteCommand 
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { isMobile } = useResponsive();

  // Filter commands based on query
  const filteredCommands = commands.filter(command =>
    command.title.toLowerCase().includes(query.toLowerCase()) ||
    command.description?.toLowerCase().includes(query.toLowerCase())
  );

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation in command palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          event.preventDefault();
          if (filteredCommands[selectedIndex]) {
            onExecuteCommand(filteredCommands[selectedIndex]);
            onClose();
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onExecuteCommand, onClose]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 4000,
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '10vh 20px 20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '600px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden'
      }}>
        {/* Search Input */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Command style={{
              position: 'absolute',
              left: '12px',
              width: '20px',
              height: '20px',
              color: '#6b7280'
            }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search..."
              autoFocus
              style={{
                width: '100%',
                padding: '12px 12px 12px 44px',
                border: 'none',
                outline: 'none',
                fontSize: '16px',
                backgroundColor: 'transparent'
              }}
            />
          </div>
        </div>

        {/* Commands List */}
        <div style={{
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          {filteredCommands.length === 0 ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              <p>No commands found for "{query}"</p>
            </div>
          ) : (
            filteredCommands.map((command, index) => (
              <div
                key={command.id || index}
                onClick={() => {
                  onExecuteCommand(command);
                  onClose();
                }}
                style={{
                  padding: '12px 20px',
                  backgroundColor: index === selectedIndex ? '#eff6ff' : 'transparent',
                  borderLeft: index === selectedIndex ? '3px solid #3b82f6' : '3px solid transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.1s ease'
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                {command.icon && (
                  <div style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: index === selectedIndex ? '#3b82f6' : '#f3f4f6',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <command.icon style={{
                      width: '16px',
                      height: '16px',
                      color: index === selectedIndex ? 'white' : '#6b7280'
                    }} />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#111827',
                    marginBottom: '2px'
                  }}>
                    {command.title}
                  </div>
                  {command.description && (
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280'
                    }}>
                      {command.description}
                    </div>
                  )}
                </div>
                {command.shortcut && (
                  <kbd style={{
                    padding: '2px 6px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #d1d5db',
                    borderRadius: '3px',
                    fontSize: '11px',
                    color: '#6b7280'
                  }}>
                    {formatShortcut(command.shortcut)}
                  </kbd>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Visual indicator for active shortcuts
export const ShortcutIndicator = ({ shortcuts = {}, className = '' }) => {
  const { pressedKeys } = useKeyboardShortcuts(shortcuts);

  if (pressedKeys.size === 0) return null;

  return (
    <div className={className} style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#111827',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '14px',
      fontFamily: 'monospace',
      zIndex: 9999,
      pointerEvents: 'none'
    }}>
      Keys: {Array.from(pressedKeys).join(' + ')}
    </div>
  );
};

export default {
  SHORTCUTS,
  useKeyboardShortcuts,
  KeyboardShortcutsModal,
  CommandPalette,
  ShortcutIndicator,
  formatShortcut
};