import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button, Badge, Modal } from '../../components/ui';
import { BookService, Book } from '../../services/bookService';
import { StudentService, ReservationItem } from '../../services/studentService';
import './Student.css';

export const BookDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [reserving, setReserving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [resItem, setResItem] = useState<ReservationItem | null>(null);

  const [inWishlist, setInWishlist] = useState(false);
  const [isReserved, setIsReserved] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [modalType, setModalType] = useState<'reservation' | 'wishlist'>('reservation');

  useEffect(() => {
    if (id) {
      setLoading(true);
      BookService.getBookById(id)
        .then(data => {
          if (data && data.id) {
            setBook(data);
            setLoading(false);
          } else {
            fetchFromCatalog();
          }
        })
        .catch(() => {
          fetchFromCatalog();
        });

      StudentService.getWishlist()
        .then(list => {
          if (Array.isArray(list)) {
            const found = list.some(item => {
              const bId = item.book?.id || item.id;
              return String(bId) === String(id);
            });
            setInWishlist(found);
          }
        })
        .catch(() => {});

      StudentService.getReservations()
        .then(resList => {
          if (Array.isArray(resList)) {
            const foundRes = resList.some(item => String(item.bookId || item.book?.id) === String(id) && (item.status === 'pending' || item.status === 'ready' || item.status === 'issued'));
            setIsReserved(foundRes);
          }
        })
        .catch(() => {});
    }
  }, [id]);

  const fetchFromCatalog = async () => {
    try {
      const allBooks = await BookService.getBooks();
      const found = Array.isArray(allBooks) ? allBooks.find((b: any) => b.id === id) : null;
      if (found) {
        setBook(found);
      } else {
        setBook(null);
      }
    } catch (e) {
      setBook(null);
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async () => {
    if (!book) return;
    setModalType('reservation');
    if (isReserved || resItem) {
      setModalTitle('Already Reserved');
      setModalMessage(`You have already placed a reservation for "${book.title}".`);
      setIsError(false);
      setModalOpen(true);
      return;
    }
    setReserving(true);
    try {
      const res = await StudentService.createReservation(book.id);
      setResItem(res);
      setIsReserved(true);
      setIsError(false);
      setModalTitle('Book Reserved Successfully!');
      setModalMessage(`Your reservation request for "${book.title}" has been placed.`);
      setModalOpen(true);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to submit reservation.';
      setIsError(true);
      setModalTitle('Reservation Status');
      setModalMessage(errorMsg);
      setModalOpen(true);
    } finally {
      setReserving(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!book) return;
    setModalType('wishlist');
    setWishlistLoading(true);
    try {
      if (inWishlist) {
        await StudentService.removeFromWishlist(book.id);
        setInWishlist(false);
        setModalTitle('Removed from Wishlist');
        setModalMessage(`"${book.title}" has been removed from your wishlist.`);
        setIsError(false);
        setModalOpen(true);
      } else {
        await StudentService.addToWishlist(book.id);
        setInWishlist(true);
        setModalTitle('Added to Wishlist ❤️');
        setModalMessage(`"${book.title}" has been added to your wishlist.`);
        setIsError(false);
        setModalOpen(true);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to update wishlist.';
      setIsError(true);
      setModalTitle('Wishlist Status');
      setModalMessage(errorMsg);
      setModalOpen(true);
    } finally {
      setWishlistLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 'var(--space-12)', textAlign: 'center', color: 'var(--bg-secondary-text)' }}>Loading book details...</div>;
  }

  if (!book) return (
    <div style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
      <i className="fas fa-exclamation-circle" style={{ fontSize: '3rem', color: 'var(--bg-border)', display: 'block', marginBottom: 'var(--space-4)' }}></i>
      <h2>Book not found</h2>
      <p style={{ color: 'var(--bg-secondary-text)', marginBottom: 'var(--space-4)' }}>The volume you requested ({id}) could not be located in the catalog.</p>
      <Link to="/student/books"><Button variant="outline">Back to Books</Button></Link>
    </div>
  );

  const ratingVal = book.rating ?? 4.5;
  const ratingCountVal = book.ratingCount ?? 10;
  const physAvailable = book.physicalAvailable ?? 0;
  const physCopies = book.physicalCopies ?? 1;

  return (
    <div>
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <Link to="/student/books" className="std-link-sm" style={{ textTransform: 'none', fontSize: '0.875rem' }}>
          <i className="fas fa-arrow-left"></i> Back to Books
        </Link>
      </div>

      <div className="sl-card">
        <div className="std-book-detail-grid">
          {/* Cover */}
          <div>
            <div className="std-book-cover-lg" style={{ background: book.coverColor || '#2D3748' }}>
              <i className="fas fa-book-open"></i>
            </div>
          </div>

          {/* Details */}
          <div>
            <div style={{ marginBottom: 'var(--space-3)' }}><Badge variant="neutral" size="sm">{book.category || 'General'}</Badge></div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', margin: '0 0 var(--space-2)' }}>{book.title || 'Untitled Book'}</h1>
            <p style={{ fontSize: '1.125rem', color: 'var(--bg-secondary-text)', margin: '0 0 var(--space-6)' }}>by {book.author || 'Unknown Author'}</p>

            <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
              <div className="std-meta-row">
                <span className="std-meta-label">ISBN</span>
                <span className="std-meta-value">{book.isbn || 'N/A'}</span>
              </div>
              <div className="std-meta-row">
                <span className="std-meta-label">Publisher</span>
                <span className="std-meta-value">{book.publisher || 'University Press'}</span>
              </div>
              <div className="std-meta-row">
                <span className="std-meta-label">Year</span>
                <span className="std-meta-value">{book.year || 2024}</span>
              </div>
              <div className="std-meta-row">
                <span className="std-meta-label">Pages</span>
                <span className="std-meta-value">{book.pages || 300}</span>
              </div>
            </div>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
              <div className="sl-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <i key={i} className={`fas fa-star ${i < Math.round(ratingVal) ? '' : 'star-empty'}`}></i>
                ))}
              </div>
              <strong>{ratingVal}</strong>
              <span style={{ color: 'var(--bg-secondary-text)', fontSize: '0.875rem' }}>({ratingCountVal.toLocaleString()} ratings)</span>
            </div>

            {/* Description */}
            <p style={{ color: 'var(--bg-secondary-text)', lineHeight: 1.7, marginBottom: 'var(--space-6)' }}>{book.description || 'Comprehensive volume cataloged in the university library database.'}</p>

            {/* Availability */}
            <div className="std-availability-grid">
              <div className="std-avail-card">
                <p className="std-avail-label"><i className="fas fa-building"></i> Physical Copies</p>
                <p className="std-avail-count" style={{ color: physAvailable > 0 ? 'var(--bg-success)' : 'var(--bg-error)' }}>
                  {physAvailable} / {physCopies}
                </p>
                <span style={{ fontSize: '0.75rem', color: 'var(--bg-secondary-text)' }}>Available</span>
              </div>
              <div className="std-avail-card">
                <p className="std-avail-label"><i className="fas fa-tablet-alt"></i> Digital Access</p>
                <p className="std-avail-count" style={{ color: book.hasDigital ? 'var(--bg-success)' : 'var(--bg-secondary-text)' }}>
                  {book.hasDigital ? 'Yes' : 'No'}
                </p>
                <span style={{ fontSize: '0.75rem', color: 'var(--bg-secondary-text)' }}>{book.hasDigital ? 'Read anytime' : 'Not available'}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="std-action-row">
              <Button
                variant={isReserved || resItem ? "secondary" : "secondary"}
                style={(isReserved || resItem) ? { background: 'var(--bg-warm-orange, #f28c28)', borderColor: 'var(--bg-warm-orange, #f28c28)', color: '#fff' } : undefined}
                icon={(isReserved || resItem) ? "fas fa-check" : "fas fa-bookmark"}
                onClick={handleReserve}
                disabled={reserving}
              >
                {reserving ? 'Reserving...' : (isReserved || resItem) ? 'Reserved ✓' : 'Reserve Copy'}
              </Button>
              {book.hasDigital && (
                <Link to={`/student/reader/${book.id}`} style={{ textDecoration: 'none' }}>
                  <Button variant="outline" icon="fas fa-book-open">Read Online</Button>
                </Link>
              )}
              <Button 
                variant={inWishlist ? "primary" : "ghost"} 
                style={inWishlist ? { background: '#e11d48', borderColor: '#e11d48', color: '#fff' } : undefined}
                icon={inWishlist ? "fas fa-heart" : "far fa-heart"}
                onClick={handleToggleWishlist}
                disabled={wishlistLoading}
              >
                {wishlistLoading ? 'Updating...' : inWishlist ? 'In Wishlist ❤️' : 'Wishlist'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title={modalTitle}
        footer={
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Close</Button>
            {!isError && (
              modalType === 'wishlist' ? (
                <Button variant="primary" onClick={() => { setModalOpen(false); navigate('/student/wishlist'); }}>
                  View Wishlist
                </Button>
              ) : (
                <Button variant="primary" onClick={() => { setModalOpen(false); navigate('/student/reservations'); }}>
                  View My Reservations
                </Button>
              )
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
                  {modalType === 'wishlist'
                    ? (inWishlist ? 'You can view and manage all your saved books in your Wishlist tab.' : 'Book removed from your saved items.')
                    : 'You will be notified as soon as a physical copy is ready for pickup at the circulation desk.'}
                </p>
              )}
            </div>
          </div>

          {!isError && modalType === 'reservation' && resItem && (
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
    </div>
  );
};
