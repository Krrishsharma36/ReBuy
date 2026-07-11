import React from 'react';
import { Shield, Smartphone, Zap, Sparkles } from 'lucide-react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useNavigation } from '../../context/NavigationContext';

export function AboutScreen() {
  const { navigateTo } = useNavigation();

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-24)' }}>
      {/* Title */}
      <div>
        <h1 className="text-28" style={{ fontWeight: 700 }}>About ReBuy</h1>
        <p className="text-14" style={{ color: 'var(--text-secondary)' }}>
          Frictionless Personal Memory Engine
        </p>
      </div>

      {/* Intro Pitch */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-16)' }}>
        <p className="text-16" style={{ color: 'var(--text-primary)', lineHeight: 1.6 }}>
          ReBuy is designed for recall speed. It is **not** an expense tracker, an accounting ledger, or an inventory manager. It is a tool to help you recall details in less than 3 seconds.
        </p>
        <p className="text-14" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          By offloading your search context (renewals, quote comparisons, recurring services) into a local natural language search database, you save energy and retain memory control.
        </p>
      </section>

      {/* Highlights grid */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-16)' }}>
        <Card radius="md" style={{ gap: 'var(--space-8)' }}>
          <Shield size={20} style={{ color: 'var(--success)' }} />
          <h3 className="text-14" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Offline First</h3>
          <p className="text-12" style={{ color: 'var(--text-secondary)' }}>All data resides inside your local browser. Zero server risks.</p>
        </Card>

        <Card radius="md" style={{ gap: 'var(--space-8)' }}>
          <Zap size={20} style={{ color: 'var(--warning)' }} />
          <h3 className="text-14" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Natural Parser</h3>
          <p className="text-12" style={{ color: 'var(--text-secondary)' }}>Write sentences naturally. The algorithm extracts costs, merchants, and tags.</p>
        </Card>

        <Card radius="md" style={{ gap: 'var(--space-8)' }}>
          <Smartphone size={20} style={{ color: 'var(--primary)' }} />
          <h3 className="text-14" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Instant Touch</h3>
          <p className="text-12" style={{ color: 'var(--text-secondary)' }}>Large touch target bounds optimized for single-hand mobile usage.</p>
        </Card>

        <Card radius="md" style={{ gap: 'var(--space-8)' }}>
          <Sparkles size={20} style={{ color: 'var(--primary)' }} />
          <h3 className="text-14" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Raycast Control</h3>
          <p className="text-12" style={{ color: 'var(--text-secondary)' }}>Use keyboard shortcuts to control search queries and capture modals.</p>
        </Card>
      </section>

      {/* Call to action button */}
      <section style={{ marginTop: 'var(--space-16)', display: 'flex', justifyContent: 'center' }}>
        <Button variant="primary" onClick={() => navigateTo('home')}>
          Get Started
        </Button>
      </section>
    </div>
  );
}

