import React, { useEffect, useState } from 'react';
import { Button, Badge } from '../../components/ui';
import { ModeratorService } from '../../services/moderatorService';
import { Book } from '../../services/bookService';
import './Moderator.css';

export const ModInventory: React.FC = () => {
  const [inventory, setInventory] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ModeratorService.getInventory()
      .then(res => {
        if (Array.isArray(res)) setInventory(res);
      })
      .catch(err => console.error("Failed to load inventory:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mod-card-header">
        <div>
          <h1 className="mod-card-title">Physical Inventory Tracking</h1>
          <p style={{ color: 'var(--bg-secondary-text)', fontSize: '0.875rem' }}>Track physical copy counts, barcodes, and shelf locations in database.</p>
        </div>
        <Button variant="primary" icon="fas fa-barcode">Scan New Copy</Button>
      </div>

      <div className="mod-card">
        {loading ? (
          <p style={{ color: 'var(--bg-secondary-text)', padding: '20px 0' }}>Loading inventory items...</p>
        ) : inventory.length === 0 ? (
          <p style={{ color: 'var(--bg-secondary-text)', padding: '20px 0' }}>No physical inventory items found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="mod-table">
              <thead>
                <tr>
                  <th>Book Title</th>
                  <th>ISBN</th>
                  <th>Stacks Location</th>
                  <th>Physical Copies</th>
                  <th>Available</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map(book => (
                  <tr key={book.id}>
                    <td><strong>{book.title}</strong></td>
                    <td>{book.isbn}</td>
                    <td>
                      <span style={{ fontSize: '0.875rem' }}>{book.physicalStacks || 'Stack 1A'}</span>
                    </td>
                    <td>{book.physicalCopies ?? 1} Copies</td>
                    <td>
                      <Badge variant={(book.physicalAvailable ?? 1) > 0 ? 'success' : 'error'} size="sm">
                        {book.physicalAvailable ?? 1} Available
                      </Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <Button size="sm" variant="outline" title="Edit Location"><i className="fas fa-edit"></i> Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
