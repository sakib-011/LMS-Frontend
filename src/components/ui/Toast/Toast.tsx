import React from 'react';
import './Toast.css';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    info: 'fas fa-info-circle'
  };

  return (
    <div className={`bg-toast bg-toast--${type}`}>
      <i className={`${icons[type]} bg-toast-icon`}></i>
      <span className="bg-toast-message">{message}</span>
      {onClose && (
        <button className="bg-toast-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
      )}
    </div>
  );
};
