import React, { useState, useEffect } from 'react';
import { Button, Badge, Modal, Input, ConfirmationDialog } from '../../components/ui';
import { BookService, Book } from '../../services/bookService';
import { validateImage } from '../../utils/imageValidation';
import { uploadImageToCloudinary } from '../../utils/cloudinaryService';
import { PdfStorageService } from '../../utils/pdfStorageService';
import '../Admin/Admin.css';
import './Moderator.css';

type ProcessState = 'idle' | 'validating' | 'saving-book' | 'uploading-image' | 'uploading-pdf' | 'updating-image-url' | 'success' | 'error';

export const ModBooks: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, title: string, message: string, isDestructive?: boolean, action?: () => void}>({ isOpen: false, title: '', message: '' });

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
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
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

    const result = await validateImage(file);
    if (!result.valid) {
      setValidationError(result.error);
      setSelectedFile(null);
      setImagePreview(null);
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
  };

  // Handle PDF File Selection
  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setValidationError(null);

    if (!file) {
      setSelectedPdfFile(null);
      return;
    }

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setValidationError('Selected file must be a valid PDF format (.pdf).');
      setSelectedPdfFile(null);
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setValidationError('PDF file size exceeds 50 MB limit.');
      setSelectedPdfFile(null);
      return;
    }

    setSelectedPdfFile(file);
  };

  // STEP-BY-STEP EXECUTION FLOW
  const handleCreateBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !author) {
      setValidationError('Title and Author are required fields.');
      return;
    }

    if (selectedFile) {
      setProcessState('validating');
      setStatusMessage('Validating cover image format and content...');
      const check = await validateImage(selectedFile);
      if (!check.valid) {
        setValidationError(check.error);
        setProcessState('error');
        return;
      }
    }

    try {
      // STEP 1: Save Book Information to Spring Boot -> Database
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
        imageUrl: undefined,
      };

      const saveResponse = await BookService.createBook(bookPayload);
      const newBookId = saveResponse.data.id;
      setSavedBookId(newBookId);

      // STEP 2: Process PDF file if attached and hasDigital is enabled
      if (hasDigital && selectedPdfFile) {
        setProcessState('uploading-pdf');
        setStatusMessage('Uploading e-Book PDF & storing in cloud storage and local cache...');
        
        const { pdfUrl } = await PdfStorageService.uploadAndCachePdf(selectedPdfFile, newBookId);

        // Update database with clean PDF URL
        await BookService.updateBookPdf(newBookId, pdfUrl);
      }

      // STEP 3: Upload Image to Cloudinary if selected
      if (selectedFile) {
        setProcessState('uploading-image');
        setStatusMessage('Uploading cover image to Cloudinary...');

        const cloudinaryRes = await uploadImageToCloudinary(selectedFile, newBookId);

        setProcessState('updating-image-url');
        setStatusMessage('Updating book cover image URL in database...');

        await BookService.updateBookImage(
          newBookId,
          cloudinaryRes.secure_url,
          cloudinaryRes.public_id
        );
      }

      setProcessState('success');
      setStatusMessage('✓ Book record and digital files uploaded & saved successfully!');
      resetForm();

    } catch (err: any) {
      console.error('Book creation error:', err);
      if (savedBookId) {
        setProcessState('error');
        setStatusMessage('Book saved in database, but file processing encountered an issue.');
      } else {
        setProcessState('error');
        setValidationError(err.response?.data?.message || err.message || 'Database save failed.');
      }
    }
  };

  const handleRetryImageUpload = async () => {
    if (!savedBookId || !selectedFile) return;

    try {
      setProcessState('uploading-image');
      setStatusMessage('Retrying image upload...');

      const cloudinaryRes = await uploadImageToCloudinary(selectedFile, savedBookId);

      setProcessState('updating-image-url');
      setStatusMessage('Updating image URL in database...');

      await BookService.updateBookImage(
        savedBookId,
        cloudinaryRes.secure_url,
        cloudinaryRes.public_id
      );

      setProcessState('success');
      setStatusMessage('✓ Cover image uploaded successfully!');
      resetForm();
    } catch (err: any) {
      setProcessState('error');
      setStatusMessage('Image upload retry failed. Please try again.');
    }
  };

  const handleDeleteBook = async (bookId: string, bookTitle: string) => {
    try {
      await BookService.deleteBook(bookId);
      fetchBooks();
    } catch (err) {
      console.error("Failed to delete book:", err);
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
      setSelectedPdfFile(null);
      setImagePreview(null);
      setValidationError(null);
      setSavedBookId(null);
      setIsAddModalOpen(false);
      setProcessState('idle');
      setStatusMessage(null);
      setHasDigital(false);
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
      <div className="mod-card-header">
        <div>
          <h1 className="mod-card-title">Book Catalog Management</h1>
          <p style={{ color: 'var(--bg-secondary-text)', fontSize: '0.875rem' }}>Manage library books, editions, and metadata in database.</p>
        </div>
        <Button variant="primary" icon="fas fa-plus" onClick={() => { setIsAddModalOpen(true); setProcessState('idle'); setValidationError(null); }}>
          Add New Book
        </Button>
      </div>

      <div className="mod-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: 320, flex: 1, minWidth: 240 }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: 12, top: 12, color: 'var(--bg-secondary-text)' }}></i>
            <input 
              type="text" 
              placeholder="Search title, author, or ISBN..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-md)', outline: 'none' }}
            />
          </div>
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ padding: '0 16px', height: '42px', borderRadius: 'var(--radius-md)', border: '1px solid var(--bg-border)', outline: 'none', background: 'white', color: 'var(--text-primary)', fontSize: '0.875rem' }}
          >
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <p style={{ color: 'var(--bg-secondary-text)', padding: '20px 0' }}>Loading catalog books...</p>
        ) : filteredBooks.length === 0 ? (
          <p style={{ color: 'var(--bg-secondary-text)', padding: '20px 0' }}>No books found matching criteria.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="mod-table">
              <thead>
                <tr>
                  <th>Cover</th>
                  <th>Book Details</th>
                  <th>ISBN</th>
                  <th>Category</th>
                  <th>Availability</th>
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
                          style={{ width: '36px', height: '52px', borderRadius: '4px', objectFit: 'cover' }} 
                        />
                      ) : (
                        <div style={{ 
                          width: '36px', height: '52px', 
                          borderRadius: '4px', 
                          background: book.coverColor || '#2D3748',
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
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--bg-secondary-text)' }}>{book.author} · {book.year} ({book.edition || '1st Ed.'})</p>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.875rem' }}>{book.isbn}</td>
                    <td><Badge variant="neutral" size="sm">{book.category}</Badge></td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ fontSize: '0.75rem' }}>{book.physicalAvailable ?? book.physicalCopies ?? 1} / {book.physicalCopies ?? 5} Available</span>
                      </div>
                    </td>
                    <td>
                      <Badge variant={book.hasDigital ? 'success' : 'neutral'} size="sm">
                        {book.hasDigital ? 'Digital + Physical' : 'Physical Only'}
                      </Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          style={{ color: 'var(--danger-color)' }} 
                          title="Delete Book"
                          onClick={() => setConfirmDialog({ 
                            isOpen: true, 
                            title: 'Delete Book', 
                            message: `Are you sure you want to delete "${book.title}" from catalog?`, 
                            isDestructive: true,
                            action: () => handleDeleteBook(book.id, book.title)
                          })}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Book Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => { if (processState === 'idle' || processState === 'error') setIsAddModalOpen(false); }}
        title="Add New Book to Catalog"
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
            <input 
              type="checkbox" 
              id="digital-copy-mod" 
              checked={hasDigital} 
              onChange={(e) => setHasDigital(e.target.checked)} 
            />
            <label htmlFor="digital-copy-mod" style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>
              Digital e-Book copy available
            </label>
          </div>

          {/* Dynamic PDF Upload Box when Digital e-Book is checked */}
          {hasDigital && (
            <div style={{ 
              padding: '14px', 
              background: 'var(--bg-pale-green, rgba(82,122,90,0.08))', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--status-success, #527A5A)', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '10px' 
            }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                <i className="fas fa-file-pdf" style={{ color: '#e74c3c', marginRight: '6px' }}></i> Upload e-Book PDF File (.pdf - Max 50 MB)
              </label>
              <input 
                type="file" 
                accept="application/pdf" 
                onChange={handlePdfSelect}
                disabled={processState !== 'idle' && processState !== 'error'}
                style={{ width: '100%', padding: '8px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white' }}
              />
              {selectedPdfFile ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: 'var(--status-success)', fontWeight: 600 }}>
                  <i className="fas fa-check-circle"></i>
                  <span><strong>{selectedPdfFile.name}</strong> ({(selectedPdfFile.size / (1024 * 1024)).toFixed(2)} MB) — Ready to save & cache</span>
                </div>
              ) : (
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Select the e-book PDF file to attach to this book record for digital reading.
                </p>
              )}
            </div>
          )}
        </form>
      </Modal>

      <ConfirmationDialog 
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={() => {
          if (confirmDialog.action) confirmDialog.action();
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDestructive={confirmDialog.isDestructive}
      />
    </div>
  );
};
