import React, { useEffect, useState } from 'react';
import { StatCard } from '../../components/ui';
import { apiClient } from '../../services/api';
import './Moderator.css';

interface ModDashboardStats {
  issuedBooks: number;
  overdueLoans: number;
  pendingReservations: number;
  pendingRequests: number;
  totalBooks: number;
}

export const ModDashboard: React.FC = () => {
  const [stats, setStats] = useState<ModDashboardStats | null>(null);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const fetchModData = async () => {
      try {
        const [dashRes, actRes] = await Promise.all([
          apiClient.get<ModDashboardStats>('/moderator/dashboard').catch(() => null),
          apiClient.get<any[]>('/moderator/activity').catch(() => ({ data: [] }))
        ]);

        if (dashRes && dashRes.data) {
          setStats(dashRes.data);
        }
        if (actRes && actRes.data) {
          setActivities(actRes.data.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to load moderator dashboard:', err);
      }
    };

    fetchModData();
  }, []);

  return (
    <div>
      <div className="mod-card-header">
        <h1 className="mod-card-title">Moderator Dashboard Overview</h1>
        <p style={{ color: 'var(--bg-secondary-text)', fontSize: '0.875rem' }}>System-wide library circulation metrics and live activity logs.</p>
      </div>

      <div className="std-stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <StatCard title="Total Library Books" value={stats?.totalBooks ?? 0} icon="fas fa-book" to="/moderator/books" />
        <StatCard title="Active Issued Loans" value={stats?.issuedBooks ?? 0} icon="fas fa-hand-holding" to="/moderator/borrowing" />
        <StatCard title="Overdue Loans" value={stats?.overdueLoans ?? 0} icon="fas fa-exclamation-triangle" to="/moderator/fines" />
        <StatCard title="Pending Requests" value={stats?.pendingRequests ?? 0} icon="fas fa-paper-plane" to="/moderator/requests" />
      </div>

      <div className="std-grid-2col">
        {/* Quick Actions / Status */}
        <div className="mod-card">
          <h2 className="mod-card-title" style={{ marginBottom: 'var(--space-4)' }}>Needs Attention</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3)', background: 'var(--bg-background)', borderRadius: 'var(--radius-md)' }}>
              <span><i className="fas fa-paper-plane" style={{ color: 'var(--bg-accent-blue)', width: 24 }}></i> Pending Book Requests</span>
              <strong>{stats?.pendingRequests ?? 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3)', background: 'var(--bg-background)', borderRadius: 'var(--radius-md)' }}>
              <span><i className="fas fa-calendar-check" style={{ color: 'var(--bg-success)', width: 24 }}></i> Pending & Ready Reservations</span>
              <strong>{stats?.pendingReservations ?? 0}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--space-3)', background: 'var(--bg-background)', borderRadius: 'var(--radius-md)' }}>
              <span><i className="fas fa-money-bill-wave" style={{ color: 'var(--bg-error)', width: 24 }}></i> Overdue Loan Alerts</span>
              <strong>{stats?.overdueLoans ?? 0}</strong>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mod-card">
          <h2 className="mod-card-title" style={{ marginBottom: 'var(--space-4)' }}>Live Audit Logs</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {activities.length === 0 ? (
              <p style={{ color: 'var(--bg-secondary-text)', fontSize: '0.875rem' }}>No recent audit activity logged.</p>
            ) : (
              activities.map((act, index) => (
                <div key={act.id || index} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--bg-accent-blue)' }}></div>
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>
                    <strong>{act.userEmail || 'System User'}</strong>: {act.details || act.action}
                  </p>
                  <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--bg-secondary-text)' }}>
                    {act.timestamp ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

