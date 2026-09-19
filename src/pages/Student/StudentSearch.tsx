import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SearchBar, Badge, Button } from '../../components/ui';
import { ViewToggle } from '../../components/ui/ViewToggle/ViewToggle';
import { BookGridCard } from '../../components/ui/BookCard/BookGridCard';
import { BookService, Book } from '../../services/bookService';
import './Student.css';

export const StudentSearch: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (query.trim().length > 0) {
      setLoading(true);
      BookService.searchBooks(query)
        .then(data => setResults(Array.isArray(data) ? data : []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    } else {
      setResults([]);
    }
  }, [query]);

  const handleSearch = (q: string) => {
    setQuery(q);
    setSearchParams({ q });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-6)' }}>
        <div className="sl-page-header" style={{ marginBottom: 0 }}>
          <h1 className="sl-page-title">Search</h1>
        </div>
        {results.length > 0 && <ViewToggle view={view} onChange={setView} />}
      </div>

      <div style={{ maxWidth: 600, marginBottom: 'var(--space-8)' }}>
        <SearchBar
          placeholder="Search books, authors, ISBN, category…"
          value={query}
          onChange={e => handleSearch(e.target.value)}
          onSearch={handleSearch}
        />
      </div>

      {query.trim() === '' && (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--bg-secondary-text)' }}>
          <i className="fas fa-search" style={{ fontSize: '3rem', display: 'block', marginBottom: 'var(--space-4)', color: 'var(--bg-border)' }}></i>
          <p>Start typing to search the library catalog…</p>
        </div>
      )}

      {query.trim().length > 0 && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--bg-secondary-text)' }}>
          <i className="fas fa-book-dead" style={{ fontSize: '3rem', display: 'block', marginBottom: 'var(--space-4)', color: 'var(--bg-border)' }}></i>
          <p>No books found for "<strong>{query}</strong>"</p>
        </div>
      )}

      {results.length > 0 && (
        <>
          <p style={{ color: 'var(--bg-secondary-text)', marginBottom: 'var(--space-4)', fontSize: '0.875rem' }}>
            {results.length} result{results.length !== 1 ? 's' : ''} for "<strong>{query}</strong>"
          </p>

          {view === 'grid' ? (
            <div className="sbb-grid">
              {results.map(book => (
                <BookGridCard 
                  key={book.id} 
                  book={book}
                  actionSlot={
                    <Link to={`/student/books/${book.id}`} style={{ textDecoration: 'none', flex: 1 }}>
                      <Button size="sm" variant="primary" style={{ width: '100%' }}>View Details</Button>
                    </Link>
                  }
                />
              ))}
            </div>
          ) : (
            <div className="std-books-table">
              {results.map(book => (
                <Link key={book.id} to={`/student/books/${book.id}`} className="std-book-row">
                  <div className="std-book-cover-mini" style={{ background: book.coverColor }}>
                    <i className="fas fa-book"></i>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="std-reading-title">{book.title}</p>
                    <p className="std-reading-author">{book.author} · {book.year}</p>
                  </div>
                  <Badge variant="neutral" size="sm">{book.category}</Badge>
                  <Badge variant={book.physicalAvailable > 0 ? 'success' : 'error'} size="sm">
                    {book.physicalAvailable > 0 ? `${book.physicalAvailable} Available` : 'Checked Out'}
                  </Badge>
                  {book.hasDigital && <Badge variant="secondary" size="sm">Digital</Badge>}
                  <i className="fas fa-chevron-right" style={{ color: 'var(--bg-border)' }}></i>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
