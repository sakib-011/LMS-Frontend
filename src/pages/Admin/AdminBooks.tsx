import React, { useState, useEffect } from 'react';
import { Button, Badge, Modal, Input, ConfirmationDialog } from '../../components/ui';
import { BookService, Book } from '../../services/bookService';
import { validateImage } from '../../utils/imageValidation';
import { uploadImageToCloudinary } from '../../utils/cloudinaryService';
import './Admin.css';

type ProcessState = 'idle' | 'validating' | 'saving-book' | 'uploading-image' | 'updating-image-url' | 'success' | 'error';

export const AdminBooks: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, title: string, message: string, isDestructive?: boolean}>({ isOpen: false, title: '', message: '' });

  // Form states
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [category, setCategory] = useState('Computer Science');
  const [publisher, setPublisher] = useState('');
  const [year, setYear] = useState('2024');
  const [pages, setPages] = useState('300');
  const [physicalCopies, setPhysicalCopies] = useState('5');
  const [hasDigital, setHasDigital] = useState(false);
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [processState, setProcessState] = useState<ProcessState>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [savedBookId, setSavedBookId] = useState<string | null>(null);

  const fetchBooks = () => {
    setLoading(true);
    BookService.getBooks()
      .then((data) => setBooks(data || []))
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Categories list
  const categories = ['All', ...Array.from(new Set(books.map(b => b.category)))];

  // Handle Image File Selection with Client-Side Validation
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setValidationError(null);

    if (!file) {
      setSelectedFile(null);
      setImagePreview(null);
      return;
    }

    // React Image Validation (Metadata + Actual Image Decoding)
    const result = await validateImage(file);
    if (!result.valid) {
      setValidationError(result.error);
      setSelectedFile(null);
      setImagePreview(null);
      return;
    }

    // Valid image selected
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
  };

  // STEP-BY-STEP EXECUTION FLOW
  const handleCreateBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author) {
      setValidationError('Title and Author are required fields.');
      return;
    }

    // Validate image if selected
    if (selectedFile) {
      setProcessState('validating');
      setStatusMessage('Validating image format and content...');
      const check = await validateImage(selectedFile);
      if (!check.valid) {
        setValidationError(check.error);
        setProcessState('error');
        return;
      }
    }

    try {
      // -------------------------------------------------------------
      // STEP 1: Send ONLY Book Information to Spring Boot -> PostgreSQL
      // -------------------------------------------------------------
      setProcessState('saving-book');
      setStatusMessage('Saving book information to database...');

      const bookPayload: Partial<Book> = {
        title,
        author,
        isbn: isbn || `978-${Math.floor(Math.random() * 899999999 + 100000000)}`,
        category,
        publisher: publisher || 'University Press',
        year: parseInt(year, 10) || 2024,
        pages: parseInt(pages, 10) || 300,
        physicalCopies: parseInt(physicalCopies, 10) || 5,
        physicalAvailable: parseInt(physicalCopies, 10) || 5,
        hasDigital,
        description,
        coverColor: '#1e1b4b',
        imageUrl: undefined, // Image URL starts as NULL/undefined
      };

      // Call Spring Boot API 1: POST /api/v1/books
      const saveResponse = await BookService.createBook(bookPayload);
      const newBookId = saveResponse.data.id;
      setSavedBookId(newBookId);

      // If no image was selected, complete process immediately
      if (!selectedFile) {
        setProcessState('success');
        setStatusMessage('Book saved successfully without image!');
        resetForm();
        return;
      }

      // -------------------------------------------------------------
      // STEP 2: Upload Image Directly From React to Cloudinary
      // -------------------------------------------------------------
      setProcessState('uploading-image');
      setStatusMessage('Uploading image directly to Cloudinary...');

      const cloudinaryRes = await uploadImageToCloudinary(selectedFile, newBookId);

      // -------------------------------------------------------------
      // STEP 3: Send Book ID + Cloudinary Image URL to Spring Boot
      // -------------------------------------------------------------
      setProcessState('updating-image-url');
      setStatusMessage('Updating book image URL in database...');

      // Call Spring Boot API 2: PATCH /api/v1/books/{id}/image
      await BookService.updateBookImage(
        newBookId,
        cloudinaryRes.secure_url,
        cloudinaryRes.public_id
      );

      setProcessState('success');
      setStatusMessage('Book created and image uploaded successfully!');
      resetForm();

    } catch (err: any) {
      console.error('Book creation error:', err);
      if (savedBookId && selectedFile) {
        // Database save succeeded, but Cloudinary or URL update failed
        setProcessState('error');
        setStatusMessage(
          'Book information was saved, but the image upload failed. Please retry the image upload.'
        );
      } else {
        // Initial database save failed
        setProcessState('error');
        setValidationError(err.response?.data?.message || err.message || 'Database save failed.');
      }
    }
  };

  // Retry Cloudinary Upload for preserved savedBookId
  const handleRetryImageUpload = async () => {
    if (!savedBookId || !selectedFile) return;

    try {
      setProcessState('uploading-image');
      setStatusMessage('Retrying image upload to Cloudinary...');

      const cloudinaryRes = await uploadImageToCloudinary(selectedFile, savedBookId);

      setProcessState('updating-image-url');
      setStatusMessage('Updating book image URL in database...');

      await BookService.updateBookImage(
        savedBookId,
        cloudinaryRes.secure_url,
        cloudinaryRes.public_id
      );

      setProcessState('success');
      setStatusMessage('Image uploaded and book record updated successfully!');
      resetForm();
    } catch (err: any) {
      setProcessState('error');
      setStatusMessage('Image upload retry failed. Please try again.');
    }
  };

  const resetForm = () => {
    setTimeout(() => {
      setTitle('');
      setAuthor('');
      setIsbn('');
      setPublisher('');
      setDescription('');
      setSelectedFile(null);
      setImagePreview(null);
      setValidationError(null);
      setSavedBookId(null);
      setIsAddModalOpen(false);
      setProcessState('idle');
      setStatusMessage(null);
      fetchBooks();
    }, 1500);
  };

  const filteredBooks = books.filter(b => {
    const matchesSearch = (b.title || '').toLowerCase().includes(search.toLowerCase()) || 
                          (b.author || '').toLowerCase().includes(search.toLowerCase()) ||
                          (b.isbn || '').includes(search);
    const matchesCategory = filterCategory === 'All' || b.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Book Catalog</h1>
          <p className="admin-subtitle">Manage physical and digital books with Cloudinary direct image storage.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <div className="admin-search">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search title, author, ISBN..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ padding: '0 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-white)', color: 'var(--text-secondary)' }}
          >
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <Button onClick={() => { setIsAddModalOpen(true); setProcessState('idle'); setValidationError(null); }}>
            <i className="fas fa-plus" style={{ marginRight: '8px' }}></i> Add Book
          </Button>
        </div>
      </div>

      <div className="admin-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cover</th>
                <th>Book Details</th>
                <th>Category</th>
                <th>Inventory</th>
                <th>Format</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBooks.map(book => (
                <tr key={book.id}>
                  <td>
                    {book.imageUrl ? (
                      <img 
                        src={book.imageUrl} 
                        alt={book.title} 
                        style={{ width: '40px', height: '56px', borderRadius: '4px', objectFit: 'cover' }} 
                      />
                    ) : (
                      <div style={{ 
                        width: '40px', height: '56px', 
                        borderRadius: '4px', 
                        background: book.coverColor || '#1e1b4b',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '0.75rem', fontWeight: 'bold'
                      }}>
                        {book.title.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{book.title}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{book.author} · ISBN: {book.isbn}</p>
                    </div>
                  </td>
                  <td>
                    <Badge variant="neutral">{book.category}</Badge>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {book.physicalAvailable} / {book.physicalCopies} Available
                    </span>
                  </td>
                  <td>
                    <Badge variant={book.hasDigital ? 'success' : 'neutral'}>
                      {book.hasDigital ? 'Digital + Physical' : 'Physical Only'}
                    </Badge>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <Button size="sm" variant="outline" style={{ color: 'var(--danger-color)' }} onClick={() => setConfirmDialog({ isOpen: true, title: 'Delete Book', message: `Are you sure you want to delete "${book.title}"?`, isDestructive: true })}>
                        <i className="fas fa-trash"></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Book Modal with Database-First Cloudinary Direct Upload Flow */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => { if (processState === 'idle' || processState === 'error') setIsAddModalOpen(false); }}
        title="Add New Book to Inventory"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={processState !== 'idle' && processState !== 'error'}>Cancel</Button>
            
            {savedBookId && processState === 'error' ? (
              <Button variant="primary" onClick={handleRetryImageUpload}>
                <i className="fas fa-sync" style={{ marginRight: '6px' }}></i> Retry Image Upload
              </Button>
            ) : (
              <Button variant="primary" onClick={handleCreateBookSubmit} disabled={processState !== 'idle' && processState !== 'error'}>
                {processState !== 'idle' && processState !== 'error' ? (
                  <>
                    <i className="fas fa-spinner fa-spin" style={{ marginRight: '6px' }}></i> Processing...
                  </>
                ) : (
                  'Save & Upload'
                )}
              </Button>
            )}
          </div>
        }
      >
        <form onSubmit={handleCreateBookSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Status Progress Display */}
          {statusMessage && (
            <div style={{ 
              padding: '12px 16px', 
              borderRadius: '6px', 
              fontSize: '0.875rem',
              background: processState === 'error' ? '#fee2e2' : processState === 'success' ? '#dcfce7' : '#e0f2fe',
              color: processState === 'error' ? '#991b1b' : processState === 'success' ? '#166534' : '#075985',
              border: `1px solid ${processState === 'error' ? '#fca5a5' : processState === 'success' ? '#86efac' : '#7dd3fc'}`
            }}>
              <i className={`fas ${processState === 'error' ? 'fa-exclamation-triangle' : processState === 'success' ? 'fa-check-circle' : 'fa-info-circle'}`} style={{ marginRight: '8px' }}></i>
              {statusMessage}
            </div>
          )}

          {/* Validation Error Alert */}
          {validationError && (
            <div style={{ padding: '12px', borderRadius: '6px', background: '#fef2f2', color: '#991b1b', border: '1px solid #fca5a5', fontSize: '0.875rem' }}>
              <i className="fas fa-exclamation-circle" style={{ marginRight: '8px' }}></i>
              {validationError}
            </div>
          )}

          {/* Image Picker with Preview */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Book Cover Image (.jpg, .jpeg, .png, .webp - Max 5 MB)
            </label>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <input 
                type="file" 
                accept="image/jpeg,image/png,image/webp" 
                onChange={handleImageSelect}
                disabled={processState !== 'idle' && processState !== 'error'}
                style={{ flex: 1, padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
              />
              {imagePreview && (
                <img 
                  src={imagePreview} 
                  alt="Cover Preview" 
                  style={{ width: '48px', height: '64px', borderRadius: '4px', objectFit: 'cover', border: '1px solid var(--border-color)' }} 
                />
              )}
            </div>
          </div>

          <Input label="Book Title *" placeholder="e.g. Clean Code" value={title} onChange={(e) => setTitle(e.target.value)} required />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Author *" placeholder="e.g. Robert C. Martin" value={author} onChange={(e) => setAuthor(e.target.value)} required />
            <Input label="ISBN" placeholder="978-0-13-235088-4" value={isbn} onChange={(e) => setIsbn(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Category</label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white' }}
              >
                {categories.filter(c => c !== 'All').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <Input label="Publisher" placeholder="Prentice Hall" value={publisher} onChange={(e) => setPublisher(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <Input label="Year" type="number" value={year} onChange={(e) => setYear(e.target.value)} />
            <Input label="Pages" type="number" value={pages} onChange={(e) => setPages(e.target.value)} />
            <Input label="Copies" type="number" value={physicalCopies} onChange={(e) => setPhysicalCopies(e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input type="checkbox" id="digital-copy" checked={hasDigital} onChange={(e) => setHasDigital(e.target.checked)} />
            <label htmlFor="digital-copy" style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>Digital e-Book copy available</label>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog 
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDestructive={confirmDialog.isDestructive}
      />
    </div>
  );
};
