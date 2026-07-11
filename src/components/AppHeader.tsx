import React from 'react';
import { Sun, Moon, Settings, Clock, ArrowLeft, Info, Home } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from './Button';

interface AppHeaderProps {
  compact?: boolean;
}

export function AppHeader({ compact = false }: AppHeaderProps) {
  const { currentScreen, navigateTo, goBack } = useNavigation();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun size={18} />;
      case 'dark': return <Moon size={18} />;
      case 'system':
      default:
        return (
          <span style={{ position: 'relative', display: 'inline-flex' }}>
            <Sun size={18} style={{ opacity: 0.5 }} />
            <span style={{ position: 'absolute', top: 0, left: 0, overflow: 'hidden', width: '50%' }}>
              <Moon size={18} />
            </span>
          </span>
        );
    }
  };

  const showBackButton = currentScreen !== 'home';

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingBottom: 'var(--space-16)',
        borderBottom: compact ? '1px solid var(--border)' : 'none',
        marginBottom: compact ? 'var(--space-16)' : '0'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
        {showBackButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            icon={<ArrowLeft size={18} />}
            aria-label="Go back"
            style={{ width: '40px', height: '40px', padding: 0 }}
          />
        )}
        
        {!compact ? (
          <div>
            <h1 className="text-28" style={{ fontWeight: 700, margin: 0, letterSpacing: '-0.03em' }}>
              ReBuy
            </h1>
            <p className="text-12" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
              Remember Once. Reuse Forever.
            </p>
          </div>
        ) : (
          <div style={{ cursor: 'pointer' }} onClick={() => navigateTo('home')}>
            <h1 className="text-20" style={{ fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
              ReBuy
            </h1>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
        {currentScreen !== 'home' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateTo('home')}
            icon={<Home size={18} />}
            aria-label="Home page"
            style={{ width: '40px', height: '40px', padding: 0 }}
          />
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateTo('timeline')}
          icon={<Clock size={18} />}
          aria-label="Timeline log"
          style={{
            width: '40px',
            height: '40px',
            padding: 0,
            color: currentScreen === 'timeline' ? 'var(--primary)' : 'inherit'
          }}
        />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateTo('settings')}
          icon={<Settings size={18} />}
          aria-label="Settings page"
          style={{
            width: '40px',
            height: '40px',
            padding: 0,
            color: currentScreen === 'settings' ? 'var(--primary)' : 'inherit'
          }}
        />

        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          icon={getThemeIcon()}
          aria-label={`Toggle theme (currently ${theme})`}
          style={{ width: '40px', height: '40px', padding: 0 }}
        />
      </div>
    </header>
  );
}
