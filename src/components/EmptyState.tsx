import React from 'react';
import { Card } from './Card';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction
}: EmptyStateProps) {
  return (
    <Card
      radius="lg"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-48) var(--space-24)',
        textAlign: 'center',
        gap: 'var(--space-16)',
        backgroundColor: 'transparent',
        border: '1px dashed var(--border)'
      }}
    >
      {icon && (
        <div style={{ color: 'var(--text-secondary)', display: 'inline-flex' }}>
          {icon}
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        <h3 className="text-16" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {title}
        </h3>
        <p className="text-14" style={{ color: 'var(--text-secondary)', maxWidth: '320px', margin: '0 auto' }}>
          {description}
        </p>
      </div>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Card>
  );
}
