import React, { useEffect, useState } from 'react';
import { Badge, Button, Input } from '../../components/ui';
import { StudentService, BookRequestItem } from '../../services/studentService';
import './Student.css';

const statusBadge = (s: string) => {
  if (s === 'approved') return <Badge variant="success">Approved</Badge>;
  if (s === 'rejected') return <Badge variant="error">Rejected</Badge>;
  if (s === 'acquired') return <Badge variant="primary">Acquired</Badge>;
  return <Badge variant="neutral">Pending</Badge>;
};

export const BookRequests: React.FC = () => {
  const [requests, setRequests] = useState<BookRequestItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', author: '', isbn: '', reason: '' });
  const [submitted, setSubmitted] = useState(false);

  const fetchRequests = async () => {
    try {
      const data = await StudentService.getRequests();
      if (Array.isArray(data)) {
        setRequests(data);
      }
    } catch (err) {
      console.error("Failed to load requests:", err);
      setRequests([]);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newReq = await StudentService.createRequest(form);
      setRequests(prev => [newReq, ...prev]);
      setSubmitted(true);
      setShowForm(false);
      setForm({ title: '', author: '', isbn: '', reason: '' });
    } catch (err) {
      console.error("Failed to create request:", err);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
        <div className="sl-page-header" style={{ marginBottom: 0 }}>
          <h1 className="sl-page-title">Book Requests</h1>
          <p className="sl-page-subtitle">Request books not currently in the catalog</p>
        </div>
        <Button variant="primary" icon="fas fa-plus" onClick={() => setShowForm(f => !f)}>
          New Request
        </Button>
      </div>

      {submitted && (
        <div style={{ backgroundColor: 'rgba(82,122,90,0.1)', border: '1px solid var(--bg-success)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', marginBottom: 'var(--space-6)', display: 'flex', gap: 'var(--space-3)', color: 'var(--bg-success)' }}>
          <i className="fas fa-check-circle"></i>
          <span>Your request has been submitted to database. Our librarians will review it shortly.</span>
        </div>
      )}

      {showForm && (
        <div className="sl-card" style={{ marginBottom: 'var(--space-6)' }}>
          <h2 className="sl-card-title">New Book Request</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <Input label="Book Title" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              <Input label="Author" placeholder="Author" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} required />
            </div>
            <Input label="ISBN (optional)" placeholder="ISBN" value={form.isbn} onChange={e => setForm({ ...form, isbn: e.target.value })} />
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: 'var(--space-1)' }}>Reason for Request</label>
              <textarea
                required
                rows={3}
                style={{ width: '100%', padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-sans)', fontSize: '1rem', outline: 'none', resize: 'vertical' }}
                placeholder="Why should this book be added to the library?"
                value={form.reason}
                onChange={e => setForm({ ...form, reason: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <Button type="submit" variant="primary">Submit Request</Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <div className="std-books-table">
        {requests.map(req => (
          <div key={req.id} className="std-list-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
              <div>
                <p className="std-list-title">{req.title}</p>
                <p className="std-list-author">by {req.author}</p>
              </div>
              {statusBadge(req.status)}
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--bg-secondary-text)', marginBottom: 'var(--space-2)' }}>{req.reason}</p>
            {req.notes && (
              <p style={{ fontSize: '0.8125rem', backgroundColor: 'var(--bg-warm-cream)', padding: 'var(--space-2) var(--space-3)', borderRadius: 'var(--radius-sm)', color: 'var(--bg-primary-text)', marginBottom: 'var(--space-2)' }}>
                <strong>Librarian Note:</strong> {req.notes}
              </p>
            )}
            <p style={{ fontSize: '0.75rem', color: 'var(--bg-secondary-text)' }}>Submitted: {req.submittedDate || 'Today'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
