import React, { useEffect, useRef } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 999,
        animation: 'fadeInOverlay var(--transition-speed) ease-out'
      }}
      onClick={(e) => {
        if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
          onClose();
        }
      }}
    >
      <div
        ref={sheetRef}
        style={{
          width: '100%',
          maxWidth: '680px',
          backgroundColor: 'var(--bg-card)',
          borderTopLeftRadius: 'var(--radius-24)',
          borderTopRightRadius: 'var(--radius-24)',
          borderTop: '1px solid var(--border)',
          padding: 'var(--space-24)',
          animation: 'slideUpSheet var(--transition-speed) var(--transition-ease)',
          boxShadow: '0 -4px 10px rgba(0, 0, 0, 0.05)'
        }}
      >
        {/* Handle for dragging/indicator */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-8)' }}>
          <div style={{ width: '40px', height: '4px', borderRadius: 'var(--radius-8)', backgroundColor: 'var(--border)' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-16)' }}>
          <h2 className="text-20" style={{ fontWeight: 600 }}>{title}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            icon={<X size={18} />}
            style={{ width: '36px', height: '36px', padding: 0 }}
          />
        </div>

        {/* Content */}
        <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes slideUpSheet {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
