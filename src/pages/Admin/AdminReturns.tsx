import React, { useState, useEffect } from 'react';
import { Button, Badge, Modal, ConfirmationDialog } from '../../components/ui';
import { ModeratorService } from '../../services/moderatorService';
import './Admin.css';

export const AdminReturns: React.FC = () => {
  const [returnsList, setReturnsList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnBarcode, setReturnBarcode] = useState('');
  
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, title: string, message: string, isDestructive?: boolean}>({ isOpen: false, title: '', message: '' });

  useEffect(() => {
    ModeratorService.getBorrowings()
      .then((data: any) => setReturnsList(Array.isArray(data) ? data : []))
      .catch(() => setReturnsList([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredReturns = returnsList.filter(item => {
    return (item.bookTitle || item.book?.title || '').toLowerCase().includes(search.toLowerCase()) || 
           (item.studentName || item.user?.name || '').toLowerCase().includes(search.toLowerCase()) ||
           (item.id || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Process Returns</h1>
          <p className="admin-subtitle">Scan returned books, assess conditions, and review the return log.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <div className="admin-search">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search Return Log..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="primary" onClick={() => setIsReturnModalOpen(true)}>
            <i className="fas fa-barcode" style={{ marginRight: '8px' }}></i> Scan Return
          </Button>
        </div>
      </div>

      <div className="admin-card">
        <h3 style={{ margin: '0 0 var(--space-4) 0', fontSize: '1rem', color: 'var(--text-primary)' }}>Recently Returned Log</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Returned Book</th>
                <th>Borrower</th>
                <th>Return Timeline</th>
                <th>Condition Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReturns.map(item => {
                const wasOverdue = item.returnDate && item.dueDate ? new Date(item.returnDate) > new Date(item.dueDate) : false;
                return (
                  <tr key={item.id}>
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
                      <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Returned: <strong>{item.returnDate || 'Today'}</strong></p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Due: {item.dueDate || 'N/A'}</p>
                    </td>
                    <td>
                      {wasOverdue ? (
                        <Badge variant="error">Returned Late</Badge>
                      ) : (
                        <Badge variant="success">On Time</Badge>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
                        <Button size="sm" variant="outline" title="View Receipt" onClick={() => setConfirmDialog({
                          isOpen: true, title: 'View Receipt', message: `Open return receipt for ${item.id.toUpperCase()}?`
                        })}>
                          <i className="fas fa-receipt"></i>
                        </Button>
                        <Button size="sm" variant="outline" title="Report Damage" onClick={() => setConfirmDialog({
                          isOpen: true, title: 'Report Damage', message: `Flag "${item.book.title}" as damaged by ${item.user.name}? This will open a fine assessment.`, isDestructive: true
                        })}>
                          <i className="fas fa-house-damage" style={{ color: 'var(--status-warning)' }}></i>
                        </Button>
                        {wasOverdue && (
                          <Button size="sm" variant="outline" title="Assess Fine" onClick={() => setConfirmDialog({
                            isOpen: true, title: 'Assess Fine', message: `Issue late return fine to ${item.user.name}?`
                          })}>
                            <i className="fas fa-file-invoice-dollar" style={{ color: 'var(--status-error)' }}></i>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredReturns.length === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--space-8) 0', color: 'var(--text-secondary)' }}>
              <i className="fas fa-undo-alt" style={{ fontSize: '2rem', marginBottom: 'var(--space-4)', opacity: 0.5 }}></i>
              <p>No returns logged matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Process Return Modal */}
      <Modal 
        isOpen={isReturnModalOpen} 
        onClose={() => setIsReturnModalOpen(false)}
        title="Process Book Return"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setIsReturnModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => {
              setReturnBarcode('');
              setIsReturnModalOpen(false);
              setConfirmDialog({
                isOpen: true,
                title: 'Return Successful',
                message: 'The book has been successfully checked back into inventory and the user loan cleared.'
              });
            }}>Confirm Return</Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Scanner Input */}
          <div style={{ padding: '24px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
             <i className="fas fa-barcode" style={{ fontSize: '3rem', color: 'var(--text-primary)', marginBottom: '16px' }}></i>
             <div style={{ maxWidth: '300px', margin: '0 auto' }}>
               <input 
                 type="text" 
                 placeholder="Scan Barcode or enter Copy ID..." 
                 value={returnBarcode}
                 onChange={(e) => setReturnBarcode(e.target.value)}
                 autoFocus
                 style={{ 
                   width: '100%', padding: '12px 16px', 
                   border: '2px solid var(--bg-warm-orange)', borderRadius: 'var(--radius-full)', 
                   outline: 'none', textAlign: 'center', fontSize: '1rem',
                   boxShadow: '0 0 0 4px rgba(230, 126, 34, 0.1)'
                 }}
               />
             </div>
             <p style={{ margin: '12px 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Scanning a barcode will automatically lookup the active loan.</p>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Returned Condition</label>
            <select style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white' }}>
              <option value="good">Good (No new damage)</option>
              <option value="fair">Fair (Minor wear)</option>
              <option value="damaged">Damaged (Requires review/fine)</option>
            </select>
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
