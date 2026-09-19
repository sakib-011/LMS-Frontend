import React, { useState } from 'react';
import { Button, Badge, DataTable, Modal } from '../../components/ui';
import './Moderator.css';

interface SystemActivity {
  id: string;
  timestamp: string;
  user: string;
  role: 'Student' | 'Moderator' | 'Admin';
  action: string;
  module: string;
  ipAddress: string;
}

const MOCK_SYSTEM_ACTIVITY: SystemActivity[] = [
  { id: 'LOG-9921', timestamp: '2026-09-18 10:45:12', user: 'Sakib Shourov', role: 'Student', action: 'Borrowed "Clean Code"', module: 'Circulation', ipAddress: '192.168.1.45' },
  { id: 'LOG-9920', timestamp: '2026-09-18 10:30:05', user: 'Sarah Librarian', role: 'Moderator', action: 'Issued fine F-1001 to STU-2024-0440', module: 'Fines', ipAddress: '10.0.0.12' },
  { id: 'LOG-9919', timestamp: '2026-09-18 09:15:00', user: 'Jane Smith', role: 'Student', action: 'Returned "Sapiens"', module: 'Circulation', ipAddress: '192.168.1.88' },
  { id: 'LOG-9918', timestamp: '2026-09-17 16:20:33', user: 'Admin User', role: 'Admin', action: 'Updated permissions for "Moderator" role', module: 'Settings', ipAddress: '10.0.0.5' },
  { id: 'LOG-9917', timestamp: '2026-09-17 14:10:11', user: 'John Doe', role: 'Student', action: 'Requested book "Designing Data-Intensive Applications"', module: 'Requests', ipAddress: '192.168.1.102' },
  { id: 'LOG-9916', timestamp: '2026-09-17 11:05:44', user: 'Sarah Librarian', role: 'Moderator', action: 'Approved reservation RES-0012', module: 'Reservations', ipAddress: '10.0.0.12' },
];

export const ModActivity: React.FC = () => {
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [moduleFilter, setModuleFilter] = useState<string>('all');

  const filteredLogs = MOCK_SYSTEM_ACTIVITY.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(search.toLowerCase()) || 
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.id.toLowerCase().includes(search.toLowerCase());
    const matchesModule = moduleFilter === 'all' || log.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  const getModules = () => {
    return Array.from(new Set(MOCK_SYSTEM_ACTIVITY.map(l => l.module)));
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Admin': return <Badge variant="error">{role}</Badge>;
      case 'Moderator': return <Badge variant="warning">{role}</Badge>;
      case 'Student': return <Badge variant="neutral">{role}</Badge>;
      default: return <Badge variant="neutral">{role}</Badge>;
    }
  };

  const columns = [
    { key: 'timestamp', header: 'Timestamp', render: (item: SystemActivity) => <span style={{ color: 'var(--bg-secondary-text)', fontSize: '0.875rem' }}>{item.timestamp}</span> },
    { 
      key: 'user', 
      header: 'User', 
      render: (item: SystemActivity) => (
        <div>
          <span style={{ fontWeight: 500, display: 'block' }}>{item.user}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--bg-secondary-text)' }}>IP: {item.ipAddress}</span>
        </div>
      ) 
    },
    { key: 'role', header: 'Role', render: (item: SystemActivity) => getRoleBadge(item.role) },
    { key: 'module', header: 'Module', render: (item: SystemActivity) => <Badge variant="neutral" size="sm">{item.module}</Badge> },
    { key: 'action', header: 'Action' }
  ];

  return (
    <div>
      <div className="mod-card-header">
        <div>
          <h1 className="mod-card-title">System Activity Logs</h1>
          <p style={{ color: 'var(--bg-secondary-text)', fontSize: '0.875rem' }}>Monitor all system events, actions, and audit trails.</p>
        </div>
        <Button variant="outline" icon="fas fa-download">Export CSV</Button>
      </div>

      <div className="mod-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <div style={{ position: 'relative', width: 350 }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: 12, top: 10, color: 'var(--bg-secondary-text)' }}></i>
            <input 
              type="text" 
              placeholder="Search by user, action, or Log ID..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 36px', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-md)' }}
            />
          </div>
          <Button variant="outline" icon="fas fa-filter" onClick={() => setIsFilterOpen(true)}>
            Filter
            {moduleFilter !== 'all' && <Badge variant="neutral" size="sm" style={{ marginLeft: 8, padding: '0 4px' }}>1</Badge>}
          </Button>
        </div>
        
        <DataTable data={filteredLogs} columns={columns} />
      </div>

      <Modal 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
        title="Filter Activity Logs"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
            <Button variant="outline" onClick={() => {
              setModuleFilter('all');
              setIsFilterOpen(false);
            }}>Clear Filters</Button>
            <Button variant="primary" onClick={() => setIsFilterOpen(false)}>Apply Filters</Button>
          </div>
        }
      >
        <div style={{ padding: 'var(--space-2) 0' }}>
          <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: 600 }}>System Module</label>
          <select 
            className="mod-input" 
            value={moduleFilter} 
            onChange={(e) => setModuleFilter(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--bg-border)', borderRadius: 'var(--radius-md)' }}
          >
            <option value="all">All Modules</option>
            {getModules().map(mod => (
              <option key={mod} value={mod}>{mod}</option>
            ))}
          </select>
        </div>
      </Modal>
    </div>
  );
};
