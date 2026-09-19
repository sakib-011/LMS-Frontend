import React, { ButtonHTMLAttributes } from 'react';
import './Button.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: string; // FontAwesome icon class, e.g., 'fas fa-plus'
  iconPosition?: 'left' | 'right';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  const baseClass = 'bg-btn';
  const variantClass = `bg-btn--${variant}`;
  const sizeClass = `bg-btn--${size}`;
  const widthClass = fullWidth ? 'bg-btn--full' : '';

  return (
    <button
      className={`${baseClass} ${variantClass} ${sizeClass} ${widthClass} ${className}`.trim()}
      {...props}
    >
      {icon && iconPosition === 'left' && <i className={`${icon} bg-btn__icon-left`}></i>}
      <span>{children}</span>
      {icon && iconPosition === 'right' && <i className={`${icon} bg-btn__icon-right`}></i>}
    </button>
  );
};
