import React, { useState, useEffect } from 'react';
import { Button, Badge, DataTable, Modal } from '../../components/ui';
import { BookService, Book } from '../../services/bookService';
import './Moderator.css';

export const ModDigitalLibrary: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    BookService.getBooks()
      .then(data => setBooks(data || []))
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, []);
  
  const digitalBooks = books.filter(b => b.hasDigital);
  
  const filteredBooks = digitalBooks.filter(b => {
    const matchesSearch = (b.title || '').toLowerCase().includes(search.toLowerCase()) || 
      (b.author || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.isbn || '').includes(search);
    const matchesCategory = categoryFilter === 'all' || b.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getCategories = () => {
    const categories = new Set(digitalBooks.map(b => b.category));
    return Array.from(categories);
  };

  const handleRemove = (id: string) => {
    if (window.confirm('Are you sure you want to remove this digital copy?')) {
      setBooks(books.filter(b => b.id !== id));
    }
  };

  const columns = [
    { 
      key: 'title', 
      header: 'Book Details', 
      render: (item: Book) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{ width: 32, height: 48, background: item.coverColor, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem' }}>
            <i className="fas fa-book"></i>
          </div>
          <div>
            <span style={{ fontWeight: 600, display: 'block' }}>{item.title}</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--bg-secondary-text)' }}>By {item.author}</span>
          </div>
        </div>
      ) 
    },
    { key: 'category', header: 'Category', render: (item: Book) => <Badge variant="neutral" size="sm">{item.category}</Badge> },
    { key: 'isbn', header: 'ISBN', render: (item: Book) => <span style={{ fontFamily: 'monospace' }}>{item.isbn}</span> },
    { key: 'pages', header: 'Pages' },
    { key: 'status', header: 'Status', render: () => <Badge variant="success">Available</Badge> }
  ];

  columns.push({
    key: 'actions',
    header: 'Actions',
    render: (item: Book) => (
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <Button size="sm" variant="outline" title="Update E-Book File" onClick={() => setIsUploadOpen(true)}>
          <i className="fas fa-file-upload"></i>
        </Button>
        <Button size="sm" variant="danger" title="Remove Digital Copy" onClick={() => handleRemove(item.id)}>
          <i className="fas fa-trash"></i>
        </Button>
      </div>
    )
  });

  return (
    <div>
      <div className="mod-card-header">
        <div>
          <h1 className="mod-card-title">Digital Library Management</h1>
          <p style={{ color: 'var(--bg-secondary-text)', fontSize: '0.875rem' }}>Manage e-books, upload new files, and monitor digital access.</p>
        </div>
        <Button variant="primary" icon="fas fa-cloud-upload-alt" onClick={() => setIsUploadOpen(true)}>Upload E-Book</Button>
      </div>

      <div className="mod-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <div style={{ position: 'relative', width: 350 }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: 12, top: 10, color: 'var(--bg-secondary-text)' }}></i>
            <input 
              type="text" 
              placeholder="Search by title, author, or ISBN..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 36px', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
          <Button variant="outline" icon="fas fa-filter" onClick={() => setIsFilterOpen(true)}>
            Filter
            {categoryFilter !== 'all' && <Badge variant="neutral" size="sm" style={{ marginLeft: 8, padding: '0 4px' }}>1</Badge>}
          </Button>
        </div>
        
        <DataTable data={filteredBooks} columns={columns} />
      </div>

      <Modal 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
        title="Upload E-Book"
      >
        <div style={{ padding: 'var(--space-4)', border: '2px dashed var(--bg-border)', borderRadius: 'var(--radius-md)', textAlign: 'center', margin: 'var(--space-2) 0 var(--space-4)' }}>
          <i className="fas fa-cloud-upload-alt" style={{ fontSize: '2.5rem', color: 'var(--bg-secondary-text)', marginBottom: 'var(--space-3)' }}></i>
          <h3 style={{ margin: '0 0 var(--space-2)' }}>Select or drop file here</h3>
          <p style={{ margin: '0 0 var(--space-4)', color: 'var(--bg-secondary-text)', fontSize: '0.875rem' }}>Supports PDF, EPUB, and MOBI (Max 50MB)</p>
          <Button variant="outline">Browse Files</Button>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600 }}>Link to Catalog Book</label>
          <select 
            className="mod-input" 
            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-md)' }}
          >
            <option value="">-- Select a physical book to attach to --</option>
            {books.filter(b => !b.hasDigital).map(b => (
              <option key={b.id} value={b.id}>{b.title} by {b.author}</option>
            ))}
          </select>
          <p style={{ marginTop: 'var(--space-2)', fontSize: '0.75rem', color: 'var(--bg-secondary-text)' }}>
            You can only attach e-books to catalog entries that do not currently have a digital version.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-6)' }}>
          <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => {
            alert('File uploaded successfully!');
            setIsUploadOpen(false);
          }}>Upload & Publish</Button>
        </div>
      </Modal>

      <Modal 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
        title="Filter Digital Library"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
            <Button variant="outline" onClick={() => {
              setCategoryFilter('all');
              setIsFilterOpen(false);
            }}>Clear Filters</Button>
            <Button variant="primary" onClick={() => setIsFilterOpen(false)}>Apply Filters</Button>
          </div>
        }
      >
        <div style={{ padding: 'var(--space-2) 0' }}>
          <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600 }}>Category</label>
          <select 
            className="mod-input" 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-md)' }}
          >
            <option value="all">All Categories</option>
            {getCategories().map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </Modal>
    </div>
  );
};
