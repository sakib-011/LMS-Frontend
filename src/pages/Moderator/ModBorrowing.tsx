import React, { useEffect, useState } from 'react';
import { Button, Badge, DataTable, ConfirmationDialog } from '../../components/ui';
import { ModeratorService } from '../../services/moderatorService';
import { AdminService } from '../../services/adminService';
import { BookService, Book } from '../../services/bookService';
import { BorrowedBookItem } from '../../services/studentService';
import './Moderator.css';

export const ModBorrowing: React.FC = () => {
  const [studentInput, setStudentInput] = useState('');
  const [bookInput, setBookInput] = useState('');
  const [students, setStudents] = useState<any[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [dueDate, setDueDate] = useState('2026-10-08');
  const [issuedMessage, setIssuedMessage] = useState('');
  const [activeBorrowings, setActiveBorrowings] = useState<BorrowedBookItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean; 
    title: string; 
    message: string; 
    action?: () => void;
    isDestructive?: boolean;
  }>({ isOpen: false, title: '', message: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const [bookRes, borrowRes, studentRes] = await Promise.all([
        BookService.getBooks().catch(() => []),
        ModeratorService.getBorrowings().catch(() => []),
        ModeratorService.getStudents().catch(() => [])
      ]);
      if (Array.isArray(bookRes)) setBooks(bookRes);
      if (Array.isArray(borrowRes)) setActiveBorrowings(borrowRes);
      if (Array.isArray(studentRes)) setStudents(studentRes);
    } catch (err) {
      console.error("Failed to load moderator circulation data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Strict match: ONLY when studentInput is non-empty
  const matchedStudent = studentInput.trim() ? students.find(s => {
    const input = studentInput.trim().toLowerCase();
    return (s.email || '').toLowerCase().includes(input) || 
           (s.id || '').toLowerCase().includes(input) || 
           (s.name || '').toLowerCase().includes(input);
  }) : null;

  // Strict match: ONLY when bookInput or selectedBookId is non-empty
  const matchedBook = (bookInput.trim() || selectedBookId) ? books.find(b => {
    if (selectedBookId && b.id === selectedBookId) return true;
    if (!bookInput.trim()) return false;
    const input = bookInput.trim().toLowerCase();
    return (b.id || '').toLowerCase().includes(input) || 
           (b.isbn || '').toLowerCase().includes(input) || 
           (b.title || '').toLowerCase().includes(input) ||
           `bc-${b.id}`.toLowerCase().includes(input);
  }) : null;

  const isStudentBlocked = matchedStudent && (matchedStudent.status === 'Blocked' || matchedStudent.status === 'Suspended');

  const handleConfirmIssue = async () => {
    const emailToUse = matchedStudent ? matchedStudent.email : studentInput;
    const bIdToUse = matchedBook ? matchedBook.id : (selectedBookId || books[0]?.id || '');

    if (!emailToUse || !bIdToUse) {
      setIssuedMessage("Please enter valid student email/ID and book barcode or selection.");
      return;
    }

    if (isStudentBlocked) {
      setIssuedMessage(`🚫 Cannot issue book: Student ${matchedStudent.name} account is blocked.`);
      return;
    }

    try {
      await ModeratorService.issueBook(emailToUse, bIdToUse, dueDate);
      setIssuedMessage(`✓ Successfully issued "${matchedBook?.title || 'Book'}" to student (${emailToUse}) with Due Date ${dueDate} in database!`);
      setSelectedBookId('');
      setBookInput('');
      setStudentInput('');
      loadData();
    } catch (err: any) {
      console.error("Failed to issue book:", err);
      setIssuedMessage(err.response?.data?.message || err.response?.data || "Failed to issue book");
    }
  };

  const handleRenewLoan = async (borrowingId: string, title: string) => {
    try {
      const updated = await ModeratorService.renewBorrowing(borrowingId);
      setIssuedMessage(`✓ Extended due date for "${title}" to ${updated.dueDate || '14 days later'} in database!`);
      loadData();
    } catch (err) {
      console.error("Failed to renew loan:", err);
      setIssuedMessage("Failed to renew loan.");
    }
  };

  const handleProcessReturn = async (borrowingId: string, title: string) => {
    try {
      await ModeratorService.processReturn(borrowingId);
      setIssuedMessage(`✓ Marked "${title}" as returned in database. Inventory restored!`);
      loadData();
    } catch (err) {
      console.error("Failed to process return:", err);
      setIssuedMessage("Failed to process return.");
    }
  };

  const handleToggleBlockStudent = async (user: any) => {
    if (!user || !user.id) return;
    const newStatus = user.status === 'Blocked' ? 'Active' : 'Blocked';
    try {
      await AdminService.updateUser(user.id, { status: newStatus });
      setIssuedMessage(`✓ Student ${user.name || user.email} status updated to ${newStatus}.`);
      loadData();
    } catch (err) {
      console.error("Failed to update user status:", err);
      setIssuedMessage("Failed to update student block status.");
    }
  };

  const columns = [
    { 
      key: 'id', 
      header: 'Loan ID', 
      render: (item: any) => <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{(item.id || '').substring(0, 8).toUpperCase()}</span> 
    },
    { 
      key: 'book', 
      header: 'Book Title & Barcode', 
      render: (item: any) => (
        <div>
          <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>{item.bookTitle || item.book?.title || 'Borrowed Book'}</p>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--bg-secondary-text)' }}>ISBN/BC: {item.isbn || item.book?.isbn || `BC-${item.book?.id || '1001'}`}</p>
        </div>
      )
    },
    {
      key: 'borrower',
      header: 'Borrower Student',
      render: (item: any) => {
        const u = item.user || { id: item.studentId, name: item.studentName, email: 'student@university.edu', status: 'Active' };
        const blocked = u.status === 'Blocked' || u.status === 'Suspended';
        return (
          <div>
            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 500 }}>
              {u.name || 'Student'} {blocked && <span style={{ color: 'var(--bg-error)', fontSize: '0.7rem', fontWeight: 'bold' }}>(BLOCKED)</span>}
            </p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--bg-secondary-text)' }}>{u.email || 'student@university.edu'}</p>
          </div>
        );
      }
    },
    { key: 'borrowDate', header: 'Issue Date', render: (item: any) => item.borrowDate || 'Today' },
    { key: 'dueDate', header: 'Due Date', render: (item: any) => <span style={{ color: item.isOverdue ? 'var(--bg-error)' : 'inherit', fontWeight: 600 }}>{item.dueDate || 'In 14 Days'}</span> },
    { key: 'status', header: 'Status', render: (item: any) => (
      item.status === 'RETURNED' ? (
        <Badge variant="neutral">Returned</Badge>
      ) : item.isOverdue ? (
        <Badge variant="error">Overdue</Badge>
      ) : (
        <Badge variant="success">Active</Badge>
      )
    )},
    {
      key: 'actions',
      header: 'Actions',
      render: (item: any) => {
        const u = item.user || { id: item.studentId, name: item.studentName, email: 'student@university.edu', status: 'Active' };
        const blocked = u.status === 'Blocked' || u.status === 'Suspended';

        return (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {item.status !== 'RETURNED' && (
              <>
                <Button size="sm" variant="outline" title="Process Return" onClick={() => setConfirmDialog({
                  isOpen: true,
                  title: 'Process Return',
                  message: `Mark "${item.bookTitle || item.book?.title}" as returned and restore physical copy in catalog?`,
                  action: () => handleProcessReturn(item.id, item.bookTitle || item.book?.title || 'Book')
                })}>
                  <i className="fas fa-undo-alt" style={{ color: 'var(--bg-success)' }}></i>
                </Button>
                <Button size="sm" variant="outline" title="Renew Loan (+14 Days)" onClick={() => setConfirmDialog({
                  isOpen: true,
                  title: 'Renew Loan',
                  message: `Extend due date for "${item.bookTitle || item.book?.title}" by 14 days in database?`,
                  action: () => handleRenewLoan(item.id, item.bookTitle || item.book?.title || 'Book')
                })}>
                  <i className="fas fa-calendar-plus" style={{ color: 'var(--bg-accent-blue)' }}></i>
                </Button>
              </>
            )}
            <Button size="sm" variant="outline" title={blocked ? "Unblock Student" : "Block Student"} onClick={() => setConfirmDialog({
              isOpen: true,
              title: blocked ? 'Unblock Student' : 'Block Student Account',
              message: blocked ? `Restore borrowing privileges for "${u.name || u.email}"?` : `Block student "${u.name || u.email}" from borrowing books?`,
              isDestructive: !blocked,
              action: () => handleToggleBlockStudent(u)
            })}>
              <i className="fas fa-ban" style={{ color: blocked ? 'var(--bg-success)' : 'var(--bg-error)' }}></i>
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <div>
      <div className="mod-card-header">
        <div>
          <h1 className="mod-card-title">Issue Book (Borrowing Desk)</h1>
          <p style={{ color: 'var(--bg-secondary-text)', fontSize: '0.875rem' }}>Scan or enter student ID/email and book barcode to verify details & checkout.</p>
        </div>
      </div>

      {issuedMessage && (
        <div style={{ backgroundColor: issuedMessage.startsWith('✓') ? 'rgba(82,122,90,0.1)' : 'rgba(230,138,102,0.1)', border: `1px solid ${issuedMessage.startsWith('✓') ? 'var(--bg-success)' : 'var(--bg-error)'}`, borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', marginBottom: 'var(--space-6)', color: issuedMessage.startsWith('✓') ? 'var(--bg-success)' : 'var(--bg-error)', fontWeight: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <i className={`fas ${issuedMessage.startsWith('✓') ? 'fa-check-circle' : 'fa-exclamation-circle'}`} style={{ marginRight: 8 }}></i>
            {issuedMessage}
          </div>
          <button onClick={() => setIssuedMessage('')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      <div className="std-grid-2col">
        {/* 1. Student Information Input & Live Preview */}
        <div className="mod-card">
          <h2 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-user-tag" style={{ color: 'var(--bg-accent-blue)' }}></i> 1. Student Identification
          </h2>
          <div className="mod-form-group">
            <input 
              type="text" 
              className="mod-input" 
              placeholder="Type Student Email or ID (e.g. student@university.edu)..." 
              value={studentInput}
              onChange={e => setStudentInput(e.target.value)}
            />
          </div>
          
          {/* Side Info Panel for Student */}
          <div style={{ 
            padding: 'var(--space-4)', 
            background: isStudentBlocked ? 'rgba(217, 83, 79, 0.08)' : matchedStudent ? 'rgba(82, 122, 90, 0.08)' : studentInput.trim() ? 'rgba(217, 83, 79, 0.05)' : 'var(--bg-background)', 
            borderRadius: 'var(--radius-md)', 
            border: isStudentBlocked ? '1px solid var(--bg-error)' : matchedStudent ? '1px solid var(--bg-success)' : studentInput.trim() ? '1px solid var(--bg-error)' : '1px dashed var(--bg-border)',
            transition: 'all 0.2s ease'
          }}>
            <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: isStudentBlocked ? 'var(--bg-error)' : matchedStudent ? 'var(--bg-success)' : 'var(--bg-accent-blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 'bold' }}>
                {matchedStudent ? (matchedStudent.name || 'S').substring(0, 2).toUpperCase() : <i className="fas fa-user"></i>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                    {matchedStudent ? matchedStudent.name : studentInput.trim() ? 'Student Not Found' : 'No Student Selected'}
                  </h3>
                  {isStudentBlocked ? <Badge variant="error" size="sm">🚫 Blocked</Badge> : matchedStudent ? <Badge variant="success" size="sm">✓ Student Found</Badge> : studentInput.trim() ? <Badge variant="error" size="sm">❌ Not Found</Badge> : <Badge variant="neutral" size="sm">Pending</Badge>}
                </div>
                <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', color: 'var(--bg-secondary-text)' }}>
                  {matchedStudent ? matchedStudent.email : studentInput.trim() ? `No record for "${studentInput}"` : 'Type email or ID above'}
                </p>
                {matchedStudent && (
                  <div style={{ marginTop: 'var(--space-2)', display: 'flex', gap: 'var(--space-2)' }}>
                    <span style={{ fontSize: '0.75rem', background: 'white', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--bg-border)', fontWeight: 600 }}>ID: {matchedStudent.id}</span>
                    <span style={{ fontSize: '0.75rem', background: 'white', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--bg-border)', color: 'var(--bg-secondary-text)' }}>Dept: {matchedStudent.department || 'Computer Science'}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Book Barcode & Selection Preview */}
        <div className="mod-card">
          <h2 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-barcode" style={{ color: 'var(--bg-accent-orange)' }}></i> 2. Book Barcode & Details
          </h2>
          <div className="mod-form-group">
            <input 
              type="text" 
              className="mod-input" 
              placeholder="Type Barcode, ISBN, or Book ID (e.g. BC-1001)..." 
              value={bookInput}
              onChange={e => {
                setBookInput(e.target.value);
                setSelectedBookId('');
              }}
            />
            <div style={{ marginTop: 8 }}>
              <select
                className="mod-input"
                value={selectedBookId}
                onChange={e => {
                  setSelectedBookId(e.target.value);
                  setBookInput('');
                }}
              >
                <option value="">Or Select Catalog Book from list...</option>
                {books.map(b => (
                  <option key={b.id} value={b.id}>{b.title} ({b.physicalAvailable ?? 1} available)</option>
                ))}
              </select>
            </div>
            <div style={{ marginTop: 8 }}>
              <label style={{ fontSize: '0.8125rem', color: 'var(--bg-secondary-text)', display: 'block', marginBottom: 4 }}>Due Date:</label>
              <input 
                type="date"
                className="mod-input"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>
          </div>
          
          {/* Side Info Panel for Book */}
          <div style={{ 
            padding: 'var(--space-4)', 
            background: matchedBook ? 'rgba(230, 138, 102, 0.08)' : (bookInput.trim() || selectedBookId) ? 'rgba(217, 83, 79, 0.05)' : 'var(--bg-background)', 
            borderRadius: 'var(--radius-md)', 
            border: matchedBook ? '1px solid var(--bg-accent-orange)' : (bookInput.trim() || selectedBookId) ? '1px solid var(--bg-error)' : '1px dashed var(--bg-border)',
            transition: 'all 0.2s ease'
          }}>
            {matchedBook ? (
              <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                <div style={{ width: 44, height: 64, background: matchedBook.coverColor || '#2D3748', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>
                  <i className="fas fa-book"></i>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{matchedBook.title}</h3>
                    <Badge variant={(matchedBook.physicalAvailable ?? 1) > 0 ? "success" : "error"} size="sm">
                      {(matchedBook.physicalAvailable ?? 1) > 0 ? `✓ Available (${matchedBook.physicalAvailable ?? 1})` : 'Out of Stock'}
                    </Badge>
                  </div>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8125rem', color: 'var(--bg-secondary-text)' }}>Author: {matchedBook.author} · {matchedBook.physicalStacks || 'Stack 1A'}</p>
                  
                  <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-2) var(--space-3)', background: 'white', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem' }}>
                      <span style={{ color: 'var(--bg-secondary-text)' }}>Barcode / ISBN:</span>
                      <span style={{ fontWeight: 600 }}>{matchedBook.isbn || `BC-${matchedBook.id}`}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '8px 0', textAlign: 'center', color: 'var(--bg-secondary-text)', fontSize: '0.8125rem' }}>
                <i className="fas fa-book-reader" style={{ fontSize: '1.25rem', display: 'block', marginBottom: '6px', opacity: 0.5 }}></i>
                <p style={{ margin: 0 }}>
                  {bookInput.trim() ? `No book found matching "${bookInput}"` : 'Scan barcode or select book to preview details.'}
                </p>
              </div>
            )}
          </div>
          
          <Button 
            variant="primary" 
            style={{ width: '100%', marginTop: 'var(--space-4)' }} 
            onClick={handleConfirmIssue}
            disabled={isStudentBlocked || !matchedStudent || !matchedBook}
          >
            <i className="fas fa-check-circle" style={{ marginRight: 8 }}></i> Complete Book Checkout in Database
          </Button>
        </div>
      </div>

      <div className="mod-card" style={{ marginTop: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h2 className="mod-card-title">Recent Active Borrowings</h2>
          <Badge variant="neutral">{activeBorrowings.length} Books</Badge>
        </div>
        <DataTable data={activeBorrowings} columns={columns} />
      </div>

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
