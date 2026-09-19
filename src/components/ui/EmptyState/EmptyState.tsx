import React from 'react';
import { Button } from '../Button/Button';
import './EmptyState.css';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'fas fa-box-open',
  title,
  description,
  actionLabel,
  onAction
}) => {
  return (
    <div className="bg-empty-state">
      <div className="bg-empty-state-icon-wrapper">
        <i className={`${icon} bg-empty-state-icon`}></i>
      </div>
      <h3 className="bg-empty-state-title">{title}</h3>
      {description && <p className="bg-empty-state-desc">{description}</p>}
      {actionLabel && onAction && (
        <div className="bg-empty-state-action">
          <Button variant="primary" onClick={onAction}>{actionLabel}</Button>
        </div>
      )}
    </div>
  );
};
