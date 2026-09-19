import React, { SelectHTMLAttributes } from 'react';
import './Select.css';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  fullWidth?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, fullWidth = true, className = '', ...props }, ref) => {
    return (
      <div className={`bg-select-wrapper ${fullWidth ? 'w-full' : ''} ${className}`}>
        {label && <label className="bg-select-label">{label}</label>}
        <div className="bg-select-container">
          <select
            ref={ref}
            className={`bg-select ${error ? 'bg-select--error' : ''}`}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <i className="fas fa-chevron-down bg-select-icon"></i>
        </div>
        {error && <span className="bg-select-error-message">{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
