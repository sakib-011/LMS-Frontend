import React, { useState } from 'react';
import { Button, Badge } from '../../components/ui';
import { ModeratorService } from '../../services/moderatorService';
import './Moderator.css';

export const ModReturns: React.FC = () => {
  const [barcode, setBarcode] = useState('');
  const [borrowingIdInput, setBorrowingIdInput] = useState('');
  const [resultMsg, setResultMsg] = useState('');

  const handleConfirmReturn = async () => {
    try {
      const bId = borrowingIdInput || barcode || 'b1';
      await ModeratorService.processReturn(bId);
      setResultMsg(`Return processed successfully for borrowing/book ID ${bId} in database! Physical copy count incremented.`);
      setBarcode('');
      setBorrowingIdInput('');
    } catch (err: any) {
      console.error("Failed to process return:", err);
      setResultMsg(err.response?.data?.message || err.response?.data || "Failed to process return in database");
    }
  };

  return (
    <div>
      <div className="mod-card-header">
        <div>
          <h1 className="mod-card-title">Process Return</h1>
          <p style={{ color: 'var(--bg-secondary-text)', fontSize: '0.875rem' }}>Scan or enter a borrowing/book ID to process its return and update copy counts.</p>
        </div>
      </div>

      {resultMsg && (
        <div style={{ backgroundColor: 'rgba(82,122,90,0.1)', border: '1px solid var(--bg-success)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', marginBottom: 'var(--space-6)', color: 'var(--bg-success)', fontWeight: 500 }}>
          <i className="fas fa-check-circle" style={{ marginRight: 8 }}></i>
          {resultMsg}
        </div>
      )}

      <div className="mod-card" style={{ maxWidth: 600, margin: '0 auto' }}>
        <h2 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-4)' }}>Scan Book Barcode / Enter Borrowing ID</h2>
        <div className="mod-form-group">
          <input 
            type="text" 
            className="mod-input" 
            placeholder="Scan barcode or enter Borrowing ID (e.g. b1 or ISBN)..." 
            value={barcode}
            onChange={e => { setBarcode(e.target.value); setBorrowingIdInput(e.target.value); }}
          />
        </div>

        {barcode && (
          <div style={{ marginTop: 'var(--space-6)', borderTop: '1px solid var(--bg-border)', paddingTop: 'var(--space-6)' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-4)' }}>Return Details</h3>
            
            <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
              <div style={{ width: 60, height: 90, background: '#2D3748', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem' }}>
                <i className="fas fa-book"></i>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 4px', fontSize: '1.125rem' }}>Target Item: {barcode}</h4>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--bg-secondary-text)' }}>Ready for return processing</p>
                
                <div style={{ marginTop: 'var(--space-3)', display: 'flex', gap: 'var(--space-2)' }}>
                  <Badge variant="success">Active Loan</Badge>
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-background)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--bg-secondary-text)' }}>Scan Timestamp</span>
                <strong>Now</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--bg-secondary-text)' }}>Action</span>
                <strong style={{ color: 'var(--bg-success)' }}>Process Return & Restock</strong>
              </div>
            </div>

            <Button variant="primary" size="lg" style={{ width: '100%' }} onClick={handleConfirmReturn}>
              Confirm Return in Database
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
