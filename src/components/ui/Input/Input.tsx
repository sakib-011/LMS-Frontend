import React, { InputHTMLAttributes } from 'react';
import './Input.css';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: string; // FontAwesome class
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, fullWidth = true, className = '', ...props }, ref) => {
    return (
      <div className={`bg-input-wrapper ${fullWidth ? 'w-full' : ''} ${className}`}>
        {label && <label className="bg-input-label">{label}</label>}
        <div className="bg-input-container">
          {icon && <i className={`${icon} bg-input-icon`}></i>}
          <input
            ref={ref}
            className={`bg-input ${icon ? 'bg-input--with-icon' : ''} ${error ? 'bg-input--error' : ''}`}
            {...props}
          />
        </div>
        {error && <span className="bg-input-error-message">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
