import React from 'react';

interface LoadingIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export function LoadingIndicator({ size = 'md', label }: LoadingIndicatorProps) {
  const getDimension = () => {
    switch (size) {
      case 'sm': return '16px';
      case 'lg': return '32px';
      case 'md':
      default: return '24px';
    }
  };

  const dimension = getDimension();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-8)', padding: 'var(--space-16)' }}>
      <div
        style={{
          width: dimension,
          height: dimension,
          border: '2px solid var(--border)',
          borderTop: '2px solid var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite'
        }}
      />
      {label && <span className="text-12" style={{ color: 'var(--text-secondary)' }}>{label}</span>}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
