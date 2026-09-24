import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Badge, Modal, Input, ConfirmationDialog } from '../../components/ui';
import { BookService, Book } from '../../services/bookService';
import { PdfStorageService, CachedPdfData } from '../../utils/pdfStorageService';
import './Admin.css';

export const AdminDigitalLibrary: React.FC = () => {
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewingItem, setPreviewingItem] = useState<any>(null);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [targetBookId, setTargetBookId] = useState('');
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [accessStatus, setAccessStatus] = useState('active');
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean; 
    title: string; 
    message: string; 
    isDestructive?: boolean;
    action?: () => void;
  }>({ isOpen: false, title: '', message: '' });

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

  const handleOpenUploadModalForBook = (bookId?: string) => {
    setTargetBookId(bookId || '');
    setSelectedPdfFile(null);
    setStatusMessage(null);
    setIsUploadModalOpen(true);
  };

  const handlePdfFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.pdf'))) {
      if (file.size > 50 * 1024 * 1024) {
        setSelectedPdfFile(null);
        setStatusMessage("⚠️ PDF file size exceeds 50 MB limit.");
        return;
      }
      setSelectedPdfFile(file);
      setStatusMessage(null);
    } else {
      setSelectedPdfFile(null);
      setStatusMessage("⚠️ Please select a valid PDF file (.pdf).");
    }
  };

  const handleUploadPdfSubmit = async () => {
    if (!targetBookId) {
      setStatusMessage("⚠️ Please select a catalog book to attach the PDF file to.");
      return;
    }

    if (!selectedPdfFile) {
      setStatusMessage("⚠️ Please select a PDF file to upload.");
      return;
    }

    try {
      setUploading(true);
      setStatusMessage("Uploading e-Book PDF & storing in cloud storage and local cache...");

      const { pdfUrl } = await PdfStorageService.uploadAndCachePdf(selectedPdfFile, targetBookId);

      // Save pdfUrl in Spring Boot -> PostgreSQL database & set hasDigital = true
      await BookService.updateBookPdf(targetBookId, pdfUrl);


      const matchedTarget = books.find(b => b.id === targetBookId);
      setToastMessage(`✓ e-Book PDF uploaded and attached to "${matchedTarget ? matchedTarget.title : 'Book'}" successfully!`);

      setStatusMessage("✓ PDF uploaded and digital book catalog updated successfully!");
      setTimeout(() => {
        setIsUploadModalOpen(false);
        setTargetBookId('');
        setSelectedPdfFile(null);
        setStatusMessage(null);
        setUploading(false);
        fetchBooks();
      }, 1000);

    } catch (err: any) {
      console.error("Failed to upload PDF:", err);
      setStatusMessage("❌ Failed to upload PDF file. Please try again.");
      setUploading(false);
    }
  };

  const handleOpenPdfPreview = async (item: any) => {
    let pdfUrl = item.pdfDataUrl;
    if (!pdfUrl || pdfUrl.includes('v1700000000')) {
      const indexedPdf = await PdfStorageService.getFromIndexedDb(item.id);
      if (indexedPdf) pdfUrl = indexedPdf;
    }
    setPreviewingItem({
      ...item,
      pdfDataUrl: pdfUrl && !pdfUrl.includes('v1700000000') ? pdfUrl : null
    });
    setIsPreviewModalOpen(true);
  };

  // Build digital asset list for all catalog books
  const digitalAssets = books.map((book, index) => {
    const catalogItem = PdfStorageService.getDigitalCatalogItem(book.id);
    const cachedData = PdfStorageService.getCachedPdf(book.id);
    
    const cleanDbUrl = book.pdfUrl && !book.pdfUrl.includes('v1700000000') ? book.pdfUrl : null;
    const cleanCatalogUrl = catalogItem?.pdfUrl && !catalogItem.pdfUrl.includes('v1700000000') ? catalogItem.pdfUrl : null;
    const cleanCachedUrl = cachedData?.pdfDataUrl && !cachedData.pdfDataUrl.includes('v1700000000') ? cachedData.pdfDataUrl : null;

    const resolvedPdfUrl = cleanCachedUrl || cleanCatalogUrl || cleanDbUrl;
    const hasPdf = Boolean(book.hasDigital || resolvedPdfUrl);
    
    return {
      ...book,
      hasPdf,
      pdfDataUrl: resolvedPdfUrl,
      format: hasPdf ? 'PDF' : 'No Digital File',
      fileSize: catalogItem ? catalogItem.fileSizeMB : cachedData ? cachedData.fileSizeMB : hasPdf ? '5.2 MB' : 'N/A',
      downloads: (index + 1) * 7 + 12,
      uploadDate: '2026-09-24',
      status: hasPdf ? 'Active' : 'Pending Upload'
    };
  });


  const filteredAssets = digitalAssets.filter(item => {
    return (item.title || '').toLowerCase().includes(search.toLowerCase()) || 
           (item.author || '').toLowerCase().includes(search.toLowerCase());
  });

  const targetBookObj = books.find(b => b.id === targetBookId);

  return (
    <div>
      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
          background: 'var(--text-primary, #1C201D)', color: 'white',
          padding: '12px 20px', borderRadius: 'var(--radius-md)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)', fontSize: '0.875rem',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <span>{toastMessage}</span>
          <button 
            onClick={() => setToastMessage(null)}
            style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: 0 }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      <div className="admin-header">
        <div>
          <h1 className="admin-title">Digital Library Management</h1>
          <p className="admin-subtitle">Upload e-book PDFs for any book, manage digital access, and monitor student reading assets.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <div className="admin-search">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search by Title or Author..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => handleOpenUploadModalForBook()}>
            <i className="fas fa-cloud-upload-alt" style={{ marginRight: '8px' }}></i> Upload e-Book PDF
          </Button>
        </div>
      </div>

      <div className="admin-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Book Details</th>
                <th>File Format & Size</th>
                <th>Engagement</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions for Every Book</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map(item => (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} style={{ width: '40px', height: '56px', borderRadius: '4px', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ 
                          width: '40px', height: '56px', 
                          borderRadius: '4px', 
                          background: item.coverColor || '#1e1b4b',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontSize: '0.75rem', fontWeight: 'bold'
                        }}>
                          {item.title.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{item.title}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.author} · ISBN: {item.isbn}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: item.hasPdf ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      <i className="fas fa-file-pdf" style={{ color: item.hasPdf ? '#e74c3c' : '#bdc3c7', marginRight: '6px' }}></i>
                      {item.format}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.fileSize}</p>
                  </td>
                  <td>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      <i className="fas fa-book-open" style={{ marginRight: '6px', color: 'var(--text-secondary)' }}></i>
                      {item.hasPdf ? `${item.downloads} total reads` : '0 reads'}
                    </p>
                  </td>
                  <td>
                    <Badge variant={item.hasPdf ? 'success' : 'neutral'}>{item.status}</Badge>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      
                      {/* 1. Upload / Replace PDF Button for EVERY BOOK */}
                      <Button 
                        size="sm" 
                        variant="primary" 
                        title="Upload or Replace e-Book PDF" 
                        onClick={() => handleOpenUploadModalForBook(item.id)}
                      >
                        <i className="fas fa-file-upload" style={{ marginRight: 6 }}></i> Upload PDF
                      </Button>

                      {/* 2. Read / Preview PDF Button */}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        title="Preview Reader" 
                        onClick={() => handleOpenPdfPreview(item)}
                      >
                        <i className="fas fa-eye" style={{ marginRight: 6 }}></i> Read PDF
                      </Button>

                      {/* 3. Edit Metadata */}
                      <Button size="sm" variant="outline" title="Edit Metadata" onClick={() => { setEditingItem(item); setIsEditModalOpen(true); }}>
                        <i className="fas fa-edit"></i>
                      </Button>

                      {/* 4. Delete File */}
                      {item.hasPdf && (
                        <Button size="sm" variant="outline" title="Remove PDF" onClick={() => setConfirmDialog({
                          isOpen: true, 
                          title: 'Remove Digital File', 
                          message: `Remove the digital PDF file for "${item.title}"? Physical copies will remain unchanged.`, 
                          isDestructive: true,
                          action: async () => {
                            await BookService.updateBook(item.id, { hasDigital: false, pdfUrl: '' });
                            setToastMessage(`Removed PDF for "${item.title}".`);
                            fetchBooks();
                          }
                        })}>
                          <i className="fas fa-trash-alt" style={{ color: 'var(--status-error)' }}></i>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-8) 0', color: 'var(--text-secondary)' }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}></i>
              <p>Loading digital library catalog records...</p>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-8) 0', color: 'var(--text-secondary)' }}>
              <i className="fas fa-laptop-code" style={{ fontSize: '2rem', marginBottom: 'var(--space-4)', opacity: 0.5 }}></i>
              <p>No catalog books found.</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Upload e-Book Modal */}
      <Modal 
        isOpen={isUploadModalOpen} 
        onClose={() => { if (!uploading) setIsUploadModalOpen(false); }}
        title={targetBookObj ? `Upload e-Book PDF for "${targetBookObj.title}"` : "Upload Digital e-Book PDF"}
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setIsUploadModalOpen(false)} disabled={uploading}>Cancel</Button>
            <Button variant="primary" onClick={handleUploadPdfSubmit} disabled={uploading || !selectedPdfFile}>
              {uploading ? (
                <>
                  <i className="fas fa-spinner fa-spin" style={{ marginRight: 6 }}></i> Uploading...
                </>
              ) : (
                'Upload PDF File'
              )}
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {statusMessage && (
            <div style={{ 
              padding: '10px 14px', borderRadius: '6px', fontSize: '0.875rem',
              background: statusMessage.startsWith('✓') ? '#dcfce7' : statusMessage.startsWith('❌') || statusMessage.startsWith('⚠️') ? '#fee2e2' : '#e0f2fe',
              color: statusMessage.startsWith('✓') ? '#166534' : statusMessage.startsWith('❌') || statusMessage.startsWith('⚠️') ? '#991b1b' : '#075985',
              border: `1px solid ${statusMessage.startsWith('✓') ? '#86efac' : statusMessage.startsWith('❌') || statusMessage.startsWith('⚠️') ? '#fca5a5' : '#7dd3fc'}`
            }}>
              {statusMessage}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>Select Target Book Record *</label>
            <select 
              value={targetBookId}
              onChange={(e) => setTargetBookId(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white' }}
            >
              <option value="">Select catalog book to attach PDF file to...</option>
              {books.map(b => (
                <option key={b.id} value={b.id}>{b.title} (Author: {b.author}) {b.hasDigital ? '✓ Has PDF' : ''}</option>
              ))}
            </select>
          </div>
          
          <div style={{ 
            border: '2px dashed var(--border-color)', 
            borderRadius: 'var(--radius-md)', 
            padding: '20px', 
            textAlign: 'center',
            background: 'var(--bg-secondary)'
          }}>
            <i className="fas fa-file-pdf" style={{ fontSize: '2.5rem', color: '#e74c3c', marginBottom: '8px' }}></i>
            <p style={{ margin: '0 0 6px 0', fontWeight: 600, color: 'var(--text-primary)' }}>Select e-Book PDF File (.pdf - Max 50 MB)</p>
            <input 
              type="file" 
              accept="application/pdf" 
              onChange={handlePdfFileSelect}
              style={{ display: 'block', margin: '0 auto', padding: '6px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white' }}
            />
            {selectedPdfFile && (
              <div style={{ marginTop: 12, fontSize: '0.875rem', color: 'var(--status-success)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <i className="fas fa-check-circle"></i>
                <span>Ready: <strong>{selectedPdfFile.name}</strong> ({(selectedPdfFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>Access Setting</label>
            <select 
              value={accessStatus}
              onChange={(e) => setAccessStatus(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white' }}
            >
              <option value="active">Active (Available for Student Digital Reading)</option>
              <option value="disabled">Disabled (Archival only)</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* PDF Reader Preview Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => { setIsPreviewModalOpen(false); setPreviewingItem(null); }}
        title={`PDF Reader Preview: ${previewingItem?.title || 'Book'}`}
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Format: {previewingItem?.format} · Size: {previewingItem?.fileSize}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="outline" onClick={() => { setIsPreviewModalOpen(false); setPreviewingItem(null); }}>Close</Button>
              <Button variant="primary" onClick={() => navigate(`/reader/${previewingItem?.id}`)}>
                <i className="fas fa-expand" style={{ marginRight: 6 }}></i> Open Fullscreen Reader
              </Button>
            </div>
          </div>
        }
      >
        {previewingItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>{previewingItem.title}</h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Author: {previewingItem.author} · ISBN: {previewingItem.isbn}</p>
              </div>
              <Badge variant={previewingItem.hasPdf ? "success" : "neutral"}>
                {previewingItem.hasPdf ? "✓ PDF Available" : "Pending Upload"}
              </Badge>
            </div>

            {previewingItem.pdfDataUrl ? (
              <iframe 
                src={previewingItem.pdfDataUrl} 
                title={previewingItem.title}
                style={{ width: '100%', height: '500px', border: '1px solid var(--border-color)', borderRadius: '8px' }}
              />
            ) : (
              <div style={{ padding: '32px 16px', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                <i className="fas fa-file-pdf" style={{ fontSize: '3rem', color: '#e74c3c', marginBottom: '12px' }}></i>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem' }}>e-Book Digital Content Reader</h4>
                <p style={{ margin: '0 0 16px 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  {previewingItem.hasPdf ? 'PDF file is cached and ready in digital library.' : 'No PDF document currently attached to this catalog book.'}
                </p>
                {!previewingItem.hasPdf && (
                  <Button size="sm" variant="primary" onClick={() => { setIsPreviewModalOpen(false); handleOpenUploadModalForBook(previewingItem.id); }}>
                    <i className="fas fa-upload" style={{ marginRight: 6 }}></i> Upload PDF Now
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Edit Digital Asset Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => { setIsEditModalOpen(false); setEditingItem(null); }}
        title="Edit Digital Metadata"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => { setIsEditModalOpen(false); setEditingItem(null); }}>Cancel</Button>
            <Button variant="primary" onClick={() => { setIsEditModalOpen(false); setEditingItem(null); }}>Save Changes</Button>
          </div>
        }
      >
        {editingItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input label="Book Title" defaultValue={editingItem.title} readOnly />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input label="Format" defaultValue={editingItem.format} readOnly />
              <Input label="File Size" defaultValue={editingItem.fileSize} readOnly />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Status</label>
              <select defaultValue={editingItem.status} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white' }}>
                <option value="Active">Active</option>
                <option value="Disabled">Disabled</option>
              </select>
            </div>
          </div>
        )}
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
