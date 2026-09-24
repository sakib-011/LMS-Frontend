import React, { useState, useEffect, useMemo } from 'react';
import { Button, Badge, ConfirmationDialog, Modal } from '../../components/ui';
import { FineStorageService, FineRecord } from '../../utils/fineStorageService';
import { InventoryStorageService } from '../../utils/inventoryStorageService';
import './Admin.css';

const DEFAULT_STUDENTS = [
  { id: 'STU-2024-1440', name: 'Sakib Shourov', email: 'sakib-shourov@gmail.com' },
  { id: 'STD-102', name: 'Alex Johnson', email: 'alex.j@university.edu' },
  { id: 'STD-103', name: 'Jane Smith', email: 'jane@university.edu' },
  { id: 'STD-104', name: 'Michael Brown', email: 'michael.b@university.edu' }
];

export const AdminFines: React.FC = () => {
  const [fines, setFines] = useState<FineRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('Unpaid');
  const [notification, setNotification] = useState<string | null>(null);

  // Modals state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const [selectedFine, setSelectedFine] = useState<FineRecord | null>(null);
  const [receiptRecord, setReceiptRecord] = useState<FineRecord | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash at Desk');

  // Issue New Fine Form State
  const [issueStudent, setIssueStudent] = useState(DEFAULT_STUDENTS[0]);
  const [issueReason, setIssueReason] = useState('Late Return');
  const [issueAmount, setIssueAmount] = useState('2.50');
  const [bookSearch, setBookSearch] = useState('');
  const [selectedBookTitle, setSelectedBookTitle] = useState('');
  const [isBookDropdownOpen, setIsBookDropdownOpen] = useState(false);
  const [issueNotes, setIssueNotes] = useState('');

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action?: () => void;
    isDestructive?: boolean;
  }>({ isOpen: false, title: '', message: '' });

  // Load fines on mount
  const refreshFines = () => {
    const list = FineStorageService.getFines();
    setFines(list);
    setLoading(false);
  };

  useEffect(() => {
    refreshFines();
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Available books for issue dropdown
  const catalogBooks = useMemo(() => {
    return InventoryStorageService.getGroupedInventory();
  }, []);

  const filteredBooks = useMemo(() => {
    if (!bookSearch.trim()) return catalogBooks;
    const q = bookSearch.toLowerCase();
    return catalogBooks.filter(b => b.bookTitle.toLowerCase().includes(q) || b.isbn.toLowerCase().includes(q));
  }, [catalogBooks, bookSearch]);

  // Filtered fines list for table
  const filteredFines = useMemo(() => {
    return fines.filter(item => {
      const q = search.toLowerCase().trim();
      const matchesSearch = !q || 
        (item.studentName || '').toLowerCase().includes(q) || 
        (item.id || '').toLowerCase().includes(q) ||
        (item.studentId || '').toLowerCase().includes(q) ||
        (item.bookTitle || '').toLowerCase().includes(q) ||
        (item.reason || '').toLowerCase().includes(q);

      const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [fines, search, filterStatus]);

  // Dynamic Statistics
  const totalUnpaid = useMemo(() => {
    return fines.filter(f => f.status === 'Unpaid').reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [fines]);

  const totalPaid = useMemo(() => {
    return fines.filter(f => f.status === 'Paid').reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [fines]);

  const blockedUsersCount = useMemo(() => {
    const unpaidStudents = new Set(fines.filter(f => f.status === 'Unpaid').map(f => f.studentId));
    return unpaidStudents.size;
  }, [fines]);

  // Issue New Fine Handler
  const handleIssueSubmit = () => {
    const parsed = parseFloat(issueAmount);
    const amt = isNaN(parsed) || parsed <= 0 ? 2.50 : parsed;

    const newFine = FineStorageService.addFine({
      studentId: issueStudent.id,
      studentName: issueStudent.name,
      studentEmail: issueStudent.email,
      bookTitle: selectedBookTitle || bookSearch || 'Library Resource',
      reason: issueReason,
      amount: amt,
      status: 'Unpaid',
      notes: issueNotes
    });

    refreshFines();
    setIsIssueModalOpen(false);
    // Reset Form
    setSelectedBookTitle('');
    setBookSearch('');
    setIssueNotes('');
    setIssueAmount('2.50');
    showNotification(`Successfully issued $${amt.toFixed(2)} fine to ${issueStudent.name} (${newFine.id})!`);
  };

  // Process Fine Payment Handler
  const handleConfirmPayment = () => {
    if (!selectedFine) return;
    FineStorageService.updateFineStatus(selectedFine.id, 'Paid', paymentMethod);
    refreshFines();
    setIsPaymentModalOpen(false);
    showNotification(`Payment of $${selectedFine.amount.toFixed(2)} processed for ${selectedFine.studentName}! Balance cleared.`);
    setSelectedFine(null);
  };

  // Waive Fine Handler
  const handleWaiveFine = (item: FineRecord) => {
    FineStorageService.updateFineStatus(item.id, 'Waived');
    refreshFines();
    showNotification(`Fine ${item.id} of $${item.amount.toFixed(2)} for ${item.studentName} has been waived!`);
  };

  return (
    <div>
      {/* Notification Toast */}
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
          <h1 className="admin-title">Fines & Penalties</h1>
          <p className="admin-subtitle">Manage late fees, damage charges, process payments, and issue fine ledger entries.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <div className="admin-search">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search Student, Fine ID, Book, Reason..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ 
              padding: '0 16px', borderRadius: 'var(--radius-full)', 
              border: '1px solid var(--border-color)', outline: 'none', 
              background: 'var(--bg-white)', color: 'var(--text-primary)', fontWeight: 600
            }}
          >
            <option value="All">All Fines</option>
            <option value="Unpaid">Unpaid Only</option>
            <option value="Paid">Paid</option>
            <option value="Waived">Waived</option>
          </select>
          <Button variant="primary" onClick={() => setIsIssueModalOpen(true)}>
            <i className="fas fa-file-invoice" style={{ marginRight: '8px' }}></i> Issue New Fine
          </Button>
        </div>
      </div>

      {/* Dynamic Summary Stat Cards */}
      <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'var(--bg-pale-peach)', color: 'var(--status-error)' }}>
            <i className="fas fa-hand-holding-usd"></i>
          </div>
          <div className="admin-stat-content">
            <h3>Total Unpaid Fines</h3>
            <p>${totalUnpaid.toFixed(2)}</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#E6F0E8', color: 'var(--status-success)' }}>
            <i className="fas fa-money-check-alt"></i>
          </div>
          <div className="admin-stat-content">
            <h3>Payments Received (MTD)</h3>
            <p>${totalPaid.toFixed(2)}</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
            <i className="fas fa-users-slash"></i>
          </div>
          <div className="admin-stat-content">
            <h3>Students With Fines</h3>
            <p>{blockedUsersCount} Student(s)</p>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Fine ID</th>
                <th>User Account</th>
                <th>Reason / Related Book</th>
                <th>Amount</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFines.map(item => (
                <tr key={item.id} style={{ opacity: item.status !== 'Unpaid' ? 0.75 : 1 }}>
                  <td>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.8125rem', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                      {(item.id || '').toUpperCase()}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Issued: {item.issueDate || ''}
                    </p>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <div style={{ 
                        width: '30px', height: '30px', borderRadius: '50%', 
                        background: 'var(--brand-primary, #1e1b4b)', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 700
                      }}>
                        {(item.studentName || 'S').substring(0,1).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {item.studentName}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          ID: <strong>{item.studentId}</strong> | {item.studentEmail}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {item.reason}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--bg-warm-orange)' }}>
                      <i className="fas fa-book" style={{ marginRight: 4 }}></i> {item.bookTitle || 'Library Material'}
                    </p>
                  </td>
                  <td>
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: item.status === 'Unpaid' ? 'var(--status-error)' : 'var(--text-primary)' }}>
                      ${(item.amount || 0).toFixed(2)}
                    </p>
                  </td>
                  <td>
                    <Badge variant={
                      item.status === 'Paid' ? 'success' : 
                      item.status === 'Waived' ? 'secondary' : 
                      'error'
                    }>
                      {item.status || 'Unpaid'}
                    </Badge>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                      
                      {item.status === 'Unpaid' ? (
                        <>
                          <Button size="sm" variant="outline" title="Process Payment" onClick={() => { setSelectedFine(item); setIsPaymentModalOpen(true); }}>
                            <i className="fas fa-credit-card" style={{ color: 'var(--status-success)', marginRight: 4 }}></i> Pay
                          </Button>
                          <Button size="sm" variant="outline" title="Waive Fine" onClick={() => setConfirmDialog({
                            isOpen: true, 
                            title: 'Waive Fine Balance', 
                            message: `Are you sure you want to waive the $${item.amount.toFixed(2)} fine for ${item.studentName}? This will clear the balance completely.`,
                            action: () => handleWaiveFine(item)
                          })}>
                            <i className="fas fa-eraser" style={{ color: 'var(--status-warning)' }}></i> Waive
                          </Button>
                          <Button size="sm" variant="outline" title="Send Invoice Reminder" onClick={() => setConfirmDialog({
                            isOpen: true, 
                            title: 'Send Invoice Reminder', 
                            message: `Send automated fine reminder email to ${item.studentName} (${item.studentEmail})?`,
                            action: () => showNotification(`Reminder email dispatched to ${item.studentEmail}!`)
                          })}>
                            <i className="fas fa-envelope"></i>
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" variant="outline" title="View Official Receipt" onClick={() => { setReceiptRecord(item); setIsReceiptModalOpen(true); }}>
                          <i className="fas fa-receipt" style={{ marginRight: 4 }}></i> Receipt
                        </Button>
                      )}
                      
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredFines.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: 'var(--space-8) 0', color: 'var(--text-secondary)' }}>
              <i className="fas fa-file-invoice-dollar" style={{ fontSize: '2rem', marginBottom: 'var(--space-4)', opacity: 0.5 }}></i>
              <p>No fines found matching your filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Processing Modal */}
      <Modal 
        isOpen={isPaymentModalOpen} 
        onClose={() => { setIsPaymentModalOpen(false); setSelectedFine(null); }}
        title="Process Fine Payment"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => { setIsPaymentModalOpen(false); setSelectedFine(null); }}>Cancel</Button>
            <Button variant="primary" onClick={handleConfirmPayment}>
              <i className="fas fa-check-circle" style={{ marginRight: 6 }}></i> Confirm & Clear Balance
            </Button>
          </div>
        }
      >
        {selectedFine && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'var(--bg-pale-peach)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
               <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--status-error)', fontWeight: 600 }}>Amount Due</p>
               <p style={{ margin: '4px 0 0 0', fontSize: '2.5rem', fontWeight: 800, color: 'var(--status-error)' }}>
                 ${selectedFine.amount.toFixed(2)}
               </p>
            </div>

            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                {selectedFine.studentName} <span style={{ fontWeight: 400, color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>({selectedFine.studentId})</span>
              </p>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                Reason: <strong>{selectedFine.reason}</strong> ({selectedFine.bookTitle})
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Payment Method
              </label>
              <select 
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white', fontWeight: 500 }}
              >
                <option value="Cash at Desk">Cash at Desk</option>
                <option value="Credit Card (POS Terminal)">Credit Card (POS Terminal)</option>
                <option value="Online Student Portal">Online Student Portal</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <input type="checkbox" id="emailReceipt" defaultChecked />
              <label htmlFor="emailReceipt" style={{ fontSize: '0.875rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
                Send confirmation email & official digital receipt to student
              </label>
            </div>
          </div>
        )}
      </Modal>

      {/* Issue New Fine Modal */}
      <Modal 
        isOpen={isIssueModalOpen} 
        onClose={() => setIsIssueModalOpen(false)}
        title="Issue New Fine / Manual Penalty"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setIsIssueModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleIssueSubmit}>
              <i className="fas fa-file-invoice" style={{ marginRight: 6 }}></i> Submit Fine
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              User Account
            </label>
            <select 
              value={issueStudent.id}
              onChange={(e) => {
                const found = DEFAULT_STUDENTS.find(s => s.id === e.target.value);
                if (found) setIssueStudent(found);
              }}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white' }}
            >
              {DEFAULT_STUDENTS.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.id} - {s.email})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Reason
              </label>
              <select 
                value={issueReason}
                onChange={(e) => setIssueReason(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white' }}
              >
                <option value="Late Return Overdue Fee">Late Return Overdue Fee</option>
                <option value="Damaged Book Cover / Spine Fee">Damaged Material Fee</option>
                <option value="Lost Item Replacement Charge">Lost Item Replacement Charge</option>
                <option value="Other Manual Charge">Other / Manual Charge</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Amount ($ USD)
              </label>
              <input 
                type="number" 
                min="0" 
                step="0.50" 
                placeholder="2.50"
                value={issueAmount}
                onChange={(e) => setIssueAmount(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', outline: 'none' }} 
              />
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Related Book (Optional)
            </label>
            <div style={{ position: 'relative' }}>
              <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}></i>
              <input 
                type="text" 
                placeholder={selectedBookTitle || "Type to search catalog books..."}
                value={bookSearch}
                onChange={(e) => {
                  setBookSearch(e.target.value);
                  setSelectedBookTitle('');
                  setIsBookDropdownOpen(true);
                }}
                onFocus={() => setIsBookDropdownOpen(true)}
                style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', outline: 'none' }}
              />
            </div>
            
            {isBookDropdownOpen && (
              <div style={{ 
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 10,
                background: 'white', border: '1px solid var(--border-color)', 
                borderRadius: 'var(--radius-md)', marginTop: '4px', maxHeight: '160px', 
                overflowY: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
              }}>
                <div 
                  style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}
                  onClick={() => { setSelectedBookTitle('N/A'); setBookSearch(''); setIsBookDropdownOpen(false); }}
                >
                  <em>None / Not Applicable</em>
                </div>
                {filteredBooks.map((b) => (
                  <div 
                    key={b.bookId}
                    style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }}
                    onClick={() => {
                      setSelectedBookTitle(b.bookTitle);
                      setBookSearch(b.bookTitle);
                      setIsBookDropdownOpen(false);
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-pale-peach)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{b.bookTitle}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ISBN: {b.isbn} · {b.author}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Internal Notes</label>
            <textarea 
              rows={3}
              placeholder="Add details about damage or reason for charge..."
              value={issueNotes}
              onChange={(e) => setIssueNotes(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>
        </div>
      </Modal>

      {/* Official Fine Receipt Modal */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => { setIsReceiptModalOpen(false); setReceiptRecord(null); }}
        title="Official Payment Receipt"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setIsReceiptModalOpen(false)}>Close</Button>
            <Button variant="primary" onClick={() => window.print()}>
              <i className="fas fa-print" style={{ marginRight: 6 }}></i> Print Receipt
            </Button>
          </div>
        }
      >
        {receiptRecord && (
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ 
              border: '2px solid var(--brand-primary, #1e1b4b)', borderRadius: '12px', padding: '24px', 
              background: '#ffffff', display: 'inline-block', maxWidth: '380px', width: '100%', textAlign: 'left'
            }}>
              <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--brand-primary, #1e1b4b)' }}>BOOKGRID LIBRARY</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Official Fine Transaction Receipt</p>
              </div>

              <p style={{ fontSize: '0.8125rem', margin: '0 0 6px 0' }}><strong>Fine ID:</strong> {receiptRecord.id}</p>
              <p style={{ fontSize: '0.8125rem', margin: '0 0 6px 0' }}><strong>Reason:</strong> {receiptRecord.reason}</p>
              <p style={{ fontSize: '0.8125rem', margin: '0 0 6px 0' }}><strong>Book Title:</strong> {receiptRecord.bookTitle || 'N/A'}</p>
              
              <div style={{ borderTop: '1px dashed var(--border-color)', borderBottom: '1px dashed var(--border-color)', padding: '8px 0', margin: '12px 0' }}>
                <p style={{ fontSize: '0.8125rem', margin: '0 0 4px 0' }}><strong>Student Name:</strong> {receiptRecord.studentName}</p>
                <p style={{ fontSize: '0.8125rem', margin: '0 0 4px 0' }}><strong>Student ID:</strong> {receiptRecord.studentId}</p>
                <p style={{ fontSize: '0.8125rem', margin: 0 }}><strong>Email:</strong> {receiptRecord.studentEmail}</p>
              </div>

              <p style={{ fontSize: '0.8125rem', margin: '0 0 4px 0' }}><strong>Issue Date:</strong> {receiptRecord.issueDate}</p>
              <p style={{ fontSize: '0.8125rem', margin: '0 0 4px 0' }}><strong>Status:</strong> <span style={{ fontWeight: 700, color: receiptRecord.status === 'Paid' ? '#10b981' : '#6b7280' }}>{receiptRecord.status}</span></p>
              {receiptRecord.paymentMethod && (
                <p style={{ fontSize: '0.8125rem', margin: '0 0 12px 0' }}><strong>Payment Method:</strong> {receiptRecord.paymentMethod}</p>
              )}

              <div style={{ background: 'var(--bg-pale-peach)', padding: '10px', borderRadius: '6px', textAlign: 'center', fontWeight: 800, fontSize: '1rem', color: 'var(--brand-primary, #1e1b4b)' }}>
                Amount Paid: ${receiptRecord.amount ? receiptRecord.amount.toFixed(2) : '0.00'}
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
