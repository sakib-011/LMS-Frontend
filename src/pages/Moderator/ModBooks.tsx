import React, { useEffect, useState } from 'react';
import { Button, Badge } from '../../components/ui';
import { BookService, Book } from '../../services/bookService';
import './Moderator.css';

export const ModBooks: React.FC = () => {
  const [search, setSearch] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    BookService.getBooks()
      .then(res => {
        if (Array.isArray(res)) setBooks(res);
      })
      .catch(err => console.error("Failed to load books:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredBooks = books.filter(b => 
    (b.title || '').toLowerCase().includes(search.toLowerCase()) || 
    (b.isbn || '').includes(search)
  );

  return (
    <div>
      <div className="mod-card-header">
        <div>
          <h1 className="mod-card-title">Book Catalog Management</h1>
          <p style={{ color: 'var(--bg-secondary-text)', fontSize: '0.875rem' }}>Manage library books, editions, and metadata in database.</p>
        </div>
        <Button variant="primary" icon="fas fa-plus">Add New Book</Button>
      </div>

      <div className="mod-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <div style={{ position: 'relative', width: 300 }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: 12, top: 10, color: 'var(--bg-secondary-text)' }}></i>
            <input 
              type="text" 
              placeholder="Search books or ISBN..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 36px', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
          <Button variant="outline" icon="fas fa-filter">Filter</Button>
        </div>

        {loading ? (
          <p style={{ color: 'var(--bg-secondary-text)', padding: '20px 0' }}>Loading catalog books...</p>
        ) : filteredBooks.length === 0 ? (
          <p style={{ color: 'var(--bg-secondary-text)', padding: '20px 0' }}>No books found in database.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="mod-table">
              <thead>
                <tr>
                  <th>Book Details</th>
                  <th>ISBN</th>
                  <th>Category</th>
                  <th>Availability</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map(book => (
                  <tr key={book.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <div style={{ width: 32, height: 48, background: book.coverColor || '#2D3748', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem' }}>
                          <i className="fas fa-book"></i>
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>{book.title}</p>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--bg-secondary-text)' }}>{book.author} · {book.year} ({book.edition || '1st Ed.'})</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.875rem' }}>{book.isbn}</td>
                    <td><Badge variant="neutral" size="sm">{book.category}</Badge></td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: '0.75rem' }}>{book.physicalAvailable ?? 1} Available</span>
                        {book.hasDigital && <span style={{ fontSize: '0.75rem', color: 'var(--bg-accent-blue)' }}>Digital Available</span>}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                        <Button size="sm" variant="outline" title="Manage Copies"><i className="fas fa-boxes"></i></Button>
                        <Button size="sm" variant="outline" title="Edit Book"><i className="fas fa-edit"></i></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
