import React, { useState, useEffect, useMemo } from 'react';
import { Button, Badge, Modal, Input, ConfirmationDialog } from '../../components/ui';
import { BookService, Book } from '../../services/bookService';
import { InventoryStorageService, InventoryCopy, GroupedBookInventory } from '../../utils/inventoryStorageService';
import '../Admin/Admin.css';
import './Moderator.css';

export const ModInventory: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [groupedInventory, setGroupedInventory] = useState<GroupedBookInventory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditBookModalOpen, setIsEditBookModalOpen] = useState(false);
  const [isManageBarcodesModalOpen, setIsManageBarcodesModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const [selectedGroup, setSelectedGroup] = useState<GroupedBookInventory | null>(null);
  const [selectedCopyForPrint, setSelectedCopyForPrint] = useState<InventoryCopy | null>(null);
  const [editingCopy, setEditingCopy] = useState<InventoryCopy | null>(null);
  const [isEditCopyModalOpen, setIsEditCopyModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Form states for adding copies
  const [bookSearchQuery, setBookSearchQuery] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [numCopiesToAdd, setNumCopiesToAdd] = useState(1);
  const [shelfInput, setShelfInput] = useState('Stack 1A');
  const [rackInput, setRackInput] = useState('Rack R1');
  const [conditionInput, setConditionInput] = useState<'New' | 'Excellent' | 'Good' | 'Fair' | 'Damaged'>('New');

  // Form states for editing book inventory location
  const [editShelf, setEditShelf] = useState('');
  const [editRack, setEditRack] = useState('');

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action?: () => void;
    isDestructive?: boolean;
  }>({ isOpen: false, title: '', message: '' });

  // Load books and grouped physical inventory
  const loadData = async () => {
    setLoading(true);
    try {
      const booksData = await BookService.getBooks();
      const booksArray = Array.isArray(booksData) ? booksData : [];
      setBooks(booksArray);

      const grouped = InventoryStorageService.getGroupedInventory(booksArray);
      setGroupedInventory(grouped);

      if (selectedGroup) {
        const updatedGroup = grouped.find(g => g.bookId === selectedGroup.bookId);
        if (updatedGroup) setSelectedGroup(updatedGroup);
      }
    } catch (e) {
      console.error("Error loading inventory:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Filtered Grouped Inventory list (Each book appears ONCE)
  const filteredGroupedInventory = useMemo(() => {
    return groupedInventory.filter(group => {
      const term = search.toLowerCase();
      const matchesSearch = group.bookTitle.toLowerCase().includes(term) ||
                            group.author.toLowerCase().includes(term) ||
                            group.isbn.toLowerCase().includes(term) ||
                            group.shelf.toLowerCase().includes(term) ||
                            group.copies.some(c => c.barcode.toLowerCase().includes(term) || c.id.toLowerCase().includes(term));
      
      let matchesStatus = true;
      if (filterStatus === 'Available') matchesStatus = group.availableCopies > 0;
      else if (filterStatus === 'Checked Out') matchesStatus = group.checkedOutCopies > 0;
      else if (filterStatus === 'Maintenance') matchesStatus = group.maintenanceCopies > 0;
      else if (filterStatus === 'Lost') matchesStatus = group.lostCopies > 0;

      return matchesSearch && matchesStatus;
    });
  }, [groupedInventory, search, filterStatus]);

  // Filtered books for search combobox inside Add Copy modal
  const filteredBooksForCombobox = useMemo(() => {
    if (!bookSearchQuery.trim()) return books;
    const q = bookSearchQuery.toLowerCase();
    return books.filter(b => 
      b.title.toLowerCase().includes(q) || 
      b.isbn.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q)
    );
  }, [books, bookSearchQuery]);

  // Handle Add Physical Copies Submit
  const handleAddCopySubmit = () => {
    if (!selectedBookId) {
      alert("Please search and select a book first.");
      return;
    }

    const linkedBook = books.find(b => b.id === selectedBookId);
    const count = Math.max(1, numCopiesToAdd);

    for (let i = 0; i < count; i++) {
      const customBarcode = count === 1 && barcodeInput.trim() ? barcodeInput.trim() : '';
      InventoryStorageService.addCopy({
        bookId: selectedBookId,
        bookTitle: linkedBook?.title || 'Book',
        barcode: customBarcode,
        shelf: shelfInput.trim() || 'Stack 1A',
        rack: `Rack R${i + 1}`,
        condition: conditionInput,
        status: 'Available'
      }, books);
    }

    if (linkedBook) {
      const updatedTotal = (linkedBook.physicalCopies || 0) + count;
      const updatedAvail = (linkedBook.physicalAvailable || 0) + count;
      BookService.updateBook(linkedBook.id, {
        physicalCopies: updatedTotal,
        physicalAvailable: updatedAvail
      }).catch(() => {});
    }

    setIsAddModalOpen(false);
    resetAddForm();
    loadData();
    showNotification(`Added ${count} new physical copy(ies) to ${linkedBook?.title || 'Book'}!`);
  };

  const resetAddForm = () => {
    setSelectedBookId('');
    setBookSearchQuery('');
    setBarcodeInput('');
    setNumCopiesToAdd(1);
    setShelfInput('Stack 1A');
    setRackInput('Rack R1');
    setConditionInput('New');
  };

  // Handle Save Book Inventory Location Edit
  const handleSaveBookLocation = () => {
    if (!selectedGroup) return;

    InventoryStorageService.updateBookInventoryLocation(
      selectedGroup.bookId,
      editShelf || selectedGroup.shelf,
      editRack || selectedGroup.rack,
      books
    );

    setIsEditBookModalOpen(false);
    loadData();
    showNotification(`Updated shelf location for "${selectedGroup.bookTitle}"!`);
  };

  // Save Single Copy Edit
  const handleSaveCopyEdit = () => {
    if (!editingCopy) return;

    InventoryStorageService.updateCopy(editingCopy.id, {
      barcode: editingCopy.barcode,
      shelf: editingCopy.shelf,
      rack: editingCopy.rack,
      condition: editingCopy.condition,
      status: editingCopy.status
    }, books);

    setIsEditCopyModalOpen(false);
    setEditingCopy(null);
    loadData();
    showNotification(`Updated barcode copy ${editingCopy.barcode}!`);
  };

  return (
    <div>
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: '#10b981', color: 'white', padding: '12px 20px',
          borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600
        }}>
          <i className="fas fa-check-circle"></i> {notification}
        </div>
      )}

      <div className="mod-card-header">
        <div>
          <h1 className="mod-card-title">Physical Inventory Tracking</h1>
          <p style={{ color: 'var(--bg-secondary-text)', fontSize: '0.875rem' }}>Track physical copy counts, barcodes, and shelf locations in database.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button variant="primary" icon="fas fa-barcode" onClick={() => { resetAddForm(); setIsAddModalOpen(true); }}>
            Scan / Add New Copy
          </Button>
        </div>
      </div>

      <div className="mod-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: 340, flex: 1, minWidth: 240 }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: 12, top: 12, color: 'var(--bg-secondary-text)' }}></i>
            <input 
              type="text" 
              placeholder="Search Title, ISBN, Barcode, Shelf..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-md)', outline: 'none' }}
            />
          </div>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '0 16px', height: '42px', borderRadius: 'var(--radius-md)', border: '1px solid var(--bg-border)', outline: 'none', background: 'white', color: 'var(--text-primary)', fontSize: '0.875rem' }}
          >
            <option value="All">All Statuses</option>
            <option value="Available">Has Available Copies</option>
            <option value="Checked Out">Has Checked Out Copies</option>
            <option value="Maintenance">Has Maintenance Copies</option>
            <option value="Lost">Has Lost Copies</option>
          </select>
        </div>

        {loading ? (
          <p style={{ color: 'var(--bg-secondary-text)', padding: '20px 0' }}>Loading inventory items...</p>
        ) : filteredGroupedInventory.length === 0 ? (
          <p style={{ color: 'var(--bg-secondary-text)', padding: '20px 0' }}>No physical inventory items found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="mod-table">
              <thead>
                <tr>
                  <th>Book Title & ISBN</th>
                  <th>Physical Copies</th>
                  <th>Library Location</th>
                  <th>Barcode Summary</th>
                  <th>Availability</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroupedInventory.map(group => (
                  <tr key={group.bookId}>
                    <td>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                          {group.bookTitle}
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--bg-secondary-text)' }}>
                          by {group.author} {group.isbn && `| ISBN: ${group.isbn}`}
                        </p>
                        {group.pdfUrl && (
                          <span style={{ display: 'inline-block', marginTop: '4px', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', fontWeight: 600 }}>
                            <i className="fas fa-file-pdf" style={{ marginRight: 4 }}></i> Online e-Book Available
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                        {group.totalCopies} Copies Total
                      </span>
                      <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--bg-secondary-text)' }}>
                        {group.availableCopies} Available · {group.checkedOutCopies} Issued
                      </p>
                    </td>

                    <td>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                        <i className="fas fa-layer-group" style={{ marginRight: 6, color: 'var(--bg-accent-orange, #d97706)' }}></i>
                        {group.shelf}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--bg-secondary-text)' }}>
                        {group.rack}
                      </p>
                    </td>

                    <td>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedGroup(group);
                          setIsManageBarcodesModalOpen(true);
                        }}
                        style={{ fontSize: '0.8125rem' }}
                      >
                        <i className="fas fa-barcode" style={{ marginRight: 6 }}></i>
                        View {group.copies.length} Barcodes
                      </Button>
                    </td>

                    <td>
                      <Badge variant={group.availableCopies > 0 ? 'success' : 'error'} size="sm">
                        {group.availableCopies > 0 ? `${group.availableCopies} Available` : 'All Copies Issued'}
                      </Badge>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          title="Print Barcode Labels" 
                          onClick={() => {
                            if (group.copies.length > 0) {
                              setSelectedCopyForPrint(group.copies[0]);
                            } else {
                              setSelectedCopyForPrint({
                                id: `${group.bookId}_copy_1`,
                                barcode: `BC-${group.isbn || group.bookId}-1`,
                                bookId: group.bookId,
                                bookTitle: group.bookTitle,
                                shelf: group.shelf,
                                rack: group.rack,
                                condition: 'New',
                                status: 'Available',
                                createdAt: new Date().toISOString()
                              });
                            }
                            setIsPrintModalOpen(true);
                          }}
                        >
                          <i className="fas fa-print"></i> Print
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          title="Edit Location" 
                          onClick={() => {
                            setSelectedGroup(group);
                            setEditShelf(group.shelf);
                            setEditRack(group.rack);
                            setIsEditBookModalOpen(true);
                          }}
                        >
                          <i className="fas fa-edit"></i> Edit
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

      {/* MODAL 1: Manage Individual Copies & Barcodes for Selected Book */}
      <Modal
        isOpen={isManageBarcodesModalOpen}
        onClose={() => { setIsManageBarcodesModalOpen(false); setSelectedGroup(null); }}
        title={`Physical Barcodes for "${selectedGroup?.bookTitle || 'Book'}"`}
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'space-between', width: '100%' }}>
            <Button variant="outline" onClick={() => {
              if (selectedGroup) {
                setSelectedBookId(selectedGroup.bookId);
                setBookSearchQuery(selectedGroup.bookTitle);
                setShelfInput(selectedGroup.shelf);
                setIsManageBarcodesModalOpen(false);
                setIsAddModalOpen(true);
              }
            }}>
              <i className="fas fa-plus" style={{ marginRight: 6 }}></i> Add Another Copy
            </Button>
            <Button variant="primary" onClick={() => setIsManageBarcodesModalOpen(false)}>Done</Button>
          </div>
        }
      >
        <div>
          <div style={{ marginBottom: '16px', padding: '12px', background: 'var(--bg-slate, #f8fafc)', borderRadius: '6px', fontSize: '0.875rem' }}>
            <p style={{ margin: 0, fontWeight: 600 }}>{selectedGroup?.bookTitle}</p>
            <p style={{ margin: '4px 0 0', color: 'var(--bg-secondary-text)', fontSize: '0.75rem' }}>
              ISBN: {selectedGroup?.isbn} · Stacks Location: <strong>{selectedGroup?.shelf} ({selectedGroup?.rack})</strong>
            </p>
          </div>

          <table className="mod-table" style={{ fontSize: '0.8125rem' }}>
            <thead>
              <tr>
                <th>Barcode Tag</th>
                <th>Rack / Shelf</th>
                <th>Condition</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {selectedGroup?.copies.map((copy) => (
                <tr key={copy.id}>
                  <td>
                    <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, fontFamily: 'monospace' }}>
                      {copy.barcode}
                    </code>
                  </td>
                  <td>{copy.rack || selectedGroup.rack}</td>
                  <td>
                    <Badge variant={copy.condition === 'New' || copy.condition === 'Excellent' ? 'success' : copy.condition === 'Damaged' ? 'error' : 'neutral'} size="sm">
                      {copy.condition}
                    </Badge>
                  </td>
                  <td>
                    <Badge variant={copy.status === 'Available' ? 'success' : copy.status === 'Checked Out' ? 'warning' : 'error'} size="sm">
                      {copy.status}
                    </Badge>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                      <Button size="sm" variant="outline" onClick={() => {
                        setSelectedCopyForPrint(copy);
                        setIsPrintModalOpen(true);
                      }} title="Print Tag">
                        <i className="fas fa-print"></i>
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => {
                        setEditingCopy({ ...copy });
                        setIsEditCopyModalOpen(true);
                      }} title="Edit Copy">
                        <i className="fas fa-edit"></i>
                      </Button>
                      <Button size="sm" variant="outline" style={{ color: 'var(--danger-color)' }} onClick={() => {
                        setConfirmDialog({
                          isOpen: true,
                          title: 'Remove Copy',
                          message: `Remove copy barcode "${copy.barcode}" from library inventory?`,
                          isDestructive: true,
                          action: () => {
                            InventoryStorageService.deleteCopy(copy.id, books);
                            loadData();
                            showNotification(`Removed copy ${copy.barcode}`);
                          }
                        });
                      }} title="Delete Copy">
                        <i className="fas fa-trash"></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      {/* MODAL 2: Add New Physical Copy Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); resetAddForm(); }}
        title="Scan or Register New Physical Copies"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddCopySubmit}>Save & Generate Barcodes</Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Select Book Title *
            </label>
            <input 
              type="text" 
              placeholder="Type to filter books by title or ISBN..." 
              value={bookSearchQuery}
              onChange={(e) => {
                setBookSearchQuery(e.target.value);
                setSelectedBookId('');
              }}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', outline: 'none' }}
            />
            {bookSearchQuery && (
              <div style={{ maxHeight: '140px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', marginTop: '4px', background: 'white' }}>
                {filteredBooksForCombobox.map(b => (
                  <div 
                    key={b.id} 
                    onClick={() => {
                      setSelectedBookId(b.id);
                      setBookSearchQuery(`${b.title} (ISBN: ${b.isbn})`);
                    }}
                    style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', background: selectedBookId === b.id ? '#e0f2fe' : 'transparent' }}
                  >
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>{b.title}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>by {b.author} · ISBN: {b.isbn}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input 
              label="Barcode (Optional / Scanned Barcode)" 
              placeholder="e.g. BC-9780132350884-1" 
              value={barcodeInput} 
              onChange={(e) => setBarcodeInput(e.target.value)} 
            />
            <Input 
              label="Number of Copies to Add" 
              type="number" 
              value={numCopiesToAdd.toString()} 
              onChange={(e) => setNumCopiesToAdd(parseInt(e.target.value, 10) || 1)} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input 
              label="Stacks / Shelf Location *" 
              placeholder="e.g. Stack 3C" 
              value={shelfInput} 
              onChange={(e) => setShelfInput(e.target.value)} 
              required
            />
            <Input 
              label="Rack Position" 
              placeholder="e.g. Rack R2" 
              value={rackInput} 
              onChange={(e) => setRackInput(e.target.value)} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Copy Initial Condition
            </label>
            <select 
              value={conditionInput} 
              onChange={(e) => setConditionInput(e.target.value as any)}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white' }}
            >
              <option value="New">Brand New</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair / Worn</option>
              <option value="Damaged">Damaged</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* MODAL 3: Edit Book Shelf Location */}
      <Modal
        isOpen={isEditBookModalOpen}
        onClose={() => setIsEditBookModalOpen(false)}
        title={`Edit Stacks Location: "${selectedGroup?.bookTitle}"`}
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setIsEditBookModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveBookLocation}>Save Location</Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input 
            label="Stacks / Shelf Location" 
            value={editShelf} 
            onChange={(e) => setEditShelf(e.target.value)} 
            placeholder="e.g. Stack 4B"
          />
          <Input 
            label="Rack Position" 
            value={editRack} 
            onChange={(e) => setEditRack(e.target.value)} 
            placeholder="e.g. Rack R1"
          />
        </div>
      </Modal>

      {/* MODAL 4: Edit Single Copy Barcode / Condition / Status */}
      <Modal
        isOpen={isEditCopyModalOpen}
        onClose={() => setIsEditCopyModalOpen(false)}
        title="Edit Copy Barcode & Details"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setIsEditCopyModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveCopyEdit}>Save Copy Details</Button>
          </div>
        }
      >
        {editingCopy && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input 
              label="Barcode Tag" 
              value={editingCopy.barcode} 
              onChange={(e) => setEditingCopy({ ...editingCopy, barcode: e.target.value })} 
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Input 
                label="Shelf Location" 
                value={editingCopy.shelf} 
                onChange={(e) => setEditingCopy({ ...editingCopy, shelf: e.target.value })} 
              />
              <Input 
                label="Rack Position" 
                value={editingCopy.rack} 
                onChange={(e) => setEditingCopy({ ...editingCopy, rack: e.target.value })} 
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '4px' }}>Condition</label>
                <select 
                  value={editingCopy.condition} 
                  onChange={(e) => setEditingCopy({ ...editingCopy, condition: e.target.value as any })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white' }}
                >
                  <option value="New">New</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Damaged">Damaged</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '4px' }}>Status</label>
                <select 
                  value={editingCopy.status} 
                  onChange={(e) => setEditingCopy({ ...editingCopy, status: e.target.value as any })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white' }}
                >
                  <option value="Available">Available</option>
                  <option value="Checked Out">Checked Out</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* MODAL 5: Printable Barcode Tag Preview & Print Dialog */}
      <Modal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Print Physical Barcode Label"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setIsPrintModalOpen(false)}>Close</Button>
            <Button variant="primary" onClick={() => window.print()}>
              <i className="fas fa-print" style={{ marginRight: 6 }}></i> Print Label
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', border: '2px dashed #cbd5e1', borderRadius: '12px', background: '#f8fafc' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem', color: '#1e293b' }}>BOOKGRID UNIVERSITY LIBRARY</h3>
          <p style={{ margin: '4px 0 12px', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>
            {selectedCopyForPrint?.bookTitle}
          </p>
          
          <div style={{ background: 'white', padding: '16px 24px', border: '1px solid #e2e8f0', borderRadius: '8px', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', fontFamily: 'monospace', letterSpacing: '4px', fontWeight: 900, color: '#0f172a' }}>
              ||| | |||| | ||| ||
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'monospace', color: '#0284c7', marginTop: '6px' }}>
              {selectedCopyForPrint?.barcode}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', marginTop: '14px', fontSize: '0.8125rem', color: '#64748b' }}>
            <span>Location: <strong>{selectedCopyForPrint?.shelf} ({selectedCopyForPrint?.rack})</strong></span>
            <span>Condition: <strong>{selectedCopyForPrint?.condition}</strong></span>
          </div>
        </div>
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
