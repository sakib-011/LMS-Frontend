import React, { useState, useEffect } from 'react';
import { Button, Badge, Modal, Input, ConfirmationDialog } from '../../components/ui';
import { BookService, Book } from '../../services/bookService';
import './Admin.css';

export const AdminDigitalLibrary: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, title: string, message: string, isDestructive?: boolean}>({ isOpen: false, title: '', message: '' });

  useEffect(() => {
    BookService.getBooks()
      .then((data) => setBooks(data || []))
      .catch(() => setBooks([]))
      .finally(() => setLoading(false));
  }, []);

  const digitalAssets = books.filter(b => b.hasDigital).map((book, index) => ({
    ...book,
    format: index % 3 === 0 ? 'EPUB' : 'PDF',
    fileSize: '5.2 MB',
    downloads: 12,
    uploadDate: '2026-09-01',
    status: 'Active'
  }));

  const filteredAssets = digitalAssets.filter(item => {
    return (item.title || '').toLowerCase().includes(search.toLowerCase()) || 
           (item.author || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Digital Library Management</h1>
          <p className="admin-subtitle">Manage e-books, PDFs, and digital reading assets.</p>
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
          <Button onClick={() => setIsUploadModalOpen(true)}>
            <i className="fas fa-cloud-upload-alt" style={{ marginRight: '8px' }}></i> Upload e-Book
          </Button>
        </div>
      </div>

      <div className="admin-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Book Details</th>
                <th>File Info</th>
                <th>Engagement</th>
                <th>Upload Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map(item => (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <div style={{ 
                        width: '40px', height: '56px', 
                        borderRadius: '4px', 
                        background: item.coverColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '0.75rem', fontWeight: 'bold'
                      }}>
                        {item.title.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{item.title}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.author}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p style={{ margin: 0, fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      <i className={item.format === 'PDF' ? "fas fa-file-pdf" : "fas fa-file-alt"} style={{ color: item.format === 'PDF' ? '#e74c3c' : '#3498db', marginRight: '6px' }}></i>
                      {item.format}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.fileSize}</p>
                  </td>
                  <td>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      <i className="fas fa-cloud-download-alt" style={{ marginRight: '6px', color: 'var(--text-secondary)' }}></i>
                      {item.downloads} total reads
                    </p>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{item.uploadDate}</span>
                  </td>
                  <td>
                    <Badge variant={item.status === 'Active' ? 'success' : 'error'}>{item.status}</Badge>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                      <Button size="sm" variant="outline" title="Preview File" onClick={() => setConfirmDialog({
                        isOpen: true, title: 'Preview File', message: `Open ${item.format} preview reader for ${item.title}?`
                      })}>
                        <i className="fas fa-eye"></i>
                      </Button>
                      <Button size="sm" variant="outline" title="Edit Metadata" onClick={() => { setEditingItem(item); setIsEditModalOpen(true); }}>
                        <i className="fas fa-edit"></i>
                      </Button>
                      <Button size="sm" variant="outline" title="Delete File" onClick={() => setConfirmDialog({
                        isOpen: true, title: 'Delete Digital Asset', message: `Are you sure you want to permanently delete the digital file for ${item.title}? Physical copies will not be affected.`, isDestructive: true
                      })}>
                        <i className="fas fa-trash-alt" style={{ color: 'var(--status-error)' }}></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredAssets.length === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--space-8) 0', color: 'var(--text-secondary)' }}>
              <i className="fas fa-laptop-code" style={{ fontSize: '2rem', marginBottom: 'var(--space-4)', opacity: 0.5 }}></i>
              <p>No digital assets found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Upload e-Book Modal */}
      <Modal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Digital e-Book"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setIsUploadModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setIsUploadModalOpen(false)}>Upload File</Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Target Book Record</label>
            <select style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white' }}>
              <option value="">Select a book from catalog to attach file to...</option>
              {books.filter(b => !b.hasDigital).map(b => (
                <option key={b.id} value={b.id}>{b.title}</option>
              ))}
            </select>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Only showing books that do not currently have a digital copy attached.</p>
          </div>
          
          <div style={{ 
            border: '2px dashed var(--border-color)', 
            borderRadius: 'var(--radius-lg)', 
            padding: 'var(--space-8)', 
            textAlign: 'center',
            background: 'var(--bg-secondary)',
            cursor: 'pointer'
          }}>
            <i className="fas fa-cloud-upload-alt" style={{ fontSize: '2rem', color: 'var(--bg-warm-orange)', marginBottom: '8px' }}></i>
            <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: 'var(--text-primary)' }}>Drag & drop file here</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Supported formats: PDF, EPUB (Max 50MB)</p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Asset Access</label>
            <select style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white' }}>
              <option value="active">Active (Available to Students)</option>
              <option value="disabled">Disabled (Hidden / Archival only)</option>
            </select>
          </div>
        </div>
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
            
            <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '0.875rem', fontWeight: 600 }}>Replace File</p>
              <Button variant="outline" style={{ width: '100%' }}>
                <i className="fas fa-file-upload" style={{ marginRight: '8px' }}></i> Upload New Version
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmationDialog 
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={() => {
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDestructive={confirmDialog.isDestructive}
      />
    </div>
  );
};
