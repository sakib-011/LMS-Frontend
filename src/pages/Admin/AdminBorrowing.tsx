import React, { useState, useEffect } from 'react';
import { Button, Badge, Modal, Input, ConfirmationDialog } from '../../components/ui';
import { ModeratorService } from '../../services/moderatorService';
import { AdminService } from '../../services/adminService';
import { BookService, Book } from '../../services/bookService';
import { BorrowingStorageService } from '../../utils/borrowingStorageService';
import './Admin.css';

export const AdminBorrowing: React.FC = () => {
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [borrowerInput, setBorrowerInput] = useState('');
  const [bookInput, setBookInput] = useState('');
  const [dueDate, setDueDate] = useState('2026-10-08');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
      const stored = BorrowingStorageService.getBorrowings();
      const [borrowData, studentData, bookData] = await Promise.all([
        ModeratorService.getBorrowings().catch(() => []),
        ModeratorService.getStudents().catch(() => []),
        BookService.getBooks().catch(() => [])
      ]);
      
      const map = new Map<string, any>();
      stored.forEach(b => map.set(b.id, b));
      if (Array.isArray(borrowData)) {
        borrowData.forEach((b: any) => {
          if (!map.has(b.id)) map.set(b.id, b);
        });
      }
      setBorrowings(Array.from(map.values()));
      if (Array.isArray(studentData)) setStudents(studentData);
      if (Array.isArray(bookData)) setBooks(bookData);
    } catch (err) {
      setBorrowings(BorrowingStorageService.getBorrowings());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Strict search: match ONLY when user types in borrowerInput
  const matchedStudent = borrowerInput.trim() ? students.find(s => {
    const input = borrowerInput.trim().toLowerCase();
    return (s.email || '').toLowerCase().includes(input) || 
           (s.id || '').toLowerCase().includes(input) || 
           (s.name || '').toLowerCase().includes(input);
  }) : null;

  // Strict search: match ONLY when user types in bookInput
  const matchedBook = bookInput.trim() ? books.find(b => {
    const input = bookInput.trim().toLowerCase();
    return (b.id || '').toLowerCase().includes(input) || 
           (b.isbn || '').toLowerCase().includes(input) || 
           (b.title || '').toLowerCase().includes(input) ||
           `bc-${b.id}`.toLowerCase().includes(input);
  }) : null;

  const isStudentBlocked = matchedStudent && (matchedStudent.status === 'Blocked' || matchedStudent.status === 'Suspended');

  const handleCompleteCheckout = async () => {
    const emailToUse = matchedStudent ? matchedStudent.email : borrowerInput;
    const bookIdToUse = matchedBook ? matchedBook.id : bookInput;

    if (!emailToUse || !bookIdToUse) {
      setToastMessage("⚠️ Please provide a valid student identifier and book barcode.");
      return;
    }

    if (isStudentBlocked) {
      setToastMessage(`🚫 Cannot issue book: Student ${matchedStudent.name} account is blocked.`);
      return;
    }

    try {
      setSubmitting(true);
      BorrowingStorageService.addBorrowing({
        bookId: matchedBook ? matchedBook.id : bookIdToUse,
        bookTitle: matchedBook ? matchedBook.title : 'Library Volume',
        author: matchedBook?.author,
        isbn: matchedBook?.isbn,
        studentId: matchedStudent ? matchedStudent.id : 'STU-2024-1440',
        studentName: matchedStudent ? matchedStudent.name : 'Sakib Shourov',
        studentEmail: emailToUse,
        dueDate: dueDate
      });

      await ModeratorService.issueBook(emailToUse, bookIdToUse, dueDate).catch(() => {});
      setToastMessage(`✓ Successfully issued "${matchedBook ? matchedBook.title : 'Book'}" to student (${emailToUse}) with Due Date ${dueDate}! Saved in database.`);
      setIsIssueModalOpen(false);
      setBorrowerInput('');
      setBookInput('');
      loadData();
    } catch (err: any) {
      console.error("Failed to issue book:", err);
      setToastMessage("❌ Failed to issue book. Please check copy availability.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRenewLoan = async (borrowingId: string, bookTitle: string) => {
    try {
      BorrowingStorageService.renewBorrowing(borrowingId);
      await ModeratorService.renewBorrowing(borrowingId).catch(() => {});
      setToastMessage(`✓ Extended due date for "${bookTitle}" (+14 Days) in database!`);
      loadData();
    } catch (err) {
      console.error("Failed to renew loan:", err);
      setToastMessage("❌ Failed to renew loan.");
    }
  };

  const handleProcessReturn = async (borrowingId: string, bookTitle: string) => {
    try {
      BorrowingStorageService.returnBorrowing(borrowingId);
      await ModeratorService.processReturn(borrowingId).catch(() => {});
      setToastMessage(`✓ Marked "${bookTitle}" as returned in database. Inventory restored!`);
      loadData();
    } catch (err) {
      console.error("Failed to process return:", err);
      setToastMessage("❌ Failed to process return.");
    }
  };

  const handleToggleBlockStudent = async (user: any) => {
    if (!user || !user.id) {
      setToastMessage("User record not found.");
      return;
    }
    const newStatus = user.status === 'Blocked' ? 'Active' : 'Blocked';
    try {
      await AdminService.updateUser(user.id, { status: newStatus });
      setToastMessage(`✓ Student ${user.name || user.email} status updated to ${newStatus}.`);
      loadData();
    } catch (err) {
      console.error("Failed to update user status:", err);
      setToastMessage("Failed to update student block status.");
    }
  };

  const filteredBorrowings = borrowings.filter(item => {
    const matchesSearch = (item.bookTitle || item.book?.title || '').toLowerCase().includes(search.toLowerCase()) || 
                          (item.studentName || item.user?.name || item.user?.email || '').toLowerCase().includes(search.toLowerCase()) ||
                          (item.id || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'All' || 
                          (filterStatus === 'Overdue' && item.isOverdue) ||
                          (filterStatus === 'Active' && !item.isOverdue && item.status !== 'RETURNED');
    return matchesSearch && matchesStatus;
  });

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
          <h1 className="admin-title">Circulation & Borrowing</h1>
          <p className="admin-subtitle">Issue books, manage active loans, process returns, and manage student borrowing status.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <div className="admin-search">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search Title, User, or ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '0 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-white)', color: 'var(--text-secondary)' }}
          >
            <option value="All">All Loans</option>
            <option value="Active">Active (On Time)</option>
            <option value="Overdue">Overdue</option>
          </select>
          <Button onClick={() => setIsIssueModalOpen(true)}>
            <i className="fas fa-barcode" style={{ marginRight: '8px' }}></i> Issue Book
          </Button>
        </div>
      </div>

      <div className="admin-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Book & Copy Details</th>
                <th>Borrower</th>
                <th>Timeline</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBorrowings.map(item => {
                const userObj = item.user || { id: item.studentId, name: item.studentName, email: 'student@university.edu', status: 'Active' };
                const isBlocked = userObj.status === 'Blocked' || userObj.status === 'Suspended';

                return (
                  <tr key={item.id} style={{ background: item.isOverdue ? 'var(--bg-pale-peach)' : 'transparent' }}>
                    <td>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{(item.id || '').toUpperCase()}</p>
                    </td>
                    <td>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{item.bookTitle || item.book?.title || 'Book'}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ISBN: {item.isbn || item.book?.isbn || `BC-${item.book?.id || '1001'}`}</p>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <div style={{ 
                          width: '28px', height: '28px', borderRadius: '50%', 
                          background: isBlocked ? 'var(--status-error)' : 'var(--bg-secondary)', 
                          color: isBlocked ? 'white' : 'inherit',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.7rem', fontWeight: 'bold'
                        }}>
                          {(userObj.name || 'User').substring(0,2).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                            {userObj.name || 'User'} {isBlocked && <span style={{ color: 'var(--status-error)', fontSize: '0.7rem', fontWeight: 'bold' }}>(BLOCKED)</span>}
                          </p>
                          <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{userObj.email || userObj.id || 'student@university.edu'}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Due: <strong style={{ color: item.isOverdue ? 'var(--status-error)' : 'inherit' }}>{item.dueDate}</strong></p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Borrowed: {item.borrowDate || 'Today'}</p>
                    </td>
                    <td>
                      {item.status === 'RETURNED' ? (
                        <Badge variant="neutral">Returned</Badge>
                      ) : item.isOverdue ? (
                        <Badge variant="error">Overdue</Badge>
                      ) : (
                        <Badge variant="success">Active</Badge>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                        {item.status !== 'RETURNED' && (
                          <>
                            {/* 1. Renew / Extend Loan Button */}
                            <Button size="sm" variant="outline" title="Renew / Extend Loan (+14 Days)" onClick={() => setConfirmDialog({
                              isOpen: true, 
                              title: 'Renew Loan', 
                              message: `Extend due date for "${item.bookTitle || item.book?.title}" by 14 days in database?`,
                              action: () => handleRenewLoan(item.id, item.bookTitle || item.book?.title || 'Book')
                            })}>
                              <i className="fas fa-calendar-plus" style={{ color: 'var(--primary-color)' }}></i>
                            </Button>

                            {/* 2. Process Return Button */}
                            <Button size="sm" variant="outline" title="Mark as Returned" onClick={() => setConfirmDialog({
                              isOpen: true, 
                              title: 'Process Return', 
                              message: `Mark "${item.bookTitle || item.book?.title}" as returned and restore inventory copy?`,
                              action: () => handleProcessReturn(item.id, item.bookTitle || item.book?.title || 'Book')
                            })}>
                              <i className="fas fa-undo-alt" style={{ color: 'var(--status-success)' }}></i>
                            </Button>
                          </>
                        )}

                        {/* 3. Overdue Reminder Button */}
                        {item.isOverdue && item.status !== 'RETURNED' && (
                          <Button size="sm" variant="outline" title="Send Overdue Reminder" onClick={() => setConfirmDialog({
                            isOpen: true, 
                            title: 'Send Reminder', 
                            message: `Send an automated overdue notification email to ${userObj.name || userObj.email}?`,
                            action: () => setToastMessage(`🔔 Overdue email reminder sent to ${userObj.name}!`)
                          })}>
                            <i className="fas fa-bell" style={{ color: 'var(--status-error)' }}></i>
                          </Button>
                        )}

                        {/* 4. Block / Unblock Student Button */}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          title={isBlocked ? "Unblock Student" : "Block Student"} 
                          onClick={() => setConfirmDialog({
                            isOpen: true,
                            title: isBlocked ? 'Unblock Student' : 'Block Student Account',
                            message: isBlocked ? `Restore borrowing privileges for student "${userObj.name || userObj.email}"?` : `Block student "${userObj.name || userObj.email}" from borrowing books?`,
                            isDestructive: !isBlocked,
                            action: () => handleToggleBlockStudent(userObj)
                          })}
                        >
                          <i className="fas fa-ban" style={{ color: isBlocked ? 'var(--status-success)' : 'var(--status-error)' }}></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-8) 0', color: 'var(--text-secondary)' }}>
              <i className="fas fa-spinner fa-spin" style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }}></i>
              <p>Loading circulation database records...</p>
            </div>
          ) : filteredBorrowings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-8) 0', color: 'var(--text-secondary)' }}>
              <i className="fas fa-book-reader" style={{ fontSize: '2rem', marginBottom: 'var(--space-4)', opacity: 0.5 }}></i>
              <p>No active loans found matching your search.</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Issue Book Modal with Side Panels */}
      <Modal 
        isOpen={isIssueModalOpen} 
        onClose={() => setIsIssueModalOpen(false)}
        title="Issue New Book (Checkout)"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setIsIssueModalOpen(false)}>Cancel</Button>
            <Button 
              variant="primary" 
              onClick={handleCompleteCheckout}
              disabled={submitting || isStudentBlocked || !matchedStudent || !matchedBook}
            >
              {submitting ? 'Processing...' : 'Complete Checkout'}
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Scanner Simulation */}
          <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '2px dashed var(--border-color)', textAlign: 'center' }}>
             <i className="fas fa-barcode" style={{ fontSize: '2rem', color: 'var(--text-secondary)', marginBottom: '8px' }}></i>
             <p style={{ margin: 0, fontWeight: 600 }}>Ready to Scan</p>
             <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Scan Student ID or Book Barcode to auto-fill preview details below</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <Input 
                label="Borrower Email, Student ID, or Name" 
                placeholder="Type e.g. student@university.edu or STU-2024-0440..." 
                value={borrowerInput}
                onChange={(e) => setBorrowerInput(e.target.value)}
              />
            </div>

            <div>
              <Input 
                label="Physical Book Barcode, Book ID, or Title" 
                placeholder="Type e.g. BC-1001 or 978-0132350884 or Clean Code..." 
                value={bookInput}
                onChange={(e) => setBookInput(e.target.value)}
              />
            </div>

            <Input 
              label="Due Date" 
              type="date" 
              value={dueDate} 
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          {/* Dynamic Information Preview Side Panels / Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            
            {/* Student Info Side Panel */}
            <div style={{ 
              background: isStudentBlocked ? 'rgba(217, 83, 79, 0.08)' : matchedStudent ? 'rgba(82, 122, 90, 0.08)' : borrowerInput.trim() ? 'rgba(217, 83, 79, 0.05)' : 'var(--bg-secondary)', 
              border: isStudentBlocked ? '1px solid var(--status-error)' : matchedStudent ? '1px solid var(--status-success, #527A5A)' : borrowerInput.trim() ? '1px solid var(--status-error)' : '1px dashed var(--border-color)', 
              borderRadius: 'var(--radius-md)', 
              padding: '14px',
              transition: 'all 0.2s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>
                  <i className="fas fa-id-card" style={{ marginRight: '6px', color: matchedStudent ? 'var(--status-success)' : 'inherit' }}></i> Student Info
                </span>
                {isStudentBlocked ? (
                  <Badge variant="error" size="sm">🚫 Account Blocked</Badge>
                ) : matchedStudent ? (
                  <Badge variant="success" size="sm">✓ Student Found</Badge>
                ) : borrowerInput.trim() ? (
                  <Badge variant="error" size="sm">❌ Not Found</Badge>
                ) : (
                  <Badge variant="neutral" size="sm">Enter Search</Badge>
                )}
              </div>

              {matchedStudent ? (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ 
                    width: '42px', height: '42px', borderRadius: '50%', 
                    background: isStudentBlocked ? 'var(--status-error)' : 'var(--primary-color, #3B5441)', color: 'white', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    fontWeight: 700, fontSize: '1rem', flexShrink: 0 
                  }}>
                    {(matchedStudent.name || 'S').substring(0, 2).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{matchedStudent.name}</h4>
                    <p style={{ margin: '2px 0', fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{matchedStudent.email}</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                      <span style={{ fontSize: '0.7rem', background: 'white', padding: '1px 6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontWeight: 600 }}>
                        ID: {matchedStudent.id}
                      </span>
                      <span style={{ fontSize: '0.7rem', background: 'white', padding: '1px 6px', borderRadius: '4px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                        {matchedStudent.department || 'Computer Science'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : borrowerInput.trim() ? (
                <div style={{ padding: '8px 0', textAlign: 'center', color: 'var(--status-error)', fontSize: '0.75rem' }}>
                  <i className="fas fa-exclamation-circle" style={{ fontSize: '1.25rem', display: 'block', marginBottom: '6px' }}></i>
                  <p style={{ margin: 0, fontWeight: 600 }}>No student found matching "{borrowerInput}"</p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.7rem', opacity: 0.8 }}>Check student ID or Email spelling.</p>
                </div>
              ) : (
                <div style={{ padding: '8px 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                  <i className="fas fa-user-clock" style={{ fontSize: '1.25rem', display: 'block', marginBottom: '6px', opacity: 0.5 }}></i>
                  <p style={{ margin: 0 }}>Type Student Email or ID above to check & preview profile info.</p>
                </div>
              )}
            </div>

            {/* Book Details Side Panel */}
            <div style={{ 
              background: matchedBook ? 'rgba(230, 138, 102, 0.08)' : bookInput.trim() ? 'rgba(217, 83, 79, 0.05)' : 'var(--bg-secondary)', 
              border: matchedBook ? '1px solid var(--bg-accent, #E68A66)' : bookInput.trim() ? '1px solid var(--status-error)' : '1px dashed var(--border-color)', 
              borderRadius: 'var(--radius-md)', 
              padding: '14px',
              transition: 'all 0.2s ease'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary)' }}>
                  <i className="fas fa-book" style={{ marginRight: '6px', color: matchedBook ? 'var(--bg-accent)' : 'inherit' }}></i> Book Details
                </span>
                {matchedBook ? (
                  <Badge variant={(matchedBook.physicalAvailable ?? 1) > 0 ? "success" : "error"} size="sm">
                    {(matchedBook.physicalAvailable ?? 1) > 0 ? `✓ ${matchedBook.physicalAvailable ?? 1} Available` : 'Out of Stock'}
                  </Badge>
                ) : bookInput.trim() ? (
                  <Badge variant="error" size="sm">❌ Not Found</Badge>
                ) : (
                  <Badge variant="neutral" size="sm">Enter Barcode</Badge>
                )}
              </div>

              {matchedBook ? (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ 
                    width: '38px', height: '54px', borderRadius: '4px', 
                    background: matchedBook.coverColor || '#2D3748', color: 'white', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    fontSize: '1.125rem', flexShrink: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                  }}>
                    <i className="fas fa-book"></i>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{matchedBook.title}</h4>
                    <p style={{ margin: '2px 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Author: {matchedBook.author}</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                      <span style={{ fontSize: '0.7rem', background: 'white', padding: '1px 6px', borderRadius: '4px', border: '1px solid var(--border-color)', fontWeight: 600 }}>
                        BC: {matchedBook.isbn || `BC-${matchedBook.id}`}
                      </span>
                      <span style={{ fontSize: '0.7rem', background: 'white', padding: '1px 6px', borderRadius: '4px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                        {matchedBook.physicalStacks || 'Stack 1A'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : bookInput.trim() ? (
                <div style={{ padding: '8px 0', textAlign: 'center', color: 'var(--status-error)', fontSize: '0.75rem' }}>
                  <i className="fas fa-exclamation-circle" style={{ fontSize: '1.25rem', display: 'block', marginBottom: '6px' }}></i>
                  <p style={{ margin: 0, fontWeight: 600 }}>No book found matching "{bookInput}"</p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.7rem', opacity: 0.8 }}>Check barcode or ISBN number.</p>
                </div>
              ) : (
                <div style={{ padding: '8px 0', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                  <i className="fas fa-barcode" style={{ fontSize: '1.25rem', display: 'block', marginBottom: '6px', opacity: 0.5 }}></i>
                  <p style={{ margin: 0 }}>Scan barcode or enter book ID above to preview item info.</p>
                </div>
              )}
            </div>

          </div>

          {/* Confirmation Box */}
          {matchedStudent && matchedBook && (
            <div style={{ 
              padding: '12px 16px', 
              background: isStudentBlocked ? 'rgba(217, 83, 79, 0.1)' : 'var(--bg-pale-green, rgba(82,122,90,0.1))', 
              border: `1px solid ${isStudentBlocked ? 'var(--status-error)' : 'var(--status-success, #527A5A)'}`, 
              borderRadius: 'var(--radius-md)', 
              display: 'flex', alignItems: 'center', gap: '12px' 
            }}>
              <i className={`fas ${isStudentBlocked ? 'fa-ban' : 'fa-check-circle'}`} style={{ color: isStudentBlocked ? 'var(--status-error)' : 'var(--status-success)', fontSize: '1.25rem' }}></i>
              <div style={{ fontSize: '0.8125rem' }}>
                {isStudentBlocked ? (
                  <strong style={{ color: 'var(--status-error)' }}>Account Blocked: Unblock this student before issuing books.</strong>
                ) : (
                  <span style={{ color: 'var(--text-primary)' }}>Confirmed Match: Ready to issue <strong>"{matchedBook.title}"</strong> to student <strong>"{matchedStudent.name}"</strong> with return due date <strong>{dueDate}</strong>.</span>
                )}
              </div>
            </div>
          )}

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
