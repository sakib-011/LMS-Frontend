import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Book } from '../../../services/bookService';
import { StudentService, ReservationItem } from '../../../services/studentService';
import { Modal } from '../Modal/Modal';
import { Button } from '../Button/Button';
import './BookGridCard.css';

interface BookGridCardProps {
  book: Book;
  topLeftBadge?: React.ReactNode;
  topRightBadge?: React.ReactNode;
  actionSlot?: React.ReactNode;
  children?: React.ReactNode;
  showAvailability?: boolean;
  isReserved?: boolean;
  onReserveSuccess?: (res: ReservationItem) => void;
}

const CAT_COLORS: Record<string, string> = {
  'Computer Science': '#F28C28',
  'Engineering': '#527A5A',
  'Business': '#234E52',
  'Mathematics': '#652B19',
  'Science': '#1C4532',
  'Literature': '#3D2B1F',
  'History': '#553C1E',
  'Arts': '#322659',
};

export const BookGridCard: React.FC<BookGridCardProps> = ({ 
  book, 
  topLeftBadge, 
  topRightBadge, 
  actionSlot, 
  children,
  showAvailability = true,
  isReserved = false,
  onReserveSuccess
}) => {
  const color = CAT_COLORS[book.category] || '#6F6A64';
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [resItem, setResItem] = useState<ReservationItem | null>(null);
  const [loading, setLoading] = useState(false);

  const isBookReserved = isReserved || !!resItem;


  const handleReadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/student/reader/${book.id}`);
  };

  const handleReserveClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isBookReserved) {
      setModalTitle('Already Reserved');
      setModalMessage(`You have already placed a reservation for "${book.title}".`);
      setIsError(false);
      setModalOpen(true);
      return;
    }
    setLoading(true);
    try {
      const res = await StudentService.createReservation(book.id);
      setResItem(res);
      setIsError(false);
      setModalTitle('Book Reserved Successfully!');
      setModalMessage(`Your reservation request for "${book.title}" has been placed.`);
      setModalOpen(true);
      if (onReserveSuccess) onReserveSuccess(res);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to submit reservation.';
      setIsError(true);
      setModalTitle('Reservation Status');
      setModalMessage(errorMsg);
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Link to={`/student/books/${book.id}`} className="sbb-grid-card">
        {topLeftBadge !== undefined ? topLeftBadge : null}
        {topRightBadge !== undefined ? topRightBadge : null}

        <div className="sbb-grid-cover" style={{ background: `${book.coverColor || '#1e1b4b'}22`, borderColor: `${book.coverColor || '#1e1b4b'}44` }}>
          <div className="sbb-cover-spine" style={{ background: book.coverColor || '#1e1b4b' }}>
            <i className="fas fa-book"></i>
          </div>
          <div className="sbb-cover-pages">
            <div className="sbb-cover-title-text">{book.title}</div>
            <div className="sbb-cover-author-text">{(book.author || 'Author').split(' ').slice(-1)[0]}</div>
            <div className="sbb-cover-pub">{book.publisher || 'University Press'}</div>
            <div className="sbb-cover-meta"><span>{book.year || 2024}</span><span>{book.pages || 300} pgs.</span></div>
          </div>
        </div>

        <div className="sbb-cat-chip" style={{ color, borderColor: `${color}55`, background: `${color}11` }}>
          {(book.category || 'General').toUpperCase()}
        </div>

        <p className="sbb-card-title">{book.title}</p>
        <p className="sbb-card-author">{book.author} ({book.year || 2024})</p>

        <div className="sbb-card-rating">
          <i className="fas fa-star sbb-star"></i>
          <strong>{book.rating || 4.8}</strong>
          <span className="sbb-rating-count">({(book.ratingCount || 100).toLocaleString()})</span>
        </div>

        {showAvailability && (
          <div className="sbb-avail-row">
            <div className="sbb-avail-chip">
              <i className="fas fa-building"></i>
              <span>{book.physicalStacks || 'Stack 1A'} · {book.physicalAvailable || 0} copies available</span>
            </div>
            {book.hasDigital && (
              <div className="sbb-avail-chip sbb-avail-chip--digital">
                <i className="fas fa-tablet-alt"></i>
                <span>Instant PDF Reader</span>
              </div>
            )}
          </div>
        )}

        {children}

        {actionSlot ? (
          <div className="sbb-card-actions">
            {actionSlot}
          </div>
        ) : (
          <div className="sbb-card-actions">
            {book.hasDigital && (
              <button className="sbb-action-btn sbb-action-btn--read" onClick={handleReadClick}>
                <i className="fas fa-book-open"></i> Read
              </button>
            )}
            <button 
              className={`sbb-action-btn ${isBookReserved ? 'sbb-action-btn--reserved' : 'sbb-action-btn--reserve'}`} 
              onClick={handleReserveClick} 
              disabled={loading}
            >
              <i className={isBookReserved ? "fas fa-check" : "fas fa-bookmark"}></i> {loading ? 'Reserving...' : isBookReserved ? 'Reserved ✓' : 'Reserve'}
            </button>
          </div>
        )}
      </Link>

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={modalTitle}
        footer={
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Close</Button>
            {!isError && (
              <Button variant="primary" onClick={() => { setModalOpen(false); navigate('/student/reservations'); }}>
                View My Reservations
              </Button>
            )}
          </div>
        }
      >
        <div style={{ padding: 'var(--space-2) 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <div style={{ 
              width: 50, height: 50, borderRadius: '50%', 
              background: isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: isError ? '#EF4444' : '#10B981', fontSize: '1.5rem', flexShrink: 0
            }}>
              <i className={isError ? "fas fa-exclamation-circle" : "fas fa-check-circle"}></i>
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>{modalMessage}</p>
              {!isError && (
                <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--bg-secondary-text)' }}>
                  You will be notified as soon as a physical copy is ready for pickup at the circulation desk.
                </p>
              )}
            </div>
          </div>

          {!isError && resItem && (
            <div style={{ background: 'var(--bg-secondary)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', fontSize: '0.875rem' }}>
              <div>
                <span style={{ color: 'var(--bg-secondary-text)', display: 'block', fontSize: '0.75rem' }}>Queue Position</span>
                <strong style={{ color: 'var(--bg-primary-text)' }}>#{resItem.queuePosition || 1} in line</strong>
              </div>
              <div>
                <span style={{ color: 'var(--bg-secondary-text)', display: 'block', fontSize: '0.75rem' }}>Reserved Date</span>
                <strong style={{ color: 'var(--bg-primary-text)' }}>{resItem.reservedDate || 'Today'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--bg-secondary-text)', display: 'block', fontSize: '0.75rem' }}>Expiry Date</span>
                <strong style={{ color: 'var(--bg-primary-text)' }}>{resItem.expiryDate || 'In 14 Days'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--bg-secondary-text)', display: 'block', fontSize: '0.75rem' }}>Status</span>
                <strong style={{ color: 'var(--bg-warm-orange, #f59e0b)' }}>Pending Queue</strong>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};
