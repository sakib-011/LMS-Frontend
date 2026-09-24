import React, { useState, useEffect } from 'react';
import { Button, Badge, ConfirmationDialog, Modal } from '../../components/ui';
import { AdminService } from '../../services/adminService';
import './Admin.css';

export const AdminReservations: React.FC = () => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isDestructive?: boolean;
    onConfirmAction?: () => void;
  }>({ isOpen: false, title: '', message: '' });

  const fetchReservations = () => {
    setLoading(true);
    AdminService.getReservations()
      .then((data: any) => setReservations(Array.isArray(data) ? data : []))
      .catch(() => setReservations([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleMarkReady = (id: string, title: string, userName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Mark Ready',
      message: `Is "${title}" ready at the circulation desk? This will notify ${userName} to pick it up.`,
      onConfirmAction: async () => {
        try {
          await AdminService.markReservationReady(id);
          fetchReservations();
        } catch (err) {
          console.error("Failed to mark ready:", err);
        }
      }
    });
  };

  const handleCheckout = (id: string, userName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Process Checkout',
      message: `Proceed to checkout for ${userName}? This will convert the reservation into an active loan.`,
      onConfirmAction: async () => {
        try {
          await AdminService.checkoutReservation(id);
          fetchReservations();
        } catch (err: any) {
          alert(err.response?.data?.message || err.message || "Failed to checkout reservation");
        }
      }
    });
  };

  const handleCancel = (id: string, title: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Cancel Reservation',
      message: `Are you sure you want to cancel the reservation for "${title}"?`,
      isDestructive: true,
      onConfirmAction: async () => {
        try {
          await AdminService.cancelReservation(id);
          fetchReservations();
        } catch (err) {
          console.error("Failed to cancel reservation:", err);
        }
      }
    });
  };

  const handleDeletePermanent = (id: string, title: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Reservation Permanently',
      message: `Are you sure you want to permanently delete the reservation record for "${title}"? This cannot be undone.`,
      isDestructive: true,
      onConfirmAction: async () => {
        try {
          await AdminService.deleteReservationPermanently(id);
          fetchReservations();
        } catch (err) {
          console.error("Failed to delete reservation:", err);
        }
      }
    });
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      if (newStatus === 'ready') {
        await AdminService.markReservationReady(id);
      } else if (newStatus === 'fulfilled') {
        await AdminService.checkoutReservation(id);
      } else if (newStatus === 'cancelled' || newStatus === 'cancelled_by_admin') {
        await AdminService.cancelReservation(id);
      } else {
        await AdminService.updateReservationStatus(id, newStatus);
      }
      fetchReservations();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Failed to update status");
      fetchReservations();
    }
  };

  const filteredReservations = reservations.filter(item => {
    const matchesSearch = (item.bookTitle || item.book?.title || '').toLowerCase().includes(search.toLowerCase()) || 
                          (item.studentName || item.user?.name || item.user?.email || '').toLowerCase().includes(search.toLowerCase()) ||
                          (item.id || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'All' || (item.status || '').toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Book Reservations</h1>
          <p className="admin-subtitle">Manage the reservation queue, waitlists, and pickup schedules.</p>
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
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '0 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-white)', color: 'var(--text-secondary)' }}
          >
            <option value="All">All Reservations</option>
            <option value="Pending">Pending / Waitlisted</option>
            <option value="Ready">Ready for Pickup</option>
            <option value="Fulfilled">Fulfilled</option>
            <option value="Expired">Expired</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="admin-card">
        {loading ? (
          <p style={{ color: 'var(--text-secondary)', padding: '20px 0' }}>Loading reservations...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Reservation ID</th>
                  <th>Requested Book</th>
                  <th>Reserving User</th>
                  <th>Timeline & Queue</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map(item => {
                  const bTitle = item.bookTitle || item.book?.title || 'Book';
                  const uName = item.studentName || item.user?.name || 'User';
                  const uObj = item.user || { name: uName, email: item.user?.email || 'student@university.edu', id: item.studentId || 'STD-001' };
                  const st = (item.status || 'pending').toLowerCase();

                  return (
                    <tr key={item.id}>
                      <td>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', fontFamily: 'monospace' }}>{(item.id || '').substring(0, 8).toUpperCase()}</p>
                      </td>
                      <td>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{bTitle}</p>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ISBN: {item.isbn || item.book?.isbn || 'N/A'}</p>
                        </div>
                      </td>
                      <td 
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSelectedUser(uObj)}
                        title="Click to view student profile"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                          <div style={{ 
                            width: '28px', height: '28px', borderRadius: '50%', 
                            background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.7rem', fontWeight: 'bold'
                          }}>
                            {uName.substring(0,2).toUpperCase()}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'underline' }}>{uName}</p>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{uObj.email || uObj.id || 'STD-001'}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                          Reserved: {item.reservedDate || 'Today'}
                        </p>
                        {st === 'ready' ? (
                          <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--status-error)', fontWeight: 600 }}>
                            Pickup Deadline: {item.pickupDeadline || 'In 3 Days'}
                          </p>
                        ) : (
                          <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Queue Position: <strong>#{item.queuePosition || 1}</strong>
                          </p>
                        )}
                      </td>
                      <td>
                        <select
                          value={st}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          style={{
                            padding: '4px 8px', borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-color)', outline: 'none',
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
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                          
                          {st === 'pending' && (
                            <Button size="sm" variant="outline" title="Mark Ready for Pickup" onClick={() => handleMarkReady(item.id, bTitle, uName)}>
                              <i className="fas fa-box-open" style={{ color: 'var(--status-success)' }}></i>
                            </Button>
                          )}

                          {st === 'ready' && (
                            <Button size="sm" variant="outline" title="Process Checkout" onClick={() => handleCheckout(item.id, uName)}>
                              <i className="fas fa-barcode" style={{ color: 'var(--bg-warm-orange)' }}></i>
                            </Button>
                          )}

                          {st !== 'cancelled' && st !== 'cancelled_by_admin' && st !== 'fulfilled' && (
                            <Button size="sm" variant="outline" title="Cancel Reservation" onClick={() => handleCancel(item.id, bTitle)}>
                              <i className="fas fa-times-circle" style={{ color: 'var(--status-error)' }}></i>
                            </Button>
                          )}

                          <Button size="sm" variant="outline" title="Delete Reservation Permanently" onClick={() => handleDeletePermanent(item.id, bTitle)}>
                            <i className="fas fa-trash-alt" style={{ color: 'var(--status-error)' }}></i>
                          </Button>
                          
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {filteredReservations.length === 0 && (
              <div style={{ textAlign: 'center', padding: 'var(--space-8) 0', color: 'var(--text-secondary)' }}>
                <i className="fas fa-clipboard-list" style={{ fontSize: '2rem', marginBottom: 'var(--space-4)', opacity: 0.5 }}></i>
                <p>No reservations found matching your filters.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reserving User Details Modal */}
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
                width: 60, height: 60, borderRadius: '50%', background: 'var(--bg-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)'
              }}>
                {(selectedUser.name || selectedUser.email || 'User').substring(0,2).toUpperCase()}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>{selectedUser.name || 'Student'}</h3>
                <p style={{ margin: '2px 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{selectedUser.email || 'student@university.edu'}</p>
                <Badge variant="primary" size="sm" style={{ marginTop: 6 }}>STUDENT</Badge>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', background: 'var(--bg-secondary)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Student ID</span>
                <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{selectedUser.id || 'STD-2024-0440'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Department</span>
                <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{selectedUser.department || 'Computer Science'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Phone Contact</span>
                <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{selectedUser.phone || '+1 (555) 019-2834'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Account Status</span>
                <Badge variant="success" size="sm">ACTIVE</Badge>
              </div>
            </div>
          </div>
        )}
      </Modal>

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
