import React, { useState, useEffect, useRef } from 'react';
import { Command, Compass, Settings, Clock, Info, SunMoon, Database, X } from 'lucide-react';
import { useNavigation, ScreenType } from '../context/NavigationContext';
import { useTheme } from '../context/ThemeContext';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
  shortcut?: string;
}

interface CommandBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandBar({ isOpen, onClose }: CommandBarProps) {
  const { navigateTo } = useNavigation();
  const { theme, setTheme } = useTheme();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Command configurations
  const commands: CommandItem[] = [
    {
      id: 'go-home',
      title: 'Navigate to Home',
      subtitle: 'Go back to memory capture input',
      icon: <Compass size={16} />,
      action: () => { navigateTo('home'); onClose(); }
    },
    {
      id: 'go-timeline',
      title: 'Navigate to Timeline',
      subtitle: 'View chronological memory list',
      icon: <Clock size={16} />,
      action: () => { navigateTo('timeline'); onClose(); }
    },
    {
      id: 'go-settings',
      title: 'Navigate to Settings',
      subtitle: 'Adjust options and manage data',
      icon: <Settings size={16} />,
      action: () => { navigateTo('settings'); onClose(); }
    },
    {
      id: 'go-about',
      title: 'Navigate to About',
      subtitle: 'Philosophy of ReBuy',
      icon: <Info size={16} />,
      action: () => { navigateTo('about'); onClose(); }
    },
    {
      id: 'toggle-dark',
      title: 'Set Theme to Dark',
      subtitle: 'Swap styles to dark',
      icon: <SunMoon size={16} />,
      action: () => { setTheme('dark'); onClose(); }
    },
    {
      id: 'toggle-light',
      title: 'Set Theme to Light',
      subtitle: 'Swap styles to light',
      icon: <SunMoon size={16} />,
      action: () => { setTheme('light'); onClose(); }
    },
    {
      id: 'toggle-system',
      title: 'Set Theme to System Default',
      subtitle: 'Sync color style to OS settings',
      icon: <SunMoon size={16} />,
      action: () => { setTheme('system'); onClose(); }
    }
  ];

  // Filter commands by search string
  const filteredCommands = commands.filter(cmd =>
    cmd.title.toLowerCase().includes(search.toLowerCase()) ||
    cmd.subtitle?.toLowerCase().includes(search.toLowerCase())
  );

  // Keyboard navigation inside command palette
  useEffect(() => {
    if (!isOpen) return;

    // Autofocus input
    setTimeout(() => inputRef.current?.focus(), 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  // Keep selected index in bounds if search query changes length of list
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        zIndex: 2000,
        paddingTop: '10vh',
        paddingLeft: 'var(--space-16)',
        paddingRight: 'var(--space-16)'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-16)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-md)',
          overflow: 'hidden',
          animation: 'slideDownCommand var(--transition-speed) var(--transition-ease)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid var(--border)',
            padding: 'var(--space-16) var(--space-24)',
            gap: 'var(--space-16)'
          }}
        >
          <Command size={18} style={{ color: 'var(--text-secondary)' }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flexGrow: 1,
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              fontSize: 'var(--font-16)',
              outline: 'none',
              border: 'none'
            }}
          />
          <button onClick={onClose} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>

        {/* List items */}
        <div
          ref={listRef}
          style={{
            maxHeight: '320px',
            overflowY: 'auto',
            padding: 'var(--space-8)'
          }}
        >
          {filteredCommands.length > 0 ? (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={cmd.action}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-12) var(--space-16)',
                    borderRadius: 'var(--radius-8)',
                    backgroundColor: isSelected ? 'var(--bg-hover)' : 'transparent',
                    cursor: 'pointer',
                    gap: 'var(--space-16)',
                    transition: 'background-color 100ms ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
                    <span style={{ color: isSelected ? 'var(--primary)' : 'var(--text-secondary)', display: 'inline-flex' }}>
                      {cmd.icon}
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="text-14" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{cmd.title}</span>
                      {cmd.subtitle && (
                        <span className="text-12" style={{ color: 'var(--text-secondary)' }}>{cmd.subtitle}</span>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <span className="text-12" style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                      Enter to run
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ padding: 'var(--space-24)', textAlign: 'center', color: 'var(--text-secondary)' }} className="text-14">
              No commands found
            </div>
          )}
        </div>

        {/* Footer shortcuts helper info */}
        <div
          style={{
            padding: 'var(--space-8) var(--space-24)',
            backgroundColor: 'var(--bg-app)',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            color: 'var(--text-secondary)',
            fontSize: 'var(--font-12)'
          }}
        >
          <span>Use <kbd>↑</kbd> <kbd>↓</kbd> to navigate</span>
          <span>Press <kbd>Esc</kbd> to close</span>
        </div>
      </div>

      <style>{`
        @keyframes slideDownCommand {
          from { transform: translateY(-12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
