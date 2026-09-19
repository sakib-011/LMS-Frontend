import React, { useState } from 'react';
import { Button, Badge } from '../../components/ui';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import './Admin.css';

// Mock Data for Charts
const circulationData = [
  { name: 'Jan', borrows: 400, returns: 240 },
  { name: 'Feb', borrows: 300, returns: 139 },
  { name: 'Mar', borrows: 200, returns: 980 },
  { name: 'Apr', borrows: 278, returns: 390 },
  { name: 'May', borrows: 189, returns: 480 },
  { name: 'Jun', borrows: 239, returns: 380 },
  { name: 'Jul', borrows: 349, returns: 430 },
];

const categoryData = [
  { name: 'Fiction', value: 400, color: '#E67E22' },
  { name: 'Science', value: 300, color: '#3498DB' },
  { name: 'History', value: 300, color: '#2ECC71' },
  { name: 'Technology', value: 200, color: '#9B59B6' },
];

const financialData = [
  { name: 'Week 1', fines: 120, donations: 50 },
  { name: 'Week 2', fines: 85, donations: 20 },
  { name: 'Week 3', fines: 210, donations: 100 },
  { name: 'Week 4', fines: 150, donations: 10 },
];

export const AdminReports: React.FC = () => {
  const [dateRange, setDateRange] = useState('Last 30 Days');

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">System Reports & Analytics</h1>
          <p className="admin-subtitle">Comprehensive data analysis, circulation trends, and financial reports.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            style={{ padding: '0 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-white)', color: 'var(--text-secondary)' }}
          >
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Quarter</option>
            <option>Year to Date</option>
          </select>
          <Button variant="primary">
            <i className="fas fa-download" style={{ marginRight: '8px' }}></i> Export Full Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 'var(--space-6)' }}>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'var(--bg-pale-peach)', color: 'var(--bg-warm-orange)' }}>
            <i className="fas fa-book-reader"></i>
          </div>
          <div className="admin-stat-content">
            <h3>Total Borrows</h3>
            <p>1,284 <span style={{ fontSize: '0.75rem', color: 'var(--status-success)', marginLeft: '8px' }}><i className="fas fa-arrow-up"></i> 12%</span></p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#E6F0E8', color: 'var(--status-success)' }}>
            <i className="fas fa-undo"></i>
          </div>
          <div className="admin-stat-content">
            <h3>Return Rate</h3>
            <p>94.2% <span style={{ fontSize: '0.75rem', color: 'var(--status-success)', marginLeft: '8px' }}><i className="fas fa-arrow-up"></i> 2.1%</span></p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
            <i className="fas fa-users"></i>
          </div>
          <div className="admin-stat-content">
            <h3>Active Users</h3>
            <p>845 <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '8px' }}><i className="fas fa-minus"></i> 0%</span></p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon" style={{ background: '#FDECEA', color: 'var(--status-error)' }}>
            <i className="fas fa-hand-holding-usd"></i>
          </div>
          <div className="admin-stat-content">
            <h3>Fines Collected</h3>
            <p>$565.00 <span style={{ fontSize: '0.75rem', color: 'var(--status-error)', marginLeft: '8px' }}><i className="fas fa-arrow-up"></i> 5%</span></p>
          </div>
        </div>
      </div>

      <div className="admin-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        {/* Circulation Trends */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem', color: 'var(--text-primary)' }}>Circulation Trends</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Badge variant="primary">Borrows</Badge>
              <Badge variant="secondary">Returns</Badge>
            </div>
          </div>
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={circulationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBorrows" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--bg-warm-orange)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--bg-warm-orange)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2ECC71" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2ECC71" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: 'var(--radius-md)', border: 'none', boxShadow: 'var(--shadow-md)' }}
                  itemStyle={{ fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="borrows" stroke="var(--bg-warm-orange)" strokeWidth={3} fillOpacity={1} fill="url(#colorBorrows)" />
                <Area type="monotone" dataKey="returns" stroke="#2ECC71" strokeWidth={3} fillOpacity={1} fill="url(#colorReturns)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="admin-card">
          <h3 style={{ margin: '0 0 var(--space-4) 0', fontSize: '1.125rem', color: 'var(--text-primary)' }}>Borrowing by Category</h3>
          <div style={{ height: '220px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: 'var(--radius-md)', border: 'none', boxShadow: 'var(--shadow-md)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
            {categoryData.map(cat => (
              <div key={cat.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: cat.color }}></div>
                  <span style={{ color: 'var(--text-secondary)' }}>{cat.name}</span>
                </div>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Financial Chart */}
      <div className="admin-card" style={{ marginTop: 'var(--space-6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem', color: 'var(--text-primary)' }}>Financial Overview</h3>
          <Button variant="outline" size="sm"><i className="fas fa-file-csv" style={{ marginRight: '8px' }}></i> Export CSV</Button>
        </div>
        <div style={{ height: '250px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={financialData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} tickFormatter={(value) => `$${value}`} />
              <Tooltip 
                contentStyle={{ borderRadius: 'var(--radius-md)', border: 'none', boxShadow: 'var(--shadow-md)' }}
                cursor={{ fill: 'var(--bg-secondary)' }}
                formatter={(value: any) => [`$${value}`, undefined]}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
              <Bar dataKey="fines" name="Fines Collected" fill="#E74C3C" radius={[4, 4, 0, 0]} barSize={30} />
              <Bar dataKey="donations" name="Donations" fill="#3498DB" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
