import React, { useState, useEffect, useMemo } from 'react';
import { Button, Badge, Modal, Input, ConfirmationDialog } from '../../components/ui';
import { ModeratorService } from '../../services/moderatorService';
import { FineStorageService } from '../../utils/fineStorageService';
import { BorrowingStorageService, BorrowingRecord } from '../../utils/borrowingStorageService';
import './Admin.css';

export const AdminReturns: React.FC = () => {
  const [borrowings, setBorrowings] = useState<BorrowingRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'returns' | 'active'>('returns');

  // Modal States
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [scanQuery, setScanQuery] = useState('');
  const [selectedBorrowingForReturn, setSelectedBorrowingForReturn] = useState<BorrowingRecord | null>(null);
  const [returnCondition, setReturnCondition] = useState<'Good' | 'Fair' | 'Damaged'>('Good');
  
  const [receiptRecord, setReceiptRecord] = useState<BorrowingRecord | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const [fineAssessmentRecord, setFineAssessmentRecord] = useState<BorrowingRecord | null>(null);
  const [isFineModalOpen, setIsFineModalOpen] = useState(false);
  const [fineInput, setFineInput] = useState('2.50');

  const [notification, setNotification] = useState<string | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action?: () => void;
    isDestructive?: boolean;
  }>({ isOpen: false, title: '', message: '' });

  const loadBorrowings = async () => {
    setLoading(true);
    try {
      const stored = BorrowingStorageService.getBorrowings();
      const apiData = await ModeratorService.getBorrowings().catch(() => []);
      if (Array.isArray(apiData) && apiData.length > 0) {
        const map = new Map<string, BorrowingRecord>();
        stored.forEach(b => map.set(b.id, b));
        apiData.forEach((item: any, idx: number) => {
          const id = item.id || `TXN-API-${idx + 1000}`;
          if (!map.has(id)) {
            map.set(id, {
              id,
              bookId: item.book?.id || item.bookId || `b${idx + 1}`,
              bookTitle: item.book?.title || item.bookTitle || 'Book Title',
              isbn: item.book?.isbn || item.isbn || 'N/A',
              barcode: item.barcode || `BC-${item.book?.isbn || item.bookId || 'BC'}-1`,
              studentId: item.user?.id || item.studentId || `STU-2024-${1440 + idx}`,
              studentName: item.user?.name || item.studentName || 'Student Name',
              studentEmail: item.user?.email || item.studentEmail || 'student@university.edu',
              borrowDate: item.borrowDate || '2026-09-10',
              dueDate: item.dueDate || '2026-09-25',
              returnDate: item.returnDate,
              status: item.returnDate ? 'RETURNED' : (item.status === 'RETURNED' ? 'RETURNED' : 'ISSUED'),
              condition: item.condition || 'Good'
            });
          }
        });
        setBorrowings(Array.from(map.values()));
      } else {
        setBorrowings(stored);
      }
    } catch (e) {
      setBorrowings(BorrowingStorageService.getBorrowings());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBorrowings();
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // Helper: Filter records for Student Lookup or Search
  const filteredList = useMemo(() => {
    const q = search.toLowerCase().trim();
    return borrowings.filter(item => {
      const matchSearch = !q || 
        item.id.toLowerCase().includes(q) ||
        (item.bookTitle || '').toLowerCase().includes(q) ||
        (item.isbn || '').toLowerCase().includes(q) ||
        (item.barcode || '').toLowerCase().includes(q) ||
        (item.studentName || '').toLowerCase().includes(q) ||
        (item.studentId || '').toLowerCase().includes(q) ||
        (item.studentEmail || '').toLowerCase().includes(q);

      if (activeTab === 'returns') {
        return matchSearch && item.status === 'RETURNED';
      } else {
        return matchSearch && item.status !== 'RETURNED';
      }
    });
  }, [borrowings, search, activeTab]);

  // Modal Scan / Student Lookup matching items
  const matchedScanItems = useMemo(() => {
    const q = scanQuery.toLowerCase().trim();
    if (!q) return [];
    return borrowings.filter(item => 
      item.status !== 'RETURNED' && (
        item.studentId?.toLowerCase().includes(q) ||
        item.studentEmail?.toLowerCase().includes(q) ||
        item.studentName?.toLowerCase().includes(q) ||
        item.barcode?.toLowerCase().includes(q) ||
        item.bookTitle?.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q)
      )
    );
  }, [borrowings, scanQuery]);

  // Handle RENEW LOAN Action
  const handleRenewLoan = async (record: BorrowingRecord) => {
    const currentDue = new Date(record.dueDate || Date.now());
    currentDue.setDate(currentDue.getDate() + 14);
    const newDueDateStr = currentDue.toISOString().split('T')[0];

    BorrowingStorageService.renewBorrowing(record.id, newDueDateStr);
    try {
      await ModeratorService.renewBorrowing(record.id, newDueDateStr);
    } catch (e) {}

    // Update state
    setBorrowings(prev => prev.map(item => {
      if (item.id === record.id) {
        return {
          ...item,
          dueDate: newDueDateStr,
          status: 'RENEWED'
        };
      }
      return item;
    }));

    showNotification(`Successfully renewed loan for "${record.bookTitle}"! New due date: ${newDueDateStr}`);
  };

  // Handle PROCESS RETURN Action
  const handleProcessReturn = async (record: BorrowingRecord, condition: 'Good' | 'Fair' | 'Damaged') => {
    const today = new Date().toISOString().split('T')[0];
    const isLate = new Date(today) > new Date(record.dueDate);
    const fine = isLate ? 2.50 : (condition === 'Damaged' ? 5.00 : 0);

    BorrowingStorageService.returnBorrowing(record.id, condition, fine);
    try {
      await ModeratorService.processReturn(record.id);
    } catch (e) {}

    if (fine > 0) {
      FineStorageService.addFine({
        studentId: record.studentId || 'STU-2024-1440',
        studentName: record.studentName || 'Sakib Shourov',
        studentEmail: record.studentEmail || 'sakib-shourov@gmail.com',
        bookId: record.bookId,
        bookTitle: record.bookTitle,
        isbn: record.isbn,
        reason: condition === 'Damaged' ? 'Damaged Material Repair Fee' : 'Late Return Overdue Fee',
        amount: fine,
        status: 'Unpaid'
      });
    }

    setBorrowings(prev => prev.map(item => {
      if (item.id === record.id) {
        return {
          ...item,
          returnDate: today,
          status: 'RETURNED',
          condition,
          fineAmount: fine
        };
      }
      return item;
    }));

    setIsScanModalOpen(false);
    setSelectedBorrowingForReturn(null);
    showNotification(`Returned "${record.bookTitle}" for ${record.studentName}! ${fine > 0 ? `Assessed $${fine.toFixed(2)} fine.` : ''}`);
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
          <h1 className="admin-title">Process Returns & Loan Renewals</h1>
          <p className="admin-subtitle">
            Scan returned books or search by Student ID / Email to view taken books, check due dates, renew loans, or process returns.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <div className="admin-search">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search Student ID, Email, Name, Book, Barcode..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="primary" onClick={() => { setScanQuery(''); setIsScanModalOpen(true); }}>
            <i className="fas fa-barcode" style={{ marginRight: '8px' }}></i> Scan Return / Lookup Student
          </Button>
        </div>
      </div>

      {/* Tabs: Returned Log vs Active Loans */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
        <button
          onClick={() => setActiveTab('returns')}
          style={{
            padding: '8px 16px', borderRadius: '20px', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
            background: activeTab === 'returns' ? 'var(--bg-warm-orange)' : 'var(--bg-white)',
            color: activeTab === 'returns' ? 'white' : 'var(--text-secondary)'
          }}
        >
          <i className="fas fa-history" style={{ marginRight: 6 }}></i> Recently Returned Log
        </button>

        <button
          onClick={() => setActiveTab('active')}
          style={{
            padding: '8px 16px', borderRadius: '20px', border: 'none', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
            background: activeTab === 'active' ? 'var(--bg-warm-orange)' : 'var(--bg-white)',
            color: activeTab === 'active' ? 'white' : 'var(--text-secondary)'
          }}
        >
          <i className="fas fa-book-reader" style={{ marginRight: 6 }}></i> Active Borrowed Books (Return / Renew)
        </button>
      </div>

      <div className="admin-card">
        <h3 style={{ margin: '0 0 var(--space-4) 0', fontSize: '1rem', color: 'var(--text-primary)' }}>
          {activeTab === 'returns' ? 'Recently Returned Log' : 'Active Borrowed Books Queue'}
        </h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Book Details</th>
                <th>Borrower Student</th>
                <th>Borrow & Due Dates</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map(item => {
                const isOverdue = new Date() > new Date(item.dueDate) && item.status !== 'RETURNED';
                const wasReturnedLate = item.returnDate && item.dueDate ? new Date(item.returnDate) > new Date(item.dueDate) : false;

                return (
                  <tr key={item.id}>
                    <td>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.8125rem', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                        {item.id}
                      </p>
                    </td>
                    <td>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                          {item.bookTitle}
                        </p>
                        <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--bg-warm-orange)', fontFamily: 'monospace' }}>
                          <i className="fas fa-barcode" style={{ marginRight: 4 }}></i> {item.barcode || `BC-${item.isbn}-1`}
                        </p>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <div style={{ 
                          width: '32px', height: '32px', borderRadius: '50%', 
                          background: 'var(--brand-primary, #1e1b4b)', color: 'white',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.75rem', fontWeight: 700
                        }}>
                          {(item.studentName || 'S').charAt(0).toUpperCase()}
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
                      <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-primary)' }}>
                        Borrow: <strong>{item.borrowDate}</strong>
                      </p>
                      <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', color: isOverdue ? '#ef4444' : 'var(--text-secondary)', fontWeight: isOverdue ? 700 : 500 }}>
                        Due: <strong>{item.dueDate}</strong> {isOverdue && '(OVERDUE)'}
                      </p>
                      {item.returnDate && (
                        <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                          Returned: {item.returnDate}
                        </p>
                      )}
                    </td>
                    <td>
                      {item.status === 'RETURNED' ? (
                        wasReturnedLate ? (
                          <Badge variant="error">Returned Late</Badge>
                        ) : (
                          <Badge variant="success">On Time</Badge>
                        )
                      ) : isOverdue ? (
                        <Badge variant="error">Overdue</Badge>
                      ) : item.status === 'RENEWED' ? (
                        <Badge variant="warning">Renewed (+14 Days)</Badge>
                      ) : (
                        <Badge variant="primary">Active Loan</Badge>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                        {/* Process Return Button for Active Borrowings */}
                        {item.status !== 'RETURNED' && (
                          <Button size="sm" variant="primary" title="Process Book Return" onClick={() => {
                            setSelectedBorrowingForReturn(item);
                            setIsScanModalOpen(true);
                          }}>
                            <i className="fas fa-undo-alt" style={{ marginRight: 4 }}></i> Return Book
                          </Button>
                        )}

                        {/* Renew Loan Button */}
                        {item.status !== 'RETURNED' && (
                          <Button size="sm" variant="outline" title="Renew Loan (+14 Days)" onClick={() => handleRenewLoan(item)}>
                            <i className="fas fa-sync-alt" style={{ marginRight: 4, color: 'var(--bg-warm-orange)' }}></i> Renew
                          </Button>
                        )}

                        {/* View Receipt Button */}
                        <Button size="sm" variant="outline" title="View Return Receipt" onClick={() => {
                          setReceiptRecord(item);
                          setIsReceiptModalOpen(true);
                        }}>
                          <i className="fas fa-receipt"></i> Receipt
                        </Button>

                        {/* Report Damage */}
                        {item.status !== 'RETURNED' && (
                          <Button size="sm" variant="outline" title="Report Damage" onClick={() => setConfirmDialog({
                            isOpen: true, 
                            title: 'Report Damaged Book', 
                            message: `Flag "${item.bookTitle}" as damaged by student ${item.studentName}? This will assess a repair fine.`, 
                            isDestructive: true,
                            action: () => handleProcessReturn(item, 'Damaged')
                          })}>
                            <i className="fas fa-house-damage" style={{ color: 'var(--status-warning)' }}></i>
                          </Button>
                        )}

                        {/* Assess / Update Fine for returned items */}
                        {item.status === 'RETURNED' && (
                          <Button size="sm" variant="outline" title="Assess / Update Fine" onClick={() => {
                            setFineAssessmentRecord(item);
                            setFineInput((item.fineAmount !== undefined ? item.fineAmount : 2.50).toString());
                            setIsFineModalOpen(true);
                          }}>
                            <i className="fas fa-file-invoice-dollar" style={{ color: 'var(--status-error)' }}></i> Fine
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredList.length === 0 && !loading && (
            <div style={{ textAlign: 'center', padding: 'var(--space-8) 0', color: 'var(--text-secondary)' }}>
              <i className="fas fa-undo-alt" style={{ fontSize: '2rem', marginBottom: 'var(--space-4)', opacity: 0.5 }}></i>
              <p>No transactions found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* SCAN / SEARCH RETURN MODAL (Supports Student ID, Email, Barcode Search) */}
      <Modal 
        isOpen={isScanModalOpen} 
        onClose={() => { setIsScanModalOpen(false); setSelectedBorrowingForReturn(null); }}
        title="Process Book Return / Student Loan Lookup"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setIsScanModalOpen(false)}>Close</Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Search Box */}
          <div style={{ padding: '20px', background: 'var(--bg-pale-peach)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <i className="fas fa-search" style={{ fontSize: '2rem', color: 'var(--bg-warm-orange)', marginBottom: '10px' }}></i>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '1rem', fontWeight: 700 }}>
              Search by Student ID, Email, Name, or Book Barcode
            </h4>
            <div style={{ maxWidth: '400px', margin: '0 auto' }}>
              <input 
                type="text" 
                placeholder="Type Student ID (e.g. STU-2024-1440), Email, or Barcode..." 
                value={scanQuery}
                onChange={(e) => setScanQuery(e.target.value)}
                autoFocus
                style={{ 
                  width: '100%', padding: '12px 16px', 
                  border: '2px solid var(--bg-warm-orange)', borderRadius: 'var(--radius-md)', 
                  outline: 'none', fontSize: '0.9375rem', background: 'white'
                }}
              />
            </div>
          </div>

          {/* Student Matched Borrowed Books Results */}
          {matchedScanItems.length > 0 ? (
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
                Found {matchedScanItems.length} Active Borrowed Book(s) for Search "{scanQuery}":
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {matchedScanItems.map(item => (
                  <div key={item.id} style={{ 
                    padding: '14px', border: '1px solid var(--border-color)', borderRadius: '8px', 
                    background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
                  }}>
                    <div>
                      <h5 style={{ margin: '0 0 4px 0', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {item.bookTitle}
                      </h5>
                      <p style={{ margin: '0 0 4px 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        Borrower: <strong>{item.studentName}</strong> (ID: {item.studentId} | {item.studentEmail})
                      </p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--bg-warm-orange)', fontWeight: 600 }}>
                        Borrow Date: {item.borrowDate} · Due Date: <strong>{item.dueDate}</strong>
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button size="sm" variant="outline" onClick={() => handleRenewLoan(item)}>
                        <i className="fas fa-sync-alt" style={{ marginRight: 4 }}></i> Renew (+14D)
                      </Button>
                      <Button size="sm" variant="primary" onClick={() => setSelectedBorrowingForReturn(item)}>
                        <i className="fas fa-check-circle" style={{ marginRight: 4 }}></i> Select to Return
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : scanQuery.trim() ? (
            <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No active borrowings found matching "{scanQuery}".
            </div>
          ) : null}

          {/* Return Condition Form when item selected */}
          {selectedBorrowingForReturn && (
            <div style={{ borderTop: '2px dashed var(--border-color)', paddingTop: '16px', marginTop: '8px' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                Confirm Return for "{selectedBorrowingForReturn.bookTitle}" (Student: {selectedBorrowingForReturn.studentName})
              </h4>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  Returned Book Condition
                </label>
                <select 
                  value={returnCondition} 
                  onChange={(e) => setReturnCondition(e.target.value as any)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white' }}
                >
                  <option value="Good">Good (No new damage)</option>
                  <option value="Fair">Fair (Minor wear)</option>
                  <option value="Damaged">Damaged (Assess repair fine)</option>
                </select>
              </div>

              <Button 
                variant="primary" 
                size="lg" 
                style={{ width: '100%' }} 
                onClick={() => handleProcessReturn(selectedBorrowingForReturn, returnCondition)}
              >
                <i className="fas fa-undo-alt" style={{ marginRight: 6 }}></i> Complete Return & Restock Physical Copy
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* PRINTABLE RECEIPT MODAL */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => { setIsReceiptModalOpen(false); setReceiptRecord(null); }}
        title="Official Book Return Receipt"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setIsReceiptModalOpen(false)}>Close</Button>
            <Button variant="primary" onClick={() => window.print()}>
              <i className="fas fa-print" style={{ marginRight: 6 }}></i> Print Official Receipt
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
                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Official Book Loan & Return Receipt</p>
              </div>

              <p style={{ fontSize: '0.8125rem', margin: '0 0 6px 0' }}><strong>TXN ID:</strong> {receiptRecord.id}</p>
              <p style={{ fontSize: '0.8125rem', margin: '0 0 6px 0' }}><strong>Book Title:</strong> {receiptRecord.bookTitle}</p>
              <p style={{ fontSize: '0.8125rem', margin: '0 0 6px 0' }}><strong>ISBN / Barcode:</strong> {receiptRecord.barcode || receiptRecord.isbn}</p>
              
              <div style={{ borderTop: '1px dashed var(--border-color)', borderBottom: '1px dashed var(--border-color)', padding: '8px 0', margin: '12px 0' }}>
                <p style={{ fontSize: '0.8125rem', margin: '0 0 4px 0' }}><strong>Student Name:</strong> {receiptRecord.studentName}</p>
                <p style={{ fontSize: '0.8125rem', margin: '0 0 4px 0' }}><strong>Student ID:</strong> {receiptRecord.studentId}</p>
                <p style={{ fontSize: '0.8125rem', margin: 0 }}><strong>Email:</strong> {receiptRecord.studentEmail}</p>
              </div>

              <p style={{ fontSize: '0.8125rem', margin: '0 0 4px 0' }}><strong>Borrow Date:</strong> {receiptRecord.borrowDate}</p>
              <p style={{ fontSize: '0.8125rem', margin: '0 0 4px 0' }}><strong>Due Date:</strong> {receiptRecord.dueDate}</p>
              <p style={{ fontSize: '0.8125rem', margin: '0 0 12px 0', color: '#10b981', fontWeight: 700 }}>
                <strong>Return Date:</strong> {receiptRecord.returnDate || 'Checked In'}
              </p>

              <div style={{ background: 'var(--bg-pale-peach)', padding: '10px', borderRadius: '6px', textAlign: 'center', fontWeight: 700, fontSize: '0.875rem' }}>
                Fine Assessed: ${receiptRecord.fineAmount ? receiptRecord.fineAmount.toFixed(2) : '0.00'}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* FINE ASSESSMENT MODAL */}
      <Modal
        isOpen={isFineModalOpen}
        onClose={() => { setIsFineModalOpen(false); setFineAssessmentRecord(null); }}
        title="Assess / Collect Fine"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setIsFineModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => {
              if (fineAssessmentRecord) {
                const parsed = parseFloat(fineInput);
                const amt = isNaN(parsed) ? 0 : parsed;

                // 1. Update borrowings list fineAmount state so table & future modals reflect it
                setBorrowings(prev => prev.map(b => b.id === fineAssessmentRecord.id ? { ...b, fineAmount: amt } : b));

                // 2. Update active receiptRecord state if it matches this item
                setReceiptRecord(prev => (prev && prev.id === fineAssessmentRecord.id) ? { ...prev, fineAmount: amt } : prev);

                // 3. Persist fine to FineStorageService
                FineStorageService.addFine({
                  studentId: fineAssessmentRecord.studentId || 'STU-2024-1440',
                  studentName: fineAssessmentRecord.studentName || 'Sakib Shourov',
                  studentEmail: fineAssessmentRecord.studentEmail || 'sakib-shourov@gmail.com',
                  bookId: fineAssessmentRecord.bookId,
                  bookTitle: fineAssessmentRecord.bookTitle,
                  isbn: fineAssessmentRecord.isbn,
                  reason: 'Overdue / Return Fine',
                  amount: amt,
                  status: 'Paid',
                  paymentMethod: 'Cash at Desk'
                });

                showNotification(`Fine of $${amt.toFixed(2)} updated & saved into Fines Ledger for ${fineAssessmentRecord.studentName}!`);
              }
              setIsFineModalOpen(false);
            }}>Collect / Save Fine</Button>
          </div>
        }
      >
        {fineAssessmentRecord && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
              Assessing fine for <strong>"{fineAssessmentRecord.bookTitle}"</strong> (Borrower: {fineAssessmentRecord.studentName} | {fineAssessmentRecord.studentId}).
            </p>
            <Input 
              label="Fine Amount ($ USD)" 
              value={fineInput} 
              onChange={(e) => setFineInput(e.target.value)} 
            />
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
