import React, { useState, useEffect } from 'react';
import { Button, Badge, ConfirmationDialog } from '../../components/ui';
import { ModeratorService } from '../../services/moderatorService';
import './Admin.css';

export const AdminRequests: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, title: string, message: string, isDestructive?: boolean}>({ isOpen: false, title: '', message: '' });

  useEffect(() => {
    ModeratorService.getRequests()
      .then((data: any) => setRequests(Array.isArray(data) ? data : []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredRequests = requests.filter(item => {
    return (item.bookTitle || item.title || '').toLowerCase().includes(search.toLowerCase()) || 
           (item.userName || item.submittedBy || '').toLowerCase().includes(search.toLowerCase()) ||
           (item.id || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Circulation Requests</h1>
          <p className="admin-subtitle">Manage stack pulls, holds, and campus delivery requests for available books.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <div className="admin-search">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search Title, User, or ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="primary">
            <i className="fas fa-print" style={{ marginRight: '8px' }}></i> Print Pull List
          </Button>
        </div>
      </div>

      <div className="admin-card">
        <h3 style={{ margin: '0 0 var(--space-4) 0', fontSize: '1rem', color: 'var(--text-primary)' }}>Active Pull Requests</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Book & Location</th>
                <th>Requested By</th>
                <th>Delivery Method</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map(item => (
                <tr key={item.id} style={{ opacity: item.status === 'pulled' ? 0.6 : 1 }}>
                  <td>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{(item.id || '').toUpperCase()}</p>
                  </td>
                  <td>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{item.book?.title || item.bookTitle || item.title || 'Book'}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <i className="fas fa-map-marker-alt" style={{ marginRight: '4px', color: 'var(--bg-warm-orange)' }}></i> 
                        {item.shelfLocation || 'Main Stacks'}
                      </p>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <div style={{ 
                        width: '28px', height: '28px', borderRadius: '50%', 
                        background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: 'bold'
                      }}>
                        {(item.user?.name || item.userName || 'User').substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{item.user?.name || item.userName || 'User'}</p>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{item.reservedDate || item.requestedDate || ''}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {item.requestType === 'Campus Delivery' && <i className="fas fa-truck" style={{ marginRight: '6px', color: 'var(--text-secondary)' }}></i>}
                      {item.requestType === 'Hold at Desk' && <i className="fas fa-building" style={{ marginRight: '6px', color: 'var(--text-secondary)' }}></i>}
                      {item.requestType}
                    </p>
                  </td>
                  <td>
                    {item.status === 'pending' ? (
                      <Badge variant="secondary">To Pull</Badge>
                    ) : (
                      <Badge variant="success">Pulled & Ready</Badge>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                      
                      {item.status === 'pending' ? (
                        <Button size="sm" variant="outline" title="Mark as Pulled" onClick={() => setConfirmDialog({
                          isOpen: true, title: 'Mark Book as Pulled', message: `Confirm you have pulled "${item.book.title}" from ${item.shelfLocation} and it is ready for ${item.requestType.toLowerCase()}.`
                        })}>
                          <i className="fas fa-check-circle" style={{ color: 'var(--status-success)' }}></i>
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" title="Process Fulfillment" onClick={() => setConfirmDialog({
                          isOpen: true, title: 'Process Fulfillment', message: `Complete the ${item.requestType.toLowerCase()} process for ${item.user.name}?`
                        })}>
                          <i className="fas fa-check-double" style={{ color: 'var(--bg-warm-orange)' }}></i>
                        </Button>
                      )}

                      <Button size="sm" variant="outline" title="Cancel Request" onClick={() => setConfirmDialog({
                        isOpen: true, title: 'Cancel Request', message: `Are you sure you want to cancel the pull request for "${item.book.title}"?`, isDestructive: true
                      })}>
                        <i className="fas fa-times" style={{ color: 'var(--status-error)' }}></i>
                      </Button>
                      
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredRequests.length === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--space-8) 0', color: 'var(--text-secondary)' }}>
              <i className="fas fa-tasks" style={{ fontSize: '2rem', marginBottom: 'var(--space-4)', opacity: 0.5 }}></i>
              <p>No active pull requests found.</p>
            </div>
          )}
        </div>
      </div>

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
