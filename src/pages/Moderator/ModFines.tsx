import React, { useEffect, useState } from 'react';
import { Button, Badge, DataTable, Modal } from '../../components/ui';
import { ModeratorService, FineItem } from '../../services/moderatorService';
import './Moderator.css';

const MOCK_FINES: FineItem[] = [
  { id: 'F-1001', user: { id: 'STU-2024-0440', name: 'Sakib Shourov', email: 'student@university.edu' }, book: { id: 'b1', title: 'A Brief History of Time', author: 'Stephen Hawking', year: 1988, isbn: '9780553380163', category: 'Science' }, amount: 5.50, reason: 'Overdue: A Brief History of Time (11 days)', dateIssued: '2026-09-15', status: 'PENDING' },
  { id: 'F-1002', user: { id: 'STU-1002', name: 'Jane Smith', email: 'jane@university.edu' }, book: { id: 'b2', title: 'Clean Code', author: 'Robert C. Martin', year: 2008, isbn: '9780132350884', category: 'Computer Science' }, amount: 2.00, reason: 'Overdue: Clean Code (4 days)', dateIssued: '2026-09-10', status: 'PAID' },
];

export const ModFines: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [fines, setFines] = useState<FineItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFines = async () => {
    try {
      const data = await ModeratorService.getFines();
      if (Array.isArray(data) && data.length > 0) {
        setFines(data);
      } else {
        setFines(MOCK_FINES);
      }
    } catch (err) {
      console.error("Failed to load fines:", err);
      setFines(MOCK_FINES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFines();
  }, []);

  const handleCollectFine = async (id: string) => {
    try {
      await ModeratorService.collectFine(id);
      setFines(prev => prev.map(f => f.id === id ? { ...f, status: 'PAID', datePaid: 'Today' } : f));
    } catch (err) {
      console.error(`Failed to collect fine ${id}:`, err);
    }
  };

  const filteredFines = fines.filter(f => {
    const studentName = f.user?.name || '';
    const studentId = f.user?.id || '';
    const matchesSearch = studentName.toLowerCase().includes(search.toLowerCase()) || 
      studentId.toLowerCase().includes(search.toLowerCase()) ||
      (f.id && f.id.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || f.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
      case 'UNPAID': return <Badge variant="error">Unpaid</Badge>;
      case 'PAID': return <Badge variant="success">Paid</Badge>;
      case 'WAIVED': return <Badge variant="neutral">Waived</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const columns = [
    { 
      key: 'id', 
      header: 'Fine ID', 
      render: (item: FineItem) => <span style={{ fontFamily: 'monospace' }}>{item.id}</span> 
    },
    { 
      key: 'student', 
      header: 'Student', 
      render: (item: FineItem) => (
        <div>
          <span style={{ fontWeight: 500, display: 'block' }}>{item.user?.name || 'Student'}</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--bg-secondary-text)' }}>{item.user?.email || item.user?.id}</span>
        </div>
      ) 
    },
    { key: 'dateIssued', header: 'Issued Date', render: (item: FineItem) => item.dateIssued || '2026-09-15' },
    { 
      key: 'reason', 
      header: 'Reason',
      render: (item: FineItem) => (
        <span style={{ display: 'inline-block', maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.reason}>
          {item.reason}
        </span>
      )
    },
    { 
      key: 'amount', 
      header: 'Amount', 
      render: (item: FineItem) => <strong style={{ color: item.status === 'PENDING' ? 'var(--bg-error)' : 'inherit' }}>${(item.amount || 0).toFixed(2)}</strong> 
    },
    { 
      key: 'status', 
      header: 'Status', 
      render: (item: FineItem) => getStatusBadge(item.status) 
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: FineItem) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {item.status === 'PENDING' && (
            <Button size="sm" variant="success" title="Collect & Mark as Paid" onClick={() => handleCollectFine(item.id)}>
              <i className="fas fa-check-double" style={{ marginRight: 4 }}></i> Collect
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="mod-card-header">
        <div>
          <h1 className="mod-card-title">Fines & Penalties</h1>
          <p style={{ color: 'var(--bg-secondary-text)', fontSize: '0.875rem' }}>Manage overdue fines, lost book fees, and collect payments.</p>
        </div>
      </div>

      <div className="mod-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <div style={{ position: 'relative', width: 350 }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: 12, top: 10, color: 'var(--bg-secondary-text)' }}></i>
            <input 
              type="text" 
              placeholder="Search by student name, ID, or fine ID..." 
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
          <p style={{ color: 'var(--bg-secondary-text)', padding: '20px 0' }}>Loading fines...</p>
        ) : (
          <DataTable data={filteredFines} columns={columns} />
        )}
      </div>

      <Modal 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
        title="Filter Fines"
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
            <option value="paid">Paid</option>
            <option value="waived">Waived</option>
          </select>
        </div>
      </Modal>
    </div>
  );
};
