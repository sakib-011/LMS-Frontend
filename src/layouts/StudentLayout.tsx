import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './StudentLayout.css';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { to: '/student', icon: 'fas fa-home', label: 'Dashboard', end: true },
    ],
  },
  {
    label: 'Library',
    items: [
      { to: '/student/books', icon: 'fas fa-book-open', label: 'Books' },
      { to: '/student/digital-library', icon: 'fas fa-tablet-alt', label: 'Digital Library' },
      { to: '/student/search', icon: 'fas fa-search', label: 'Search' },
    ],
  },
  {
    label: 'My Account',
    items: [
      { to: '/student/library', icon: 'fas fa-bookmark', label: 'My Library' },
      { to: '/student/reservations', icon: 'fas fa-calendar-check', label: 'Reservations' },
      { to: '/student/requests', icon: 'fas fa-paper-plane', label: 'Book Requests' },
      { to: '/student/wishlist', icon: 'fas fa-heart', label: 'Wishlist' },
    ],
  },
  {
    label: 'Activity',
    items: [
      { to: '/student/reviews', icon: 'fas fa-star', label: 'Reviews' },
      { to: '/student/notifications', icon: 'fas fa-bell', label: 'Notifications', badge: true },
    ],
  },
];

export const StudentLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const unread = 0;

  const displayName = user?.name || 'Student User';
  const displayId = user?.id || 'STD-001';

  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  return (
    <div className={`sl-shell ${isCollapsed ? 'sl-shell--collapsed' : ''}`}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="sl-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ——— Sidebar ——— */}
      <aside className={`sl-sidebar ${sidebarOpen ? 'sl-sidebar--open' : ''} ${isCollapsed ? 'sl-sidebar--collapsed' : ''}`}>

        {/* Brand */}
        <div className="sl-brand">
          <Link to="/" className="sl-logo">
            <div className="sl-logo-icon-wrap">
              <i className="fas fa-book"></i>
            </div>
            {!isCollapsed && (
              <div className="sl-logo-stack">
                <span className="sl-logo-text">BookGrid</span>
                <span className="sl-logo-sub">STUDENT PORTAL</span>
              </div>
            )}
          </Link>
          <div className="sl-brand-actions">
            <button 
              className="sl-collapse-btn" 
              onClick={() => setIsCollapsed(!isCollapsed)} 
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <i className={`fas fa-chevron-${isCollapsed ? 'right' : 'left'}`}></i>
            </button>
            <button className="sl-close-btn" onClick={() => setSidebarOpen(false)} aria-label="Close sidebar">
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Student Identity Card */}
        <div className="sl-identity">
          <div className="sl-identity-avatar" title={isCollapsed ? `${displayName} (${displayId})` : undefined}>
            <i className="fas fa-user-graduate"></i>
          </div>
          {!isCollapsed && (
            <div className="sl-identity-info">
              <strong>{displayName}</strong>
              <span>{displayId}</span>
              <span className="sl-identity-dept">Student Account</span>
            </div>
          )}
        </div>

        {/* Navigation Groups */}
        <nav className="sl-nav">
          {NAV_GROUPS.map(group => (
            <div key={group.label} className="sl-nav-group">
              {!isCollapsed && <p className="sl-nav-group-label">{group.label}</p>}
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={(item as any).end}
                  className={({ isActive }) =>
                    `sl-nav-link ${isActive ? 'sl-nav-link--active' : ''}`
                  }
                  title={isCollapsed ? item.label : undefined}
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sl-nav-icon-wrap">
                    <i className={item.icon}></i>
                  </span>
                  {!isCollapsed && <span className="sl-nav-label">{item.label}</span>}
                  {(item as any).badge && unread > 0 && (
                    <span className={`sl-nav-badge ${isCollapsed ? 'sl-nav-badge--dot' : ''}`}>
                      {isCollapsed ? '' : unread}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sl-sidebar-footer">
          <NavLink
            to="/student/profile"
            className={({ isActive }) => `sl-nav-link ${isActive ? 'sl-nav-link--active' : ''}`}
            title={isCollapsed ? "Profile" : undefined}
          >
            <span className="sl-nav-icon-wrap"><i className="fas fa-user-circle"></i></span>
            {!isCollapsed && <span className="sl-nav-label">Profile</span>}
          </NavLink>
          <NavLink
            to="/student/settings"
            className={({ isActive }) => `sl-nav-link ${isActive ? 'sl-nav-link--active' : ''}`}
            title={isCollapsed ? "Settings" : undefined}
          >
            <span className="sl-nav-icon-wrap"><i className="fas fa-cog"></i></span>
            {!isCollapsed && <span className="sl-nav-label">Settings</span>}
          </NavLink>
          <button 
            type="button"
            onClick={handleSignOut} 
            className="sl-nav-link sl-nav-link--signout" 
            title={isCollapsed ? "Sign Out" : undefined}
            style={{ background: 'none', border: 'none', width: '100%', cursor: 'pointer', textAlign: 'left' }}
          >
            <span className="sl-nav-icon-wrap"><i className="fas fa-sign-out-alt"></i></span>
            {!isCollapsed && <span className="sl-nav-label">Sign Out</span>}
          </button>
        </div>
      </aside>


      {/* ——— Main column ——— */}
      <div className="sl-main">
        {/* Mobile bar */}
        <div className="sl-mobile-bar">
          <button className="sl-menu-btn" onClick={() => setSidebarOpen(true)}>
            <i className="fas fa-bars"></i>
          </button>
          <Link to="/" className="sl-mobile-brand">
            <i className="fas fa-book" style={{ color: 'var(--bg-warm-orange)' }}></i>
            <span>BookGrid</span>
          </Link>
        </div>

        {/* Page content */}
        <main className="sl-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
