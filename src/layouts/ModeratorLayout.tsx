import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ModeratorLayout.css';

export const ModeratorLayout: React.FC = () => {
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

  const displayName = user?.name || 'Moderator Staff';
  const displayRole = (user?.role || 'MODERATOR').toUpperCase();

  const MENU_ITEMS = [
    { path: '/moderator', icon: 'fas fa-chart-pie', label: 'Dashboard', permission: true },
    { path: '/moderator/books', icon: 'fas fa-book', label: 'Books', permission: true },
    { path: '/moderator/inventory', icon: 'fas fa-boxes', label: 'Inventory', permission: true },
    { path: '/moderator/students', icon: 'fas fa-users', label: 'Students', permission: true },
    { path: '/moderator/borrowing', icon: 'fas fa-hand-holding', label: 'Borrowing', permission: true },
    { path: '/moderator/returns', icon: 'fas fa-undo', label: 'Returns', permission: true },
    { path: '/moderator/reservations', icon: 'fas fa-calendar-check', label: 'Reservations', permission: true },
    { path: '/moderator/requests', icon: 'fas fa-paper-plane', label: 'Book Requests', permission: true },
    { path: '/moderator/fines', icon: 'fas fa-money-bill-wave', label: 'Fines', permission: true },
    { path: '/moderator/digital-library', icon: 'fas fa-laptop', label: 'Digital Library', permission: true },
    { path: '/moderator/reports', icon: 'fas fa-chart-bar', label: 'Reports', permission: true },
    { path: '/moderator/activity', icon: 'fas fa-history', label: 'Activity Logs', permission: true },
  ];

  return (
    <div className="mod-layout">
      {/* Sidebar */}
      <div className={`mod-sidebar ${sidebarOpen ? '' : 'mod-sidebar-closed'}`}>
        <div className="mod-sidebar-header">
          <Link to="/" style={{ textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: 'var(--bg-accent-blue)', color: 'white', width: 32, height: 32, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              BG
            </div>
            {sidebarOpen && <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>BookGrid</span>}
          </Link>
          <button className="mod-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <i className={`fas fa-chevron-${sidebarOpen ? 'left' : 'right'}`}></i>
          </button>
        </div>

        <nav className="mod-nav">
          <p className="mod-nav-label">{sidebarOpen ? 'MODERATOR PANEL' : 'MOD'}</p>
          {MENU_ITEMS.filter(item => item.permission).map(item => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`mod-nav-link ${location.pathname === item.path ? 'active' : ''}`}
              title={!sidebarOpen ? item.label : undefined}
            >
              <i className={item.icon}></i>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
        
        <div className="mod-sidebar-footer">
          <button onClick={handleSignOut} className="mod-nav-link" style={{ color: 'var(--bg-error)', background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}>
            <i className="fas fa-sign-out-alt"></i>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      <div className="mod-main-content">
        {/* Topbar */}
        <header className="mod-topbar">
          <div className="mod-topbar-search">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Global search (books, users, barcodes)..." />
          </div>
          <div className="mod-topbar-actions">
            <div style={{ position: 'relative' }}>
              <button className="mod-icon-btn" onClick={() => toggleDropdown('mail')}>
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
              <button className="mod-icon-btn" onClick={() => toggleDropdown('notifications')}>
                <i className="fas fa-bell"></i>
                <span className="mod-badge">3</span>
              </button>
              {openDropdown === 'notifications' && (
                <div className="admin-dropdown">
                  <div className="admin-dropdown-header">Notifications</div>
                  <div className="admin-dropdown-item"><i className="fas fa-book"></i> Clean Code returned</div>
                  <div className="admin-dropdown-item"><i className="fas fa-exclamation-circle"></i> Overdue book alert</div>
                </div>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <div className="mod-profile" onClick={() => toggleDropdown('profile')}>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem' }}>{displayName}</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{displayRole}</p>
                </div>
                <div className="mod-avatar">
                  {displayName.charAt(0)}
                </div>
              </div>
              {openDropdown === 'profile' && (
                <div className="admin-dropdown" style={{ right: 0, minWidth: '200px' }}>
                  <button onClick={handleSignOut} className="admin-dropdown-item" style={{ color: 'var(--status-error)', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="mod-page-wrapper">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

