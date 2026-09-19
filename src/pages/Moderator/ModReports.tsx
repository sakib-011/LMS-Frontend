import React, { useState } from 'react';
import { Button } from '../../components/ui';
import { ChartCard } from '../../components/ui/ChartCard/ChartCard';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import './Moderator.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const BORROWING_TRENDS = [
  { name: 'Mon', count: 12 },
  { name: 'Tue', count: 19 },
  { name: 'Wed', count: 15 },
  { name: 'Thu', count: 22 },
  { name: 'Fri', count: 30 },
  { name: 'Sat', count: 18 },
  { name: 'Sun', count: 10 },
];

const REVENUE_TRENDS = [
  { month: 'May', amount: 120 },
  { month: 'Jun', amount: 150 },
  { month: 'Jul', amount: 200 },
  { month: 'Aug', amount: 180 },
  { month: 'Sep', amount: 240 },
];

const POPULAR_CATEGORIES = [
  { name: 'Computer Science', value: 45 },
  { name: 'Fiction', value: 30 },
  { name: 'Science', value: 25 },
  { name: 'History', value: 15 },
];

const USER_DISTRIBUTION = [
  { name: 'Students', value: 1200 },
  { name: 'Moderators', value: 15 },
  { name: 'Administrators', value: 5 },
];

export const ModReports: React.FC = () => {

  return (
    <div>
      <div className="mod-card-header">
        <div>
          <h1 className="mod-card-title">Analytics & Reports</h1>
          <p style={{ color: 'var(--bg-secondary-text)', fontSize: '0.875rem' }}>View system statistics, borrowing trends, and export reports.</p>
        </div>
        <Button variant="primary" icon="fas fa-download" onClick={() => alert('Exporting PDF Report...')}>Export PDF</Button>
      </div>

      <div className="std-grid-2col" style={{ marginBottom: 'var(--space-6)' }}>
        <ChartCard title="Borrowing Trends" subtitle="Daily borrowing activity over the last 7 days">
          <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BORROWING_TRENDS} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--bg-border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--bg-secondary-text)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--bg-secondary-text)' }} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} contentStyle={{ borderRadius: 'var(--radius-md)', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="count" fill="var(--bg-accent-blue)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Fines & Revenue" subtitle="Monthly fine collection trends">
          <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={REVENUE_TRENDS} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--bg-border)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--bg-secondary-text)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--bg-secondary-text)' }} tickFormatter={(val) => `$${val}`} />
                <Tooltip contentStyle={{ borderRadius: 'var(--radius-md)', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} formatter={(value: any) => [`$${value}`, 'Amount']} />
                <Line type="monotone" dataKey="amount" stroke="var(--bg-success)" strokeWidth={3} dot={{ r: 4, fill: 'var(--bg-success)' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="std-grid-2col">
        <ChartCard title="Popular Categories" subtitle="Most borrowed book categories">
          <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={POPULAR_CATEGORIES}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {POPULAR_CATEGORIES.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 'var(--radius-md)', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="User Distribution" subtitle="Active users by role">
          <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={USER_DISTRIBUTION}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {USER_DISTRIBUTION.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 'var(--radius-md)', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
};
