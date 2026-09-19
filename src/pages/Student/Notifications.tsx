import React, { useState, useEffect } from 'react';
import { NotificationItem, Button } from '../../components/ui';
import { StudentService } from '../../services/studentService';
import './Student.css';

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    StudentService.getNotifications()
      .then((data: any) => setNotifications(Array.isArray(data) ? data : []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  const unread = notifications.filter(n => n.isUnread);
  const read = notifications.filter(n => !n.isUnread);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
        <div className="sl-page-header" style={{ marginBottom: 0 }}>
          <h1 className="sl-page-title">Notifications</h1>
          <p className="sl-page-subtitle">{unread.length} unread</p>
        </div>
        {unread.length > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            <i className="fas fa-check-double" style={{ marginRight: 8 }}></i> Mark all as read
          </Button>
        )}
      </div>

      {unread.length > 0 && (
        <>
          <p className="std-notif-group-label">Unread</p>
          <div className="sl-card" style={{ padding: 0, overflow: 'hidden' }}>
            {unread.map(n => (
              <NotificationItem
                key={n.id}
                title={n.title}
                description={n.description}
                time={n.time}
                isUnread={n.isUnread}
                icon={n.icon}
              />
            ))}
          </div>
        </>
      )}

      {read.length > 0 && (
        <>
          <p className="std-notif-group-label">Earlier</p>
          <div className="sl-card" style={{ padding: 0, overflow: 'hidden' }}>
            {read.map(n => (
              <NotificationItem
                key={n.id}
                title={n.title}
                description={n.description}
                time={n.time}
                isUnread={false}
                icon={n.icon}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
