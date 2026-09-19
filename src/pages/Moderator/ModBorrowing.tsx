import React, { useEffect, useState } from 'react';
import { Button, Badge, DataTable } from '../../components/ui';
import { ModeratorService } from '../../services/moderatorService';
import { BookService, Book } from '../../services/bookService';
import { BorrowedBookItem } from '../../services/studentService';
import './Moderator.css';

export const ModBorrowing: React.FC = () => {
  const [studentId, setStudentId] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [issuedMessage, setIssuedMessage] = useState('');
  const [activeBorrowings, setActiveBorrowings] = useState<BorrowedBookItem[]>([]);

  useEffect(() => {
    BookService.getBooks()
      .then(res => {
        if (Array.isArray(res)) setBooks(res);
      })
      .catch(err => console.error("Failed to load books:", err));

    ModeratorService.getBorrowings()
      .then(res => {
        if (Array.isArray(res)) setActiveBorrowings(res);
      })
      .catch(err => console.error("Failed to load active borrowings:", err));
  }, []);

  const selectedBook = books.find(b => b.id === selectedBookId);

  const handleConfirmIssue = async () => {
    try {
      const email = studentId.includes('@') ? studentId : 'student@university.edu';
      const bId = selectedBookId || (books[0]?.id || '');
      await ModeratorService.issueBook(email, bId);
      setIssuedMessage(`Successfully issued "${selectedBook?.title || 'Book'}" to student (${email}) in database!`);
      setSelectedBookId('');
      setStudentId('');
      // Refresh borrowings list
      ModeratorService.getBorrowings().then(res => { if (Array.isArray(res)) setActiveBorrowings(res); });
    } catch (err: any) {
      console.error("Failed to issue book:", err);
      setIssuedMessage(err.response?.data?.message || err.response?.data || "Failed to issue book");
    }
  };

  const columns = [
    { key: 'book', header: 'Book Title', render: (item: any) => <span style={{ fontWeight: 500 }}>{item.book?.title || 'Borrowed Book'}</span> },
    { key: 'borrowDate', header: 'Issue Date', render: (item: any) => item.borrowDate || 'Today' },
    { key: 'dueDate', header: 'Due Date', render: (item: any) => item.dueDate || 'In 14 Days' },
    { key: 'status', header: 'Status', render: (item: any) => (
      <Badge variant={item.isOverdue ? 'error' : 'success'}>
        {item.isOverdue ? 'Overdue' : 'Active'}
      </Badge>
    )}
  ];

  return (
    <div>
      <div className="mod-card-header">
        <div>
          <h1 className="mod-card-title">Issue Book (Borrowing)</h1>
          <p style={{ color: 'var(--bg-secondary-text)', fontSize: '0.875rem' }}>Scan or enter student ID/email and select book to checkout.</p>
        </div>
      </div>

      {issuedMessage && (
        <div style={{ backgroundColor: 'rgba(82,122,90,0.1)', border: '1px solid var(--bg-success)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', marginBottom: 'var(--space-6)', color: 'var(--bg-success)', fontWeight: 500 }}>
          <i className="fas fa-check-circle" style={{ marginRight: 8 }}></i>
          {issuedMessage}
        </div>
      )}

      <div className="std-grid-2col">
        <div className="mod-card">
          <h2 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-4)' }}>1. Student Information</h2>
          <div className="mod-form-group">
            <input 
              type="text" 
              className="mod-input" 
              placeholder="Enter Student Email or ID (e.g. student@university.edu)..." 
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
            />
          </div>
          
          <div style={{ padding: 'var(--space-4)', background: 'var(--bg-background)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--bg-success)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--bg-accent-blue)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                <i className="fas fa-user"></i>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>{studentId || 'Select Student'}</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.875rem', color: 'var(--bg-secondary-text)' }}>University Student Account</p>
                <div style={{ marginTop: 'var(--space-2)', display: 'flex', gap: 'var(--space-2)' }}>
                  <Badge variant="success" size="sm">Eligible</Badge>
                  <Badge variant="neutral" size="sm">Active Account</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mod-card">
          <h2 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-4)' }}>2. Select Book to Issue</h2>
          <div className="mod-form-group">
            <select
              className="mod-input"
              value={selectedBookId}
              onChange={e => setSelectedBookId(e.target.value)}
            >
              <option value="">Select Catalog Book...</option>
              {books.map(b => (
                <option key={b.id} value={b.id}>{b.title} ({b.physicalAvailable ?? 1} available)</option>
              ))}
            </select>
          </div>
          
          {selectedBook && (
            <div style={{ padding: 'var(--space-4)', background: 'var(--bg-background)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                <div style={{ width: 48, height: 72, background: selectedBook.coverColor || '#2D3748', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                  <i className="fas fa-book"></i>
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '1rem' }}>{selectedBook.title}</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.875rem', color: 'var(--bg-secondary-text)' }}>Author: {selectedBook.author} · Stacks: {selectedBook.physicalStacks || 'Stack 1A'}</p>
                  
                  <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3)', background: 'white', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--bg-secondary-text)' }}>Issue Date</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Today</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.875rem', color: 'var(--bg-secondary-text)' }}>Due Date</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--bg-error)' }}>+14 Days</span>
                    </div>
                  </div>
                  
                  <Button variant="primary" style={{ width: '100%', marginTop: 'var(--space-4)' }} onClick={handleConfirmIssue}>
                    Confirm Issue in Database
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mod-card" style={{ marginTop: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h2 className="mod-card-title">Recent Active Borrowings</h2>
          <Badge variant="neutral">{activeBorrowings.length} Books</Badge>
        </div>
        <DataTable data={activeBorrowings} columns={columns} />
      </div>
    </div>
  );
};
