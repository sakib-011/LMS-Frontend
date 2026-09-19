import React, { useEffect } from 'react';
import './Drawer.css';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: 'left' | 'right';
  title?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  children,
  position = 'right',
  title
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
    <div className="bg-drawer-overlay" onClick={onClose}>
      <div 
        className={`bg-drawer bg-drawer--${position}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-drawer-header">
          {title ? <h3 className="bg-drawer-title">{title}</h3> : <div />}
          <button className="bg-drawer-close" onClick={onClose} aria-label="Close">
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="bg-drawer-content">
          {children}
        </div>
      </div>
    </div>
  );
};
