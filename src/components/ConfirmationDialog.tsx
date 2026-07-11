import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: 'primary' | 'danger';
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  type = 'danger'
}: ConfirmationDialogProps) {
  const footer = (
    <>
      <Button variant="ghost" size="sm" onClick={onClose}>
        {cancelLabel}
      </Button>
      <Button variant={type} size="sm" onClick={() => {
        onConfirm();
        onClose();
      }}>
        {confirmLabel}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={footer}
    >
      <p className="text-14" style={{ color: 'var(--text-secondary)' }}>{message}</p>
    </Modal>
  );
}
