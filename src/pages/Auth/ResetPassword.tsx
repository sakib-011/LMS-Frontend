import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input } from '../../components/ui';
import './Auth.css';

export const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="bg-auth-card" style={{ textAlign: 'center' }}>
        <div style={{ 
          width: '4rem', height: '4rem', backgroundColor: 'rgba(82, 122, 90, 0.1)', 
          color: 'var(--bg-success)', borderRadius: '50%', display: 'flex', 
          alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-6)',
          fontSize: '2rem'
        }}>
          <i className="fas fa-check"></i>
        </div>
        <h1 className="bg-auth-title">Password Reset!</h1>
        <p className="bg-auth-subtitle" style={{ marginBottom: 'var(--space-8)' }}>
          Your password has been successfully reset. You can now log in with your new password.
        </p>
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <Button variant="primary" fullWidth>Go to Sign In</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-auth-card">
      <div className="bg-auth-header">
        <h1 className="bg-auth-title">Set New Password</h1>
        <p className="bg-auth-subtitle">Please enter your new password below</p>
      </div>

      {error && (
        <div className="bg-auth-alert bg-auth-alert--error">
          <i className="fas fa-exclamation-circle" style={{ marginTop: '2px' }}></i>
          <span>{error}</span>
        </div>
      )}

      <form className="bg-auth-form" onSubmit={handleReset}>
        <Input 
          label="New Password" 
          type="password"
          placeholder="Enter new password"
          icon="fas fa-lock"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Input 
          label="Confirm New Password" 
          type="password"
          placeholder="Confirm new password"
          icon="fas fa-lock"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button 
          type="submit" 
          variant="primary" 
          fullWidth 
          disabled={isLoading}
          style={{ marginTop: 'var(--space-2)' }}
        >
          {isLoading ? (
            <><i className="fas fa-circle-notch fa-spin" style={{ marginRight: '8px' }}></i> Resetting...</>
          ) : (
            'Reset Password'
          )}
        </Button>
      </form>
    </div>
  );
};
