import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookCard } from '../../components/ui/BookCard/BookCard';
import { Button } from '../../components/ui';
import { BookService, Book } from '../../services/bookService';
import './Books.css';

export const Books: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    BookService.getBooks()
      .then(data => setBooks(data || []))
      .catch(() => setBooks([]));
  }, []);

  const previewBooks = books.slice(0, 8);

  return (
    <div className="bg-public-books">
      <div className="bg-public-books-header">
        <div className="container">
          <h1>Library Catalog</h1>
          <p>Discover physical and digital resources available in the BookGrid ecosystem.</p>
        </div>
      </div>

      <div className="container" style={{ padding: 'var(--space-12) 0', position: 'relative' }}>
        <div className="bg-public-books-grid">
          {previewBooks.map(book => (
            <BookCard 
              key={book.id}
              id={book.id}
              title={book.title}
              author={book.author}
              category={book.category}
              status={book.physicalAvailable > 0 ? 'Available' : 'Checked Out'}
              coverImage={book.coverColor ? undefined : undefined} // Mock data doesn't have cover images
            />
          ))}
        </div>

        {/* Lock Overlay for non-logged in users */}
        <div className="bg-public-books-overlay">
          <div className="bg-public-books-lock-card">
            <i className="fas fa-lock"></i>
            <h2>Unlock the Full Library</h2>
            <p>You are viewing a limited preview of the catalog. Login to search, filter, and access over 12,000+ academic resources, journals, and digital books.</p>
            <div className="bg-public-books-actions">
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button variant="primary" size="lg">Login</Button>
              </Link>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <Button variant="outline" size="lg">Create Free Account</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
