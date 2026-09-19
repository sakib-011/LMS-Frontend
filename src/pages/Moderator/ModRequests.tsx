import React, { useEffect, useState } from 'react';
import { Button, Badge, DataTable, Modal } from '../../components/ui';
import { ModeratorService } from '../../services/moderatorService';
import { BookRequestItem } from '../../services/studentService';
import './Moderator.css';

export const ModRequests: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [requests, setRequests] = useState<BookRequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
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

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await ModeratorService.updateRequestStatus(id, status);
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (err) {
      console.error(`Failed to update request ${id}:`, err);
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = (r.title || '').toLowerCase().includes(search.toLowerCase()) || 
      (r.id || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.author || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="warning">Pending</Badge>;
      case 'approved': return <Badge variant="success">Approved</Badge>;
      case 'rejected': return <Badge variant="error">Rejected</Badge>;
      case 'acquired': return <Badge variant="neutral">Acquired</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const columns = [
    { 
      key: 'id', 
      header: 'Req ID', 
      render: (item: BookRequestItem) => <span style={{ fontFamily: 'monospace' }}>{item.id}</span> 
    },
    { 
      key: 'title', 
      header: 'Book Details', 
      render: (item: BookRequestItem) => (
        <div>
          <span style={{ fontWeight: 500, display: 'block' }}>{item.title}</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--bg-secondary-text)' }}>By {item.author}</span>
        </div>
      ) 
    },
    { key: 'submittedDate', header: 'Submitted', render: (item: BookRequestItem) => item.submittedDate || 'Today' },
    { 
      key: 'reason', 
      header: 'Reason',
      render: (item: BookRequestItem) => (
        <span style={{ display: 'inline-block', maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.reason}>
          {item.reason}
        </span>
      )
    },
    { 
      key: 'status', 
      header: 'Status', 
      render: (item: BookRequestItem) => getStatusBadge(item.status) 
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: BookRequestItem) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {item.status === 'pending' && (
            <>
              <Button size="sm" variant="success" title="Approve Request" onClick={() => handleUpdateStatus(item.id, 'approved')}>
                <i className="fas fa-check"></i> Approve
              </Button>
              <Button size="sm" variant="danger" title="Reject Request" onClick={() => handleUpdateStatus(item.id, 'rejected')}>
                <i className="fas fa-times"></i> Reject
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="mod-card-header">
        <div>
          <h1 className="mod-card-title">Book Requests Management</h1>
          <p style={{ color: 'var(--bg-secondary-text)', fontSize: '0.875rem' }}>Review and manage student book acquisition requests.</p>
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
          <p style={{ color: 'var(--bg-secondary-text)', padding: '20px 0' }}>Loading requests...</p>
        ) : (
          <DataTable data={filteredRequests} columns={columns} />
        )}
      </div>

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
            <option value="rejected">Rejected</option>
            <option value="acquired">Acquired</option>
          </select>
        </div>
      </Modal>
    </div>
  );
};
