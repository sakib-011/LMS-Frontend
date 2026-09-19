import React, { useState } from 'react';
import { Button, Badge, ConfirmationDialog, Toggle } from '../../components/ui';
import './Admin.css';

const MOCK_ALERTS = [
  { id: 'sec-1', severity: 'high', type: 'Brute Force', description: '25 failed login attempts in 5 minutes for user admin@bookgrid.com.', sourceIp: '192.168.1.105', time: '10 mins ago', status: 'Active' },
  { id: 'sec-2', severity: 'medium', type: 'Unusual Access', description: 'Login from new geographic location (Singapore) for user STU1002.', sourceIp: '203.0.113.42', time: '1 hour ago', status: 'Active' },
  { id: 'sec-3', severity: 'low', type: 'Expired Session', description: 'Force token revocation requested by user.', sourceIp: '192.168.1.55', time: '3 hours ago', status: 'Resolved' },
  { id: 'sec-4', severity: 'high', type: 'DDoS Pattern', description: 'Rapid API requests exceeding rate limit on /api/catalog.', sourceIp: '10.0.0.99', time: '1 day ago', status: 'Resolved' },
];

export const AdminSecurity: React.FC = () => {
  const [alerts, setAlerts] = useState(MOCK_ALERTS);
  const [blockedIps, setBlockedIps] = useState<string[]>(['10.0.0.50', '192.168.1.200']);
  const [blockedIpSearch, setBlockedIpSearch] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, title: string, message: string, isDestructive?: boolean, action?: () => void}>({ isOpen: false, title: '', message: '' });

  const [settings, setSettings] = useState({
    mfaEnabled: true,
    complexPasswords: true,
    lockoutEnabled: true,
    sessionTimeout: '30'
  });

  const handleResolve = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, status: 'Resolved' } : a));
  };

  const handleBlockIp = (id: string, ip: string) => {
    if (!blockedIps.includes(ip)) {
      setBlockedIps([...blockedIps, ip]);
    }
    handleResolve(id);
  };

  const handleUnblockIp = (ip: string) => {
    setBlockedIps(blockedIps.filter(blockedIp => blockedIp !== ip));
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">System Security Settings</h1>
          <p className="admin-subtitle">Monitor threats, manage authentication policies, and review active alerts.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button variant="primary">
            <i className="fas fa-shield-alt" style={{ marginRight: '8px' }}></i> Run Security Audit
          </Button>
        </div>
      </div>

      <div className="admin-grid" style={{ gridTemplateColumns: '1fr 2fr', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Security Policies */}
          <div className="admin-card">
          <h3 style={{ margin: '0 0 var(--space-4) 0', fontSize: '1.125rem', color: 'var(--text-primary)' }}>Authentication Policies</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Require Multi-Factor Auth (MFA)</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Force all administrators and moderators to use 2FA.</p>
              </div>
              <Toggle 
                checked={settings.mfaEnabled}
                onChange={(e) => setSettings({...settings, mfaEnabled: e.target.checked})}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Strong Passwords Required</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Enforce 12+ chars, numbers, and symbols.</p>
              </div>
              <Toggle 
                checked={settings.complexPasswords}
                onChange={(e) => setSettings({...settings, complexPasswords: e.target.checked})}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Account Lockout Enabled</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Lock account after 5 failed login attempts.</p>
              </div>
              <Toggle 
                checked={settings.lockoutEnabled}
                onChange={(e) => setSettings({...settings, lockoutEnabled: e.target.checked})}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Idle Session Timeout (Minutes)</label>
              <select 
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({...settings, sessionTimeout: e.target.value})}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white' }}
              >
                <option value="15">15 Minutes</option>
                <option value="30">30 Minutes</option>
                <option value="60">1 Hour</option>
                <option value="120">2 Hours</option>
                <option value="never">Never (Not Recommended)</option>
              </select>
            </div>
            
            <Button variant="outline" style={{ marginTop: '10px', width: '100%', display: 'flex', justifyContent: 'center' }}>
              Save Policy Changes
            </Button>
          </div>
        </div>

        {/* Blocked IPs */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem', color: 'var(--text-primary)' }}>Firewall: Blocked IPs</h3>
            <Badge variant="neutral">{blockedIps.length}</Badge>
          </div>
          
          <div style={{ marginBottom: '16px', position: 'relative' }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}></i>
            <input 
              type="text" 
              placeholder="Search IP addresses..." 
              value={blockedIpSearch}
              onChange={(e) => setBlockedIpSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 32px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', outline: 'none' }}
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
            {blockedIps.length === 0 ? (
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '16px 0' }}>No IPs currently blocked.</p>
            ) : blockedIps.filter(ip => ip.includes(blockedIpSearch)).length === 0 ? (
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '16px 0' }}>No matching IPs found.</p>
            ) : (
              blockedIps.filter(ip => ip.includes(blockedIpSearch)).map(ip => (
                <div key={ip} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '0.875rem', color: 'var(--text-primary)' }}>{ip}</p>
                  <Button size="sm" variant="outline" title="Remove Block" onClick={() => handleUnblockIp(ip)}>
                    Unblock
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

        {/* Security Alerts */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem', color: 'var(--text-primary)' }}>Active Threat Alerts</h3>
            <Badge variant="error">{alerts.filter(a => a.status === 'Active').length} Threats Detected</Badge>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {alerts.map(alert => (
              <div key={alert.id} style={{ 
                padding: '16px', 
                border: `1px solid ${alert.status === 'Resolved' ? 'var(--border-color)' : alert.severity === 'high' ? 'rgba(231, 76, 60, 0.3)' : 'rgba(241, 196, 15, 0.3)'}`,
                borderRadius: 'var(--radius-md)',
                background: alert.status === 'Resolved' ? 'transparent' : alert.severity === 'high' ? 'rgba(231, 76, 60, 0.05)' : 'rgba(241, 196, 15, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                opacity: alert.status === 'Resolved' ? 0.6 : 1
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <i className={`fas fa-${alert.type === 'Brute Force' ? 'unlock-alt' : alert.type === 'Unusual Access' ? 'globe' : alert.type === 'DDoS Pattern' ? 'network-wired' : 'shield-alt'}`} style={{ color: alert.status === 'Resolved' ? 'var(--text-secondary)' : alert.severity === 'high' ? 'var(--status-error)' : 'var(--status-warning)' }}></i>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{alert.type}</p>
                      {alert.status === 'Resolved' && <Badge variant="neutral">Resolved</Badge>}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{alert.description}</p>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{alert.time}</p>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: alert.status === 'Resolved' ? 'none' : '1px solid rgba(0,0,0,0.05)', paddingTop: alert.status === 'Resolved' ? '0' : '12px' }}>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>Source IP: {alert.sourceIp}</p>
                  
                  {alert.status === 'Active' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button size="sm" variant="outline" onClick={() => setConfirmDialog({
                        isOpen: true, 
                        title: 'Block IP Address', 
                        message: `Are you sure you want to block IP ${alert.sourceIp} at the firewall level?`,
                        isDestructive: true,
                        action: () => handleBlockIp(alert.id, alert.sourceIp)
                      })}>
                        Block IP
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleResolve(alert.id)}>
                        Mark Resolved
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ConfirmationDialog 
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={() => {
          if (confirmDialog.action) confirmDialog.action();
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDestructive={confirmDialog.isDestructive}
      />
    </div>
  );
};
