import React, { useState } from 'react';
import { Button, Input, Toggle } from '../../components/ui';
import './Student.css';

type SetTab = 'account' | 'notifications' | 'privacy';

export const Settings: React.FC = () => {
  const [tab, setTab] = useState<SetTab>('account');
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [dueDates, setDueDates] = useState(true);
  const [newBooks, setNewBooks] = useState(false);

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!currentPassword) {
      setErrorMsg('Current password is required to save changes.');
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setErrorMsg('New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMsg('New passwords do not match.');
        return;
      }
    }

    setSaved(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSavePreferences = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <div className="sl-page-header">
        <h1 className="sl-page-title">Settings</h1>
        <p className="sl-page-subtitle">Manage your account preferences</p>
      </div>

      {saved && (
        <div style={{ backgroundColor: '#e6f4ea', border: '1px solid #ceead6', borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)', marginBottom: 'var(--space-6)', display: 'flex', gap: 'var(--space-3)', color: '#137333', fontSize: '0.875rem', fontWeight: 500, alignItems: 'center' }}>
          <i className="fas fa-check-circle"></i> Settings updated and saved successfully.
        </div>
      )}

      {errorMsg && (
        <div style={{ backgroundColor: '#fce8e6', border: '1px solid #fad2cf', borderRadius: 'var(--radius-md)', padding: 'var(--space-3) var(--space-4)', marginBottom: 'var(--space-6)', display: 'flex', gap: 'var(--space-3)', color: '#c5221f', fontSize: '0.875rem', fontWeight: 500, alignItems: 'center' }}>
          <i className="fas fa-exclamation-triangle"></i> {errorMsg}
        </div>
      )}

      <div className="sl-tabs">
        {(['account', 'notifications', 'privacy'] as SetTab[]).map(t => (
          <button key={t} className={`sl-tab ${tab === t ? 'sl-tab--active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'account' && (
        <div className="sl-card">
          <h3 className="sl-card-title">Account Security & Password</h3>
          <form onSubmit={handleSaveAccount} className="std-settings-form">
            <Input label="Full Name" defaultValue="Sakib Shourov" required />
            <Input label="Email" type="email" defaultValue="sakib.shourov@university.edu" required />
            <Input label="Phone" type="tel" defaultValue="+880 1700 000440" />
            <hr style={{ border: 'none', borderTop: '1px solid var(--bg-border)' }} />
            
            <h4 style={{ fontFamily: 'var(--font-sans)', margin: '0 0 var(--space-2)' }}>Password Authentication</h4>
            <Input 
              label="Current Password * (Required to confirm)" 
              type="password" 
              placeholder="Enter current password" 
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
            />
            <Input 
              label="New Password" 
              type="password" 
              placeholder="New password (min 6 characters)" 
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
            {newPassword && (
              <Input 
                label="Confirm New Password *" 
                type="password" 
                placeholder="Confirm new password" 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            )}
            <Button variant="primary" type="submit">Save Changes</Button>
          </form>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="sl-card">
          <h3 className="sl-card-title">Notification Preferences</h3>
          {[
            { label: 'Email notifications', sub: 'Receive important updates via email', state: emailNotifs, toggle: setEmailNotifs },
            { label: 'Due date reminders', sub: 'Remind me when books are due soon', state: dueDates, toggle: setDueDates },
            { label: 'New book alerts', sub: 'Get notified when new books are added', state: newBooks, toggle: setNewBooks },
          ].map(item => (
            <div key={item.label} className="std-settings-row">
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9375rem' }}>{item.label}</p>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--bg-secondary-text)' }}>{item.sub}</p>
              </div>
              <Toggle 
                checked={item.state} 
                onChange={() => item.toggle((v: boolean) => !v)} 
              />
            </div>
          ))}
          <Button variant="primary" onClick={handleSavePreferences} style={{ marginTop: 'var(--space-4)' }}>Save Preferences</Button>
        </div>
      )}

      {tab === 'privacy' && (
        <div className="sl-card">
          <h3 className="sl-card-title">Privacy</h3>
          <div className="std-settings-row">
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9375rem' }}>Public reading history</p>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--bg-secondary-text)' }}>Allow others to see your reading activity</p>
            </div>
            <Toggle defaultChecked={false} />
          </div>
          <div style={{ marginTop: 'var(--space-8)', padding: 'var(--space-4)', backgroundColor: 'rgba(201,92,84,0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(201,92,84,0.2)' }}>
            <h4 style={{ margin: '0 0 var(--space-2)', color: 'var(--bg-error)' }}>Danger Zone</h4>
            <p style={{ margin: '0 0 var(--space-4)', fontSize: '0.875rem', color: 'var(--bg-secondary-text)' }}>These actions are irreversible. Please be certain.</p>
            <Button variant="danger" icon="fas fa-trash">Delete Account</Button>
          </div>
        </div>
      )}
    </div>
  );
};
