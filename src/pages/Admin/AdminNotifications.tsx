import React, { useState } from 'react';
import { Button, Badge, Modal, ConfirmationDialog } from '../../components/ui';
import './Admin.css';

const MOCK_NOTIFICATIONS = [
  { id: 'notif-1', title: 'System Maintenance Window', message: 'The library system will be down for scheduled maintenance on Sunday from 2 AM to 4 AM.', target: 'All Users', type: 'System', date: '2026-09-15 08:30 AM', status: 'Sent' },
  { id: 'notif-2', title: 'New E-Books Available', message: 'We have added 500 new titles to our digital library collection. Check them out today!', target: 'All Students', type: 'Announcement', date: '2026-09-12 10:00 AM', status: 'Sent' },
  { id: 'notif-3', title: 'Updated Late Fee Policy', message: 'Starting next month, late fees for reference materials will increase to $2/day.', target: 'All Users', type: 'Policy', date: '2026-09-01 09:15 AM', status: 'Sent' },
  { id: 'notif-4', title: 'Overdue Notice Batch', message: 'Automated overdue notices sent to 45 users.', target: 'Specific Users (45)', type: 'Automated', date: '2026-09-16 01:00 AM', status: 'Sent' },
];

export const AdminNotifications: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isComposeModalOpen, setIsComposeModalOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, title: string, message: string, isDestructive?: boolean}>({ isOpen: false, title: '', message: '' });

  const filteredNotifications = MOCK_NOTIFICATIONS.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">System Notifications</h1>
          <p className="admin-subtitle">Send announcements, alerts, and manage automated communication.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <div className="admin-search">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search notifications..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="primary" onClick={() => setIsComposeModalOpen(true)}>
            <i className="fas fa-bullhorn" style={{ marginRight: '8px' }}></i> New Announcement
          </Button>
        </div>
      </div>

      <div className="admin-card">
        <h3 style={{ margin: '0 0 var(--space-4) 0', fontSize: '1rem', color: 'var(--text-primary)' }}>Notification History</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Notification Title / Message</th>
                <th>Target Audience</th>
                <th>Type</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotifications.map(item => (
                <tr key={item.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 }}>{item.date.split(' ')[0]}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.date.split(' ').slice(1).join(' ')}</p>
                  </td>
                  <td style={{ maxWidth: '400px' }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{item.title}</p>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.message}
                    </p>
                  </td>
                  <td>
                    <Badge variant="neutral">{item.target}</Badge>
                  </td>
                  <td>
                    <Badge variant={
                      item.type === 'System' ? 'error' : 
                      item.type === 'Policy' ? 'neutral' : 
                      item.type === 'Automated' ? 'secondary' : 
                      'primary'
                    }>
                      {item.type}
                    </Badge>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                      <Button size="sm" variant="outline" title="View Details" onClick={() => setConfirmDialog({
                        isOpen: true, title: item.title, message: item.message
                      })}>
                        <i className="fas fa-eye"></i>
                      </Button>
                      <Button size="sm" variant="outline" title="Resend">
                        <i className="fas fa-paper-plane" style={{ color: 'var(--bg-warm-orange)' }}></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredNotifications.length === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--space-8) 0', color: 'var(--text-secondary)' }}>
              <i className="fas fa-bell-slash" style={{ fontSize: '2rem', marginBottom: 'var(--space-4)', opacity: 0.5 }}></i>
              <p>No notifications found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Notification Modal */}
      <Modal 
        isOpen={isComposeModalOpen} 
        onClose={() => setIsComposeModalOpen(false)}
        title="Compose New Announcement"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setIsComposeModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => {
              setIsComposeModalOpen(false);
              setConfirmDialog({
                isOpen: true,
                title: 'Announcement Sent',
                message: 'Your notification has been successfully queued for delivery to the selected audience.'
              });
            }}><i className="fas fa-paper-plane" style={{ marginRight: '8px' }}></i> Send Now</Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Target Audience</label>
            <select style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white' }}>
              <option value="all">All System Users</option>
              <option value="students">All Students</option>
              <option value="moderators">Librarians & Moderators Only</option>
              <option value="active_borrowers">Users with Active Loans</option>
              <option value="overdue">Users with Overdue Items</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Subject / Title</label>
              <input type="text" placeholder="e.g., Holiday Closure Notice" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Notification Type</label>
              <select style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white' }}>
                <option value="Announcement">Announcement</option>
                <option value="System">System Alert</option>
                <option value="Policy">Policy Update</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Message Body</label>
            <textarea 
              rows={5}
              placeholder="Write your announcement here..."
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '16px', background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" id="pushNotif" defaultChecked />
              <label htmlFor="pushNotif" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>Send In-App Notification</label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" id="emailNotif" defaultChecked />
              <label htmlFor="emailNotif" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>Send via Email</label>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmationDialog 
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={() => {
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDestructive={confirmDialog.isDestructive}
      />
    </div>
  );
};
