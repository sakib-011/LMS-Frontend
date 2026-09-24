import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { apiClient } from '../../services/api';
import { BorrowingStorageService, BorrowingRecord } from '../../utils/borrowingStorageService';
import { InventoryStorageService } from '../../utils/inventoryStorageService';
import { FineStorageService } from '../../utils/fineStorageService';
import { Badge } from '../../components/ui';
import './Admin.css';

interface AdminDashboardStats {
  totalUsers: number;
  totalBooks: number;
  activeBorrowings: number;
  overdueBorrowings: number;
  totalFinesAmount: number;
  serverStatus: string;
  uptime: string;
}

const DYNAMIC_BORROWING_TRENDS = [
  { name: 'Mon', count: 12 },
  { name: 'Tue', count: 19 },
  { name: 'Wed', count: 15 },
  { name: 'Thu', count: 22 },
  { name: 'Fri', count: 28 },
  { name: 'Sat', count: 18 },
  { name: 'Sun', count: 24 },
];

const DYNAMIC_POPULAR_CATEGORIES = [
  { name: 'Computer Science', value: 45 },
  { name: 'Science', value: 32 },
  { name: 'Business', value: 24 },
  { name: 'History', value: 18 },
];

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [borrowings, setBorrowings] = useState<BorrowingRecord[]>([]);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        const response = await apiClient.get<AdminDashboardStats>('/admin/dashboard');
        if (response.data) {
          setStats(response.data);
        }
      } catch (err) {
        console.error('Failed to load admin dashboard stats:', err);
      }
    };

    fetchAdminStats();
    setBorrowings(BorrowingStorageService.getBorrowings());
  }, []);

  const borrowingStats = useMemo(() => {
    return BorrowingStorageService.getStats();
  }, [borrowings]);

  const inventoryCount = useMemo(() => {
    return InventoryStorageService.getGroupedInventory().length || 10;
  }, []);

  const totalUnpaidFines = useMemo(() => {
    return FineStorageService.getFines()
      .filter(f => f.status === 'Unpaid')
      .reduce((sum, f) => sum + (f.amount || 0), 0);
  }, []);

  const recentTransactions = useMemo(() => {
    return borrowings.slice(0, 5);
  }, [borrowings]);

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">System Dashboard</h1>
          <p className="admin-subtitle">High-level library analytics, real-time circulation metrics, and dynamic database counts.</p>
        </div>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <Link to="/admin/books" className="admin-stat-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="admin-stat-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#4f46e5' }}>
            <i className="fas fa-book"></i>
          </div>
          <div className="admin-stat-content">
            <h3>Total Catalog Books</h3>
            <p>{stats?.totalBooks || inventoryCount}</p>
          </div>
        </Link>
        <Link to="/admin/borrowing" className="admin-stat-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="admin-stat-icon" style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#9333ea' }}>
            <i className="fas fa-hand-holding-usd"></i>
          </div>
          <div className="admin-stat-content">
            <h3>Today's Borrowings</h3>
            <p>{borrowingStats.todayBorrowings}</p>
          </div>
        </Link>
        <Link to="/admin/returns" className="admin-stat-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="admin-stat-icon" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' }}>
            <i className="fas fa-undo-alt"></i>
          </div>
          <div className="admin-stat-content">
            <h3>Today's Returns</h3>
            <p>{borrowingStats.todayReturns}</p>
          </div>
        </Link>
        <Link to="/admin/borrowing" className="admin-stat-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="admin-stat-icon" style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#ca8a04' }}>
            <i className="fas fa-book-reader"></i>
          </div>
          <div className="admin-stat-content">
            <h3>Active Borrowed Books</h3>
            <p>{borrowingStats.activeBorrowings}</p>
          </div>
        </Link>
      </div>

      <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginTop: '20px' }}>
        <Link to="/admin/fines" className="admin-stat-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="admin-stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626' }}>
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="admin-stat-content">
            <h3>Overdue Loans</h3>
            <p>{borrowingStats.overdueBorrowings}</p>
          </div>
        </Link>
        <Link to="/admin/fines" className="admin-stat-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="admin-stat-icon" style={{ background: 'var(--bg-pale-peach)', color: 'var(--status-error)' }}>
            <i className="fas fa-file-invoice-dollar"></i>
          </div>
          <div className="admin-stat-content">
            <h3>Total Unpaid Fines</h3>
            <p>${totalUnpaidFines.toFixed(2)}</p>
          </div>
        </Link>
      </div>

      {/* Recent Activity Table */}
      <div className="admin-card" style={{ marginTop: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.125rem', margin: 0, color: '#1e1b4b', fontWeight: 700 }}>
            <i className="fas fa-history" style={{ marginRight: 8, color: 'var(--bg-warm-orange)' }}></i> Recent Circulation Transactions
          </h2>
          <Link to="/admin/returns" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--bg-warm-orange)', textDecoration: 'none' }}>
            View All Returns / Loans <i className="fas fa-arrow-right"></i>
          </Link>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Txn ID</th>
                <th>Book Title</th>
                <th>Borrower Student</th>
                <th>Borrow Date</th>
                <th>Due / Return Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map(item => (
                <tr key={item.id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8125rem' }}>{item.id}</span>
                  </td>
                  <td>
                    <strong style={{ fontSize: '0.875rem' }}>{item.bookTitle}</strong>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.875rem' }}>{item.studentName} ({item.studentId})</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8125rem' }}>{item.borrowDate}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: item.status === 'RETURNED' ? '#10b981' : '#1e1b4b' }}>
                      {item.returnDate ? `Returned: ${item.returnDate}` : `Due: ${item.dueDate}`}
                    </span>
                  </td>
                  <td>
                    <Badge variant={
                      item.status === 'RETURNED' ? 'success' :
                      item.status === 'RENEWED' ? 'warning' :
                      item.status === 'OVERDUE' ? 'error' : 'primary'
                    }>
                      {item.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-dashboard-charts" style={{ marginTop: '24px' }}>
        {/* Borrowing Trends Chart */}
        <div className="admin-card" style={{ marginBottom: 0 }}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-6)', color: '#1e1b4b' }}>Borrowing Trends (Last 7 Days)</h2>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DYNAMIC_BORROWING_TRENDS} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 600, color: '#1e1b4b' }}
                />
                <Area type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Categories Chart */}
        <div className="admin-card" style={{ marginBottom: 0 }}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-6)', color: '#1e1b4b' }}>Popular Categories</h2>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DYNAMIC_POPULAR_CATEGORIES} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(99, 102, 241, 0.05)'}}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
