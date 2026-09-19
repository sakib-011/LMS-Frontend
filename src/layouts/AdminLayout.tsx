import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<'mail' | 'notifications' | 'profile' | null>(null);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleDropdown = (dropdown: 'mail' | 'notifications' | 'profile') => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const displayName = user?.name || 'Administrator';
  const displayRole = (user?.role || 'ADMINISTRATOR').toUpperCase();

  const MENU_GROUPS = [
    {
      title: 'OVERVIEW',
      items: [
        { path: '/admin', icon: 'fas fa-tachometer-alt', label: 'Dashboard' },
        { path: '/admin/analytics', icon: 'fas fa-chart-line', label: 'Analytics' },
      ]
    },
    {
      title: 'ACCESS CONTROL',
      items: [
        { path: '/admin/users', icon: 'fas fa-users', label: 'Users' },
        { path: '/admin/moderators', icon: 'fas fa-user-tie', label: 'Moderators' },
        { path: '/admin/roles', icon: 'fas fa-user-tag', label: 'Roles' },
        { path: '/admin/permissions', icon: 'fas fa-key', label: 'Permissions' },
      ]
    },
    {
      title: 'CATALOG & INVENTORY',
      items: [
        { path: '/admin/books', icon: 'fas fa-book', label: 'Books' },
        { path: '/admin/inventory', icon: 'fas fa-boxes', label: 'Inventory' },
        { path: '/admin/digital-library', icon: 'fas fa-laptop', label: 'Digital Library' },
        { path: '/admin/acquisition', icon: 'fas fa-shopping-cart', label: 'Acquisition' },
      ]
    },
    {
      title: 'CIRCULATION',
      items: [
        { path: '/admin/borrowing', icon: 'fas fa-hand-holding', label: 'Borrowing' },
        { path: '/admin/returns', icon: 'fas fa-undo', label: 'Returns' },
        { path: '/admin/reservations', icon: 'fas fa-calendar-check', label: 'Reservations' },
        { path: '/admin/requests', icon: 'fas fa-paper-plane', label: 'Requests' },
        { path: '/admin/fines', icon: 'fas fa-money-bill-wave', label: 'Fines' },
      ]
    },
    {
      title: 'SYSTEM & LOGS',
      items: [
        { path: '/admin/reports', icon: 'fas fa-file-alt', label: 'Reports' },
        { path: '/admin/notifications', icon: 'fas fa-bell', label: 'Notifications' },
        { path: '/admin/audit-logs', icon: 'fas fa-history', label: 'Audit Logs' },
        { path: '/admin/security', icon: 'fas fa-shield-alt', label: 'Security' },
        { path: '/admin/settings', icon: 'fas fa-cog', label: 'Settings' },
        { path: '/admin/backup', icon: 'fas fa-database', label: 'Backup' },
      ]
    }
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarOpen ? '' : 'admin-sidebar-closed'}`}>
        <div className="admin-sidebar-header">
          <Link to="/" style={{ textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="admin-logo-mark">BG</div>
            {sidebarOpen && <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>AdminPanel</span>}
          </Link>
          <button className="admin-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <i className={`fas fa-chevron-${sidebarOpen ? 'left' : 'right'}`}></i>
          </button>
        </div>

        <nav className="admin-nav">
          {MENU_GROUPS.map((group, i) => (
            <div key={i} className="admin-nav-group">
              <p className="admin-nav-label" style={{ opacity: sidebarOpen ? 1 : 0 }}>{group.title}</p>
              {group.items.map(item => (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className={`admin-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <i className={item.icon}></i>
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        
        <div className="admin-sidebar-footer">
          <button onClick={handleSignOut} className="admin-nav-link" style={{ color: 'var(--bg-error)', background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}>
            <i className="fas fa-sign-out-alt"></i>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      <div className="admin-main-content">
        {/* Topbar */}
        <header className="admin-topbar">
          <div className="admin-topbar-search">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Global system search..." />
          </div>
          <div className="admin-topbar-actions">
            <div style={{ position: 'relative' }}>
              <button className="admin-icon-btn" onClick={() => toggleDropdown('mail')}>
                <i className="fas fa-envelope"></i>
              </button>
              {openDropdown === 'mail' && (
                <div className="admin-dropdown">
                  <div className="admin-dropdown-header">Messages</div>
                  <div className="admin-dropdown-item">No new messages</div>
                </div>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <button className="admin-icon-btn" onClick={() => toggleDropdown('notifications')}>
                <i className="fas fa-bell"></i>
                <span className="admin-badge">3</span>
              </button>
              {openDropdown === 'notifications' && (
                <div className="admin-dropdown">
                  <div className="admin-dropdown-header">Notifications</div>
                  <div className="admin-dropdown-item"><i className="fas fa-info-circle"></i> System update completed</div>
                  <div className="admin-dropdown-item"><i className="fas fa-exclamation-triangle"></i> High server load detected</div>
                  <div className="admin-dropdown-item"><i className="fas fa-user-plus"></i> New admin account created</div>
                </div>
              )}
            </div>
            
            <div style={{ position: 'relative' }}>
              <div className="admin-profile" onClick={() => toggleDropdown('profile')}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>{displayName}</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{displayRole}</p>
                </div>
                <div className="admin-avatar">
                  <i className="fas fa-user-cog"></i>
                </div>
              </div>
              {openDropdown === 'profile' && (
                <div className="admin-dropdown" style={{ right: 0, minWidth: '200px' }}>
                  <Link to="/admin/settings" className="admin-dropdown-item" onClick={() => setOpenDropdown(null)}>
                    <i className="fas fa-cog"></i> Settings
                  </Link>
                  <Link to="/admin/security" className="admin-dropdown-item" onClick={() => setOpenDropdown(null)}>
                    <i className="fas fa-shield-alt"></i> Security
                  </Link>
                  <div style={{ borderTop: '1px solid var(--border-color)', margin: '4px 0' }}></div>
                  <button onClick={handleSignOut} className="admin-dropdown-item" style={{ color: 'var(--status-error)', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-page-wrapper">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

