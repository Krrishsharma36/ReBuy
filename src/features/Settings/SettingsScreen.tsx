import React, { useState } from 'react';
import { Sun, Moon, Laptop, Download, Upload, Info } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '../../context/NavigationContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { SnackBar } from '../../components/SnackBar';

export function SettingsScreen() {
  const { theme, setTheme } = useTheme();
  const { navigateTo } = useNavigation();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleExport = () => {
    // Mock export download trigger
    setToastMessage('Exported 4 memory records to ReBuy_Backup.json');
  };

  const handleImport = () => {
    // Mock import action triggers
    setToastMessage('Successfully imported 14 memory logs from backup');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' }}>
      {/* Title */}
      <div>
        <h1 className="text-28" style={{ fontWeight: 700 }}>Settings</h1>
        <p className="text-14" style={{ color: 'var(--text-secondary)' }}>
          Configure theme preferences and manage database logs
        </p>
      </div>

      {/* Theme Selection */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
        <h2 className="text-12" style={{ fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Select Color Theme
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-12)' }}>
          <Card
            hoverable
            onClick={() => setTheme('light')}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme === 'light' ? 'var(--bg-hover)' : 'var(--bg-card)',
              borderColor: theme === 'light' ? 'var(--primary)' : 'var(--border)'
            }}
          >
            <Sun size={20} style={{ color: theme === 'light' ? 'var(--primary)' : 'var(--text-secondary)' }} />
            <span className="text-14" style={{ fontWeight: 500 }}>Light</span>
          </Card>
          
          <Card
            hoverable
            onClick={() => setTheme('dark')}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme === 'dark' ? 'var(--bg-hover)' : 'var(--bg-card)',
              borderColor: theme === 'dark' ? 'var(--primary)' : 'var(--border)'
            }}
          >
            <Moon size={20} style={{ color: theme === 'dark' ? 'var(--primary)' : 'var(--text-secondary)' }} />
            <span className="text-14" style={{ fontWeight: 500 }}>Dark</span>
          </Card>
          
          <Card
            hoverable
            onClick={() => setTheme('system')}
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme === 'system' ? 'var(--bg-hover)' : 'var(--bg-card)',
              borderColor: theme === 'system' ? 'var(--primary)' : 'var(--border)'
            }}
          >
            <Laptop size={20} style={{ color: theme === 'system' ? 'var(--primary)' : 'var(--text-secondary)' }} />
            <span className="text-14" style={{ fontWeight: 500 }}>System</span>
          </Card>
        </div>
      </section>

      {/* Memory Backup Data Managers */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
        <h2 className="text-12" style={{ fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Data Portability
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          <Button variant="secondary" onClick={handleExport} icon={<Download size={16} />} style={{ justifyContent: 'flex-start' }}>
            Export Memory Database
          </Button>
          <Button variant="secondary" onClick={handleImport} icon={<Upload size={16} />} style={{ justifyContent: 'flex-start' }}>
            Import Memory Database
          </Button>
        </div>
      </section>

      {/* Navigation about link */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
        <h2 className="text-12" style={{ fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          App Info
        </h2>
        <Button variant="ghost" onClick={() => navigateTo('about')} icon={<Info size={16} />} style={{ justifyContent: 'flex-start', paddingLeft: 0 }}>
          About ReBuy Philosophy
        </Button>
      </section>

      {/* Toast popup */}
      {toastMessage && (
        <SnackBar
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}

