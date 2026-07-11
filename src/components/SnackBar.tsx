import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface SnackBarMessage {
  id: string;
  message: string;
  type?: 'success' | 'warning' | 'danger' | 'info';
}

interface SnackBarProps {
  message: string;
  type?: 'success' | 'warning' | 'danger' | 'info';
  onClose: () => void;
  duration?: number;
}

export function SnackBar({
  message,
  type = 'info',
  onClose,
  duration = 3000
}: SnackBarProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getStyle = () => {
    let borderLeft = '4px solid var(--primary)';
    let colorIcon = 'var(--primary)';

    if (type === 'success') {
      borderLeft = '4px solid var(--success)';
      colorIcon = 'var(--success)';
    } else if (type === 'warning') {
      borderLeft = '4px solid var(--warning)';
      colorIcon = 'var(--warning)';
    } else if (type === 'danger') {
      borderLeft = '4px solid var(--danger)';
      colorIcon = 'var(--danger)';
    }

    return {
      borderLeft,
      colorIcon
    };
  };

  const { borderLeft, colorIcon } = getStyle();

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'var(--space-24)',
        right: 'var(--space-24)',
        left: 'var(--space-24)',
        maxWidth: '360px',
        margin: '0 auto',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderLeft,
        borderRadius: 'var(--radius-8)',
        padding: 'var(--space-16)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--space-16)',
        boxShadow: 'var(--shadow-md)',
        zIndex: 1100,
        animation: 'slideUpSnack var(--transition-speed) var(--transition-ease)'
      }}
      role="alert"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-12)' }}>
        <span style={{ color: colorIcon, display: 'inline-flex' }}>
          {type === 'success' && <CheckCircle2 size={18} />}
          {type === 'warning' && <AlertTriangle size={18} />}
          {type === 'danger' && <AlertCircle size={18} />}
          {type === 'info' && <Info size={18} />}
        </span>
        <span className="text-14" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
          {message}
        </span>
      </div>
      <button
        onClick={onClose}
        style={{
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: 'transparent'
        }}
        aria-label="Close message"
      >
        <X size={14} />
      </button>

      <style>{`
        @keyframes slideUpSnack {
          from { transform: translateY(24px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
