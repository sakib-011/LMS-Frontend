import React from 'react';
import './Toggle.css';

export interface ToggleProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ label, className, ...props }) => {
  return (
    <label className={`bg-toggle ${className || ''}`}>
      <input type="checkbox" className="bg-toggle-input" {...props} />
      <span className="bg-toggle-slider"></span>
      {label && <span className="bg-toggle-label">{label}</span>}
    </label>
  );
};
