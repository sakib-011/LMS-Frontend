import React from 'react';
import './LoadingState.css';

export interface LoadingStateProps {
  message?: string;
  fullHeight?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Loading...',
  fullHeight = false
}) => {
  return (
    <div className={`bg-loading-state ${fullHeight ? 'bg-loading-state--full' : ''}`}>
      <div className="bg-loading-spinner"></div>
      <p className="bg-loading-message">{message}</p>
    </div>
  );
};
