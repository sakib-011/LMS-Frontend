import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input } from '../../components/ui';
import './Auth.css';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // For mock purposes, directly redirect to reset-password to show success state
      navigate('/reset-password');
    }, 1500);
  };

  return (
    <div className="bg-auth-card">
      <div className="bg-auth-header">
        <h1 className="bg-auth-title">Forgot Password</h1>
        <p className="bg-auth-subtitle">Enter your email to receive a reset link</p>
      </div>

      <form className="bg-auth-form" onSubmit={handleReset}>
        <Input 
          label="Email Address" 
          type="email"
          placeholder="Enter your registered email"
          icon="fas fa-envelope"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
            <><i className="fas fa-circle-notch fa-spin" style={{ marginRight: '8px' }}></i> Sending Link...</>
          ) : (
            'Send Reset Link'
          )}
        </Button>
      </form>

      <div className="bg-auth-footer">
        Remember your password? <Link to="/login" className="bg-auth-link">Back to Sign In</Link>
      </div>
    </div>
  );
};
