import React, { useEffect } from 'react';
import './Modal.css';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md'
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="bg-modal-overlay" onClick={onClose}>
      <div 
        className={`bg-modal bg-modal--${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-modal-header">
          {title && <h3 className="bg-modal-title">{title}</h3>}
          <button className="bg-modal-close" onClick={onClose} aria-label="Close">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="bg-modal-content">
          {children}
        </div>
        {footer && <div className="bg-modal-footer">{footer}</div>}
      </div>
    </div>
  );
};
