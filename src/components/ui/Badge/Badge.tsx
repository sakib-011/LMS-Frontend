import React from 'react';
import './Badge.css';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  style
}) => {
  return (
    <span className={`bg-badge bg-badge--${variant} bg-badge--${size} ${className}`.trim()} style={style}>
      {children}
    </span>
  );
};

