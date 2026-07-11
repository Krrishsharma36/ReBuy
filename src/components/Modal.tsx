import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
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
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'var(--space-16)',
        backdropFilter: 'none', // Strict rule: No glassmorphism
        animation: 'fadeInOverlay var(--transition-speed) ease-out'
      }}
      onClick={(e) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
          onClose();
        }
      }}
    >
      <Card
        ref={modalRef}
        radius="lg"
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-16)',
          animation: 'slideUpModal var(--transition-speed) var(--transition-ease)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="text-20" style={{ fontWeight: 600 }}>{title}</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            icon={<X size={18} />}
            aria-label="Close modal"
            style={{ height: '36px', width: '36px', padding: 0 }}
          />
        </div>

        {/* Content */}
        <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-14)' }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-8)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-16)' }}>
            {footer}
          </div>
        )}
      </Card>

      <style>{`
        @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUpModal {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
