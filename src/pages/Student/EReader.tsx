import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Badge } from '../../components/ui';
import { BookService, Book } from '../../services/bookService';
import { useAuth } from '../../context/AuthContext';
import { PdfStorageService, CachedPdfData } from '../../utils/pdfStorageService';
import './Student.css';

type SideTab = 'bookmarks' | 'notes';

interface BookmarkItem {
  id: string;
  page: number;
  title: string;
  createdAt: string;
}

interface NoteItem {
  id: string;
  page: number;
  text: string;
  userName: string;
  userEmail: string;
  createdAt: string;
}

export const EReader: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [cachedPdf, setCachedPdf] = useState<CachedPdfData | null>(null);
  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<SideTab>('bookmarks');
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(846);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  // Bookmarks & Notes state
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [userNote, setUserNote] = useState('');

  // Load saved states from localStorage
  useEffect(() => {
    if (!id) return;

    setLoading(true);

    // Restore saved completion & last read page
    try {
      const savedCompleted = localStorage.getItem(`book_completed_${id}`);
      if (savedCompleted === 'true') {
        setIsCompleted(true);
      }
      const savedPage = localStorage.getItem(`book_page_${id}`);
      if (savedPage) {
        const p = parseInt(savedPage, 10);
        if (!isNaN(p) && p > 0) {
          setCurrentPage(p);
        }
      }
    } catch (e) {}

    // Load saved bookmarks from localStorage
    try {
      const savedBms = localStorage.getItem(`book_bookmarks_${id}`);
      if (savedBms) setBookmarks(JSON.parse(savedBms));
    } catch (e) {
      console.warn("Could not load bookmarks:", e);
    }

    // Load saved notes from localStorage
    try {
      const savedNts = localStorage.getItem(`book_notes_${id}`);
      if (savedNts) setNotes(JSON.parse(savedNts));
    } catch (e) {
      console.warn("Could not load notes:", e);
    }

    // 1. Check local memory cache & IndexedDB first
    const localCache = PdfStorageService.getCachedPdf(id);
    if (localCache && localCache.pdfDataUrl && !localCache.pdfDataUrl.startsWith('indexeddb:')) {
      setCachedPdf(localCache);
      setActivePdfUrl(localCache.pdfDataUrl);
    }

    // Fetch from IndexedDB for large PDF files
    PdfStorageService.getFromIndexedDb(id).then(indexedPdf => {
      if (indexedPdf) {
        setActivePdfUrl(indexedPdf);
      }
    });

    // 2. Fetch authoritative book record from Spring Boot PostgreSQL Database
    BookService.getBookById(id)
      .then(async data => {
        setBook(data);
        if (data.pages && data.pages > 0) {
          setTotalPages(data.pages);
        } else {
          setTotalPages(846);
        }

        const dbPdfUrl = data.pdfUrl;

        // Prioritize HTTP/HTTPS or Base64 Data URLs from database if valid
        if (dbPdfUrl && (dbPdfUrl.startsWith('http') || dbPdfUrl.startsWith('data:')) && !dbPdfUrl.includes('v1700000000')) {
          setActivePdfUrl(dbPdfUrl);
        } else {
          // If dbPdfUrl is 'indexeddb:id' or empty/mock, fetch real Base64 Data URL from IndexedDB
          const indexedPdf = await PdfStorageService.getFromIndexedDb(id);
          if (indexedPdf) {
            setActivePdfUrl(indexedPdf);
          }
        }
      })
      .catch((err) => {
        console.error("Error loading book record from database:", err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Convert Base64 Data URL to Blob Object URL for fast, smooth iframe fragment navigation (#page=N)
  useEffect(() => {
    if (!activePdfUrl) {
      setBlobUrl(null);
      return;
    }

    if (activePdfUrl.startsWith('data:application/pdf')) {
      try {
        const parts = activePdfUrl.split(',');
        const base64Str = parts[1];
        const binaryStr = atob(base64Str);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const createdBlobUrl = URL.createObjectURL(blob);
        setBlobUrl(createdBlobUrl);

        return () => {
          URL.revokeObjectURL(createdBlobUrl);
        };
      } catch (e) {
        console.error("Error creating Blob URL:", e);
        setBlobUrl(activePdfUrl);
      }
    } else {
      setBlobUrl(activePdfUrl);
    }
  }, [activePdfUrl]);

  // Page Navigation Helper
  const handlePageChange = (newPage: number) => {
    const validPage = Math.max(1, Math.min(totalPages, newPage));
    setCurrentPage(validPage);
    try {
      localStorage.setItem(`book_page_${id}`, validPage.toString());
    } catch (e) {}
  };

  // Toggle Completed Status
  const handleToggleComplete = () => {
    const newStatus = !isCompleted;
    setIsCompleted(newStatus);
    try {
      localStorage.setItem(`book_completed_${id}`, newStatus ? 'true' : 'false');
      if (newStatus) {
        handlePageChange(totalPages); // Set page to 100%
      }
    } catch (e) {}
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Add current page to bookmarks
  const handleToggleBookmarkCurrentPage = () => {
    if (!id) return;
    const exists = bookmarks.some(b => b.page === currentPage);
    let updated: BookmarkItem[];

    if (exists) {
      updated = bookmarks.filter(b => b.page !== currentPage);
    } else {
      const newItem: BookmarkItem = {
        id: Date.now().toString(),
        page: currentPage,
        title: `Page ${currentPage}`,
        createdAt: new Date().toLocaleDateString()
      };
      updated = [newItem, ...bookmarks];
    }

    setBookmarks(updated);
    try {
      localStorage.setItem(`book_bookmarks_${id}`, JSON.stringify(updated));
    } catch (e) {
      console.warn("Error saving bookmarks:", e);
    }
  };

  // Delete specific bookmark
  const handleDeleteBookmark = (bmId: string) => {
    if (!id) return;
    const updated = bookmarks.filter(b => b.id !== bmId);
    setBookmarks(updated);
    try {
      localStorage.setItem(`book_bookmarks_${id}`, JSON.stringify(updated));
    } catch (e) {}
  };

  // Save a new note
  const handleSaveNote = () => {
    if (!userNote.trim() || !id) return;

    const authorName = user?.name || (user?.email ? user.email.split('@')[0] : 'System Administrator');
    const authorEmail = user?.email || 'admin@bookgrid.edu';

    const newNote: NoteItem = {
      id: Date.now().toString(),
      page: currentPage,
      text: userNote.trim(),
      userName: authorName,
      userEmail: authorEmail,
      createdAt: `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · ${new Date().toLocaleDateString()}`
    };

    const updated = [newNote, ...notes];
    setNotes(updated);
    setUserNote('');

    try {
      localStorage.setItem(`book_notes_${id}`, JSON.stringify(updated));
    } catch (e) {
      console.warn("Error saving notes:", e);
    }
  };

  // Delete a note
  const handleDeleteNote = (noteId: string) => {
    if (!id) return;
    const updated = notes.filter(n => n.id !== noteId);
    setNotes(updated);
    try {
      localStorage.setItem(`book_notes_${id}`, JSON.stringify(updated));
    } catch (e) {}
  };

  // Resolve valid Iframe Src with page hash #page=N
  const getCleanIframeSrc = (url: string | null, page: number): string => {
    if (!url || url.startsWith('indexeddb:')) return '';
    const cleanUrl = url.split('#')[0];
    return `${cleanUrl}#page=${page}`;
  };

  const isCurrentPageBookmarked = bookmarks.some(b => b.page === currentPage);
  const progress = isCompleted ? 100 : Math.min(100, Math.round((currentPage / Math.max(1, totalPages)) * 100));
  const rawUrlToUse = blobUrl || activePdfUrl;
  const finalIframeSrc = getCleanIframeSrc(rawUrlToUse, currentPage);

  return (
    <div className="reader-container" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Topbar */}
      <div className="reader-topbar">
        <div className="reader-topbar-left">
          <Link to="/admin/digital-library" style={{ textDecoration: 'none', color: 'var(--bg-secondary-text)', fontSize: '1.1rem' }}>
            <i className="fas fa-arrow-left"></i>
          </Link>
          <h1 className="reader-title" style={{ fontSize: '1.2rem', fontWeight: 700 }}>{book?.title || 'e-Book Reader'}</h1>
          {isCompleted && (
            <Badge variant="success" size="sm" style={{ background: '#10b981', color: '#ffffff' }}>
              <i className="fas fa-check-circle" style={{ marginRight: 4 }}></i> Completed (100%)
            </Badge>
          )}
          {cachedPdf && !isCompleted && (
            <Badge variant="success" size="sm">
              <i className="fas fa-bolt" style={{ marginRight: 4 }}></i> Cached in LocalStorage
            </Badge>
          )}
        </div>
        <div className="reader-topbar-right">
          {/* Mark as Completed Button */}
          <button 
            onClick={handleToggleComplete}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '20px',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.8125rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              background: isCompleted ? '#10b981' : 'var(--bg-warm-orange)',
              color: 'white',
              boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
            }}
            title={isCompleted ? "Mark as Reading in Progress" : "Mark Book as Completed"}
          >
            <i className={`fas ${isCompleted ? 'fa-check-circle' : 'fa-flag-checkered'}`}></i>
            {isCompleted ? 'Completed' : 'Mark as Completed'}
          </button>

          <button 
            className={`reader-icon-btn ${isCurrentPageBookmarked ? 'active' : ''}`} 
            onClick={handleToggleBookmarkCurrentPage} 
            title={isCurrentPageBookmarked ? "Remove Bookmark for this Page" : "Bookmark Page"}
            style={{ color: isCurrentPageBookmarked ? 'var(--bg-warm-orange)' : 'inherit' }}
          >
            <i className="fas fa-bookmark" style={{ fontSize: '1.1rem' }}></i>
          </button>
          
          <button className="reader-icon-btn" onClick={() => setZoom(100)} title="Reset Zoom">
            <i className="fas fa-sync-alt"></i>
          </button>

          <button className="reader-icon-btn" onClick={toggleFullscreen} title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
            <i className={`fas ${isFullscreen ? 'fa-compress' : 'fa-expand'}`}></i>
          </button>
          
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <i className="fas fa-user" style={{ color: 'var(--bg-secondary-text)' }}></i>
          </div>
        </div>
      </div>

      <div className="reader-body" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Main Fullscreen / Expanded PDF Viewport Area */}
        <div className="reader-main" style={{ flex: 1, height: '100%', background: '#ffffff', overflow: 'hidden', padding: 0 }}>
          <div className="reader-pdf-page" style={{ width: '100%', height: '100%', padding: 0, margin: 0, transform: `scale(${zoom / 100})`, transformOrigin: 'top center', transition: 'transform 0.15s ease', background: '#ffffff' }}>
            
            {finalIframeSrc ? (
              <iframe 
                key={rawUrlToUse}
                src={finalIframeSrc} 
                title={book?.title || 'PDF e-Book Reader'} 
                style={{ 
                  width: '100%', 
                  height: 'calc(100vh - 116px)', 
                  border: 'none', 
                  background: '#ffffff',
                  display: 'block' 
                }} 
              />
            ) : loading ? (
              <div style={{ textAlign: 'center', padding: '120px 20px', color: 'var(--text-primary)' }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', marginBottom: '16px', color: 'var(--bg-warm-orange)' }}></i>
                <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Loading e-Book PDF document from database...</p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-primary)' }}>
                <i className="fas fa-file-pdf" style={{ fontSize: '4rem', color: '#e74c3c', marginBottom: '16px' }}></i>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.3rem' }}>No Digital PDF Attached</h3>
                <p style={{ margin: '0 0 20px 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Please upload a PDF file for "{book?.title || 'Book'}" in the Digital Library catalog.
                </p>
                <Link to="/admin/digital-library">
                  <Button variant="primary">
                    <i className="fas fa-upload" style={{ marginRight: 6 }}></i> Upload PDF Now
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Side Panel (Bookmarks & Notes) */}
        <div className="reader-sidepanel" style={{ width: '340px', borderLeft: '1px solid var(--bg-border)', display: 'flex', flexDirection: 'column', background: 'white' }}>
          <div className="reader-sidepanel-tabs">
            <button className={`reader-sidepanel-tab ${activeTab === 'bookmarks' ? 'active' : ''}`} onClick={() => setActiveTab('bookmarks')}>
              Bookmarks ({bookmarks.length})
            </button>
            <button className={`reader-sidepanel-tab ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
              Notes ({notes.length})
            </button>
          </div>
          
          <div className="reader-sidepanel-content" style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {/* BOOKMARKS TAB */}
            {activeTab === 'bookmarks' && (
              <div>
                <Button 
                  size="sm" 
                  variant={isCurrentPageBookmarked ? "primary" : "outline"} 
                  style={{ width: '100%', marginBottom: '16px' }} 
                  onClick={handleToggleBookmarkCurrentPage}
                >
                  <i className={`fas ${isCurrentPageBookmarked ? 'fa-check' : 'fa-plus'}`} style={{ marginRight: 6 }}></i>
                  {isCurrentPageBookmarked ? `Bookmarked (Page ${currentPage})` : `Bookmark Current Page (${currentPage})`}
                </Button>

                {bookmarks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-secondary)' }}>
                    <i className="fas fa-bookmark" style={{ fontSize: '2rem', opacity: 0.3, marginBottom: 8 }}></i>
                    <p style={{ margin: 0, fontSize: '0.875rem' }}>No bookmarks saved yet.</p>
                    <p style={{ margin: '4px 0 0', fontSize: '0.75rem' }}>Click the button above to bookmark page {currentPage}.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {bookmarks.map((bm) => (
                      <div 
                        key={bm.id} 
                        style={{ 
                          padding: '10px 12px', 
                          borderRadius: '6px', 
                          border: '1px solid var(--bg-border)', 
                          background: bm.page === currentPage ? 'var(--bg-pale-peach)' : 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div 
                          style={{ cursor: 'pointer', flex: 1 }} 
                          onClick={() => handlePageChange(bm.page)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Badge variant={bm.page === currentPage ? "warning" : "neutral"} size="sm">
                              Page {bm.page}
                            </Badge>
                            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{bm.title}</span>
                          </div>
                          <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Saved on {bm.createdAt}
                          </p>
                        </div>
                        
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button 
                            onClick={() => handlePageChange(bm.page)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--bg-warm-orange)', cursor: 'pointer', padding: 4 }}
                            title="Jump to page"
                          >
                            <i className="fas fa-external-link-alt"></i>
                          </button>
                          <button 
                            onClick={() => handleDeleteBookmark(bm.id)}
                            style={{ background: 'transparent', border: 'none', color: '#e74c3c', cursor: 'pointer', padding: 4 }}
                            title="Delete bookmark"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* NOTES TAB */}
            {activeTab === 'notes' && (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>
                    Add Note for Page {currentPage}
                  </label>
                  <textarea 
                    placeholder={`Write your study notes or insights for Page ${currentPage}...`} 
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      border: '1px solid var(--bg-border)', 
                      borderRadius: '6px', 
                      minHeight: '80px', 
                      resize: 'vertical', 
                      fontSize: '0.875rem',
                      fontFamily: 'inherit',
                      outline: 'none',
                      marginBottom: '8px'
                    }}
                  ></textarea>
                  <Button size="sm" variant="primary" style={{ width: '100%' }} onClick={handleSaveNote} disabled={!userNote.trim()}>
                    <i className="fas fa-save" style={{ marginRight: 6 }}></i> Save Note to Page {currentPage}
                  </Button>
                </div>
                
                {notes.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--text-secondary)' }}>
                    <i className="fas fa-sticky-note" style={{ fontSize: '2rem', opacity: 0.3, marginBottom: 8 }}></i>
                    <p style={{ margin: 0, fontSize: '0.875rem' }}>No personal notes created yet.</p>
                  </div>
                ) : (
                  <div>
                    <h4 style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                      Saved Reader Notes ({notes.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {notes.map((note) => {
                        const authorInitial = (note.userName || user?.name || user?.email || 'U').charAt(0).toUpperCase();
                        const displayName = note.userName || user?.name || (user?.email ? user.email.split('@')[0] : 'System Administrator');
                        const displayEmail = note.userEmail || user?.email || 'admin@bookgrid.edu';

                        return (
                          <div 
                            key={note.id} 
                            style={{ 
                              padding: '12px', 
                              background: note.page === currentPage ? 'var(--bg-pale-peach)' : 'white', 
                              borderRadius: '8px', 
                              border: '1px solid var(--bg-border)',
                              borderLeft: `4px solid ${note.page === currentPage ? 'var(--bg-warm-orange)' : 'var(--brand-primary, #1e1b4b)'}`,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px'
                            }}
                          >
                            {/* Author Name, Email & Avatar Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ 
                                  width: 30, height: 30, borderRadius: '50%', 
                                  background: 'var(--brand-primary, #1e1b4b)', color: 'white', 
                                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                  fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 
                                }}>
                                  {authorInitial}
                                </div>
                                <div>
                                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', lineHeight: 1.2 }}>
                                    {displayName}
                                  </span>
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block' }}>
                                    {displayEmail}
                                  </span>
                                </div>
                              </div>
                              
                              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                <Badge variant={note.page === currentPage ? "warning" : "neutral"} size="sm">
                                  Page {note.page}
                                </Badge>
                                <button 
                                  onClick={() => handleDeleteNote(note.id)} 
                                  style={{ background: 'transparent', border: 'none', color: '#e74c3c', cursor: 'pointer', padding: 2 }}
                                  title="Delete Note"
                                >
                                  <i className="fas fa-trash-alt"></i>
                                </button>
                              </div>
                            </div>

                            <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                              {note.text}
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '6px', borderTop: '1px dashed var(--bg-border)', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                              <span style={{ cursor: 'pointer', color: 'var(--bg-warm-orange)', fontWeight: 600 }} onClick={() => handlePageChange(note.page)}>
                                <i className="fas fa-external-link-alt" style={{ marginRight: 4 }}></i> Jump to Page {note.page}
                              </span>
                              <span>{note.createdAt}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
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
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1 }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--bg-secondary-text)', fontWeight: 600 }}>
            {progress}% Complete
          </span>

          {/* Quick Page Step controls */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button 
              className="reader-icon-btn" 
              style={{ width: 28, height: 28, fontSize: '0.75rem' }} 
              onClick={() => handlePageChange(1)} 
              title="First Page (Page 1)"
            >
              <i className="fas fa-angle-double-left"></i>
            </button>
            <button 
              className="reader-icon-btn" 
              style={{ width: 28, height: 28, fontSize: '0.75rem' }} 
              onClick={() => handlePageChange(currentPage - 10)} 
              title="-10 Pages"
            >
              -10
            </button>
            <button 
              className="reader-icon-btn" 
              style={{ width: 28, height: 28, fontSize: '0.75rem' }} 
              onClick={() => handlePageChange(currentPage + 10)} 
              title="+10 Pages"
            >
              +10
            </button>
            <button 
              className="reader-icon-btn" 
              style={{ width: 28, height: 28, fontSize: '0.75rem' }} 
              onClick={() => handlePageChange(totalPages)} 
              title={`Last Page (Page ${totalPages})`}
            >
              <i className="fas fa-angle-double-right"></i>
            </button>
          </div>
        </div>
        
        <div className="reader-controls-center">
          <button className="reader-icon-btn" onClick={() => handlePageChange(currentPage - 1)} title="Previous Page">
            <i className="fas fa-chevron-left"></i>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: '0.875rem' }}>
            <input 
              type="text" 
              value={currentPage} 
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val)) handlePageChange(val);
              }}
              className="reader-page-input" 
            />
            <span 
              title="Click to adjust total page count" 
              style={{ color: 'var(--bg-secondary-text)', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => {
                const input = prompt("Set total PDF pages:", totalPages.toString());
                if (input) {
                  const p = parseInt(input, 10);
                  if (!isNaN(p) && p > 0) setTotalPages(p);
                }
              }}
            >
              / {totalPages}
            </span>
          </div>
          <button className="reader-icon-btn" onClick={() => handlePageChange(currentPage + 1)} title="Next Page">
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', justifyContent: 'flex-end', flex: 1 }}>
          <button className="reader-icon-btn" onClick={() => setZoom(z => Math.max(50, z - 10))} title="Zoom Out">
            <i className="fas fa-search-minus"></i>
          </button>
          <span style={{ fontSize: '0.875rem', width: '40px', textAlign: 'center', color: 'var(--text-primary)', fontWeight: 600 }}>{zoom}%</span>
          <button className="reader-icon-btn" onClick={() => setZoom(z => Math.min(200, z + 10))} title="Zoom In">
            <i className="fas fa-search-plus"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

