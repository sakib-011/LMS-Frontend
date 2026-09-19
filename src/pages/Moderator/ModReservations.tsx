import React, { useEffect, useState } from 'react';
import { Button, Badge, DataTable, Modal } from '../../components/ui';
import { ModeratorService } from '../../services/moderatorService';
import { ReservationItem } from '../../services/studentService';
import './Moderator.css';

export const ModReservations: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    try {
      const data = await ModeratorService.getReservations();
      if (Array.isArray(data)) {
        setReservations(data);
      } else {
        setReservations([]);
      }
    } catch (err) {
      console.error("Failed to load reservations:", err);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleMarkReady = async (id: string) => {
    try {
      const updated = await ModeratorService.markReservationReady(id);
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'ready', pickupDeadline: updated.pickupDeadline || 'In 3 days' } : r));
    } catch (err) {
      console.error("Failed to mark reservation ready:", err);
    }
  };

  const filteredReservations = reservations.filter(r => {
    const title = r.book?.title || '';
    const matchesSearch = title.toLowerCase().includes(search.toLowerCase()) || 
      (r.id && r.id.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="warning">Pending</Badge>;
      case 'ready': return <Badge variant="success">Ready for Pickup</Badge>;
      case 'expired': return <Badge variant="error">Expired</Badge>;
      case 'cancelled': return <Badge variant="neutral">Cancelled</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const columns = [
    { 
      key: 'id', 
      header: 'Res ID', 
      render: (item: ReservationItem) => <span style={{ fontFamily: 'monospace' }}>{item.id}</span> 
    },
    { 
      key: 'book', 
      header: 'Book Title', 
      render: (item: ReservationItem) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div style={{ width: 24, height: 32, background: item.book?.coverColor || '#2D3748', borderRadius: 2 }}></div>
          <span style={{ fontWeight: 500 }}>{item.book?.title || 'Reserved Book'}</span>
        </div>
      ) 
    },
    { key: 'reservedDate', header: 'Reserved Date', render: (item: ReservationItem) => item.reservedDate || 'Today' },
    { key: 'expiryDate', header: 'Expiry Date', render: (item: ReservationItem) => item.expiryDate || '+14 Days' },
    { 
      key: 'queuePosition', 
      header: 'Queue',
      render: (item: ReservationItem) => `#${item.queuePosition || 1}`
    },
    { 
      key: 'status', 
      header: 'Status', 
      render: (item: ReservationItem) => getStatusBadge(item.status) 
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: ReservationItem) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {item.status === 'pending' && (
            <Button size="sm" variant="success" title="Mark as Ready" onClick={() => handleMarkReady(item.id)}>
              <i className="fas fa-check" style={{ marginRight: 4 }}></i> Ready
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
          <h1 className="mod-card-title">Reservations Management</h1>
          <p style={{ color: 'var(--bg-secondary-text)', fontSize: '0.875rem' }}>Manage student book reservations and queue.</p>
        </div>
      </div>

      <div className="mod-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <div style={{ position: 'relative', width: 300 }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: 12, top: 10, color: 'var(--bg-secondary-text)' }}></i>
            <input 
              type="text" 
              placeholder="Search by book or ID..." 
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
          <p style={{ color: 'var(--bg-secondary-text)', padding: '20px 0' }}>Loading reservations...</p>
        ) : (
          <DataTable data={filteredReservations} columns={columns} />
        )}
      </div>

      <Modal 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
        title="Filter Reservations"
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
            <option value="ready">Ready for Pickup</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </Modal>
    </div>
  );
};
