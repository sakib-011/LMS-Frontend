import React, { useState, useEffect } from 'react';
import { Button, Badge, Modal, Input, ConfirmationDialog } from '../../components/ui';
import { ModeratorService } from '../../services/moderatorService';
import './Admin.css';

export const AdminBorrowing: React.FC = () => {
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, title: string, message: string, isDestructive?: boolean}>({ isOpen: false, title: '', message: '' });

  useEffect(() => {
    ModeratorService.getBorrowings()
      .then((data: any) => setBorrowings(Array.isArray(data) ? data : []))
      .catch(() => setBorrowings([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredBorrowings = borrowings.filter(item => {
    const matchesSearch = (item.bookTitle || item.book?.title || '').toLowerCase().includes(search.toLowerCase()) || 
                          (item.studentName || item.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
                          (item.id || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'All' || 
                          (filterStatus === 'Overdue' && item.isOverdue) ||
                          (filterStatus === 'Active' && !item.isOverdue);
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Circulation & Borrowing</h1>
          <p className="admin-subtitle">Issue books, manage active loans, and track overdue items.</p>
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
              {filteredBorrowings.map(item => (
                <tr key={item.id} style={{ background: item.isOverdue ? 'var(--bg-pale-peach)' : 'transparent' }}>
                  <td>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{(item.id || '').toUpperCase()}</p>
                  </td>
                  <td>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{item.bookTitle || item.book?.title || 'Book'}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ISBN: {item.isbn || item.book?.isbn || 'N/A'}</p>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <div style={{ 
                        width: '28px', height: '28px', borderRadius: '50%', 
                        background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', fontWeight: 'bold'
                      }}>
                        {(item.studentName || item.user?.name || 'User').substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{item.studentName || item.user?.name || 'User'}</p>
                        <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>ID: {item.studentId || item.user?.id || 'STD-001'}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Due: <strong style={{ color: item.isOverdue ? 'var(--status-error)' : 'inherit' }}>{item.dueDate}</strong></p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Borrowed: {item.borrowDate}</p>
                  </td>
                  <td>
                    {item.isOverdue ? (
                      <Badge variant="error">Overdue</Badge>
                    ) : (
                      <Badge variant="success">Active</Badge>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                      <Button size="sm" variant="outline" title="Renew / Extend Loan" onClick={() => setConfirmDialog({
                        isOpen: true, title: 'Renew Loan', message: `Extend the due date for "${item.bookTitle || item.book?.title}" by 14 days?`
                      })}>
                        <i className="fas fa-calendar-plus"></i>
                      </Button>
                      <Button size="sm" variant="outline" title="Mark as Returned" onClick={() => setConfirmDialog({
                        isOpen: true, title: 'Process Return', message: `Mark "${item.bookTitle || item.book?.title}" as returned and update inventory?`
                      })}>
                        <i className="fas fa-undo-alt" style={{ color: 'var(--status-success)' }}></i>
                      </Button>
                      {item.isOverdue && (
                        <Button size="sm" variant="outline" title="Send Overdue Reminder" onClick={() => setConfirmDialog({
                          isOpen: true, title: 'Send Reminder', message: `Send an automated overdue email reminder to ${item.studentName || item.user?.name}?`
                        })}>
                          <i className="fas fa-bell" style={{ color: 'var(--status-error)' }}></i>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredBorrowings.length === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--space-8) 0', color: 'var(--text-secondary)' }}>
              <i className="fas fa-book-reader" style={{ fontSize: '2rem', marginBottom: 'var(--space-4)', opacity: 0.5 }}></i>
              <p>No active loans found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Issue Book Modal */}
      <Modal 
        isOpen={isIssueModalOpen} 
        onClose={() => setIsIssueModalOpen(false)}
        title="Issue New Book (Checkout)"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setIsIssueModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setIsIssueModalOpen(false)}>Complete Checkout</Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Scanner Simulation */}
          <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '2px dashed var(--border-color)', textAlign: 'center' }}>
             <i className="fas fa-barcode" style={{ fontSize: '2rem', color: 'var(--text-secondary)', marginBottom: '8px' }}></i>
             <p style={{ margin: 0, fontWeight: 600 }}>Ready to Scan</p>
             <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Scan User ID or Book Barcode to auto-fill</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input label="Borrower Email or Student ID" placeholder="e.g. student@university.edu" />
            <Input label="Physical Book Barcode or Book ID" placeholder="e.g. BC-1002" />
            <Input label="Due Date" type="date" defaultValue="2026-09-30" />
          </div>

        </div>
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
