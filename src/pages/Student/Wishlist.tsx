import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button } from '../../components/ui';
import { ViewToggle } from '../../components/ui/ViewToggle/ViewToggle';
import { BookGridCard } from '../../components/ui/BookCard/BookGridCard';
import { StudentService, WishlistItem } from '../../services/studentService';
import { Book } from '../../services/bookService';
import './Student.css';

export const Wishlist: React.FC = () => {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const data = await StudentService.getWishlist();
      if (Array.isArray(data)) {
        setItems(data);
      }
    } catch (err) {
      console.error("Failed to load wishlist:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (bookId: string) => {
    try {
      await StudentService.removeFromWishlist(bookId);
      setItems(prev => prev.filter(item => item.book?.id !== bookId && item.id !== bookId));
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-6)' }}>
        <div className="sl-page-header" style={{ marginBottom: 0 }}>
          <h1 className="sl-page-title">Wishlist</h1>
          <p className="sl-page-subtitle">{items.length} books saved</p>
        </div>
        <ViewToggle view={view} onChange={setView} />
      </div>

      {loading ? (
        <p style={{ color: 'var(--bg-secondary-text)', padding: '20px 0' }}>Loading wishlist...</p>
      ) : items.length === 0 ? (
        <p style={{ color: 'var(--bg-secondary-text)', padding: '20px 0' }}>Your wishlist is empty.</p>
      ) : view === 'grid' ? (
        <div className="sbb-grid">
          {items.map(item => {
            const book: Book = item.book || { id: item.id, title: 'Wishlist Book', author: 'Catalog', coverColor: '#2D3748', physicalAvailable: 1 } as any;
            return (
              <BookGridCard 
                key={book.id} 
                book={book}
                actionSlot={
                  <>
                    <Link to={`/student/books/${book.id}`} style={{ textDecoration: 'none', flex: 1 }}>
                      <Button size="sm" variant="primary" style={{ width: '100%' }}>Reserve</Button>
                    </Link>
                    <Button size="sm" variant="ghost" icon="fas fa-times" style={{ flexShrink: 0 }} onClick={() => handleRemove(book.id)}></Button>
                  </>
                }
              />
            );
          })}
        </div>
      ) : (
        <div className="std-books-table">
          {items.map(item => {
            const book: Book = item.book || { id: item.id, title: 'Wishlist Book', author: 'Catalog', coverColor: '#2D3748', physicalAvailable: 1 } as any;
            return (
              <div key={book.id} className="std-list-card">
                <div className="std-list-book-cover" style={{ background: book.coverColor || '#2D3748' }}>
                  <i className="fas fa-book"></i>
                </div>
                <div className="std-list-book-info">
                  <p className="std-list-title">{book.title}</p>
                  <p className="std-list-author">{book.author}</p>
                  <Badge variant="neutral" size="sm">{book.category || 'General'}</Badge>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', alignItems: 'flex-end', flexShrink: 0 }}>
                  <Badge variant={(book.physicalAvailable || 0) > 0 ? 'success' : 'error'} size="sm">
                    {(book.physicalAvailable || 0) > 0 ? 'Available' : 'Checked Out'}
                  </Badge>
                  <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                    <Link to={`/student/books/${book.id}`} style={{ textDecoration: 'none' }}>
                      <Button size="sm" variant="primary">Reserve</Button>
                    </Link>
                    <Button size="sm" variant="ghost" icon="fas fa-times" onClick={() => handleRemove(book.id)}></Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
