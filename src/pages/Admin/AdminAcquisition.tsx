import React, { useState, useEffect } from 'react';
import { Button, Badge, Modal, ConfirmationDialog } from '../../components/ui';
import { AdminService } from '../../services/adminService';
import './Admin.css';

export const AdminAcquisition: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<any>(null);
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, title: string, message: string, isDestructive?: boolean}>({ isOpen: false, title: '', message: '' });

  useEffect(() => {
    AdminService.getAcquisitions()
      .then((data: any) => {
        if (Array.isArray(data)) {
          setRequests(data);
        } else {
          setRequests([]);
        }
      })
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredRequests = requests.filter(req => {
    const matchesSearch = (req.title || '').toLowerCase().includes(search.toLowerCase()) || 
                          (req.author || '').toLowerCase().includes(search.toLowerCase()) ||
                          (req.isbn && req.isbn.includes(search));
    const matchesStatus = filterStatus === 'All' || (req.status || '').toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Book Acquisitions</h1>
          <p className="admin-subtitle">Manage, approve, or reject new book requests from students and staff.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <div className="admin-search">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search title, author, ISBN..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '0 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-white)', color: 'var(--text-secondary)' }}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Acquired">Acquired</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="admin-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Requested Book</th>
                <th>Submitted By</th>
                <th>Reason / Justification</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map(req => (
                <tr key={req.id}>
                  <td>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{req.title}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {req.author} {req.isbn ? `· ISBN: ${req.isbn}` : ''}
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
                        {(req.submittedBy?.name || req.requestedBy || 'User').substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{req.submittedBy?.name || req.requestedBy || 'User'}</p>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{req.submittedDate || req.orderDate || ''}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ maxWidth: '250px' }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={req.reason}>
                      {req.reason}
                    </p>
                    {req.notes && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--bg-warm-orange)' }}>
                        <i className="fas fa-comment-dots" style={{ marginRight: '4px' }}></i>
                        {req.notes}
                      </p>
                    )}
                  </td>
                  <td>
                    <Badge variant={
                      req.status === 'approved' ? 'success' : 
                      req.status === 'pending' ? 'secondary' : 
                      req.status === 'acquired' ? 'primary' : 
                      'error'
                    }>{req.status.charAt(0).toUpperCase() + req.status.slice(1)}</Badge>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                      <Button size="sm" variant="outline" title="Add Admin Note" onClick={() => { setEditingRequest(req); setIsNoteModalOpen(true); }}>
                        <i className="fas fa-pen"></i>
                      </Button>
                      
                      {req.status === 'pending' && (
                        <>
                          <Button size="sm" variant="outline" title="Approve Request" onClick={() => setConfirmDialog({
                            isOpen: true, title: 'Approve Request', message: `Approve the acquisition of "${req.title}"? This will notify the requester.`
                          })}>
                            <i className="fas fa-check" style={{ color: 'var(--status-success)' }}></i>
                          </Button>
                          <Button size="sm" variant="outline" title="Reject Request" onClick={() => setConfirmDialog({
                            isOpen: true, title: 'Reject Request', message: `Reject the request for "${req.title}"?`, isDestructive: true
                          })}>
                            <i className="fas fa-times" style={{ color: 'var(--status-error)' }}></i>
                          </Button>
                        </>
                      )}

                      {req.status === 'approved' && (
                        <Button size="sm" variant="outline" title="Mark as Acquired" onClick={() => setConfirmDialog({
                          isOpen: true, title: 'Mark Acquired', message: `Has "${req.title}" been fully acquired and added to the catalog?`
                        })}>
                          <i className="fas fa-box-open" style={{ color: 'var(--status-success)' }}></i>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredRequests.length === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--space-8) 0', color: 'var(--text-secondary)' }}>
              <i className="fas fa-inbox" style={{ fontSize: '2rem', marginBottom: 'var(--space-4)', opacity: 0.5 }}></i>
              <p>No acquisition requests found matching your filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Note Modal */}
      <Modal 
        isOpen={isNoteModalOpen} 
        onClose={() => { setIsNoteModalOpen(false); setEditingRequest(null); }}
        title="Admin Notes"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => { setIsNoteModalOpen(false); setEditingRequest(null); }}>Cancel</Button>
            <Button variant="primary" onClick={() => { setIsNoteModalOpen(false); setEditingRequest(null); }}>Save Note</Button>
          </div>
        }
      >
        {editingRequest && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>{editingRequest.title}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Requested by: {editingRequest.submittedBy.name}</p>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Administrative Note</label>
              <textarea 
                defaultValue={editingRequest.notes}
                placeholder="E.g., Waiting for budget approval, similar book already exists..."
                rows={4}
                style={{ 
                  width: '100%', 
                  padding: '10px 12px', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 'var(--radius-md)', 
                  background: 'white',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
              <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Notes are visible to the user who requested the book.</p>
            </div>
          </div>
        )}
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
