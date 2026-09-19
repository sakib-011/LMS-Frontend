import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button } from '../../components/ui';
import { ViewToggle } from '../../components/ui/ViewToggle/ViewToggle';
import { BookGridCard } from '../../components/ui/BookCard/BookGridCard';
import { StudentService, DigitalBookItem } from '../../services/studentService';
import './Student.css';

type DigTab = 'all' | 'reading' | 'bookmarked' | 'completed';

export const DigitalLibrary: React.FC = () => {
  const [tab, setTab] = useState<DigTab>('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [digitalBooks, setDigitalBooks] = useState<DigitalBookItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    StudentService.getDigitalLibrary()
      .then(res => {
        if (Array.isArray(res)) setDigitalBooks(res);
      })
      .catch(err => console.error("Failed to load digital books:", err))
      .finally(() => setLoading(false));
  }, []);

  const activeDigital = digitalBooks;
  const continueItem = activeDigital.find(d => d.lastRead) || activeDigital[0];

  const filtered = activeDigital.filter(d =>
    tab === 'all' ? true
    : tab === 'reading' ? d.progress > 0 && d.progress < 100
    : tab === 'bookmarked' ? d.bookmarked
    : d.progress === 100
  );

  return (
    <div>
      <div className="sl-page-header">
        <h1 className="sl-page-title">Digital Library</h1>
        <p className="sl-page-subtitle">Your digital reading collection from database</p>
      </div>

      {/* Continue Reading Banner */}
      {continueItem && (
        <div className="sl-card" style={{ marginBottom: 'var(--space-6)', display: 'flex', gap: 'var(--space-6)', alignItems: 'center', background: 'linear-gradient(135deg, var(--bg-deep-black), #333)' }}>
          <div style={{ width: '5rem', height: '7rem', borderRadius: 'var(--radius-md)', flexShrink: 0, background: continueItem.book?.coverColor || '#2D3748', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', fontSize: '2rem' }}>
            <i className="fas fa-book-open"></i>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ color: 'var(--bg-soft-orange)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>Continue Reading</p>
            <h3 style={{ color: 'white', margin: '0 0 var(--space-1)', fontFamily: 'var(--font-serif)', fontSize: '1.25rem' }}>{continueItem.book?.title || 'Digital Volume'}</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', margin: '0 0 var(--space-3)', fontSize: '0.875rem' }}>Page {continueItem.currentPage || 1} of {continueItem.book?.pages || 350}</p>
            <div className="std-progress-bar" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <div className="std-progress-fill" style={{ width: `${continueItem.progress || 0}%` }}></div>
            </div>
          </div>
          <Link to={`/student/reader/${continueItem.book?.id || continueItem.id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
            <Button variant="secondary">Continue <i className="fas fa-arrow-right" style={{ marginLeft: 8 }}></i></Button>
          </Link>
        </div>
      )}

      {/* Tabs + View Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--bg-border)', marginBottom: 'var(--space-4)' }}>
        <div className="sl-tabs" style={{ borderBottom: 'none', marginBottom: 0 }}>
          {(['all', 'reading', 'bookmarked', 'completed'] as DigTab[]).map(t => (
            <button key={t} className={`sl-tab ${tab === t ? 'sl-tab--active' : ''}`} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase() + t.slice(1)} {tab === t ? `(${filtered.length})` : ''}
            </button>
          ))}
        </div>
        <div style={{ paddingBottom: 2 }}>
          <ViewToggle view={view} onChange={setView} />
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--bg-secondary-text)', padding: '20px 0' }}>Loading digital library...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: 'var(--bg-secondary-text)', padding: '20px 0' }}>No digital books match this category.</p>
      ) : view === 'grid' ? (
        <div className="sbb-grid">
          {filtered.map(d => (
            <BookGridCard 
              key={d.id} 
              book={d.book || { title: 'Digital Book', author: 'Library Catalog', coverColor: '#2D3748' } as any}
              showAvailability={false}
              topRightBadge={d.bookmarked ? <div className="sbb-edition-badge"><i className="fas fa-bookmark" style={{ color: 'var(--bg-warm-orange)' }}></i></div> : undefined}
              actionSlot={
                (d.progress || 0) < 100 ? (
                  <Link to={`/student/reader/${d.book?.id || d.id}`} style={{ textDecoration: 'none', flex: 1 }}>
                    <Button size="sm" variant="primary" style={{ width: '100%' }}>
                      {(d.progress || 0) > 0 ? 'Continue' : 'Start'}
                    </Button>
                  </Link>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                    <Badge variant="success" size="sm">Completed</Badge>
                  </div>
                )
              }
            >
              <div style={{ padding: '6px 10px 10px' }}>
                <div className="std-progress-bar">
                  <div className="std-progress-fill" style={{ width: `${d.progress || 0}%` }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', marginTop: 4 }}>
                  <span style={{ color: 'var(--bg-secondary-text)' }}>Page {d.currentPage || 1} · {d.progress || 0}%</span>
                  {d.lastRead && <span style={{ color: 'var(--bg-secondary-text)' }}>Last: {d.lastRead}</span>}
                </div>
              </div>
            </BookGridCard>
          ))}
        </div>
      ) : (
        /* List view */
        <div className="std-books-table">
          {filtered.map(d => (
            <div key={d.id} className="std-list-card">
              <div className="std-list-book-cover" style={{ background: d.book?.coverColor || '#2D3748' }}>
                <i className="fas fa-book-open"></i>
              </div>
              <div className="std-list-book-info">
                <p className="std-list-title">{d.book?.title || 'Digital Book'}</p>
                <p className="std-list-author">{d.book?.author || 'Library Catalog'}</p>
                <div className="std-progress-bar-wrap">
                  <div className="std-progress-bar">
                    <div className="std-progress-fill" style={{ width: `${d.progress || 0}%` }}></div>
                  </div>
                  <span className="std-progress-label">Page {d.currentPage || 1} · {d.progress || 0}% complete</span>
                </div>
                {d.lastRead && <span style={{ fontSize: '0.75rem', color: 'var(--bg-secondary-text)', marginTop: 4, display: 'block' }}>Last read: {d.lastRead}</span>}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-2)', flexShrink: 0 }}>
                {d.bookmarked && <Badge variant="secondary" size="sm"><i className="fas fa-bookmark"></i> Bookmarked</Badge>}
                {d.progress === 100 && <Badge variant="success" size="sm">Completed</Badge>}
                {(d.progress || 0) < 100 && (
                  <Link to={`/student/reader/${d.book?.id || d.id}`} style={{ textDecoration: 'none' }}>
                    <Button size="sm" variant="primary">{(d.progress || 0) > 0 ? 'Continue' : 'Start Reading'}</Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
