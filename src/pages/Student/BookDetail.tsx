import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Badge } from '../../components/ui';
import { BookService, Book } from '../../services/bookService';
import './Student.css';

export const BookDetail: React.FC = () => {
  const { id } = useParams();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [reserved, setReserved] = useState(false);

  useEffect(() => {
    if (id) {
      BookService.getBookById(id)
        .then(data => setBook(data))
        .catch(() => setBook(null))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return <div style={{ padding: 'var(--space-12)', textAlign: 'center' }}>Loading book details...</div>;
  }

  if (!book) return (
    <div style={{ textAlign: 'center', padding: 'var(--space-16)' }}>
      <i className="fas fa-exclamation-circle" style={{ fontSize: '3rem', color: 'var(--bg-border)', display: 'block', marginBottom: 'var(--space-4)' }}></i>
      <h2>Book not found</h2>
      <Link to="/student/books"><Button variant="outline">Back to Books</Button></Link>
    </div>
  );

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
            <div className="std-book-cover-lg" style={{ background: book.coverColor }}>
              <i className="fas fa-book-open"></i>
            </div>
          </div>

          {/* Details */}
          <div>
            <div style={{ marginBottom: 'var(--space-3)' }}><Badge variant="neutral" size="sm">{book.category}</Badge></div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', margin: '0 0 var(--space-2)' }}>{book.title}</h1>
            <p style={{ fontSize: '1.125rem', color: 'var(--bg-secondary-text)', margin: '0 0 var(--space-6)' }}>by {book.author}</p>

            <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
              <div className="std-meta-row">
                <span className="std-meta-label">ISBN</span>
                <span className="std-meta-value">{book.isbn}</span>
              </div>
              <div className="std-meta-row">
                <span className="std-meta-label">Publisher</span>
                <span className="std-meta-value">{book.publisher}</span>
              </div>
              <div className="std-meta-row">
                <span className="std-meta-label">Year</span>
                <span className="std-meta-value">{book.year}</span>
              </div>
              <div className="std-meta-row">
                <span className="std-meta-label">Pages</span>
                <span className="std-meta-value">{book.pages}</span>
              </div>
            </div>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
              <div className="sl-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <i key={i} className={`fas fa-star ${i < Math.round(book.rating) ? '' : 'star-empty'}`}></i>
                ))}
              </div>
              <strong>{book.rating}</strong>
              <span style={{ color: 'var(--bg-secondary-text)', fontSize: '0.875rem' }}>({book.ratingCount.toLocaleString()} ratings)</span>
            </div>

            {/* Description */}
            <p style={{ color: 'var(--bg-secondary-text)', lineHeight: 1.7, marginBottom: 'var(--space-6)' }}>{book.description}</p>

            {/* Availability */}
            <div className="std-availability-grid">
              <div className="std-avail-card">
                <p className="std-avail-label"><i className="fas fa-building"></i> Physical Copies</p>
                <p className="std-avail-count" style={{ color: book.physicalAvailable > 0 ? 'var(--bg-success)' : 'var(--bg-error)' }}>
                  {book.physicalAvailable} / {book.physicalCopies}
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
              {book.physicalAvailable > 0 ? (
                <Button variant="primary" icon="fas fa-bookmark">Borrow Now</Button>
              ) : (
                <Button
                  variant={reserved ? 'outline' : 'secondary'}
                  icon="fas fa-calendar-check"
                  onClick={() => setReserved(r => !r)}
                >
                  {reserved ? 'Reserved ✓' : 'Reserve Copy'}
                </Button>
              )}
              {book.hasDigital && (
                <Link to={`/student/reader/${book.id}`} style={{ textDecoration: 'none' }}>
                  <Button variant="outline" icon="fas fa-book-open">Read Online</Button>
                </Link>
              )}
              <Button variant="ghost" icon="fas fa-heart">Wishlist</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
