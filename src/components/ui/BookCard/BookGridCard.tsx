import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Book } from '../../../services/bookService';
import './BookGridCard.css';

interface BookGridCardProps {
  book: Book;
  topLeftBadge?: React.ReactNode;
  topRightBadge?: React.ReactNode;
  actionSlot?: React.ReactNode;
  children?: React.ReactNode;
  showAvailability?: boolean;
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
  showAvailability = true
}) => {
  const color = CAT_COLORS[book.category] || '#6F6A64';
  const navigate = useNavigate();

  const defaultTopLeft = <div className="sbb-gate-badge" style={{ background: color }}>GATE {(book.gateScore || 4.8).toFixed(2)}</div>;
  const defaultTopRight = <div className="sbb-edition-badge">{book.edition || '1st Ed'}</div>;

  const handleReadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/student/reader/${book.id}`);
  };

  const handleReserveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    alert(`Reservation request submitted for "${book.title}"! You will be notified when it's ready for pickup.`);
  };

  return (
    <Link to={`/student/books/${book.id}`} className="sbb-grid-card">
      {topLeftBadge !== undefined ? topLeftBadge : defaultTopLeft}
      {topRightBadge !== undefined ? topRightBadge : defaultTopRight}

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
          <button className="sbb-action-btn sbb-action-btn--reserve" onClick={handleReserveClick}>
            <i className="fas fa-bookmark"></i> Reserve
          </button>
        </div>
      )}
    </Link>
  );
};
