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

  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const handleMarkReady = async (id: string) => {
    try {
      const updated = await ModeratorService.markReservationReady(id);
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'ready', pickupDeadline: updated.pickupDeadline || 'In 3 days' } : r));
    } catch (err) {
      console.error("Failed to mark reservation ready:", err);
    }
  };

  const handleCheckout = async (id: string) => {
    try {
      await ModeratorService.checkoutReservation(id);
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'fulfilled' } : r));
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to checkout reservation");
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await ModeratorService.cancelReservation(id);
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled_by_admin' } : r));
    } catch (err) {
      console.error("Failed to cancel reservation:", err);
    }
  };

  const handleDeletePermanent = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this reservation record?")) return;
    try {
      await ModeratorService.deleteReservationPermanently(id);
      setReservations(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error("Failed to delete reservation:", err);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      if (newStatus === 'ready') {
        await ModeratorService.markReservationReady(id);
      } else if (newStatus === 'fulfilled') {
        await ModeratorService.checkoutReservation(id);
      } else if (newStatus === 'cancelled' || newStatus === 'cancelled_by_admin') {
        await ModeratorService.cancelReservation(id);
      } else {
        await ModeratorService.updateReservationStatus(id, newStatus);
      }
      fetchReservations();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to update reservation status");
      fetchReservations();
    }
  };

  const filteredReservations = reservations.filter(r => {
    const title = r.book?.title || '';
    const student = (r as any).user?.name || (r as any).user?.email || '';
    const matchesSearch = title.toLowerCase().includes(search.toLowerCase()) || 
      student.toLowerCase().includes(search.toLowerCase()) ||
      (r.id && r.id.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || (r.status || '').toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const st = (status || 'pending').toLowerCase();
    switch (st) {
      case 'pending': return <Badge variant="warning">Pending</Badge>;
      case 'ready': return <Badge variant="success">Ready for Pickup</Badge>;
      case 'fulfilled': return <Badge variant="primary">Fulfilled</Badge>;
      case 'expired': return <Badge variant="error">Expired</Badge>;
      case 'cancelled_by_admin':
      case 'cancelled': return <Badge variant="neutral">Cancelled</Badge>;
      default: return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const columns = [
    { 
      key: 'id', 
      header: 'Res ID', 
      render: (item: any) => <span style={{ fontFamily: 'monospace' }}>{(item.id || '').substring(0, 8).toUpperCase()}</span> 
    },
    { 
      key: 'book', 
      header: 'Book Title', 
      render: (item: any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <div style={{ width: 24, height: 32, background: item.book?.coverColor || '#2D3748', borderRadius: 2 }}></div>
          <span style={{ fontWeight: 500 }}>{item.book?.title || 'Reserved Book'}</span>
        </div>
      ) 
    },
    { 
      key: 'user', 
      header: 'Student', 
      render: (item: any) => {
        const uObj = item.user || { name: item.studentName || 'Student', email: item.user?.email || 'student@university.edu' };
        return (
          <div 
            style={{ cursor: 'pointer' }}
            onClick={() => setSelectedUser(uObj)}
            title="Click to view student profile"
          >
            <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', textDecoration: 'underline' }}>{uObj.name || 'Student'}</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--bg-secondary-text)' }}>{uObj.email || 'N/A'}</p>
          </div>
        );
      } 
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
      render: (item: any) => {
        const st = (item.status || 'pending').toLowerCase();
        return (
          <select
            value={st}
            onChange={(e) => handleStatusChange(item.id, e.target.value)}
            style={{
              padding: '4px 8px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--bg-border)', outline: 'none',
              fontSize: '0.75rem', fontWeight: 600,
              background: st === 'ready' ? '#DEF7EC' : st === 'pending' ? '#E1EFFE' : st === 'fulfilled' ? '#E5E7EB' : '#FDE8E8',
              color: st === 'ready' ? '#03543F' : st === 'pending' ? '#1E429F' : st === 'fulfilled' ? '#374151' : '#9B1C1C'
            }}
          >
            <option value="pending">Pending</option>
            <option value="ready">Ready</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="cancelled_by_admin">Cancelled</option>
          </select>
        );
      } 
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: any) => {
        const st = (item.status || 'pending').toLowerCase();
        return (
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {st === 'pending' && (
              <Button size="sm" variant="success" title="Mark as Ready" onClick={() => handleMarkReady(item.id)}>
                <i className="fas fa-check" style={{ marginRight: 4 }}></i> Ready
              </Button>
            )}
            {st === 'ready' && (
              <Button size="sm" variant="primary" title="Process Checkout" onClick={() => handleCheckout(item.id)}>
                <i className="fas fa-barcode" style={{ marginRight: 4 }}></i> Checkout
              </Button>
            )}
            {st !== 'cancelled' && st !== 'cancelled_by_admin' && st !== 'fulfilled' && (
              <Button size="sm" variant="danger" title="Cancel Reservation" onClick={() => handleCancel(item.id)}>
                <i className="fas fa-times"></i>
              </Button>
            )}
            <Button size="sm" variant="outline" title="Delete Permanently" onClick={() => handleDeletePermanent(item.id)}>
              <i className="fas fa-trash-alt" style={{ color: 'var(--bg-error)' }}></i>
            </Button>
          </div>
        );
      }
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

      {/* Reserving Student Details Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="Reserving Student Profile"
        footer={<Button variant="outline" onClick={() => setSelectedUser(null)}>Close</Button>}
      >
        {selectedUser && (
          <div style={{ padding: 'var(--space-2) 0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%', background: 'var(--bg-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--bg-primary-text)'
              }}>
                {(selectedUser.name || selectedUser.email || 'User').substring(0,2).toUpperCase()}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--bg-primary-text)' }}>{selectedUser.name || 'Student'}</h3>
                <p style={{ margin: '2px 0 0', color: 'var(--bg-secondary-text)', fontSize: '0.875rem' }}>{selectedUser.email || 'student@university.edu'}</p>
                <Badge variant="primary" size="sm" style={{ marginTop: 6 }}>STUDENT</Badge>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', background: 'var(--bg-secondary)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--bg-secondary-text)', display: 'block' }}>Student ID</span>
                <strong style={{ fontSize: '0.875rem', color: 'var(--bg-primary-text)' }}>{selectedUser.id || 'STD-2024-0440'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--bg-secondary-text)', display: 'block' }}>Department</span>
                <strong style={{ fontSize: '0.875rem', color: 'var(--bg-primary-text)' }}>{selectedUser.department || 'Computer Science'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--bg-secondary-text)', display: 'block' }}>Phone Contact</span>
                <strong style={{ fontSize: '0.875rem', color: 'var(--bg-primary-text)' }}>{selectedUser.phone || '+1 (555) 019-2834'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--bg-secondary-text)', display: 'block' }}>Account Status</span>
                <Badge variant="success" size="sm">ACTIVE</Badge>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
