import React, { useState } from 'react';
import { Sun, Moon, Laptop, Download, Upload, Info, Database, Play, Trash2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigation } from '../../context/NavigationContext';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { SnackBar } from '../../components/SnackBar';
import { BackupService } from '../../services/BackupService';
import { DatabaseSeeder } from '../../utils/seeder';
import { ReBuyDBManager } from '../../database/db';

export function SettingsScreen() {
  const { theme, setTheme } = useTheme();
  const { navigateTo } = useNavigation();
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'danger' } | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [clearing, setClearing] = useState(false);

  const backupService = new BackupService();

  const handleExport = async () => {
    try {
      const json = await backupService.exportData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ReBuy_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      setToast({ message: 'Backup JSON downloaded successfully', type: 'success' });
    } catch (e) {
      setToast({ message: 'Failed to export backup', type: 'danger' });
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        await backupService.importData(text, 'merge');
        setToast({ message: 'Backup merge completed successfully', type: 'success' });
      } catch (err) {
        setToast({ message: 'Failed to import backup file', type: 'danger' });
      }
    };
    reader.readAsText(file);
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const result = await DatabaseSeeder.seed(30, 3);
      setToast({
        message: `Successfully seeded ${result.objectsSeeded} objects & ${result.activitiesSeeded} activities in ${result.durationMs}ms!`,
        type: 'success'
      });
    } catch (e) {
      setToast({ message: 'Seeding database failed', type: 'danger' });
    } finally {
      setSeeding(false);
    }
  };

  const handleClearDatabase = async () => {
    if (!confirm('Are you absolutely sure you want to clear ReBuyDB? This will wipe out all memories, activities, and settings!')) return;
    setClearing(true);
    try {
      const dbManager = ReBuyDBManager.getInstance();
      const stores: ('objects' | 'activities' | 'preferences' | 'metadata' | 'searchIndex')[] = [
        'objects',
        'activities',
        'preferences',
        'metadata',
        'searchIndex'
      ];
      for (const storeName of stores) {
        const { store } = await dbManager.getStoreTransaction(storeName, 'readwrite');
        await new Promise<void>((resolve, reject) => {
          const request = store.clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
      setToast({ message: 'Database cleared successfully. All stores wiped.', type: 'success' });
    } catch (e) {
      setToast({ message: 'Failed to clear database', type: 'danger' });
    } finally {
      setClearing(false);
    }
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
            Export Database to JSON
          </Button>
          
          <div style={{ position: 'relative', width: '100%' }}>
            <Button
              variant="secondary"
              onClick={() => document.getElementById('importFile')?.click()}
              icon={<Upload size={16} />}
              style={{ justifyContent: 'flex-start', width: '100%' }}
            >
              Import JSON Backup
            </Button>
            <input
              id="importFile"
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </section>

      {/* Developer Options */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
        <h2 className="text-12" style={{ fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Developer Tools
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          <Button variant="secondary" onClick={handleSeed} disabled={seeding} icon={<Play size={16} />} style={{ justifyContent: 'flex-start' }}>
            {seeding ? 'Seeding Database...' : 'Seed 30 Sample Memories'}
          </Button>
          <Button variant="ghost" onClick={handleClearDatabase} disabled={clearing} icon={<Trash2 size={16} />} style={{ justifyContent: 'flex-start', color: 'var(--danger)' }}>
            {clearing ? 'Clearing Stores...' : 'Wipe ReBuyDB Stores'}
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

      {/* SnackBar Toasts */}
      {toast && (
        <SnackBar
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
