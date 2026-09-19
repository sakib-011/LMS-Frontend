import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { AuthService } from '../../services/authService';
import './Auth.css';

type LoginState = 'idle' | 'loading' | 'invalid' | 'blocked' | 'suspended';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginState, setLoginState] = useState<LoginState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoginState('loading');
    setErrorMsg('');

    try {
      await login({ email, password });
      setLoginState('idle');

      const currentUser = AuthService.getCurrentUser();
      const role = (currentUser?.role || '').toUpperCase();

      // Check if user came from a protected route
      const fromPath = (location.state as any)?.from?.pathname;

      if (fromPath && (
        (role === 'STUDENT' && fromPath.startsWith('/student')) ||
        (role === 'MODERATOR' && fromPath.startsWith('/moderator')) ||
        ((role === 'ADMINISTRATOR' || role === 'ADMIN') && fromPath.startsWith('/admin'))
      )) {
        navigate(fromPath, { replace: true });
        return;
      }

      // Default role-isolated panel redirects
      if (role === 'STUDENT') {
        navigate('/student', { replace: true });
      } else if (role === 'MODERATOR') {
        navigate('/moderator', { replace: true });
      } else if (role === 'ADMINISTRATOR' || role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err: any) {
      setLoginState('invalid');
      setErrorMsg(err?.response?.data?.message || err?.message || 'Invalid email or password');
    }
  };

  const handleQuickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="bg-auth-card">
      <div className="bg-auth-header">
        <h1 className="bg-auth-title">Welcome Back</h1>
        <p className="bg-auth-subtitle">Sign in to your BookGrid account</p>
      </div>

      <div style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-3)', background: 'var(--bg-background)', borderRadius: 'var(--radius-md)', border: '1px solid var(--bg-border)' }}>
        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--bg-secondary-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 'var(--space-2)', textAlign: 'center' }}>
          Select Demo Account
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)' }}>
          <button
            type="button"
            onClick={() => handleQuickLogin('student@university.edu')}
            style={{
              padding: '8px 6px',
              borderRadius: 'var(--radius-sm)',
              border: email === 'student@university.edu' ? '2px solid #2563eb' : '1px solid var(--bg-border)',
              background: email === 'student@university.edu' ? '#eff6ff' : 'var(--bg-white)',
              color: 'var(--bg-deep-black)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease',
            }}
          >
            <i className="fas fa-user-graduate" style={{ color: '#2563eb', fontSize: '1rem' }}></i>
            Student
          </button>
          
          <button
            type="button"
            onClick={() => handleQuickLogin('moderator@university.edu')}
            style={{
              padding: '8px 6px',
              borderRadius: 'var(--radius-sm)',
              border: email === 'moderator@university.edu' ? '2px solid #7c3aed' : '1px solid var(--bg-border)',
              background: email === 'moderator@university.edu' ? '#f5f3ff' : 'var(--bg-white)',
              color: 'var(--bg-deep-black)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease',
            }}
          >
            <i className="fas fa-user-shield" style={{ color: '#7c3aed', fontSize: '1rem' }}></i>
            Moderator
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('admin@university.edu')}
            style={{
              padding: '8px 6px',
              borderRadius: 'var(--radius-sm)',
              border: email === 'admin@university.edu' ? '2px solid #d97706' : '1px solid var(--bg-border)',
              background: email === 'admin@university.edu' ? '#fffbeb' : 'var(--bg-white)',
              color: 'var(--bg-deep-black)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease',
            }}
          >
            <i className="fas fa-user-gear" style={{ color: '#d97706', fontSize: '1rem' }}></i>
            Admin
          </button>
        </div>
      </div>

      {loginState === 'invalid' && (
        <div className="bg-auth-alert bg-auth-alert--error">
          <i className="fas fa-exclamation-circle" style={{ marginTop: '2px' }}></i>
          <span>{errorMsg || 'Invalid email or password. Please try again.'}</span>
        </div>
      )}

      <form className="bg-auth-form" onSubmit={(e) => handleLoginSubmit(e)}>
        <Input 
          label="Email or Account ID" 
          placeholder="e.g., student@university.edu"
          icon="fas fa-user"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <Input 
          label="Password" 
          type="password"
          placeholder="Enter your password"
          icon="fas fa-lock"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="bg-auth-options">
          <label className="bg-auth-checkbox">
            <input type="checkbox" defaultChecked />
            <span>Remember Me</span>
          </label>
          <Link to="/forgot-password" className="bg-auth-link">Forgot Password?</Link>
        </div>

        <Button 
          type="submit" 
          variant="primary" 
          fullWidth 
          disabled={loginState === 'loading'}
        >
          {loginState === 'loading' ? (
            <><i className="fas fa-circle-notch fa-spin" style={{ marginRight: '8px' }}></i> Authenticating...</>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      <div className="bg-auth-footer" style={{ marginTop: 'var(--space-6)' }}>
        Don't have an account? <Link to="/register" className="bg-auth-link">Create Account</Link>
      </div>
    </div>
  );
};
