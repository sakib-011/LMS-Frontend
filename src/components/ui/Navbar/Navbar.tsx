import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../Button/Button';
import { useAuth } from '../../../context/AuthContext';
import './Navbar.css';

export interface NavbarProps {
  onMenuClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const getPanelRoute = () => {
    if (!user) return '/login';
    const role = (user.role || '').toUpperCase();
    if (role === 'STUDENT') return '/student';
    if (role === 'MODERATOR') return '/moderator';
    if (role === 'ADMINISTRATOR' || role === 'ADMIN') return '/admin';
    return '/';
  };

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-navbar">
      <div className="bg-navbar-left">
        {onMenuClick && (
          <button className="bg-navbar-menu-btn" onClick={onMenuClick}>
            <i className="fas fa-bars"></i>
          </button>
        )}
        <Link to="/" className="bg-navbar-logo">
          <i className="fas fa-book bg-navbar-logo-icon"></i>
          <span className="bg-navbar-logo-text">BookGrid</span>
        </Link>
      </div>

      <div className="bg-navbar-center">
        <Link to="/" className="bg-navbar-link">Home</Link>
        <Link to="/books" className="bg-navbar-link">Browse Books</Link>
        <Link to="/categories" className="bg-navbar-link">Categories</Link>
        <Link to="/how-it-works" className="bg-navbar-link">How It Works</Link>
        <Link to="/about" className="bg-navbar-link">About</Link>
      </div>
      
      <div className="bg-navbar-right">
        {isAuthenticated && user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to={getPanelRoute()} style={{ textDecoration: 'none' }}>
              <Button variant="outline" size="sm" icon="fas fa-user-graduate">
                My Panel ({(user.role || '').toUpperCase()})
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleSignOut} icon="fas fa-sign-out-alt">
              Sign Out
            </Button>
          </div>
        ) : (
          <>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="sm">Create Account</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

