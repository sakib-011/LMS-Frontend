import React, { useState, useEffect } from 'react';
import { Button, Badge, Modal } from '../../components/ui';
import { AdminService } from '../../services/adminService';
import './Admin.css';

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: { name: string; role: string };
  ipAddress: string;
  type: string;
  action: string;
  resource: string;
  status: string;
  details: string;
}

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  useEffect(() => {
    AdminService.getAuditLogs()
      .then((data: any) => {
        if (Array.isArray(data)) {
          setLogs(data);
        } else {
          setLogs([]);
        }
      })
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.actor?.name?.toLowerCase().includes(search.toLowerCase()) || 
                          log.action?.toLowerCase().includes(search.toLowerCase()) ||
                          log.resource?.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'All' || log.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">System Audit Logs</h1>
          <p className="admin-subtitle">Track all administrative actions, system events, and security flags.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <div className="admin-search">
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search actor, action, or resource..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            style={{ padding: '0 16px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-white)', color: 'var(--text-secondary)' }}
          >
            <option value="All">All Event Types</option>
            <option value="Auth">Authentication</option>
            <option value="Create">Creation (POST)</option>
            <option value="Update">Modification (PUT/PATCH)</option>
            <option value="Delete">Deletion (DELETE)</option>
            <option value="Security">Security Alerts</option>
            <option value="Financial">Financial Actions</option>
            <option value="System">System Processes</option>
          </select>
          <Button variant="outline">
            <i className="fas fa-download" style={{ marginRight: '8px' }}></i> Export CSV
          </Button>
        </div>
      </div>

      <div className="admin-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor / IP Address</th>
                <th>Event Type</th>
                <th>Action & Resource Affected</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id} style={{ opacity: log.status === 'Failed' ? 0.9 : 1, background: log.status === 'Failed' ? '#FDECEA' : 'transparent' }}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 600 }}>{log.timestamp.split(', ')[0]}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{log.timestamp.split(', ')[1]}</p>
                  </td>
                  <td>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {log.actor.name === 'System Auto-Process' && <i className="fas fa-robot" style={{ marginRight: '6px', color: 'var(--text-secondary)' }}></i>}
                      {log.actor.name}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>IP: {log.ipAddress}</p>
                  </td>
                  <td>
                    <Badge variant={
                      log.type === 'Security' || log.type === 'Delete' ? 'error' : 
                      log.type === 'Auth' ? 'secondary' : 
                      log.type === 'Financial' ? 'success' : 
                      'neutral'
                    }>
                      {log.type}
                    </Badge>
                  </td>
                  <td style={{ maxWidth: '300px' }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{log.action}</p>
                    <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.resource}
                    </p>
                  </td>
                  <td>
                    {log.status === 'Success' ? (
                      <span style={{ color: 'var(--status-success)', fontWeight: 600, fontSize: '0.875rem' }}><i className="fas fa-check-circle"></i> Success</span>
                    ) : (
                      <span style={{ color: 'var(--status-error)', fontWeight: 600, fontSize: '0.875rem' }}><i className="fas fa-exclamation-triangle"></i> Failed</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <Button size="sm" variant="outline" title="View JSON Payload" onClick={() => setSelectedLog(log)}>
                      <i className="fas fa-code"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredLogs.length === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--space-8) 0', color: 'var(--text-secondary)' }}>
              <i className="fas fa-history" style={{ fontSize: '2rem', marginBottom: 'var(--space-4)', opacity: 0.5 }}></i>
              <p>No audit logs found matching your filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Log Details Modal */}
      <Modal 
        isOpen={selectedLog !== null} 
        onClose={() => setSelectedLog(null)}
        title="Audit Log Details"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="primary" onClick={() => setSelectedLog(null)}>Close</Button>
          </div>
        }
      >
        {selectedLog && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Log ID</p>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', fontFamily: 'monospace' }}>{selectedLog.id}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Timestamp</p>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>{selectedLog.timestamp}</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Actor</p>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>{selectedLog.actor.name} ({selectedLog.actor.role})</p>
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>IP Address</p>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', fontFamily: 'monospace' }}>{selectedLog.ipAddress}</p>
              </div>
            </div>

            <div>
              <p style={{ margin: '0 0 8px 0', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>Raw JSON Payload</p>
              <pre style={{ 
                background: '#1E1E1E', 
                color: '#D4D4D4', 
                padding: '16px', 
                borderRadius: 'var(--radius-md)', 
                overflowX: 'auto',
                fontSize: '0.875rem',
                margin: 0
              }}>
{JSON.stringify({
  eventId: selectedLog.id,
  timestamp: selectedLog.timestamp,
  eventType: selectedLog.type,
  action: selectedLog.action,
  status: selectedLog.status,
  actor: {
    name: selectedLog.actor.name,
    ip: selectedLog.ipAddress
  },
  resource: selectedLog.resource,
  metadata: JSON.parse(selectedLog.details)
}, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};
