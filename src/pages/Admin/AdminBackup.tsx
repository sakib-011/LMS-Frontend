import React, { useState } from 'react';
import { Button, Badge, ConfirmationDialog, Toggle } from '../../components/ui';
import './Admin.css';

const MOCK_BACKUPS = [
  { id: 'bkp-1', date: '2026-09-15 03:00 AM', type: 'Automated', size: '2.4 GB', status: 'Completed', storage: 'AWS S3 (us-east-1)' },
  { id: 'bkp-2', date: '2026-09-14 03:00 AM', type: 'Automated', size: '2.4 GB', status: 'Completed', storage: 'AWS S3 (us-east-1)' },
  { id: 'bkp-3', date: '2026-09-13 03:00 AM', type: 'Automated', size: '2.3 GB', status: 'Completed', storage: 'AWS S3 (us-east-1)' },
  { id: 'bkp-4', date: '2026-09-12 14:30 PM', type: 'Manual', size: '2.3 GB', status: 'Completed', storage: 'Local Server' },
  { id: 'bkp-5', date: '2026-09-12 03:00 AM', type: 'Automated', size: '2.3 GB', status: 'Failed', storage: 'AWS S3 (us-east-1)' },
];

export const AdminBackup: React.FC = () => {
  const [backups, setBackups] = useState(MOCK_BACKUPS);
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, title: string, message: string, isDestructive?: boolean}>({ isOpen: false, title: '', message: '' });
  const [isBackupRunning, setIsBackupRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const [settings, setSettings] = useState({
    autoBackup: true,
    frequency: 'Daily',
    time: '03:00',
    retention: '30',
    target: 's3'
  });

  const handleManualBackup = () => {
    setIsBackupRunning(true);
    setProgress(0);
    
    // Simulate backup progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBackupRunning(false);
          
          // Add new backup to list
          const newBackup = {
            id: `bkp-${Date.now()}`,
            date: new Date().toLocaleString(),
            type: 'Manual',
            size: '2.5 GB',
            status: 'Completed',
            storage: 'Local Server'
          };
          setBackups([newBackup, ...backups]);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  return (
    <div>
      <div className="admin-header">
        <div>
          <h1 className="admin-title">System Backup & Restore</h1>
          <p className="admin-subtitle">Manage database snapshots, configure automated backups, and restore system state.</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Button variant="primary" onClick={handleManualBackup} disabled={isBackupRunning}>
            {isBackupRunning ? (
              <><i className="fas fa-circle-notch fa-spin" style={{ marginRight: '8px' }}></i> Backing Up... {progress}%</>
            ) : (
              <><i className="fas fa-database" style={{ marginRight: '8px' }}></i> Trigger Manual Backup</>
            )}
          </Button>
        </div>
      </div>

      {isBackupRunning && (
        <div className="admin-card" style={{ marginBottom: 'var(--space-6)', borderLeft: '4px solid var(--bg-warm-orange)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>Backup in Progress</h3>
            <span style={{ fontWeight: 600, color: 'var(--bg-warm-orange)' }}>{progress}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: 'var(--bg-warm-orange)', transition: 'width 0.3s ease' }}></div>
          </div>
          <p style={{ margin: '8px 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Compressing database tables and migrating to local storage...</p>
        </div>
      )}

      <div className="admin-grid" style={{ gridTemplateColumns: '1fr 2fr', alignItems: 'start' }}>
        
        {/* Backup Configuration */}
        <div className="admin-card">
          <h3 style={{ margin: '0 0 var(--space-4) 0', fontSize: '1.125rem', color: 'var(--text-primary)' }}>Automation Settings</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>Automated Backups</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Run scheduled system backups.</p>
              </div>
              <Toggle 
                checked={settings.autoBackup}
                onChange={(e) => setSettings({...settings, autoBackup: e.target.checked})}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Backup Frequency</label>
              <select 
                value={settings.frequency}
                onChange={(e) => setSettings({...settings, frequency: e.target.value})}
                disabled={!settings.autoBackup}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white', opacity: settings.autoBackup ? 1 : 0.5 }}
              >
                <option value="Hourly">Hourly</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Execution Time</label>
              <input 
                type="time" 
                value={settings.time}
                onChange={(e) => setSettings({...settings, time: e.target.value})}
                disabled={!settings.autoBackup}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', opacity: settings.autoBackup ? 1 : 0.5 }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Retention Policy (Days)</label>
              <input 
                type="number" 
                value={settings.retention}
                onChange={(e) => setSettings({...settings, retention: e.target.value})}
                disabled={!settings.autoBackup}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', opacity: settings.autoBackup ? 1 : 0.5 }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Storage Target</label>
              <select 
                value={settings.target}
                onChange={(e) => setSettings({...settings, target: e.target.value})}
                disabled={!settings.autoBackup}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white', opacity: settings.autoBackup ? 1 : 0.5 }}
              >
                <option value="local">Local Server Storage</option>
                <option value="s3">Amazon S3 Cloud</option>
                <option value="gcs">Google Cloud Storage</option>
              </select>
            </div>

            <Button variant="outline" style={{ marginTop: '8px', width: '100%', justifyContent: 'center' }}>
              Save Configuration
            </Button>
          </div>
        </div>

        {/* Backup History */}
        <div className="admin-card">
          <h3 style={{ margin: '0 0 var(--space-4) 0', fontSize: '1.125rem', color: 'var(--text-primary)' }}>Backup History</h3>
          
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Storage Location</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {backups.map(bkp => (
                  <tr key={bkp.id}>
                    <td style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {bkp.date}
                    </td>
                    <td>
                      <Badge variant={bkp.type === 'Automated' ? 'secondary' : 'primary'}>{bkp.type}</Badge>
                    </td>
                    <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{bkp.size}</td>
                    <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <i className={`fas fa-${bkp.storage.includes('Local') ? 'server' : 'cloud'}`} style={{ marginRight: '6px' }}></i>
                      {bkp.storage}
                    </td>
                    <td>
                      {bkp.status === 'Completed' ? (
                        <span style={{ color: 'var(--status-success)', fontWeight: 600, fontSize: '0.875rem' }}><i className="fas fa-check-circle"></i> Completed</span>
                      ) : (
                        <span style={{ color: 'var(--status-error)', fontWeight: 600, fontSize: '0.875rem' }}><i className="fas fa-times-circle"></i> Failed</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <Button size="sm" variant="outline" title="Download Snapshot" disabled={bkp.status === 'Failed'}>
                          <i className="fas fa-download"></i>
                        </Button>
                        <Button size="sm" variant="outline" title="Restore System" disabled={bkp.status === 'Failed'} onClick={() => setConfirmDialog({
                          isOpen: true,
                          title: 'CRITICAL WARNING: Restore System',
                          message: `You are about to roll the entire database back to the snapshot taken on ${bkp.date}. ALL data created after this point will be permanently lost! Are you absolutely sure?`,
                          isDestructive: true
                        })}>
                          <i className="fas fa-history" style={{ color: 'var(--status-error)' }}></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmationDialog 
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={() => {
          setConfirmDialog({ ...confirmDialog, isOpen: false });
        }}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDestructive={confirmDialog.isDestructive}
      />
    </div>
  );
};
