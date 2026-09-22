import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { AdminService } from '../../services/adminService';
import './Admin.css';

const COLORS = ['var(--bg-warm-orange)', 'var(--bg-deep-black)', 'var(--bg-soft-orange)', '#a8a29e'];

const DEFAULT_BORROWING_TRENDS = [
  { name: 'Mon', count: 12 },
  { name: 'Tue', count: 19 },
  { name: 'Wed', count: 15 },
  { name: 'Thu', count: 22 },
  { name: 'Fri', count: 30 },
  { name: 'Sat', count: 18 },
  { name: 'Sun', count: 10 },
];

const DEFAULT_REVENUE_TRENDS = [
  { month: 'May', amount: 120 },
  { month: 'Jun', amount: 150 },
  { month: 'Jul', amount: 200 },
  { month: 'Aug', amount: 180 },
  { month: 'Sep', amount: 240 },
];

const DEFAULT_POPULAR_CATEGORIES = [
  { name: 'Computer Science', value: 45 },
  { name: 'Fiction', value: 30 },
  { name: 'Science', value: 25 },
  { name: 'History', value: 15 },
];

const DEFAULT_USER_DISTRIBUTION = [
  { name: 'Students', value: 1200 },
  { name: 'Moderators', value: 15 },
  { name: 'Administrators', value: 5 },
];

export const AdminAnalytics: React.FC = () => {
  const [borrowingTrends, setBorrowingTrends] = useState<any[]>(DEFAULT_BORROWING_TRENDS);
  const [revenueTrends, setRevenueTrends] = useState<any[]>(DEFAULT_REVENUE_TRENDS);
  const [popularCategories, setPopularCategories] = useState<any[]>(DEFAULT_POPULAR_CATEGORIES);
  const [userDistribution, setUserDistribution] = useState<any[]>(DEFAULT_USER_DISTRIBUTION);

  useEffect(() => {
    AdminService.getAnalytics()
      .then((data: any) => {
        if (data) {
          if (Array.isArray(data.borrowingTrends)) setBorrowingTrends(data.borrowingTrends);
          if (Array.isArray(data.revenueTrends)) setRevenueTrends(data.revenueTrends);
          if (Array.isArray(data.popularCategories)) setPopularCategories(data.popularCategories);
          if (Array.isArray(data.userDistribution)) setUserDistribution(data.userDistribution);
        }
      })
      .catch(() => {});
  }, []);
  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">Analytics & Reports</h1>
          <p className="admin-subtitle">Deep dive into library usage, revenue, and system metrics</p>
        </div>
        <button className="admin-icon-btn" style={{ background: 'var(--bg-warm-orange)', color: 'white', borderRadius: '8px', padding: '0 16px', width: 'auto' }}>
          <i className="fas fa-download" style={{ marginRight: '8px' }}></i> Export Report
        </button>
      </div>

      <div className="admin-dashboard-charts">
        {/* Borrowing Volume (Area) */}
        <div className="admin-card" style={{ marginBottom: 0 }}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-6)', color: 'var(--text-primary)' }}>Daily Borrowing Volume</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={borrowingTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBorrowing" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--bg-warm-orange)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--bg-warm-orange)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
                  labelStyle={{ fontWeight: 600, color: 'var(--text-primary)' }}
                />
                <Area type="monotone" dataKey="count" stroke="var(--bg-warm-orange)" strokeWidth={3} fillOpacity={1} fill="url(#colorBorrowing)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fine Collection (Line) */}
        <div className="admin-card" style={{ marginBottom: 0 }}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-6)', color: 'var(--text-primary)' }}>Monthly Fine Revenue (USD)</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
                  labelStyle={{ fontWeight: 600, color: 'var(--text-primary)' }}
                />
                <Line type="monotone" dataKey="amount" stroke="var(--bg-deep-black)" strokeWidth={3} dot={{ r: 6, fill: 'var(--bg-deep-black)' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="admin-dashboard-charts">
        {/* Popular Categories (Bar) */}
        <div className="admin-card" style={{ marginBottom: 0 }}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-6)', color: 'var(--text-primary)' }}>Top Categories by Demand</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularCategories} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                <XAxis type="number" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: 'var(--bg-warm-cream)'}}
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
                />
                <Bar dataKey="value" fill="var(--bg-warm-orange)" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Roles (Pie) */}
        <div className="admin-card" style={{ marginBottom: 0 }}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: 'var(--space-6)', color: 'var(--text-primary)' }}>User Base Distribution</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {userDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
};
