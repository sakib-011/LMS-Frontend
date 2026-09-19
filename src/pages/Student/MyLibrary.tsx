import React, { useEffect, useState } from 'react';

import { Badge, Button } from '../../components/ui';
import { ViewToggle } from '../../components/ui/ViewToggle/ViewToggle';
import { BookGridCard } from '../../components/ui/BookCard/BookGridCard';
import { StudentService, BorrowingItem, ReservationItem } from '../../services/studentService';
import './Student.css';

type LibTab = 'borrowed' | 'reservations' | 'history' | 'overdue';

export const MyLibrary: React.FC = () => {
  const [tab, setTab] = useState<LibTab>('borrowed');
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [borrowings, setBorrowings] = useState<BorrowingItem[]>([]);
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      StudentService.getBorrowings().catch(() => []),
      StudentService.getReservations().catch(() => [])
    ]).then(([borrowData, resData]) => {
      if (Array.isArray(borrowData)) setBorrowings(borrowData);
      if (Array.isArray(resData)) setReservations(resData);
    }).finally(() => setLoading(false));
  }, []);

  const activeBorrowings = borrowings.filter(b => b.status !== 'RETURNED');
  const historyBorrowings = borrowings.filter(b => b.status === 'RETURNED');
  const overdue = activeBorrowings.filter(b => b.isOverdue || b.status === 'OVERDUE');

  const renderBorrowed = () => {
    if (activeBorrowings.length === 0) {
      return <p style={{ color: 'var(--bg-secondary-text)', padding: '20px 0' }}>No active borrowed items.</p>;
    }
    if (view === 'grid') {
      return (
        <div className="sbb-grid">
          {activeBorrowings.map(b => (
            <BookGridCard 
              key={b.id} 
              book={b.book || { title: 'Borrowed Book', author: 'Catalog', coverColor: '#2D3748' } as any}
              showAvailability={false}
              topRightBadge={b.isOverdue ? <div className="sbb-edition-badge" style={{ color: 'var(--bg-error)', fontWeight: 800 }}>OVERDUE</div> : undefined}
              actionSlot={<Button size="sm" variant="outline" style={{ width: '100%' }}>Renew</Button>}
            >
              <div style={{ padding: '6px 10px 10px' }}>
                <div className="std-progress-bar">
                  <div className="std-progress-fill" style={{ width: `${b.progress ?? 0}%` }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', marginTop: 4 }}>
                  <span style={{ color: 'var(--bg-secondary-text)' }}>{b.progress ?? 0}% read</span>
                  <span style={{ color: b.isOverdue ? 'var(--bg-error)' : 'var(--bg-secondary-text)' }}>Due: {b.dueDate || 'N/A'}</span>
                </div>
              </div>
            </BookGridCard>
          ))}
        </div>
      );
    }
    return (
      <div className="std-books-table">
        {activeBorrowings.map(b => (
          <div key={b.id} className="std-list-card">
            <div className="std-list-book-cover" style={{ background: b.book?.coverColor || '#2D3748' }}>
              <i className="fas fa-book"></i>
            </div>
            <div className="std-list-book-info">
              <p className="std-list-title">{b.book?.title || 'Borrowed Book'}</p>
              <p className="std-list-author">{b.book?.author || 'Catalog'}</p>
              <div className="std-progress-bar-wrap">
                <div className="std-progress-bar">
                  <div className="std-progress-fill" style={{ width: `${b.progress ?? 0}%` }}></div>
                </div>
                <span className="std-progress-label">{b.progress ?? 0}% read</span>
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--bg-secondary-text)', marginBottom: 4 }}>Due: {b.dueDate || 'N/A'}</p>
              {b.isOverdue ? <Badge variant="error">Overdue</Badge> : <Badge variant="success">On Time</Badge>}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderReservations = () => {
    if (reservations.length === 0) {
      return <p style={{ color: 'var(--bg-secondary-text)', padding: '20px 0' }}>No reservations found.</p>;
    }
    if (view === 'grid') {
      return (
        <div className="sbb-grid">
          {reservations.map(r => (
            <BookGridCard 
              key={r.id} 
              book={r.book || { title: 'Reserved Book', author: 'Catalog', coverColor: '#2D3748' } as any}
              showAvailability={false}
              topRightBadge={r.status === 'ready' ? <div className="sbb-edition-badge" style={{ color: 'var(--bg-success)' }}>READY</div> : <div className="sbb-edition-badge">Queue #{r.queuePosition || 1}</div>}
            />
          ))}
        </div>
      );
    }
    return (
      <div className="std-books-table">
        {reservations.map(r => (
          <div key={r.id} className="std-list-card" style={{ borderColor: r.status === 'ready' ? 'var(--bg-success)' : undefined }}>
            <div className="std-list-book-cover" style={{ background: r.book?.coverColor || '#2D3748' }}>
              <i className="fas fa-book"></i>
            </div>
            <div className="std-list-book-info">
              <p className="std-list-title">{r.book?.title || 'Reserved Book'}</p>
              <p className="std-list-author">{r.book?.author || 'Catalog'}</p>
              {r.status === 'ready' && r.pickupDeadline && (
                <span style={{ fontSize: '0.8125rem', color: 'var(--bg-success)' }}>
                  <i className="fas fa-map-marker-alt"></i> Pickup by {r.pickupDeadline}
                </span>
              )}
            </div>
            <div style={{ flexShrink: 0 }}>
              {r.status === 'ready' ? <Badge variant="success">Ready for Pickup</Badge> : <Badge variant="neutral">Queue #{r.queuePosition || 1}</Badge>}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderHistory = () => {
    if (historyBorrowings.length === 0) {
      return <p style={{ color: 'var(--bg-secondary-text)', padding: '20px 0' }}>No past borrowing history.</p>;
    }
    if (view === 'grid') {
      return (
        <div className="sbb-grid">
          {historyBorrowings.map(b => (
            <BookGridCard 
              key={b.id} 
              book={b.book || { title: 'Past Borrowed Book', author: 'Catalog', coverColor: '#2D3748' } as any}
              showAvailability={false}
              actionSlot={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0 4px' }}>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--bg-secondary-text)' }}>Returned: {b.returnDate || 'Recently'}</span>
                  <Badge variant="success" size="sm">Returned</Badge>
                </div>
              }
            />
          ))}
        </div>
      );
    }
    return (
      <div className="std-books-table">
        {historyBorrowings.map(b => (
          <div key={b.id} className="std-list-card">
            <div className="std-list-book-cover" style={{ background: b.book?.coverColor || '#2D3748' }}>
              <i className="fas fa-book"></i>
            </div>
            <div className="std-list-book-info">
              <p className="std-list-title">{b.book?.title || 'Past Borrowed Book'}</p>
              <p className="std-list-author">{b.book?.author || 'Catalog'}</p>
              <span style={{ fontSize: '0.8125rem', color: 'var(--bg-secondary-text)' }}>Returned: {b.returnDate || 'Recently'}</span>
            </div>
            <Badge variant="success">Returned</Badge>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="sl-page-header">
        <h1 className="sl-page-title">My Library</h1>
        <p className="sl-page-subtitle">Track your borrowed books and reservation history from database</p>
      </div>

      {/* Tabs + View Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 0, borderBottom: '2px solid var(--bg-border)' }}>
        <div className="sl-tabs" style={{ borderBottom: 'none', marginBottom: 0 }}>
          {(['borrowed', 'reservations', 'history', 'overdue'] as LibTab[]).map(t => (
            <button key={t} className={`sl-tab ${tab === t ? 'sl-tab--active' : ''}`} onClick={() => setTab(t)}>
              {t === 'borrowed' ? `Borrowed (${activeBorrowings.length})`
                : t === 'reservations' ? `Reservations (${reservations.length})`
                : t === 'history' ? `History (${historyBorrowings.length})`
                : `Overdue (${overdue.length})`}
            </button>
          ))}
        </div>
        <div style={{ paddingBottom: 2 }}>
          <ViewToggle view={view} onChange={setView} />
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-4)' }}>
        {loading ? (
          <p style={{ color: 'var(--bg-secondary-text)', padding: '20px 0' }}>Loading library records...</p>
        ) : (
          <>
            {tab === 'borrowed' && renderBorrowed()}

            {tab === 'reservations' && renderReservations()}

            {tab === 'history' && renderHistory()}

            {tab === 'overdue' && (
              overdue.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--bg-success)' }}>
                  <i className="fas fa-check-circle" style={{ fontSize: '3rem', display: 'block', marginBottom: 'var(--space-4)' }}></i>
                  <p>No overdue books — great job!</p>
                </div>
              ) : (
                view === 'grid' ? (
                  <div className="sbb-grid">
                    {overdue.map(b => (
                      <BookGridCard 
                        key={b.id} 
                        book={b.book || { title: 'Overdue Book', author: 'Catalog', coverColor: '#2D3748' } as any}
                        showAvailability={false}
                        topRightBadge={<div className="sbb-edition-badge" style={{ color: 'var(--bg-error)', fontWeight: 800 }}>OVERDUE</div>}
                        actionSlot={
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0 4px' }}>
                            <span style={{ fontSize: '0.6875rem', color: 'var(--bg-error)' }}>Was due: {b.dueDate}</span>
                          </div>
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <div className="std-books-table">
                    {overdue.map(b => (
                      <div key={b.id} className="std-list-card" style={{ borderColor: 'var(--bg-error)' }}>
                        <div className="std-list-book-cover" style={{ background: b.book?.coverColor || '#2D3748' }}>
                          <i className="fas fa-book"></i>
                        </div>
                        <div className="std-list-book-info">
                          <p className="std-list-title">{b.book?.title || 'Overdue Book'}</p>
                          <p className="std-list-author">{b.book?.author || 'Catalog'}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: '0.8125rem', color: 'var(--bg-error)', marginBottom: 4 }}>Was due: {b.dueDate}</p>
                          <Badge variant="error">Overdue</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};
