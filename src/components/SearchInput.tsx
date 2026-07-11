import React, { useRef, useEffect } from 'react';
import { Search, Command } from 'lucide-react';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  onSubmit,
  placeholder = 'What do you want to remember?'
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when pressing '/' key on keyboard (if not already focused inside an input)
  useKeyboardShortcuts({
    '/': () => {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    },
    'Escape': () => {
      inputRef.current?.blur();
      onChange('');
    }
  }, { preventDefault: true, disableOnInput: true });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSubmit) {
      onSubmit();
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        gap: 'var(--space-8)'
      }}
    >
      <Search
        size={18}
        style={{
          position: 'absolute',
          left: 'var(--space-16)',
          color: 'var(--text-secondary)',
          pointerEvents: 'none'
        }}
      />
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        aria-label={placeholder}
        style={{
          width: '100%',
          height: '48px', // large touch target
          padding: '0 var(--space-48) 0 var(--space-48)',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-12)',
          color: 'var(--text-primary)',
          fontSize: 'var(--font-16)',
          fontFamily: 'var(--font-family)',
          fontWeight: 400,
          outline: 'none',
          boxShadow: 'var(--shadow-sm)',
          transition: 'border-color var(--transition-speed) var(--transition-ease), box-shadow var(--transition-speed) var(--transition-ease)'
        }}
      />
      
      {/* Keyboard Hint HUD */}
      <kbd
        onClick={() => inputRef.current?.focus()}
        style={{
          position: 'absolute',
          right: 'var(--space-16)',
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          padding: '2px 6px',
          backgroundColor: 'var(--bg-app)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-8)',
          color: 'var(--text-secondary)',
          fontSize: 'var(--font-12)',
          cursor: 'pointer',
          userSelect: 'none'
        }}
      >
        <Command size={10} />K
      </kbd>
    </div>
  );
}
