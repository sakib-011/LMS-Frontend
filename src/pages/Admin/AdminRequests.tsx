import React, { useState, useEffect } from 'react';
import { Button, Badge, ConfirmationDialog, Modal } from '../../components/ui';
import { AdminService } from '../../services/adminService';
import './Admin.css';

export const AdminRequests: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isDestructive?: boolean;
    onConfirmAction?: () => void;
  }>({ isOpen: false, title: '', message: '' });

  const fetchRequests = () => {
    setLoading(true);
    AdminService.getRequests()
      .then((data: any) => setRequests(Array.isArray(data) ? data : []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await AdminService.updateRequestStatus(id, newStatus);
      fetchRequests();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to update request status");
    }
  };

  const handleDeleteRequest = (id: string, title: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Request Permanently',
      message: `Are you sure you want to permanently delete the book request for "${title}"? This action cannot be undone.`,
      isDestructive: true,
      onConfirmAction: async () => {
        try {
          await AdminService.deleteRequestPermanently(id);
          fetchRequests();
        } catch (err: any) {
          alert(err.response?.data?.message || err.message || "Failed to delete request");
        }
      }
    });
  };

  const filteredRequests = requests.filter(item => {
    const bookTitle = item.book?.title || item.bookTitle || item.title || '';
    const userName = item.user?.name || item.userName || item.submittedBy || '';
    const reqId = item.id || '';
    const query = search.toLowerCase();
    return bookTitle.toLowerCase().includes(query) || 
           userName.toLowerCase().includes(query) ||
           reqId.toLowerCase().includes(query);
  });

  const getStatusBadge = (status: string) => {
    const st = (status || 'pending').toLowerCase();
    switch (st) {
      case 'pending': return <Badge variant="secondary">To Pull</Badge>;
      case 'pulled': return <Badge variant="success">Pulled & Ready</Badge>;
      case 'approved': return <Badge variant="success">Approved</Badge>;
      case 'fulfilled': return <Badge variant="neutral">Fulfilled</Badge>;
      case 'rejected': return <Badge variant="error">Rejected</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

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
          <Button variant="primary" onClick={() => window.print()}>
            <i className="fas fa-print" style={{ marginRight: '8px' }}></i> Print Pull List
          </Button>
        </div>
      </div>

      <div className="admin-card">
        <h3 style={{ margin: '0 0 var(--space-4) 0', fontSize: '1rem', color: 'var(--text-primary)' }}>Active Pull Requests</h3>
        
        {loading ? (
          <p style={{ color: 'var(--text-secondary)', padding: '20px 0', textAlign: 'center' }}>Loading circulation requests...</p>
        ) : (
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
                {filteredRequests.map(item => {
                  const bookTitle = item.book?.title || item.bookTitle || item.title || 'Book';
                  const userName = item.user?.name || item.userName || 'Student User';
                  const userObj = item.user || { name: userName, email: item.userEmail || 'student@university.edu', department: 'Computer Science' };
                  
                  return (
                    <tr key={item.id} style={{ opacity: (item.status === 'fulfilled' || item.status === 'rejected') ? 0.65 : 1 }}>
                      <td>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', fontFamily: 'monospace' }}>{(item.id || '').substring(0, 8).toUpperCase()}</p>
                      </td>
                      <td>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{bookTitle}</p>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            <i className="fas fa-map-marker-alt" style={{ marginRight: '4px', color: 'var(--bg-warm-orange)' }}></i> 
                            {item.shelfLocation || item.book?.physicalStacks || 'Main Stacks'}
                          </p>
                        </div>
                      </td>
                      <td>
                        <div 
                          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}
                          onClick={() => setSelectedUser(userObj)}
                          title="Click to view student profile"
                        >
                          <div style={{ 
                            width: '28px', height: '28px', borderRadius: '50%', 
                            background: 'var(--bg-warm-orange, #f28c28)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.7rem', fontWeight: 'bold'
                          }}>
                            {userName.substring(0,2).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)', textDecoration: 'underline', fontWeight: 500 }}>{userName}</p>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{item.submittedDate || item.requestedDate || 'Recent'}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                          {item.requestType === 'Campus Delivery' ? <><i className="fas fa-truck" style={{ marginRight: '6px', color: 'var(--text-secondary)' }}></i>Campus Delivery</> : <><i className="fas fa-building" style={{ marginRight: '6px', color: 'var(--text-secondary)' }}></i>Hold at Desk</>}
                        </p>
                      </td>
                      <td>
                        <select
                          className="admin-select"
                          style={{ padding: '4px 8px', fontSize: '0.8125rem', borderRadius: '6px', border: '1px solid var(--bg-border)', background: 'var(--bg-white)', color: 'var(--text-primary)' }}
                          value={item.status || 'pending'}
                          onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
                        >
                          <option value="pending">To Pull</option>
                          <option value="pulled">Pulled & Ready</option>
                          <option value="approved">Approved</option>
                          <option value="fulfilled">Fulfilled</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', alignItems: 'center' }}>
                          {item.status === 'pending' && (
                            <Button size="sm" variant="outline" title="Mark as Pulled" onClick={() => handleUpdateStatus(item.id, 'pulled')}>
                              <i className="fas fa-check-circle" style={{ color: 'var(--status-success, #10B981)' }}></i>
                            </Button>
                          )}
                          {item.status === 'pulled' && (
                            <Button size="sm" variant="outline" title="Process Fulfillment" onClick={() => handleUpdateStatus(item.id, 'fulfilled')}>
                              <i className="fas fa-check-double" style={{ color: 'var(--bg-warm-orange, #f28c28)' }}></i>
                            </Button>
                          )}

                          <Button 
                            size="sm" 
                            variant="outline" 
                            title="Delete Request Permanently" 
                            onClick={() => handleDeleteRequest(item.id, bookTitle)}
                            style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: '#EF4444' }}
                          >
                            <i className="fas fa-trash-alt"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {filteredRequests.length === 0 && (
              <div style={{ textAlign: 'center', padding: 'var(--space-8) 0', color: 'var(--text-secondary)' }}>
                <i className="fas fa-tasks" style={{ fontSize: '2rem', marginBottom: 'var(--space-4)', opacity: 0.5 }}></i>
                <p>No circulation requests found.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Student Profile Details Modal */}
      {selectedUser && (
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title="Student Profile"
          footer={<Button variant="outline" onClick={() => setSelectedUser(null)}>Close</Button>}
        >
          <div style={{ padding: 'var(--space-2) 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              <div style={{ 
                width: 60, height: 60, borderRadius: '50%', 
                background: 'var(--bg-warm-orange, #f28c28)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 'bold'
              }}>
                {(selectedUser.name || 'Student').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{selectedUser.name || 'Student User'}</h3>
                <p style={{ margin: '2px 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{selectedUser.email || 'student@university.edu'}</p>
                <Badge variant="secondary" size="sm" style={{ marginTop: 6 }}>STUDENT</Badge>
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', fontSize: '0.875rem' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Student ID</span>
                <strong>{selectedUser.id || 'STU-2024-0440'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Department</span>
                <strong>{selectedUser.department || 'Computer Science'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Phone</span>
                <strong>{selectedUser.phone || '+1 (555) 234-5678'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.75rem' }}>Status</span>
                <strong style={{ color: '#10B981' }}>{selectedUser.status || 'ACTIVE'}</strong>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog 
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={() => {
          if (confirmDialog.onConfirmAction) confirmDialog.onConfirmAction();
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDestructive={confirmDialog.isDestructive}
      />
    </div>
  );
};
