import React, { useState } from 'react';
import { Button } from '../../components/ui';
import { ViewToggle } from '../../components/ui/ViewToggle/ViewToggle';
import { BookGridCard } from '../../components/ui/BookCard/BookGridCard';
import './Student.css';

export const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  return (
    <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-6)' }}>
      <div className="sl-page-header" style={{ marginBottom: 0 }}>
        <h1 className="sl-page-title">My Reviews</h1>
        <p className="sl-page-subtitle">{reviews.length} reviews written</p>
      </div>
      <ViewToggle view={view} onChange={setView} />
    </div>

    {reviews.length === 0 ? (
      <div style={{ textAlign: 'center', padding: 'var(--space-12)', color: 'var(--bg-secondary-text)' }}>
        <i className="fas fa-star" style={{ fontSize: '3rem', opacity: 0.3, marginBottom: 'var(--space-4)' }}></i>
        <p>You haven't written any book reviews yet.</p>
      </div>
    ) : view === 'grid' ? (
      <div className="sbb-grid">
        {reviews.map(rev => (
          <BookGridCard
            key={rev.id}
            book={rev.book}
            showAvailability={false}
            topRightBadge={<div className="sbb-edition-badge"><i className="fas fa-star" style={{ color: 'var(--bg-warm-orange)' }}></i> {rev.rating}</div>}
            actionSlot={
              <>
                <Button size="sm" variant="outline" icon="fas fa-edit" style={{ flex: 1 }}>Edit</Button>
                <Button size="sm" variant="danger" style={{ flex: 1 }}>Delete</Button>
              </>
            }
          >
            <div style={{ padding: '0 10px 10px', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ flex: 1 }}>
                <p style={{ color: 'var(--bg-primary-text)', fontSize: '0.75rem', lineHeight: 1.4, margin: '6px 0 0', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  "{rev.comment}"
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--bg-border)' }}>
                <span style={{ fontSize: '0.625rem', color: 'var(--bg-secondary-text)' }}>{rev.date}</span>
                <span style={{ fontSize: '0.625rem', color: 'var(--bg-secondary-text)' }}>
                  <i className="fas fa-thumbs-up"></i> {rev.helpful}
                </span>
              </div>
            </div>
          </BookGridCard>
        ))}
      </div>
    ) : (
      <div className="std-books-table">
      {reviews.map(rev => (
        <div key={rev.id} className="std-list-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
            <div className="std-list-book-cover" style={{ background: rev.book.coverColor }}>
              <i className="fas fa-book"></i>
            </div>
            <div style={{ flex: 1 }}>
              <p className="std-list-title">{rev.book.title}</p>
              <p className="std-list-author">by {rev.book.author}</p>
              <div className="sl-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <i key={i} className={`fas fa-star ${i < rev.rating ? '' : 'star-empty'}`}></i>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Button size="sm" variant="outline" icon="fas fa-edit">Edit</Button>
              <Button size="sm" variant="danger">Delete</Button>
            </div>
          </div>
          <p style={{ color: 'var(--bg-primary-text)', fontSize: '0.9375rem', lineHeight: 1.6, margin: 0, fontStyle: 'italic', borderLeft: '3px solid var(--bg-pale-peach)', paddingLeft: 'var(--space-4)' }}>
            "{rev.comment}"
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-3)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--bg-secondary-text)' }}>Written: {rev.date}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--bg-secondary-text)' }}>
              <i className="fas fa-thumbs-up"></i> {rev.helpful} found helpful
            </span>
          </div>
        </div>
      ))}
      </div>
    )}
  </div>
  );
};
