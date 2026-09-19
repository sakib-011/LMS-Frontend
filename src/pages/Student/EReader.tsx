import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../../components/ui';
import { BookService, Book } from '../../services/bookService';
import { useAuth } from '../../context/AuthContext';
import './Student.css';

type SideTab = 'bookmarks' | 'notes';

const SAMPLE_CONTENT = `The study of algorithms dates back to the ancient world. The word itself derives from the name of the ninth-century Persian mathematician Muhammad ibn Musa al-Khwarizmi, whose works introduced systematic procedures for solving mathematical problems.

But what exactly is an algorithm? Simply put, it is any well-defined computational procedure that takes some value, or set of values, as input and produces some value, or set of values, as output. An algorithm is thus a sequence of computational steps that transform the input into the output.

We can also view an algorithm as a tool for solving a well-specified computational problem. The statement of the problem specifies in general terms the desired input/output relationship. The algorithm describes a specific computational procedure for achieving that input/output relationship.`;

export const EReader: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [activeTab, setActiveTab] = useState<SideTab>('bookmarks');
  const [zoom, setZoom] = useState(100);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const progress = 45;

  useEffect(() => {
    if (id) {
      BookService.getBookById(id)
        .then(data => setBook(data))
        .catch(() => setBook(null));
    }
  }, [id]);

  return (
    <div className="reader-container">
      {/* Topbar */}
      <div className="reader-topbar">
        <div className="reader-topbar-left">
          <Link to="/student/digital-library" style={{ textDecoration: 'none', color: 'var(--bg-secondary-text)' }}>
            <i className="fas fa-arrow-left"></i>
          </Link>
          <h1 className="reader-title">{book?.title || 'e-Book Reader'}</h1>
        </div>
        <div className="reader-topbar-right">
          <button className="reader-icon-btn"><i className="fas fa-search"></i></button>
          <button className={`reader-icon-btn ${isBookmarked ? 'active' : ''}`} onClick={() => setIsBookmarked(!isBookmarked)}>
            <i className="fas fa-bookmark"></i>
          </button>
          <button className="reader-icon-btn"><i className="fas fa-expand"></i></button>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <i className="fas fa-user" style={{ color: 'var(--bg-secondary-text)' }}></i>
          </div>
        </div>
      </div>

      <div className="reader-body">
        {/* Main PDF Area */}
        <div className="reader-main">
          <div className="reader-pdf-page" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
            <div className="reader-watermark">
              BookGrid Library Copy<br/>Student ID: {user?.id || 'STD-001'}
            </div>
            
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', textAlign: 'center', marginBottom: '2rem' }}>
              Chapter 1: The Role of Algorithms in Computing
            </h2>
            {SAMPLE_CONTENT.split('\n\n').map((para, i) => (
              <p key={i} style={{ fontSize: '1.125rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>{para}</p>
            ))}
          </div>
        </div>

        {/* Side Panel */}
        <div className="reader-sidepanel">
          <div className="reader-sidepanel-tabs">
            <button className={`reader-sidepanel-tab ${activeTab === 'bookmarks' ? 'active' : ''}`} onClick={() => setActiveTab('bookmarks')}>
              Bookmarks
            </button>
            <button className={`reader-sidepanel-tab ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
              Notes
            </button>
          </div>
          
          <div className="reader-sidepanel-content">
            {activeTab === 'bookmarks' && (
              <div>
                <Button size="sm" variant="outline" style={{ width: '100%', marginBottom: 'var(--space-4)' }} onClick={() => setIsBookmarked(!isBookmarked)}>
                  <i className="fas fa-plus"></i> Bookmark Current Page
                </Button>
                {isBookmarked && (
                  <div style={{ padding: 'var(--space-3)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-sm)' }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600 }}>Page 45</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--bg-secondary-text)' }}>Chapter 1</p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'notes' && (
              <div>
                <textarea 
                  placeholder="Add a personal note for this page..." 
                  style={{ width: '100%', padding: 'var(--space-3)', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-sm)', minHeight: '100px', resize: 'vertical', marginBottom: 'var(--space-2)' }}
                ></textarea>
                <Button size="sm" variant="primary" style={{ width: '100%' }}>Save Note</Button>
                
                <div style={{ marginTop: 'var(--space-6)' }}>
                  <h4 style={{ fontSize: '0.875rem', color: 'var(--bg-secondary-text)', marginBottom: 'var(--space-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Previous Notes</h4>
                  <div style={{ padding: 'var(--space-3)', background: 'var(--bg-pale-peach)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--bg-warm-orange)' }}>
                    <p style={{ margin: '0 0 4px', fontSize: '0.75rem', color: 'var(--bg-secondary-text)', fontWeight: 600 }}>Page 12</p>
                    <p style={{ margin: 0, fontSize: '0.875rem' }}>Important definition of O(n) notation here. Need to review for midterms.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="reader-bottombar">
        <div className="reader-progress-wrap">
          <div className="reader-progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flex: 1 }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--bg-secondary-text)', fontWeight: 500 }}>{progress}% Complete</span>
        </div>
        
        <div className="reader-controls-center">
          <button className="reader-icon-btn"><i className="fas fa-chevron-left"></i></button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.875rem' }}>
            <input type="text" value="45" readOnly className="reader-page-input" />
            <span style={{ color: 'var(--bg-secondary-text)' }}>/ 1292</span>
          </div>
          <button className="reader-icon-btn"><i className="fas fa-chevron-right"></i></button>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', justifyContent: 'flex-end', flex: 1 }}>
          <button className="reader-icon-btn" onClick={() => setZoom(z => Math.max(50, z - 10))}><i className="fas fa-search-minus"></i></button>
          <span style={{ fontSize: '0.875rem', width: '40px', textAlign: 'center' }}>{zoom}%</span>
          <button className="reader-icon-btn" onClick={() => setZoom(z => Math.min(200, z + 10))}><i className="fas fa-search-plus"></i></button>
        </div>
      </div>
    </div>
  );
};
