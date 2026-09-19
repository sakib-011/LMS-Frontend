import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StatCard, Badge } from '../../components/ui';
import { BookGridCard } from '../../components/ui/BookCard/BookGridCard';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../services/api';
import { BookService, Book } from '../../services/bookService';
import '../../layouts/StudentLayout.css';
import './Student.css';

interface DashboardStats {
  currentlyBorrowed: number;
  totalBorrowed: number;
  pendingReservations: number;
  activeRequests: number;
  totalFines: number;
  recentBorrowings: any[];
}

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [digitalBooks, setDigitalBooks] = useState<any[]>([]);
  const [borrowings, setBorrowings] = useState<any[]>([]);
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashRes, digitalRes, borrowRes, booksRes] = await Promise.all([
          apiClient.get<DashboardStats>('/student/dashboard').catch(() => null),
          apiClient.get<any[]>('/student/digital-library').catch(() => ({ data: [] })),
          apiClient.get<any[]>('/student/borrowings').catch(() => ({ data: [] })),
          BookService.getBooks().catch(() => [])
        ]);

        if (dashRes && dashRes.data) {
          setStats(dashRes.data);
        }
        if (digitalRes && digitalRes.data) {
          setDigitalBooks(digitalRes.data);
        }
        if (borrowRes && borrowRes.data) {
          setBorrowings(borrowRes.data);
        }
        if (Array.isArray(booksRes)) {
          setRecommendedBooks(booksRes.slice(0, 6));
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      }
    };

    fetchDashboardData();
  }, []);

  const studentFirstName = user?.name ? user.name.split(' ')[0] : 'Student';
  const overdueCount = borrowings.filter(b => b.isOverdue || b.status === 'OVERDUE').length;

  return (
    <div>
      {/* Welcome Header */}
      <div className="sl-page-header">
        <h1 className="sl-page-title">Welcome back, {studentFirstName}.</h1>
        <p className="sl-page-subtitle">Here's what's happening with your library account.</p>
      </div>

      {/* Stat Cards */}
      <div className="std-stats-grid">
        <StatCard title="Currently Borrowed" value={stats?.currentlyBorrowed ?? 0} icon="fas fa-book-reader" to="/student/library" />
        <StatCard title="Reserved Books" value={stats?.pendingReservations ?? 0} icon="fas fa-calendar-check" to="/student/reservations" />
        <StatCard title="Pending Requests" value={stats?.activeRequests ?? 0} icon="fas fa-paper-plane" to="/student/requests" />
        <StatCard title="Overdue Loans" value={overdueCount} icon="fas fa-exclamation-triangle" to="/student/library" />
      </div>

      <div className="std-grid-2col">
        {/* Continue Reading */}
        <div className="sl-card">
          <div className="std-section-header">
            <h2 className="sl-card-title">Continue Reading</h2>
            <Link to="/student/digital-library" className="std-link-sm">View All <i className="fas fa-arrow-right"></i></Link>
          </div>
          <div className="std-reading-list">
            {digitalBooks.length === 0 ? (
              <p style={{ color: 'var(--text-secondary, #718096)', fontSize: '0.875rem', padding: '12px 0' }}>
                No active digital readings found in your library.
              </p>
            ) : (
              digitalBooks.slice(0, 3).map(d => (
                <Link key={d.id} to={`/student/reader/${d.book?.id || d.id}`} className="std-reading-item">
                  <div className="std-book-cover-mini" style={{ background: d.book?.coverColor || '#2D3748' }}>
                    <i className="fas fa-book-open"></i>
                  </div>
                  <div className="std-reading-meta">
                    <strong className="std-reading-title">{d.book?.title || 'Digital Book'}</strong>
                    <span className="std-reading-author">{d.book?.author || 'Library Collection'}</span>
                    <div className="std-progress-bar-wrap">
                      <div className="std-progress-bar">
                        <div className="std-progress-fill" style={{ width: `${d.progress || 0}%` }}></div>
                      </div>
                      <span className="std-progress-label">Page {d.currentPage || 1} · {d.progress || 0}%</span>
                    </div>
                  </div>
                  <i className="fas fa-chevron-right std-reading-arrow"></i>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Books Due Soon */}
        <div className="sl-card">
          <div className="std-section-header">
            <h2 className="sl-card-title">Due Soon</h2>
            <Link to="/student/library" className="std-link-sm">My Library <i className="fas fa-arrow-right"></i></Link>
          </div>
          <div className="std-due-list">
            {borrowings.length === 0 ? (
              <p style={{ color: 'var(--text-secondary, #718096)', fontSize: '0.875rem', padding: '12px 0' }}>
                You have no active borrowed items.
              </p>
            ) : (
              borrowings.map(b => (
                <div key={b.id} className="std-due-item">
                  <div className="std-book-cover-mini" style={{ background: b.book?.coverColor || '#1A202C' }}>
                    <i className="fas fa-book"></i>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="std-due-title">{b.book?.title || 'Library Loan'}</p>
                    <p className="std-due-date">Due: {b.dueDate || 'N/A'}</p>
                  </div>
                  {b.isOverdue || b.status === 'OVERDUE'
                    ? <Badge variant="error" size="sm">Overdue</Badge>
                    : <Badge variant="success" size="sm">On Time</Badge>
                  }
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="sl-card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="std-section-header">
          <h2 className="sl-card-title">Catalog Books</h2>
          <Link to="/student/books" className="std-link-sm">Browse All <i className="fas fa-arrow-right"></i></Link>
        </div>
        {recommendedBooks.length === 0 ? (
          <p style={{ color: 'var(--text-secondary, #718096)', fontSize: '0.875rem', padding: '12px 0' }}>
            Loading catalog books...
          </p>
        ) : (
          <div className="sbb-grid" style={{ marginBottom: 0 }}>
            {recommendedBooks.map(book => (
              <BookGridCard 
                key={book.id} 
                book={book as any} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

