import React, { useState, useEffect } from 'react';
import { Button, Toggle } from '../../components/ui';
import { SettingsStorageService, SystemSettings } from '../../utils/settingsStorageService';
import './Admin.css';

export const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<SystemSettings>(SettingsStorageService.getSettings());
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    setSettings(SettingsStorageService.getSettings());
  }, []);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleChange = (field: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveAll = () => {
    SettingsStorageService.saveSettings(settings);
    showNotification('✓ System preferences & library policies saved successfully!');
  };

  return (
    <div>
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: '#10b981', color: 'white', padding: '12px 20px',
          borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600
        }}>
          <i className="fas fa-check-circle"></i> {notification}
        </div>
      )}

      <div className="admin-header">
        <div>
          <h1 className="admin-title">System Settings</h1>
          <p className="admin-subtitle">Configure global platform preferences, library policies, SMTP email, and localization.</p>
        </div>
        <Button variant="primary" onClick={handleSaveAll}>
          <i className="fas fa-save" style={{ marginRight: '8px' }}></i> Save All Changes
        </Button>
      </div>

      <div className="admin-grid" style={{ gridTemplateColumns: '250px 1fr', alignItems: 'start' }}>
        
        {/* Settings Navigation Sidebar */}
        <div className="admin-card" style={{ padding: 'var(--space-2)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button 
              className={`settings-nav-item ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: 'none', background: activeTab === 'general' ? 'rgba(230, 126, 34, 0.1)' : 'transparent', color: activeTab === 'general' ? 'var(--bg-warm-orange)' : 'var(--text-secondary)', fontWeight: activeTab === 'general' ? 600 : 400, borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
            >
              <i className="fas fa-sliders-h" style={{ width: '20px' }}></i> General
            </button>
            <button 
              className={`settings-nav-item ${activeTab === 'policies' ? 'active' : ''}`}
              onClick={() => setActiveTab('policies')}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: 'none', background: activeTab === 'policies' ? 'rgba(230, 126, 34, 0.1)' : 'transparent', color: activeTab === 'policies' ? 'var(--bg-warm-orange)' : 'var(--text-secondary)', fontWeight: activeTab === 'policies' ? 600 : 400, borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
            >
              <i className="fas fa-book-reader" style={{ width: '20px' }}></i> Library Policies
            </button>
            <button 
              className={`settings-nav-item ${activeTab === 'localization' ? 'active' : ''}`}
              onClick={() => setActiveTab('localization')}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: 'none', background: activeTab === 'localization' ? 'rgba(230, 126, 34, 0.1)' : 'transparent', color: activeTab === 'localization' ? 'var(--bg-warm-orange)' : 'var(--text-secondary)', fontWeight: activeTab === 'localization' ? 600 : 400, borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
            >
              <i className="fas fa-globe-americas" style={{ width: '20px' }}></i> Localization
            </button>
            <button 
              className={`settings-nav-item ${activeTab === 'email' ? 'active' : ''}`}
              onClick={() => setActiveTab('email')}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: 'none', background: activeTab === 'email' ? 'rgba(230, 126, 34, 0.1)' : 'transparent', color: activeTab === 'email' ? 'var(--bg-warm-orange)' : 'var(--text-secondary)', fontWeight: activeTab === 'email' ? 600 : 400, borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
            >
              <i className="fas fa-envelope" style={{ width: '20px' }}></i> Email & SMTP
            </button>
            <button 
              className={`settings-nav-item ${activeTab === 'integrations' ? 'active' : ''}`}
              onClick={() => setActiveTab('integrations')}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: 'none', background: activeTab === 'integrations' ? 'rgba(230, 126, 34, 0.1)' : 'transparent', color: activeTab === 'integrations' ? 'var(--bg-warm-orange)' : 'var(--text-secondary)', fontWeight: activeTab === 'integrations' ? 600 : 400, borderRadius: 'var(--radius-md)', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
            >
              <i className="fas fa-plug" style={{ width: '20px' }}></i> Integrations
            </button>
          </div>
        </div>

        {/* Settings Content Area */}
        <div className="admin-card" style={{ minHeight: '500px' }}>
          
          {activeTab === 'general' && (
            <div>
              <h3 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>General Information</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Library/Institution Name</label>
                    <input type="text" value={settings.libraryName} onChange={(e) => handleChange('libraryName', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Public Registration</label>
                    <div style={{ height: '42px', display: 'flex', alignItems: 'center' }}>
                      <Toggle 
                        checked={settings.allowPublicRegistration}
                        onChange={(e) => handleChange('allowPublicRegistration', e.target.checked)}
                        label="Allow users to register accounts"
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Support Email Address</label>
                    <input type="email" value={settings.contactEmail} onChange={(e) => handleChange('contactEmail', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Support Phone Number</label>
                    <input type="text" value={settings.supportPhone} onChange={(e) => handleChange('supportPhone', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Physical Address</label>
                  <textarea rows={3} value={settings.address} onChange={(e) => handleChange('address', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontFamily: 'inherit' }} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'policies' && (
            <div>
              <h3 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>Library Policies</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Max Active Loans Per User</label>
                    <input type="number" value={settings.maxBooksPerUser} onChange={(e) => handleChange('maxBooksPerUser', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }} />
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Maximum physical books a student can hold at once.</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Reservation Hold Time (Days)</label>
                    <input type="number" value={settings.maxReservationDays} onChange={(e) => handleChange('maxReservationDays', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }} />
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>How long a requested book stays on the hold shelf.</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Standard Fine Rate (Per Day)</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-secondary)' }}>$</span>
                      <input type="number" step="0.01" value={settings.finePerDay} onChange={(e) => handleChange('finePerDay', e.target.value)} style={{ width: '100%', padding: '10px 12px 10px 24px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'localization' && (
            <div>
              <h3 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>Localization</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '8px' }}>System Timezone</label>
                    <select value={settings.timezone} onChange={(e) => handleChange('timezone', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white' }}>
                      <option>UTC -08:00 Pacific Time</option>
                      <option>UTC -05:00 Eastern Time</option>
                      <option>UTC +00:00 London</option>
                      <option>UTC +05:30 India</option>
                      <option>UTC +06:00 Dhaka</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '8px' }}>System Language</label>
                    <select value={settings.language} onChange={(e) => handleChange('language', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white' }}>
                      <option>English (US)</option>
                      <option>Spanish (ES)</option>
                      <option>French (FR)</option>
                      <option>Bengali (BD)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '8px' }}>Currency Format</label>
                    <select value={settings.currency} onChange={(e) => handleChange('currency', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'white' }}>
                      <option>USD ($)</option>
                      <option>EUR (€)</option>
                      <option>GBP (£)</option>
                      <option>BDT (৳)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div>
              <h3 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>Email & SMTP Preferences</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '6px' }}>SMTP Host</label>
                    <input type="text" value={settings.smtpServer || 'smtp.bookgrid.edu'} onChange={(e) => handleChange('smtpServer', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '6px' }}>SMTP Port</label>
                    <input type="text" value={settings.smtpPort || '587'} onChange={(e) => handleChange('smtpPort', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '6px' }}>Notification Sender Address</label>
                  <input type="email" value={settings.smtpUser || 'notifications@bookgrid.edu'} onChange={(e) => handleChange('smtpUser', e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div>
              <h3 style={{ margin: '0 0 24px 0', fontSize: '1.25rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>Third-Party System Integrations</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9375rem', fontWeight: 700 }}>Google Workspace Single Sign-On (SSO)</h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Allow university students and staff to sign in using institutional Google OAuth.</p>
                  </div>
                  <Toggle checked={true} label="" />
                </div>
                <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9375rem', fontWeight: 700 }}>Stripe Payment Gateway</h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Process online student fine payments via credit card or digital wallets.</p>
                  </div>
                  <Toggle checked={true} label="" />
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
