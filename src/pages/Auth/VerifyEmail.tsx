import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button, Input } from '../../components/ui';
import { apiClient } from '../../services/api';
import './Auth.css';

export const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [showEditEmail, setShowEditEmail] = useState(!initialEmail);
  const [isVerifying, setIsVerifying] = useState(!!token);
  const [isVerified, setIsVerified] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  const [isResending, setIsResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const navigate = useNavigate();

  // Automatic verification when token is present in the URL
  useEffect(() => {
    if (!token) return;

    const verifyToken = async () => {
      setIsVerifying(true);
      setVerifyError('');

      try {
        const response = await apiClient.post<{ success: boolean; message: string; email?: string }>('/auth/verify-email', {
          token,
          email: initialEmail
        });

        setIsVerifying(false);
        if (response.data.success) {
          setIsVerified(true);
          if (response.data.email) {
            setEmail(response.data.email);
          }
        } else {
          setVerifyError(response.data.message || 'Verification link is invalid or expired.');
        }
      } catch (err: any) {
        setIsVerifying(false);
        setVerifyError(err?.response?.data?.message || err?.message || 'Verification link is invalid or expired.');
      }
    };

    verifyToken();
  }, [token, initialEmail]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsResending(true);
    setResendMsg('');
    setResendStatus('idle');

    try {
      const response = await apiClient.post<{ success: boolean; message: string }>('/auth/resend-verification', { email });
      setIsResending(false);
      if (response.data.success) {
        setResendStatus('success');
        setResendMsg(response.data.message || `Verification email sent successfully to ${email}`);
      } else {
        setResendStatus('error');
        setResendMsg(response.data.message || 'Failed to send verification email. Please check SMTP settings.');
      }
    } catch (err: any) {
      setIsResending(false);
      setResendStatus('error');
      setResendMsg(err?.response?.data?.message || err?.message || 'Failed to send verification email.');
    }
  };

  // State 1: Verifying Token Spinner
  if (isVerifying) {
    return (
      <div className="bg-auth-card" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ fontSize: '3rem', color: '#3182ce', marginBottom: '16px' }}>
          <i className="fas fa-circle-notch fa-spin"></i>
        </div>
        <h1 className="bg-auth-title">Verifying Your Email...</h1>
        <p className="bg-auth-subtitle">Please wait while we confirm your account link.</p>
      </div>
    );
  }

  // State 2: Successful Verification Confirmation Screen
  if (isVerified) {
    return (
      <div className="bg-auth-card" style={{ textAlign: 'center', padding: '32px 24px' }}>
        <div style={{ 
          width: '5rem', height: '5rem', backgroundColor: '#e6fffa', 
          color: '#319795', borderRadius: '50%', display: 'flex', 
          alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
          fontSize: '2.5rem', boxShadow: '0 4px 12px rgba(49, 151, 149, 0.15)'
        }}>
          <i className="fas fa-check"></i>
        </div>

        <h1 className="bg-auth-title" style={{ color: '#234e52', fontSize: '1.75rem', marginBottom: '8px' }}>
          Email Verified!
        </h1>
        
        <p className="bg-auth-subtitle" style={{ color: '#4a5568', lineHeight: 1.6, marginBottom: '24px' }}>
          Thank you for verifying your email address {email ? <strong>({email})</strong> : null}. Your BookGrid account is now <strong>Active</strong> and fully ready.
        </p>

        <div className="bg-auth-alert bg-auth-alert--success" style={{ textAlign: 'left', marginBottom: '24px' }}>
          <i className="fas fa-shield-alt" style={{ marginTop: '2px' }}></i>
          <span>Account activated successfully. You can now sign in to access your portal.</span>
        </div>

        <Button 
          variant="primary" 
          fullWidth 
          onClick={() => navigate('/login')}
          icon="fas fa-sign-in-alt"
          style={{ padding: '14px', fontSize: '1rem' }}
        >
          Proceed to Sign In
        </Button>
      </div>
    );
  }

  // State 3: Resend View or Token Error View
  return (
    <div className="bg-auth-card" style={{ textAlign: 'center' }}>
      <div style={{ 
        width: '4rem', height: '4rem', backgroundColor: verifyError ? '#fff5f5' : 'var(--bg-pale-peach, #fffaf0)', 
        color: verifyError ? '#e53e3e' : 'var(--bg-warm-orange, #dd6b20)', borderRadius: '50%', display: 'flex', 
        alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-6)',
        fontSize: '2rem'
      }}>
        <i className={verifyError ? 'fas fa-exclamation-triangle' : 'fas fa-envelope-open-text'}></i>
      </div>
      
      <h1 className="bg-auth-title">{verifyError ? 'Verification Failed' : 'Verify Your Email'}</h1>
      <p className="bg-auth-subtitle" style={{ marginBottom: 'var(--space-4)', lineHeight: 1.6 }}>
        {verifyError ? verifyError : "We've sent a verification link to your registered email address. Please check your inbox and click the link to activate your account."}
      </p>

      {email && !showEditEmail && (
        <div style={{ 
          padding: '12px 16px', 
          backgroundColor: '#fffaf0', 
          border: '1px solid #feebc8', 
          borderRadius: '8px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: '16px' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <i className="fas fa-envelope" style={{ color: '#dd6b20' }}></i>
            <span style={{ fontWeight: 600, color: '#2d3748', fontSize: '0.9rem' }}>{email}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setShowEditEmail(true)} 
            style={{ background: 'none', border: 'none', color: '#3182ce', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Change
          </button>
        </div>
      )}

      {resendStatus === 'success' && (
        <div className="bg-auth-alert bg-auth-alert--success" style={{ textAlign: 'left', marginBottom: '16px' }}>
          <i className="fas fa-check-circle" style={{ marginTop: '2px' }}></i>
          <span>{resendMsg}</span>
        </div>
      )}

      {resendStatus === 'error' && (
        <div className="bg-auth-alert bg-auth-alert--error" style={{ textAlign: 'left', marginBottom: '16px' }}>
          <i className="fas fa-exclamation-circle" style={{ marginTop: '2px' }}></i>
          <span>{resendMsg}</span>
        </div>
      )}

      <form onSubmit={handleResend} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', marginTop: 'var(--space-4)' }}>
        {showEditEmail && (
          <Input 
            label="Registered Email Address"
            type="email"
            placeholder="e.g. student@university.edu"
            icon="fas fa-envelope"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        )}

        <Button 
          type="submit"
          variant="outline" 
          fullWidth 
          disabled={isResending || !email}
        >
          {isResending ? (
            <><i className="fas fa-circle-notch fa-spin" style={{ marginRight: '8px' }}></i> Sending Verification Email...</>
          ) : (
            'Resend Verification Email'
          )}
        </Button>
        
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <Button variant="ghost" fullWidth>Back to Sign In</Button>
        </Link>
      </form>
    </div>
  );
};



