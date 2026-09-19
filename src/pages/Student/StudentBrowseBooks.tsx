import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book } from '../../services/bookService';
import { BookGridCard } from '../../components/ui/BookCard/BookGridCard';
import './StudentBrowseBooks.css';

import { BookService } from '../../services/bookService';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance (Academic Rank)' },
  { value: 'title', label: 'Title A → Z' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'year', label: 'Newest First' },
];

const CATEGORIES = ['Computer Science', 'Engineering', 'Business', 'Mathematics', 'Science', 'Literature', 'History', 'Arts'];

type ExtBook = Book & { edition: string; gateScore: number; physicalStacks: string };

export const StudentBrowseBooks: React.FC = () => {
  const [dbBooks, setDbBooks] = useState<Book[]>([]);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    BookService.getBooks()
      .then(res => {
        if (Array.isArray(res)) {
          setDbBooks(res as any);
        }
      })
      .catch(err => console.error("Failed to load db books:", err));
  }, []);

  const activeCatalog = useMemo(() => {
    return dbBooks.map((b) => ({
      ...b,
      edition: b.edition || '1st Ed.',
      gateScore: (b as any).gateScore || 7.0,
      physicalStacks: b.physicalStacks || 'Stack 1A',
      rating: b.rating || 4.5,
      ratingCount: b.ratingCount || 10,
      description: b.description || b.title,
      coverColor: b.coverColor || '#2D3748',
      physicalCopies: b.physicalCopies ?? 1,
      physicalAvailable: b.physicalAvailable ?? 1,
      hasDigital: b.hasDigital ?? false
    }));
  }, [dbBooks]);

  /* Filter state */
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [availOnly, setAvailOnly] = useState(false);
  const [digitalOnly, setDigitalOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);

  /* Staged filter state (applied only when user clicks Apply) */
  const [staged, setStaged] = useState({ selectedCategories: [] as string[], availOnly: false, digitalOnly: false, minRating: 0 });

  const PER_PAGE = 8;
  const filterRef = useRef<HTMLDivElement>(null);

  /* Close popup on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    };
    if (filterOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [filterOpen]);

  const openFilter = () => {
    setStaged({ selectedCategories, availOnly, digitalOnly, minRating });
    setFilterOpen(true);
  };

  const applyFilter = () => {
    setSelectedCategories(staged.selectedCategories);
    setAvailOnly(staged.availOnly);
    setDigitalOnly(staged.digitalOnly);
    setMinRating(staged.minRating);
    setPage(1);
    setFilterOpen(false);
  };

  const resetFilter = () => {
    setStaged({ selectedCategories: [], availOnly: false, digitalOnly: false, minRating: 0 });
  };

  const clearAll = () => {
    setSelectedCategories([]);
    setAvailOnly(false);
    setDigitalOnly(false);
    setMinRating(0);
    setPage(1);
  };

  const toggleStagedCat = (cat: string) =>
    setStaged(s => ({
      ...s,
      selectedCategories: s.selectedCategories.includes(cat)
        ? s.selectedCategories.filter(c => c !== cat)
        : [...s.selectedCategories, cat],
    }));

  const activeFilterCount =
    selectedCategories.length +
    (availOnly ? 1 : 0) +
    (digitalOnly ? 1 : 0) +
    (minRating > 0 ? 1 : 0);

  const filtered = useMemo(() => {
    let books = activeCatalog.filter(b => {
      const q = query.toLowerCase();
      return (
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        (b.category && b.category.toLowerCase().includes(q)) ||
        (b.isbn && b.isbn.includes(q))
      );
    });
    if (selectedCategories.length > 0) books = books.filter(b => selectedCategories.includes(b.category));
    if (availOnly) books = books.filter(b => (b.physicalAvailable || 0) > 0);
    if (digitalOnly) books = books.filter(b => b.hasDigital);
    if (minRating > 0) books = books.filter(b => (b.rating || 0) >= minRating);
    if (sortBy === 'title') books = [...books].sort((a, b) => a.title.localeCompare(b.title));
    if (sortBy === 'rating') books = [...books].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sortBy === 'year') books = [...books].sort((a, b) => (b.year || 0) - (a.year || 0));
    if (sortBy === 'relevance') books = [...books].sort((a, b) => (b.gateScore || 0) - (a.gateScore || 0));
    return books;
  }, [activeCatalog, query, selectedCategories, availOnly, digitalOnly, minRating, sortBy]);

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));

  return (
    <div className="sbb-shell">
      {/* ── Breadcrumb ── */}
      <div className="sbb-breadcrumb">
        <Link to="/student">Portal</Link>
        <i className="fas fa-chevron-right sbb-bc-sep"></i>
        <span>Library Books</span>
      </div>

      {/* ── Page Header ── */}
      <div className="sbb-page-header">
        <div>
          <h1 className="sbb-page-title">Library Books</h1>
          <p className="sbb-page-sub">Explore the BookGrid collection — find books for physical borrowing or digital reading.</p>
        </div>
        <div className="sbb-sync-badge">
          <span className="sbb-sync-dot"></span>
          Real-time Stacks Sync active
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="sbb-toolbar">
        {/* Search */}
        <div className="sbb-search-wrap">
          <i className="fas fa-search sbb-search-icon"></i>
          <input
            className="sbb-search-input"
            placeholder="Search by title, author, ISBN, subject heading…"
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(1); }}
          />
          {query && (
            <button className="sbb-search-clear" onClick={() => setQuery('')}>
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>

        {/* Filter popup trigger */}
        <div className="sbb-filter-anchor" ref={filterRef}>
          <button className="sbb-filter-btn" onClick={openFilter}>
            <i className="fas fa-sliders-h"></i>
            Filters
            {activeFilterCount > 0 && (
              <span className="sbb-filter-count">{activeFilterCount}</span>
            )}
          </button>

          {/* ── Filter Popup ── */}
          {filterOpen && (
            <div className="sbb-filter-popup">
              <div className="sbb-fp-header">
                <span className="sbb-fp-title"><i className="fas fa-sliders-h"></i> Catalog Filters</span>
                <button className="sbb-fp-reset" onClick={resetFilter}>Reset</button>
              </div>

              {/* Availability */}
              <div className="sbb-fp-section">
                <p className="sbb-fp-label">Availability</p>
                <label className="sbb-fp-check">
                  <input type="checkbox" checked={staged.availOnly} onChange={e => setStaged(s => ({ ...s, availOnly: e.target.checked }))} />
                  <span>Available in Stacks only</span>
                </label>
                <label className="sbb-fp-check">
                  <input type="checkbox" checked={staged.digitalOnly} onChange={e => setStaged(s => ({ ...s, digitalOnly: e.target.checked }))} />
                  <span>Has Digital / PDF access</span>
                </label>
              </div>

              {/* Category */}
              <div className="sbb-fp-section">
                <p className="sbb-fp-label">Academic Discipline</p>
                <div className="sbb-fp-cat-grid">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      className={`sbb-fp-cat-pill ${staged.selectedCategories.includes(cat) ? 'active' : ''}`}
                      onClick={() => toggleStagedCat(cat)}
                    >
                      {cat}
                      {staged.selectedCategories.includes(cat) && <i className="fas fa-check"></i>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minimum Rating */}
              <div className="sbb-fp-section">
                <p className="sbb-fp-label">Minimum Rating</p>
                <div className="sbb-fp-rating-row">
                  {[0, 3, 3.5, 4, 4.5].map(r => (
                    <button
                      key={r}
                      className={`sbb-fp-rating-btn ${staged.minRating === r ? 'active' : ''}`}
                      onClick={() => setStaged(s => ({ ...s, minRating: r }))}
                    >
                      {r === 0 ? 'Any' : (
                        <>
                          <i className="fas fa-star" style={{ color: 'var(--bg-warm-orange)', fontSize: '0.7rem' }}></i>
                          {r}+
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="sbb-fp-footer">
                <button className="sbb-fp-cancel" onClick={() => setFilterOpen(false)}>Cancel</button>
                <button className="sbb-fp-apply" onClick={applyFilter}>
                  Apply Filters
                  {staged.selectedCategories.length + (staged.availOnly ? 1 : 0) + (staged.digitalOnly ? 1 : 0) + (staged.minRating > 0 ? 1 : 0) > 0 && (
                    <span className="sbb-filter-count" style={{ marginLeft: 6 }}>
                      {staged.selectedCategories.length + (staged.availOnly ? 1 : 0) + (staged.digitalOnly ? 1 : 0) + (staged.minRating > 0 ? 1 : 0)}
                    </span>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Find Volume button */}
        <button className="sbb-find-btn">
          <i className="fas fa-database"></i> Find Volume
        </button>
      </div>

      {/* ── Active Filter Tags ── */}
      {activeFilterCount > 0 && (
        <div className="sbb-active-filters">
          <span className="sbb-active-label">ACTIVE:</span>
          {selectedCategories.map(cat => (
            <button key={cat} className="sbb-active-tag" onClick={() => setSelectedCategories(p => p.filter(c => c !== cat))}>
              {cat} <i className="fas fa-times"></i>
            </button>
          ))}
          {availOnly && (
            <button className="sbb-active-tag" onClick={() => setAvailOnly(false)}>
              Available Only <i className="fas fa-times"></i>
            </button>
          )}
          {digitalOnly && (
            <button className="sbb-active-tag" onClick={() => setDigitalOnly(false)}>
              Digital <i className="fas fa-times"></i>
            </button>
          )}
          {minRating > 0 && (
            <button className="sbb-active-tag" onClick={() => setMinRating(0)}>
              ★ {minRating}+ <i className="fas fa-times"></i>
            </button>
          )}
          <button className="sbb-clear-all" onClick={clearAll}>Clear All</button>
        </div>
      )}

      {/* ── Catalog Header ── */}
      <div className="sbb-catalog-header">
        <div className="sbb-result-count">
          <strong>{filtered.length.toLocaleString()}</strong> volumes cataloged across stacks
        </div>
        <div className="sbb-catalog-controls">
          <div className="sbb-view-toggle">
            <button className={`sbb-view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Grid view">
              <i className="fas fa-th"></i>
            </button>
            <button className={`sbb-view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title="List view">
              <i className="fas fa-list"></i>
            </button>
          </div>
          <div className="sbb-sort-wrap">
            <span className="sbb-sort-label">SORT</span>
            <select className="sbb-sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── No results ── */}
      {filtered.length === 0 && (
        <div className="sbb-empty">
          <i className="fas fa-search"></i>
          <p>No books match your search or filters.</p>
          <button className="sbb-fp-cancel" onClick={clearAll} style={{ marginTop: 8 }}>Clear Filters</button>
        </div>
      )}

      {filtered.length > 0 && (
        <div className={viewMode === 'grid' ? 'sbb-grid' : 'sbb-list'}>
          {paginated.map(book =>
            viewMode === 'grid'
              ? <BookGridCard key={book.id} book={book} />
              : <ListCard key={book.id} book={book} />
          )}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="sbb-pagination">
          <button className="sbb-pag-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            <i className="fas fa-chevron-left"></i> Previous
          </button>
          {Array.from({ length: Math.min(totalPages, 6) }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              className={`sbb-pag-num ${page === p ? 'active' : ''}`}
              onClick={() => setPage(p)}
            >{p}</button>
          ))}
          {totalPages > 6 && <span className="sbb-pag-ellipsis">… {totalPages}</span>}
          <button className="sbb-pag-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
            Next <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
};

/* ── Helpers ─────────────────────────────────────────────── */
const CAT_COLORS: Record<string, string> = {
  'Computer Science': '#F28C28',
  'Engineering': '#527A5A',
  'Business': '#234E52',
  'Mathematics': '#652B19',
  'Science': '#1C4532',
  'Literature': '#3D2B1F',
  'History': '#553C1E',
  'Arts': '#322659',
};

const ListCard: React.FC<{ book: ExtBook }> = ({ book }) => {
  const color = CAT_COLORS[book.category] || '#6F6A64';
  return (
    <Link to={`/student/books/${book.id}`} className="sbb-list-card">
      <div className="sbb-list-cover" style={{ background: book.coverColor }}>
        <i className="fas fa-book"></i>
      </div>
      <div className="sbb-list-info">
        <div className="sbb-cat-chip sbb-cat-chip--sm" style={{ color, borderColor: `${color}55`, background: `${color}11` }}>
          {book.category.toUpperCase()}
        </div>
        <p className="sbb-card-title" style={{ fontSize: '1rem' }}>{book.title}</p>
        <p className="sbb-card-author">{book.author} · {book.publisher} · {book.year}</p>
        <p style={{ fontSize: '0.8125rem', color: 'var(--bg-secondary-text)', margin: '4px 0 0', lineHeight: 1.5 }}>
          {book.description.substring(0, 140)}…
        </p>
      </div>
      <div className="sbb-list-meta">
        <div className="sbb-card-rating">
          <i className="fas fa-star sbb-star"></i>
          <strong>{book.rating}</strong>
        </div>
        <div className="sbb-avail-chip" style={{ marginTop: 4 }}>
          <i className="fas fa-building"></i>
          <span>{book.physicalAvailable > 0 ? `${book.physicalAvailable} available` : 'Checked out'}</span>
        </div>
        {book.hasDigital && (
          <div className="sbb-avail-chip sbb-avail-chip--digital" style={{ marginTop: 4 }}>
            <i className="fas fa-tablet-alt"></i><span>Digital</span>
          </div>
        )}
        <div className="sbb-card-actions" style={{ marginTop: 12 }}>
          {book.hasDigital && (
            <button className="sbb-action-btn sbb-action-btn--read" onClick={e => e.preventDefault()}>
              <i className="fas fa-book-open"></i> Read
            </button>
          )}
          <button className="sbb-action-btn sbb-action-btn--reserve" onClick={e => e.preventDefault()}>
            <i className="fas fa-bookmark"></i> Reserve
          </button>
        </div>
      </div>
    </Link>
  );
};
