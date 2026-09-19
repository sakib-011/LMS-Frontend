import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'var(--bg-warm-cream)'
    }}>
      <div style={{ padding: 'var(--space-6) var(--space-8)' }}>
        <Link to="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          textDecoration: 'none',
          color: 'var(--bg-deep-black)'
        }}>
          <i className="fas fa-book" style={{ color: 'var(--bg-warm-orange)', fontSize: '1.5rem' }}></i>
          <span style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.5rem',
            fontWeight: 700,
            letterSpacing: '-0.02em'
          }}>BookGrid</span>
        </Link>
      </div>

      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        paddingBottom: 'var(--space-16)'
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};
