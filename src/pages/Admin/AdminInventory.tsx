import React, { useState, useEffect } from 'react';
import { Button, Badge, Modal, Input, ConfirmationDialog } from '../../components/ui';
import { ModeratorService } from '../../services/moderatorService';
import { BookService, Book } from '../../services/bookService';
import './Admin.css';

export const AdminInventory: React.FC = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, title: string, message: string, isDestructive?: boolean}>({ isOpen: false, title: '', message: '' });

  useEffect(() => {
    Promise.all([ModeratorService.getInventory(), BookService.getBooks()])
      .then(([invData, booksData]) => {
        setInventory(Array.isArray(invData) ? invData : []);
        setBooks(Array.isArray(booksData) ? booksData : []);
      })
      .catch(() => {
        setInventory([]);
        setBooks([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Map inventory items to include book details
  const inventoryWithBooks = inventory.map(item => ({
    ...item,
    book: books.find(b => b.id === item.bookId) || item.book
  }));

  const filteredInventory = inventoryWithBooks.filter(item => {
    const matchesSearch = (item.id || '').toLowerCase().includes(search.toLowerCase()) || 
                          (item.barcode || '').includes(search) ||
                          (item.book?.title || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Physical Inventory</h1>
          <p className="admin-subtitle">Manage individual physical copies, barcodes, and shelf locations.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <div className="admin-search">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search ID, Barcode, Book Title..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '0 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-white)', color: 'var(--text-secondary)' }}
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Checked Out">Checked Out</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Lost">Lost</option>
          </select>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <i className="fas fa-plus" style={{ marginRight: '8px' }}></i> Add Copy
          </Button>
        </div>
      </div>

      <div className="admin-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Copy ID / Barcode</th>
                <th>Book Title</th>
                <th>Location</th>
                <th>Condition</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map(item => (
                <tr key={item.id}>
                  <td>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{item.id}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}><i className="fas fa-barcode"></i> {item.barcode}</p>
                    </div>
                  </td>
                  <td>
                    {item.book ? (
                       <p style={{ margin: 0, fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{item.book.title}</p>
                    ) : (
                      <span style={{ color: 'var(--status-error)' }}>Unknown Book</span>
                    )}
                  </td>
                  <td>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Shelf: {item.shelf}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Rack: {item.rack}</p>
                  </td>
                  <td>
                    <span style={{ 
                      fontSize: '0.875rem', 
                      color: item.condition === 'Excellent' || item.condition === 'Good' ? 'var(--status-success)' : 
                             item.condition === 'Fair' ? 'var(--status-warning)' : 'var(--status-error)' 
                    }}>
                      {item.condition}
                    </span>
                  </td>
                  <td>
                    <Badge variant={
                      item.status === 'Available' ? 'success' : 
                      item.status === 'Checked Out' ? 'primary' : 
                      'error'
                    }>{item.status}</Badge>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                      <Button size="sm" variant="outline" title="Print Barcode" onClick={() => setConfirmDialog({
                        isOpen: true, title: 'Print Barcode', message: `Send print job for Barcode ${item.barcode} to the label printer?`
                      })}>
                        <i className="fas fa-print"></i>
                      </Button>
                      <Button size="sm" variant="outline" title="Edit Item" onClick={() => { setEditingItem(item); setIsEditModalOpen(true); }}>
                        <i className="fas fa-edit"></i>
                      </Button>
                      {item.status === 'Available' && (
                        <Button size="sm" variant="outline" title="Mark for Maintenance" onClick={() => setConfirmDialog({
                          isOpen: true, title: 'Maintenance', message: `Move ${item.id} to maintenance for repairs?`
                        })}>
                          <i className="fas fa-tools"></i>
                        </Button>
                      )}
                      {item.status !== 'Lost' && (
                        <Button size="sm" variant="outline" title="Report Lost" onClick={() => setConfirmDialog({
                          isOpen: true, title: 'Report Lost', message: `Are you sure you want to mark ${item.id} as Lost? This will trigger a system review if checked out.`, isDestructive: true
                        })}>
                          <i className="fas fa-exclamation-triangle" style={{ color: 'var(--status-error)' }}></i>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredInventory.length === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--space-8) 0', color: 'var(--text-secondary)' }}>
              <i className="fas fa-boxes" style={{ fontSize: '2rem', marginBottom: 'var(--space-4)', opacity: 0.5 }}></i>
              <p>No inventory items found matching your filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Copy Modal */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title="Add Physical Copy"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setIsAddModalOpen(false)}>Add Copy</Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Select Book</label>
            <select style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white' }}>
              <option value="">Search and select a book...</option>
              {books.map(b => (
                <option key={b.id} value={b.id}>{b.title} ({b.isbn})</option>
              ))}
            </select>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Barcode Number" placeholder="Auto-generated if empty" />
            <Input label="Number of Copies" type="number" defaultValue="1" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Shelf" placeholder="e.g. 2A" />
            <Input label="Rack" placeholder="e.g. R1" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Initial Condition</label>
            <select style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white' }}>
              <option value="New">New</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* Edit Copy Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => { setIsEditModalOpen(false); setEditingItem(null); }}
        title="Edit Inventory Item"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => { setIsEditModalOpen(false); setEditingItem(null); }}>Cancel</Button>
            <Button variant="primary" onClick={() => { setIsEditModalOpen(false); setEditingItem(null); }}>Save Changes</Button>
          </div>
        }
      >
        {editingItem && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input label="Copy ID" defaultValue={editingItem.id} readOnly />
            <Input label="Book Title" defaultValue={editingItem.book?.title} readOnly />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input label="Barcode" defaultValue={editingItem.barcode} />
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Condition</label>
                <select defaultValue={editingItem.condition} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white' }}>
                  <option value="New">New</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input label="Shelf" defaultValue={editingItem.shelf} />
              <Input label="Rack" defaultValue={editingItem.rack} />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Status Override</label>
              <select defaultValue={editingItem.status} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white' }}>
                <option value="Available">Available</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Lost">Lost</option>
              </select>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Note: Cannot manually set status to "Checked Out". That requires an active transaction.</p>
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
