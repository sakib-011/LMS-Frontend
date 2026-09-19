import React from 'react';
import './NotificationItem.css';

export interface NotificationItemProps {
  title: string;
  description?: string;
  time: string;
  isUnread?: boolean;
  icon?: string;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  title,
  description,
  time,
  isUnread = false,
  icon = 'fas fa-bell'
}) => {
  return (
    <div className={`bg-notification-item ${isUnread ? 'bg-notification-item--unread' : ''}`}>
      <div className="bg-notification-icon-wrapper">
        <i className={icon}></i>
      </div>
      <div className="bg-notification-content">
        <h4 className="bg-notification-title">{title}</h4>
        {description && <p className="bg-notification-desc">{description}</p>}
        <span className="bg-notification-time">{time}</span>
      </div>
      {isUnread && <div className="bg-notification-dot"></div>}
    </div>
  );
};
