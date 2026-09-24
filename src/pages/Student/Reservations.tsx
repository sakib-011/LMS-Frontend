import React, { useEffect, useState } from 'react';
import { Badge, Button } from '../../components/ui';
import { ViewToggle } from '../../components/ui/ViewToggle/ViewToggle';
import { BookGridCard } from '../../components/ui/BookCard/BookGridCard';
import { StudentService, ReservationItem } from '../../services/studentService';
import './Student.css';

export const Reservations: React.FC = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    try {
      const data = await StudentService.getReservations();
      if (Array.isArray(data)) {
        setReservations(data);
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

  const handleCancel = async (id: string) => {
    try {
      await StudentService.cancelReservation(id);
      setReservations(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error("Failed to cancel reservation:", err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-6)' }}>
        <div className="sl-page-header" style={{ marginBottom: 0 }}>
          <h1 className="sl-page-title">Reservations</h1>
          <p className="sl-page-subtitle">Track your reservation queue and pickup status</p>
        </div>
        <ViewToggle view={view} onChange={setView} />
      </div>

      {loading ? (
        <p style={{ color: 'var(--bg-secondary-text)', padding: '20px 0' }}>Loading reservations...</p>
      ) : reservations.length === 0 ? (
        <p style={{ color: 'var(--bg-secondary-text)', padding: '20px 0' }}>No active reservations found.</p>
      ) : view === 'grid' ? (
        <div className="sbb-grid">
          {reservations.map(res => (
            <BookGridCard 
              key={res.id} 
              book={res.book || { title: 'Reserved Book', author: 'Library Catalog', coverColor: '#2D3748' } as any}
              showAvailability={false}
              topRightBadge={
                res.status === 'ready' ? <div className="sbb-edition-badge" style={{ color: 'var(--bg-success)', fontWeight: 'bold' }}>READY</div> :
                res.status === 'cancelled_by_admin' ? <div className="sbb-edition-badge" style={{ color: 'var(--bg-error)', fontWeight: 'bold' }}>REMOVED BY ADMIN</div> :
                res.status === 'cancelled' ? <div className="sbb-edition-badge" style={{ color: 'var(--bg-secondary-text)' }}>CANCELLED</div> :
                res.status === 'fulfilled' ? <div className="sbb-edition-badge" style={{ color: '#3b82f6', fontWeight: 'bold' }}>LOAN ACTIVE</div> :
                <div className="sbb-edition-badge">Queue #{res.queuePosition || 1}</div>
              }
              actionSlot={
                res.status === 'ready' ? <Badge variant="success">Ready for Pickup</Badge> :
                res.status === 'cancelled_by_admin' ? <Badge variant="error">Cancelled by Admin</Badge> :
                res.status === 'cancelled' ? <Badge variant="neutral">Cancelled by You</Badge> :
                res.status === 'fulfilled' ? <Badge variant="primary">Loan Active</Badge> :
                <Button size="sm" variant="danger" style={{ width: '100%' }} onClick={() => handleCancel(res.id)}>Cancel</Button>
              }
            />
          ))}
        </div>
      ) : (
        <div className="std-books-table">
        {reservations.map(res => (
          <div key={res.id} className="std-list-card" style={{
            borderColor: res.status === 'ready' ? 'var(--bg-success)' : res.status === 'cancelled_by_admin' ? 'var(--bg-error)' : undefined
          }}>
            <div className="std-list-book-cover" style={{ background: res.book?.coverColor || '#2D3748' }}>
              <i className="fas fa-book"></i>
            </div>
            <div className="std-list-book-info">
              <p className="std-list-title">{res.book?.title || 'Reserved Book'}</p>
              <p className="std-list-author">{res.book?.author || 'Library Catalog'}</p>
              <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-2)', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8125rem', color: 'var(--bg-secondary-text)' }}>
                  <i className="fas fa-calendar"></i> Reserved: {res.reservedDate || 'Today'}
                </span>
                {res.status === 'pending' && (
                  <span style={{ fontSize: '0.8125rem', color: 'var(--bg-secondary-text)' }}>
                    <i className="fas fa-users"></i> Queue position: #{res.queuePosition || 1}
                  </span>
                )}
                {res.status === 'ready' && res.pickupDeadline && (
                  <span style={{ fontSize: '0.8125rem', color: 'var(--bg-success)', fontWeight: 600 }}>
                    <i className="fas fa-map-marker-alt"></i> Pickup by: {res.pickupDeadline}
                  </span>
                )}
                {res.status === 'cancelled_by_admin' && (
                  <span style={{ fontSize: '0.8125rem', color: 'var(--bg-error)', fontWeight: 600 }}>
                    <i className="fas fa-exclamation-circle"></i> Cancelled by library admin
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-2)', flexShrink: 0 }}>
              {res.status === 'ready' && <Badge variant="success">Ready for Pickup</Badge>}
              {res.status === 'pending' && <Badge variant="neutral">In Queue</Badge>}
              {res.status === 'cancelled_by_admin' && <Badge variant="error">Cancelled by Admin</Badge>}
              {res.status === 'cancelled' && <Badge variant="neutral">Cancelled</Badge>}
              {res.status === 'fulfilled' && <Badge variant="primary">Loan Active</Badge>}
              {res.status === 'pending' && (
                <Button size="sm" variant="danger" onClick={() => handleCancel(res.id)}>Cancel</Button>
              )}
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  );
};
