import React, { useState, useEffect, useMemo } from 'react';
import { Button, Badge, Modal, Input, ConfirmationDialog } from '../../components/ui';
import { BookService, Book } from '../../services/bookService';
import { InventoryStorageService, InventoryCopy, GroupedBookInventory } from '../../utils/inventoryStorageService';
import './Admin.css';

export const AdminInventory: React.FC = () => {
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

      // Refresh currently open selectedGroup if open
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

    // Sync physical copies count with book record
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

      <div className="admin-header">
        <div>
          <h1 className="admin-title">Physical Inventory</h1>
          <p className="admin-subtitle">Track physical copies, barcode tags, shelf locations, and catalog status per book.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <div className="admin-search">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search Book Title, ISBN, Barcode, Shelf..." 
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
            <option value="Available">Has Available Copies</option>
            <option value="Checked Out">Has Checked Out Copies</option>
            <option value="Maintenance">Has Maintenance Copies</option>
            <option value="Lost">Has Lost Copies</option>
          </select>
          <Button onClick={() => { resetAddForm(); setIsAddModalOpen(true); }}>
            <i className="fas fa-plus" style={{ marginRight: '8px' }}></i> Add Copy
          </Button>
        </div>
      </div>

      {/* Main Grouped Inventory Table (1 Row per Book) */}
      <div className="admin-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
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
                  {/* Book Title & ISBN */}
                  <td>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                        {group.bookTitle}
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        by {group.author} {group.isbn && `| ISBN: ${group.isbn}`}
                      </p>
                      {group.pdfUrl && (
                        <span style={{ display: 'inline-block', marginTop: '4px', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.1)', color: '#2563eb', fontWeight: 600 }}>
                          <i className="fas fa-file-pdf" style={{ marginRight: 4 }}></i> Online e-Book Available
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Physical Copies Count */}
                  <td>
                    <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                      {group.totalCopies} Copies Total
                    </span>
                    <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {group.availableCopies} Available · {group.checkedOutCopies} Issued
                    </p>
                  </td>

                  {/* Location */}
                  <td>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                      <i className="fas fa-layer-group" style={{ marginRight: 6, color: 'var(--bg-warm-orange)' }}></i>
                      {group.shelf}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {group.rack}
                    </p>
                  </td>

                  {/* Barcode List Quick View */}
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
                      <i className="fas fa-barcode" style={{ marginRight: 6, color: 'var(--bg-warm-orange)' }}></i>
                      View {group.copies.length} Barcodes
                    </Button>
                  </td>

                  {/* Availability Badge */}
                  <td>
                    <Badge variant={group.availableCopies > 0 ? 'success' : 'error'}>
                      {group.availableCopies > 0 ? `${group.availableCopies} Available` : 'All Copies Issued'}
                    </Badge>
                  </td>

                  {/* Actions */}
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
                        title="Manage Barcodes & Copies" 
                        onClick={() => {
                          setSelectedGroup(group);
                          setIsManageBarcodesModalOpen(true);
                        }}
                      >
                        <i className="fas fa-list-ol"></i> Barcodes
                      </Button>

                      <Button 
                        size="sm" 
                        variant="outline" 
                        title="Edit Shelf Location" 
                        onClick={() => {
                          setSelectedGroup(group);
                          setEditShelf(group.shelf);
                          setEditRack(group.rack);
                          setIsEditBookModalOpen(true);
                        }}
                      >
                        <i className="fas fa-edit"></i> Edit Location
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredGroupedInventory.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: 'var(--space-8) 0', color: 'var(--text-secondary)' }}>
              <i className="fas fa-boxes" style={{ fontSize: '2rem', marginBottom: 'var(--space-4)', opacity: 0.5 }}></i>
              <p>No inventory items found matching your filter criteria.</p>
            </div>
          )}
        </div>
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
              <i className="fas fa-plus" style={{ marginRight: 6 }}></i> Add Another Copy for this Book
            </Button>
            <Button variant="primary" onClick={() => setIsManageBarcodesModalOpen(false)}>Done</Button>
          </div>
        }
      >
        {selectedGroup && (
          <div>
            <div style={{ padding: '12px', background: 'var(--bg-pale-peach)', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 2px 0', fontSize: '0.9375rem', fontWeight: 700 }}>{selectedGroup.bookTitle}</h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Location: <strong>{selectedGroup.shelf}</strong> ({selectedGroup.rack}) | Total Copies: <strong>{selectedGroup.copies.length}</strong>
                </p>
              </div>
              <Badge variant="success">{selectedGroup.availableCopies} Available</Badge>
            </div>

            <table className="admin-table" style={{ width: '100%', fontSize: '0.8125rem' }}>
              <thead>
                <tr>
                  <th>Copy Barcode</th>
                  <th>Rack Position</th>
                  <th>Condition</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedGroup.copies.map(copy => (
                  <tr key={copy.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--bg-warm-orange)' }}>
                        <i className="fas fa-barcode" style={{ marginRight: 4 }}></i> {copy.barcode}
                      </span>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        ID: {copy.id}
                      </p>
                    </td>
                    <td>{copy.rack}</td>
                    <td>
                      <span style={{ 
                        fontWeight: 600, 
                        color: copy.condition === 'Damaged' || copy.condition === 'Fair' ? '#ef4444' : '#10b981' 
                      }}>
                        {copy.condition}
                      </span>
                    </td>
                    <td>
                      <Badge variant={
                        copy.status === 'Available' ? 'success' : 
                        copy.status === 'Checked Out' ? 'primary' : 
                        'error'
                      } size="sm">{copy.status}</Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <Button size="sm" variant="outline" title="Print this Barcode Tag" onClick={() => {
                          setSelectedCopyForPrint(copy);
                          setIsPrintModalOpen(true);
                        }}>
                          <i className="fas fa-print"></i>
                        </Button>
                        <Button size="sm" variant="outline" title="Edit Copy Barcode/Status" onClick={() => {
                          setEditingCopy(copy);
                          setIsEditCopyModalOpen(true);
                        }}>
                          <i className="fas fa-edit"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      {/* MODAL 2: Add Physical Copy with Searchable Book Combobox */}
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)}
        title="Add Physical Copy to Library Inventory"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddCopySubmit}>
              <i className="fas fa-plus-circle" style={{ marginRight: 6 }}></i> Add Copy Now
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Searchable Book Combobox */}
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Search & Select Book <span style={{ color: '#ef4444' }}>*</span>
            </label>
            
            <input 
              type="text" 
              placeholder="🔍 Type to search book by title, author, or ISBN..."
              value={bookSearchQuery}
              onChange={(e) => setBookSearchQuery(e.target.value)}
              style={{ 
                width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', 
                borderRadius: 'var(--radius-md)', fontSize: '0.875rem', outline: 'none', marginBottom: '8px'
              }}
            />

            <div style={{ 
              maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border-color)', 
              borderRadius: 'var(--radius-md)', background: 'white' 
            }}>
              {filteredBooksForCombobox.length === 0 ? (
                <div style={{ padding: '12px', fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                  No matching books found.
                </div>
              ) : (
                filteredBooksForCombobox.map(b => {
                  const existingGroup = groupedInventory.find(g => g.bookId === b.id);
                  const isInInventory = existingGroup && existingGroup.copies.length > 0;

                  return (
                    <div 
                      key={b.id}
                      onClick={() => {
                        setSelectedBookId(b.id);
                        setBookSearchQuery(b.title);
                        if (existingGroup) {
                          setShelfInput(existingGroup.shelf);
                        } else if (b.physicalStacks) {
                          setShelfInput(`Stack ${b.physicalStacks.replace(/^Stack\s+/i, '')}`);
                        }
                      }}
                      style={{
                        padding: '10px 12px',
                        cursor: 'pointer',
                        background: selectedBookId === b.id ? 'var(--bg-pale-peach)' : 'transparent',
                        borderBottom: '1px solid var(--bg-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                            {b.title}
                          </span>
                          {isInInventory ? (
                            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontWeight: 700 }}>
                              <i className="fas fa-check-circle" style={{ marginRight: 3 }}></i> Already in Inventory ({existingGroup.copies.length} Copies)
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(249, 115, 22, 0.1)', color: '#f97316', fontWeight: 700 }}>
                              + New to Inventory
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                          by {b.author} | ISBN: {b.isbn} {isInInventory && `| Location: ${existingGroup.shelf}`}
                        </span>
                      </div>
                      {selectedBookId === b.id && (
                        <i className="fas fa-check-circle" style={{ color: 'var(--bg-warm-orange)', fontSize: '1.1rem' }}></i>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input 
              label="Number of Copies to Add" 
              type="number" 
              min="1"
              value={numCopiesToAdd} 
              onChange={(e) => setNumCopiesToAdd(parseInt(e.target.value, 10) || 1)} 
            />
            
            <Input 
              label="Barcode Tag (Auto-Generated if blank)" 
              placeholder="e.g. BC-978-0-13-235089-1" 
              value={barcodeInput} 
              onChange={(e) => setBarcodeInput(e.target.value)} 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input 
              label="Stack Location" 
              placeholder="e.g. Stack 2A" 
              value={shelfInput} 
              onChange={(e) => setShelfInput(e.target.value)} 
            />
            <Input 
              label="Rack Position" 
              placeholder="e.g. Rack R1" 
              value={rackInput} 
              onChange={(e) => setRackInput(e.target.value)} 
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Condition
            </label>
            <select 
              value={conditionInput} 
              onChange={(e) => setConditionInput(e.target.value as any)}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white' }}
            >
              <option value="New">New</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Damaged">Damaged</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* MODAL 3: Edit Book Inventory Location */}
      <Modal
        isOpen={isEditBookModalOpen}
        onClose={() => { setIsEditBookModalOpen(false); setSelectedGroup(null); }}
        title={`Edit Location for "${selectedGroup?.bookTitle || 'Book'}"`}
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setIsEditBookModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveBookLocation}>
              <i className="fas fa-save" style={{ marginRight: 6 }}></i> Save Location
            </Button>
          </div>
        }
      >
        {selectedGroup && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input label="Book Title" value={selectedGroup.bookTitle} readOnly />
            <Input 
              label="Stack Location" 
              value={editShelf} 
              onChange={(e) => setEditShelf(e.target.value)} 
              placeholder="e.g. Stack 2A"
            />
            <Input 
              label="Rack Range Summary" 
              value={editRack} 
              onChange={(e) => setEditRack(e.target.value)} 
              placeholder="e.g. Racks R1 - R8"
            />
          </div>
        )}
      </Modal>

      {/* MODAL 4: Edit Single Barcode Copy */}
      <Modal
        isOpen={isEditCopyModalOpen}
        onClose={() => { setIsEditCopyModalOpen(false); setEditingCopy(null); }}
        title="Edit Barcode Copy Information"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setIsEditCopyModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveCopyEdit}>Save Copy Info</Button>
          </div>
        }
      >
        {editingCopy && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input label="Copy ID" value={editingCopy.id} readOnly />
            <Input 
              label="Barcode Tag" 
              value={editingCopy.barcode} 
              onChange={(e) => setEditingCopy({ ...editingCopy, barcode: e.target.value })}
            />
            <Input 
              label="Stack Location" 
              value={editingCopy.shelf} 
              onChange={(e) => setEditingCopy({ ...editingCopy, shelf: e.target.value })}
            />
            <Input 
              label="Rack Position" 
              value={editingCopy.rack} 
              onChange={(e) => setEditingCopy({ ...editingCopy, rack: e.target.value })}
            />
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Condition</label>
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
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Status Override</label>
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
        )}
      </Modal>

      {/* MODAL 5: Printable Barcode Tag */}
      <Modal
        isOpen={isPrintModalOpen}
        onClose={() => { setIsPrintModalOpen(false); setSelectedCopyForPrint(null); }}
        title="Print Library Physical Barcode Tag"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setIsPrintModalOpen(false)}>Close</Button>
            <Button variant="primary" onClick={() => window.print()}>
              <i className="fas fa-print" style={{ marginRight: 6 }}></i> Print Barcode Label
            </Button>
          </div>
        }
      >
        {selectedCopyForPrint && (
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ 
              border: '2px dashed var(--bg-warm-orange)', borderRadius: '12px', padding: '24px', 
              background: '#fdfcfa', display: 'inline-block', maxWidth: '360px', width: '100%' 
            }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                BOOKGRID LIBRARY SYSTEM
              </h3>
              <p style={{ margin: '0 0 12px 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--bg-warm-orange)' }}>
                {selectedCopyForPrint.bookTitle || selectedCopyForPrint.resolvedTitle || 'Book'}
              </p>

              {/* Barcode Graphic Lines */}
              <div style={{ 
                height: '60px', background: '#000', margin: '12px auto', width: '80%', 
                backgroundImage: 'repeating-linear-gradient(90deg, #000 0px, #000 3px, #fff 3px, #fff 5px, #000 5px, #000 9px, #fff 9px, #fff 11px)' 
              }}></div>

              <p style={{ margin: '4px 0 12px 0', fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '2px' }}>
                {selectedCopyForPrint.barcode}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.75rem', borderTop: '1px solid var(--bg-border)', paddingTop: '8px' }}>
                <span><strong>Loc:</strong> {selectedCopyForPrint.shelf} ({selectedCopyForPrint.rack})</span>
                <span><strong>Copy ID:</strong> {selectedCopyForPrint.id}</span>
              </div>
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
