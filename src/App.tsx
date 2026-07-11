import React, { useState } from 'react';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { ThemeProvider } from './context/ThemeContext';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { AppHeader } from './components/AppHeader';
import { CommandBar } from './components/CommandBar';

// Feature screens
import { HomeScreen } from './features/Home/HomeScreen';
import { TimelineScreen } from './features/Timeline/TimelineScreen';
import { DetailsScreen } from './features/Details/DetailsScreen';
import { SettingsScreen } from './features/Settings/SettingsScreen';
import { AboutScreen } from './features/About/AboutScreen';

function AppShellContent() {
  const { currentScreen } = useNavigation();
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // Bind command bar toggle shortcut: Cmd+K or Ctrl+K
  useKeyboardShortcuts({
    'mod+k': () => setIsCommandOpen(prev => !prev),
    'Escape': () => setIsCommandOpen(false)
  }, { preventDefault: true, disableOnInput: false });

  // Map active screen states to views
  const renderScreen = () => {
    switch (currentScreen) {
      case 'timeline':
        return <TimelineScreen />;
      case 'details':
        return <DetailsScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'about':
        return <AboutScreen />;
      case 'home':
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="app-container">
      {/* Brand & navigation header bar */}
      <AppHeader compact={currentScreen !== 'home'} />

      {/* Screen area container */}
      <main style={{ minHeight: '60vh' }}>
        {renderScreen()}
      </main>

      {/* Raycast Command Bar Modal overlay */}
      <CommandBar
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
      />

      {/* Footnotes navigation guides */}
      <footer style={{ marginTop: 'var(--space-48)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-16)', color: 'var(--text-secondary)' }} className="text-12">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>ReBuy memory bank (Mock UI Mode)</span>
          <span style={{ display: 'flex', gap: 'var(--space-16)' }}>
            <span>Press <kbd>⌘ K</kbd> for commands</span>
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NavigationProvider>
        <AppShellContent />
      </NavigationProvider>
    </ThemeProvider>
  );
}
