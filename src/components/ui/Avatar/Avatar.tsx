import React from 'react';
import './Avatar.css';

export interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  fallback,
  size = 'md',
  className = ''
}) => {
  const initials = fallback || alt.charAt(0).toUpperCase();

  return (
    <div className={`bg-avatar bg-avatar--${size} ${className}`.trim()}>
      {src ? (
        <img src={src} alt={alt} className="bg-avatar-image" />
      ) : (
        <span className="bg-avatar-fallback">{initials}</span>
      )}
    </div>
  );
};
