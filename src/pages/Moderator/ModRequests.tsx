import React, { useEffect, useState } from 'react';
import { Button, Badge, DataTable, Modal, ConfirmationDialog } from '../../components/ui';
import { ModeratorService } from '../../services/moderatorService';
import { BookRequestItem } from '../../services/studentService';
import './Moderator.css';

export const ModRequests: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [requests, setRequests] = useState<BookRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isDestructive?: boolean;
    onConfirmAction?: () => void;
  }>({ isOpen: false, title: '', message: '' });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await ModeratorService.getRequests();
      if (Array.isArray(data)) {
        setRequests(data);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error("Failed to load requests:", err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await ModeratorService.updateRequestStatus(id, status);
      fetchRequests();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to update request status");
    }
  };

  const handleDeleteRequest = (id: string, title: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Request Permanently',
      message: `Are you sure you want to permanently delete the request for "${title}"?`,
      isDestructive: true,
      onConfirmAction: async () => {
        try {
          await ModeratorService.deleteRequestPermanently(id);
          fetchRequests();
        } catch (err: any) {
          alert(err.response?.data?.message || err.message || "Failed to delete request");
        }
      }
    });
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = (r.title || '').toLowerCase().includes(search.toLowerCase()) || 
      (r.id || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.author || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    { 
      key: 'id', 
      header: 'Req ID', 
      render: (item: any) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{(item.id || '').substring(0, 8).toUpperCase()}</span> 
    },
    { 
      key: 'title', 
      header: 'Book Details', 
      render: (item: any) => (
        <div>
          <span style={{ fontWeight: 600, display: 'block' }}>{item.title}</span>
          <span style={{ fontSize: '0.8125rem', color: 'var(--bg-secondary-text)' }}>By {item.author || 'Author'}</span>
        </div>
      ) 
    },
    { 
      key: 'user', 
      header: 'Requested By', 
      render: (item: any) => {
        const u = item.user || { name: item.userName || 'Student', email: item.userEmail || 'student@university.edu' };
        return (
          <span 
            style={{ textDecoration: 'underline', cursor: 'pointer', fontWeight: 500, color: 'var(--text-primary)' }}
            onClick={() => setSelectedUser(u)}
            title="Click to view student details"
          >
            {u.name || 'Student'}
          </span>
        );
      } 
    },
    { key: 'submittedDate', header: 'Submitted', render: (item: BookRequestItem) => item.submittedDate || 'Today' },
    { 
      key: 'reason', 
      header: 'Reason',
      render: (item: BookRequestItem) => (
        <span style={{ display: 'inline-block', maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.reason}>
          {item.reason || 'Academic Reference'}
        </span>
      )
    },
    { 
      key: 'status', 
      header: 'Status', 
      render: (item: any) => (
        <select
          className="mod-input"
          style={{ padding: '4px 8px', fontSize: '0.8125rem', borderRadius: '6px', border: '1px solid var(--bg-border)' }}
          value={item.status || 'pending'}
          onChange={(e) => handleUpdateStatus(item.id, e.target.value)}
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="pulled">Pulled & Ready</option>
          <option value="fulfilled">Fulfilled</option>
          <option value="rejected">Rejected</option>
        </select>
      ) 
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: any) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          {item.status === 'pending' && (
            <Button size="sm" variant="success" title="Approve" onClick={() => handleUpdateStatus(item.id, 'approved')}>
              <i className="fas fa-check"></i>
            </Button>
          )}
          <Button 
            size="sm" 
            variant="danger" 
            title="Delete Request Permanently" 
            onClick={() => handleDeleteRequest(item.id, item.title)}
          >
            <i className="fas fa-trash-alt"></i>
          </Button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="mod-card-header">
        <div>
          <h1 className="mod-card-title">Book Requests Management</h1>
          <p style={{ color: 'var(--bg-secondary-text)', fontSize: '0.875rem' }}>Review, update status, and manage student book acquisition requests.</p>
        </div>
      </div>

      <div className="mod-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <div style={{ position: 'relative', width: 350 }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: 12, top: 10, color: 'var(--bg-secondary-text)' }}></i>
            <input 
              type="text" 
              placeholder="Search by title, author, or ID..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 36px', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
          <Button variant="outline" icon="fas fa-filter" onClick={() => setIsFilterOpen(true)}>
            Filter
            {statusFilter !== 'all' && <Badge variant="neutral" size="sm" style={{ marginLeft: 8, padding: '0 4px' }}>1</Badge>}
          </Button>
        </div>
        
        {loading ? (
          <p style={{ color: 'var(--bg-secondary-text)', padding: '20px 0', textAlign: 'center' }}>Loading requests...</p>
        ) : (
          <DataTable data={filteredRequests} columns={columns} />
        )}
      </div>

      {/* Student Details Modal */}
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
                width: 50, height: 50, borderRadius: '50%', 
                background: 'var(--bg-warm-orange, #f28c28)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.25rem', fontWeight: 'bold'
              }}>
                {(selectedUser.name || 'Student').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.125rem' }}>{selectedUser.name || 'Student User'}</h3>
                <p style={{ margin: '2px 0 0', color: 'var(--bg-secondary-text)', fontSize: '0.875rem' }}>{selectedUser.email || 'student@university.edu'}</p>
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', fontSize: '0.875rem' }}>
              <div>
                <span style={{ color: 'var(--bg-secondary-text)', display: 'block', fontSize: '0.75rem' }}>Student ID</span>
                <strong>{selectedUser.id || 'STU-2024-0440'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--bg-secondary-text)', display: 'block', fontSize: '0.75rem' }}>Department</span>
                <strong>{selectedUser.department || 'Computer Science'}</strong>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Filter Modal */}
      <Modal 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
        title="Filter Book Requests"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
            <Button variant="outline" onClick={() => {
              setStatusFilter('all');
              setIsFilterOpen(false);
            }}>Clear Filters</Button>
            <Button variant="primary" onClick={() => setIsFilterOpen(false)}>Apply Filters</Button>
          </div>
        }
      >
        <div style={{ padding: 'var(--space-2) 0' }}>
          <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600 }}>Status</label>
          <select 
            className="mod-input" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-md)' }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="pulled">Pulled & Ready</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </Modal>

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
