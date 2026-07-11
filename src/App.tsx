import { useState } from 'react';
import { Search, Sparkles, Command, Keyboard, Database, ShieldAlert, Wifi } from 'lucide-react';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

export default function App() {
  const [query, setQuery] = useState('');
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  // Hook up shortcuts: Ctrl+K or Cmd+K toggles the command bar, Esc closes it.
  useKeyboardShortcuts({
    'mod+k': () => setIsCommandOpen(prev => !prev),
    'Escape': () => setIsCommandOpen(false)
  }, { preventDefault: true, disableOnInput: false });

  return (
    <div className="container animate-fade-in" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)', paddingTop: 'var(--space-2xl)' }}>
      {/* Premium Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '1.75rem', fontFamily: 'var(--font-header)' }}>ReBuy</h1>
          <p className="body-sm">Personal Memory Engine</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-xs)', alignItems: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: '4px 8px', borderRadius: 'var(--radius-full)', background: 'rgba(34, 197, 94, 0.1)', color: 'rgb(74, 222, 128)' }}>
            <Wifi size={12} /> Offline Ready
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', padding: '4px 8px', borderRadius: 'var(--radius-full)', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)' }}>
            <Database size={12} /> Local
          </span>
        </div>
      </header>

      {/* Search & Capture Trigger Component Skeleton */}
      <section className="glass-panel" style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', color: 'hsl(var(--text-muted))' }} />
          <input
            type="text"
            placeholder="Search memories or type a purchase to save (e.g. Starbucks $4.50 #food)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 40px',
              background: 'hsl(var(--bg-surface))',
              border: '1px solid hsl(var(--border-subtle))',
              borderRadius: 'var(--radius-md)',
              color: 'hsl(var(--text-primary))',
              fontSize: '0.9375rem'
            }}
          />
          <kbd style={{
            position: 'absolute',
            right: '12px',
            background: 'hsl(var(--bg-surface-elevated))',
            padding: '3px 6px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            color: 'hsl(var(--text-muted))',
            border: '1px solid hsl(var(--border-strong))',
            display: 'flex',
            alignItems: 'center',
            gap: '2px'
          }}>
            <Command size={10} />K
          </kbd>
        </div>

        {query.trim() && (
          <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', background: 'rgba(139, 92, 246, 0.05)', border: '1px dashed rgba(139, 92, 246, 0.3)', padding: 'var(--space-sm)', borderRadius: 'var(--radius-sm)' }}>
            <Sparkles size={14} style={{ color: 'hsl(var(--accent-primary))' }} />
            <span style={{ fontSize: '0.8125rem', color: 'hsl(var(--text-secondary))' }}>
              Press <kbd style={{ padding: '2px 4px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px' }}>Enter</kbd> to quick-parse and save this memory
            </span>
          </div>
        )}
      </section>

      {/* Main Stream Area */}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <h3 style={{ fontSize: '1rem', color: 'hsl(var(--text-primary))' }}>Recent Capture Stream</h3>
        
        {/* Empty State Mock */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-2xl)', textAlign: 'center', gap: 'var(--space-sm)' }}>
          <div style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-full)', background: 'hsl(var(--bg-surface))', color: 'hsl(var(--accent-primary))' }}>
            <Command size={32} />
          </div>
          <div>
            <h4 style={{ fontWeight: 600 }}>Your memory bank is empty</h4>
            <p className="body-sm" style={{ maxWidth: '320px', margin: '8px auto 0' }}>
              Type your first purchase, renewal date, or quote in the input field above. The NLP engine will parse it on the fly.
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Keyboard Shortcuts HUD */}
      <footer style={{ marginTop: 'auto', borderTop: '1px solid hsl(var(--border-subtle))', paddingTop: 'var(--space-md)', paddingBottom: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'hsl(var(--text-muted))', fontSize: '0.75rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Keyboard size={12} /> Shortcuts
          </span>
          <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
            <span><kbd style={{ padding: '2px 4px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>⌘ K</kbd> Toggle capture</span>
            <span><kbd style={{ padding: '2px 4px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>/</kbd> Focus search</span>
            <span><kbd style={{ padding: '2px 4px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>Esc</kbd> Clear</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
