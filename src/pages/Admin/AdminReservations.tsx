import React, { useState, useEffect } from 'react';
import { Button, Badge, ConfirmationDialog } from '../../components/ui';
import { ModeratorService } from '../../services/moderatorService';
import './Admin.css';

export const AdminReservations: React.FC = () => {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, title: string, message: string, isDestructive?: boolean}>({ isOpen: false, title: '', message: '' });

  useEffect(() => {
    ModeratorService.getReservations()
      .then((data: any) => setReservations(Array.isArray(data) ? data : []))
      .catch(() => setReservations([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredReservations = reservations.filter(item => {
    const matchesSearch = (item.bookTitle || item.book?.title || '').toLowerCase().includes(search.toLowerCase()) || 
                          (item.studentName || item.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
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
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>

      <div className="admin-card">
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
              {filteredReservations.map(item => (
                <tr key={item.id}>
                  <td>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{(item.id || '').toUpperCase()}</p>
                  </td>
                  <td>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{item.bookTitle || item.book?.title || 'Book'}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ISBN: {item.isbn || item.book?.isbn || 'N/A'}</p>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <div style={{ 
                        width: '28px', height: '28px', borderRadius: '50%', 
                        background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: 'bold'
                      }}>
                        {(item.studentName || item.user?.name || 'User').substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{item.studentName || item.user?.name || 'User'}</p>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>ID: {item.studentId || item.user?.id || 'STD-001'}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      Reserved: {item.reservedDate || ''}
                    </p>
                    {item.status === 'ready' ? (
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--status-error)', fontWeight: 600 }}>
                        Pickup Deadline: {item.pickupDeadline || 'N/A'}
                      </p>
                    ) : (
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Queue Position: <strong>#{item.queuePosition || 1}</strong>
                      </p>
                    )}
                  </td>
                  <td>
                    <Badge variant={
                      item.status === 'ready' ? 'success' : 
                      item.status === 'pending' ? 'primary' : 
                      'error'
                    }>
                      {(item.status || 'pending').charAt(0).toUpperCase() + (item.status || 'pending').slice(1)}
                    </Badge>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                      
                      {item.status === 'pending' && (
                        <Button size="sm" variant="outline" title="Mark Ready for Pickup" onClick={() => setConfirmDialog({
                          isOpen: true, title: 'Mark Ready', message: `Is "${item.bookTitle || item.book?.title}" ready at the circulation desk? This will notify ${item.studentName || item.user?.name} to pick it up.`
                        })}>
                          <i className="fas fa-box-open" style={{ color: 'var(--status-success)' }}></i>
                        </Button>
                      )}

                      {item.status === 'ready' && (
                        <Button size="sm" variant="outline" title="Process Checkout" onClick={() => setConfirmDialog({
                          isOpen: true, title: 'Process Checkout', message: `Proceed to checkout for ${item.studentName || item.user?.name}? This will convert the reservation into an active loan.`
                        })}>
                          <i className="fas fa-barcode" style={{ color: 'var(--bg-warm-orange)' }}></i>
                        </Button>
                      )}

                      {item.status !== 'expired' && (
                        <Button size="sm" variant="outline" title="Cancel Reservation" onClick={() => setConfirmDialog({
                          isOpen: true, title: 'Cancel Reservation', message: `Are you sure you want to cancel the reservation for "${item.bookTitle || item.book?.title}"?`, isDestructive: true
                        })}>
                          <i className="fas fa-times-circle" style={{ color: 'var(--status-error)' }}></i>
                        </Button>
                      )}
                      
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredReservations.length === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--space-8) 0', color: 'var(--text-secondary)' }}>
              <i className="fas fa-clipboard-list" style={{ fontSize: '2rem', marginBottom: 'var(--space-4)', opacity: 0.5 }}></i>
              <p>No reservations found matching your filters.</p>
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
