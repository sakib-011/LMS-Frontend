import React, { useState, useEffect } from 'react';
import { Button, Badge, ConfirmationDialog, Modal } from '../../components/ui';
import { ModeratorService } from '../../services/moderatorService';
import './Admin.css';

export const AdminFines: React.FC = () => {
  const [fines, setFines] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Unpaid');
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isBookDropdownOpen, setIsBookDropdownOpen] = useState(false);
  const [selectedFine, setSelectedFine] = useState<any>(null);
  const [bookSearch, setBookSearch] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, title: string, message: string, isDestructive?: boolean}>({ isOpen: false, title: '', message: '' });

  useEffect(() => {
    ModeratorService.getFines()
      .then((data: any) => setFines(Array.isArray(data) ? data : []))
      .catch(() => setFines([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredFines = fines.filter(item => {
    const matchesSearch = (item.studentName || item.user?.name || '').toLowerCase().includes(search.toLowerCase()) || 
                          (item.id || '').toLowerCase().includes(search.toLowerCase()) ||
                          (item.studentId || item.user?.id || '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalUnpaid = fines.filter(f => f.status === 'Unpaid').reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Fines & Penalties</h1>
          <p className="admin-subtitle">Manage late fees, damage charges, and process user payments.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <div className="admin-search">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search User or Fine ID..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '0 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-white)', color: 'var(--text-secondary)' }}
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
            <p>$145.50</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
            <i className="fas fa-users-slash"></i>
          </div>
          <div className="admin-stat-content">
            <h3>Blocked Accounts</h3>
            <p>12 Users</p>
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
                <tr key={item.id} style={{ opacity: item.status !== 'Unpaid' ? 0.6 : 1 }}>
                  <td>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{(item.id || '').toUpperCase()}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.issueDate || ''}</p>
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
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{item.reason || 'Overdue Fine'}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.bookTitle || item.book?.title || 'Book'}</p>
                  </td>
                  <td>
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>${(item.amount || 0).toFixed(2)}</p>
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
                            <i className="fas fa-credit-card" style={{ color: 'var(--status-success)' }}></i>
                          </Button>
                          <Button size="sm" variant="outline" title="Waive Fine" onClick={() => setConfirmDialog({
                            isOpen: true, title: 'Waive Fine', message: `Are you sure you want to waive the $${item.amount.toFixed(2)} fine for ${item.user.name}? This will clear the balance.`
                          })}>
                            <i className="fas fa-eraser" style={{ color: 'var(--status-warning)' }}></i>
                          </Button>
                          <Button size="sm" variant="outline" title="Send Invoice Reminder" onClick={() => setConfirmDialog({
                            isOpen: true, title: 'Send Invoice Reminder', message: `Send an automated fine reminder email to ${item.user.name}?`
                          })}>
                            <i className="fas fa-envelope"></i>
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" variant="outline" title="View Receipt" onClick={() => setConfirmDialog({
                          isOpen: true, title: 'View Receipt', message: `Open payment receipt for ${item.id.toUpperCase()}?`
                        })}>
                          <i className="fas fa-receipt"></i>
                        </Button>
                      )}
                      
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredFines.length === 0 && (
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
            <Button variant="primary" onClick={() => {
              setIsPaymentModalOpen(false);
              setSelectedFine(null);
              setConfirmDialog({
                isOpen: true,
                title: 'Payment Successful',
                message: 'The fine has been successfully paid and the user account holds have been cleared.'
              });
            }}>Confirm Payment</Button>
          </div>
        }
      >
        {selectedFine && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '16px', background: 'var(--bg-pale-peach)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
               <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--status-error)' }}>Amount Due</p>
               <p style={{ margin: '4px 0 0 0', fontSize: '2.5rem', fontWeight: 700, color: 'var(--status-error)' }}>${selectedFine.amount.toFixed(2)}</p>
            </div>

            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>{selectedFine.user.name}</p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Reason: {selectedFine.reason} ({selectedFine.book.title})</p>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Payment Method</label>
              <select style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white' }}>
                <option value="cash">Cash at Desk</option>
                <option value="card_pos">Credit Card (POS Terminal)</option>
                <option value="online_verification">Online Payment Verification</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <input type="checkbox" id="emailReceipt" defaultChecked />
              <label htmlFor="emailReceipt" style={{ fontSize: '0.875rem', cursor: 'pointer' }}>Email receipt to user</label>
            </div>
          </div>
        )}
      </Modal>

      {/* Issue New Fine Modal */}
      <Modal 
        isOpen={isIssueModalOpen} 
        onClose={() => setIsIssueModalOpen(false)}
        title="Issue New Fine"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="outline" onClick={() => setIsIssueModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => {
              setIsIssueModalOpen(false);
              setConfirmDialog({
                isOpen: true,
                title: 'Fine Issued',
                message: 'The new fine has been successfully applied to the user account.'
              });
            }}>Submit Fine</Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>User Account</label>
            <select style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white' }}>
              <option value="student1">Student Account (student@university.edu)</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Reason</label>
              <select style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white' }}>
                <option value="late">Late Return</option>
                <option value="damaged">Damaged Material</option>
                <option value="lost">Lost Item Replacement</option>
                <option value="other">Other / Manual Charge</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Amount ($)</label>
              <input type="number" min="0" step="0.01" placeholder="0.00" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }} />
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Related Book (Optional)</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}></i>
                <input 
                  type="text" 
                  placeholder="Type to search books..." 
                  value={bookSearch}
                  onChange={(e) => {
                    setBookSearch(e.target.value);
                    setIsBookDropdownOpen(true);
                  }}
                  onFocus={() => setIsBookDropdownOpen(true)}
                  onBlur={() => setTimeout(() => setIsBookDropdownOpen(false), 200)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setIsBookDropdownOpen(true); } }}
                  style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', outline: 'none' }}
                />
              </div>
              <Button variant="primary" onClick={() => setIsBookDropdownOpen(true)}>Search</Button>
            </div>
            
            {isBookDropdownOpen && (
              <div style={{ background: 'white', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', marginTop: '8px', maxHeight: '160px', overflowY: 'auto', boxShadow: 'var(--shadow-sm)' }}>
                    <div 
                      style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }}
                      onClick={() => { setBookSearch(''); setIsBookDropdownOpen(false); }}
                    >
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>None / Not Applicable</span>
                    </div>
                    {fines.map(f => f.book).filter(Boolean).length > 0 ? fines.map(f => f.book).filter(Boolean).map((b: any, idx: number) => (
                      <div 
                        key={b.id || idx}
                        style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}
                        onClick={() => { setBookSearch(`${b.title} (ISBN: ${b.isbn || 'N/A'})`); setIsBookDropdownOpen(false); }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'var(--bg-pale-peach)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                      >
                        <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{b.title}</p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>ISBN: {b.isbn || 'N/A'}</p>
                      </div>
                    )) : (
                      <div style={{ padding: '8px 12px', color: 'var(--status-error)', fontSize: '0.875rem' }}>No books match your search.</div>
                    )}
                  </div>
            )}
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Internal Notes</label>
            <textarea 
              rows={3}
              placeholder="Add details about the damage or reason for manual charge..."
              style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontFamily: 'inherit', resize: 'vertical' }}
            />
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
