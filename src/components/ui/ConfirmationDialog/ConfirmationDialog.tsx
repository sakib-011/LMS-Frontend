import React from 'react';
import { Modal } from '../Modal/Modal';
import { Button } from '../Button/Button';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false
}) => {
  const footer = (
    <>
      <Button variant="ghost" onClick={onClose}>
        {cancelText}
      </Button>
      <Button 
        variant={isDestructive ? 'danger' : 'primary'} 
        onClick={() => {
          onConfirm();
          onClose();
        }}
      >
        {confirmText}
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm" footer={footer}>
      <p className="text-sans" style={{ color: 'var(--bg-secondary-text)', margin: 0 }}>
        {message}
      </p>
    </Modal>
  );
};
