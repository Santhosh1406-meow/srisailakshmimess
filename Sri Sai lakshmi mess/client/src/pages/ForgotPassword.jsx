import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Phone,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ForgotPassword() {
  const { resetPasswordByPhone } = useAuth();
  const navigate = useNavigate();

  // 'form' | 'success'
  const [step, setStep] = useState('form');

  // Form fields
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & feedback
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Clean phone input (digits only, max 10)
  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(val);
    if (error) setError('');
  };

  // Password reset submit handler
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      setError('Please enter your 10-digit registered mobile number.');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError('Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPasswordByPhone({
        phone: cleanPhone,
        newPassword
      });
      if (res.email) setUserEmail(res.email);
      setStep('success');
    } catch (err) {
      setError(err.message || 'Password reset failed. Please verify your mobile number.');
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength helper
  const passwordStrength = () => {
    const p = newPassword;
    if (!p) return null;
    if (p.length < 6) return { label: 'Too short', color: '#ef4444', width: '25%' };
    if (p.length < 8) return { label: 'Weak', color: '#f97316', width: '45%' };
    if (/[A-Z]/.test(p) && /[0-9]/.test(p)) return { label: 'Strong', color: '#16a34a', width: '100%' };
    return { label: 'Fair', color: '#d97706', width: '70%' };
  };
  const strength = passwordStrength();

  return (
    <div className="auth-page">
      <div className="auth-bg-decoration" />

      <div className="auth-container">
        {/* Brand Header */}
        <div className="auth-brand">
          <img
            src="/logo.png"
            alt="Sri Sai Lakshmi Mess"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid rgba(254, 215, 170, 0.8)',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
            }}
          />
          <div>
            <h1 className="auth-brand-name">Sri Sai Lakshmi Mess</h1>
            <p className="auth-brand-tagline">Authentic South Indian Cuisine</p>
          </div>
        </div>

        {/* Card */}
        <div className="auth-card">
          {/* Header */}
          <div className="auth-card-header">
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(234,88,12,0.12), rgba(217,119,6,0.18))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                color: '#ea580c'
              }}
            >
              {step === 'success' ? (
                <CheckCircle2 size={28} color="#16a34a" />
              ) : (
                <KeyRound size={28} />
              )}
            </div>

            <h2 className="auth-card-title">
              {step === 'success' ? 'Password Reset Successful!' : 'Reset Password'}
            </h2>
            <p className="auth-card-subtitle">
              {step === 'success'
                ? 'Your new password has been saved.'
                : 'Enter your registered mobile number and set a new password.'}
            </p>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="auth-alert auth-alert-error" role="alert">
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          {step === 'form' && (
            <form onSubmit={handleResetPassword} noValidate>
              {/* Registered Mobile Number */}
              <div className="form-group">
                <label htmlFor="forgot-phone" className="form-label">
                  Registered Mobile Number <span className="required">*</span>
                </label>
                <div className="auth-input-wrapper" style={{ display: 'flex', alignItems: 'center' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      color: '#475569',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      zIndex: 2,
                      pointerEvents: 'none'
                    }}
                  >
                    <span>🇮🇳 +91</span>
                  </div>
                  <input
                    id="forgot-phone"
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="98765 43210"
                    maxLength={10}
                    style={{ paddingLeft: '72px' }}
                    className="form-control"
                    autoComplete="tel"
                    autoFocus
                    required
                  />
                </div>
                <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.35rem' }}>
                  Enter the 10-digit mobile number linked to your customer account.
                </p>
              </div>

              {/* New Password */}
              <div className="form-group">
                <label htmlFor="new-password" className="form-label">
                  New Password <span className="required">*</span>
                </label>
                <div className="auth-input-wrapper">
                  <Lock size={17} className="auth-input-icon" />
                  <input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Minimum 6 characters"
                    className="form-control auth-input-with-icon auth-input-with-toggle"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowNewPassword((v) => !v)}
                    aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  >
                    {showNewPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {strength && (
                  <div className="auth-strength-bar">
                    <div
                      className="auth-strength-fill"
                      style={{ width: strength.width, backgroundColor: strength.color }}
                    />
                    <span style={{ color: strength.color }}>{strength.label}</span>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="form-group">
                <label htmlFor="confirm-new-password" className="form-label">
                  Confirm New Password <span className="required">*</span>
                </label>
                <div className="auth-input-wrapper">
                  <Lock size={17} className="auth-input-icon" />
                  <input
                    id="confirm-new-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Re-enter your new password"
                    className="form-control auth-input-with-icon auth-input-with-toggle"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {confirmPassword && newPassword === confirmPassword && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.82rem',
                      color: 'var(--color-leaf-green)',
                      marginTop: '0.35rem'
                    }}
                  >
                    <CheckCircle2 size={14} /> Passwords match
                  </div>
                )}
              </div>

              <button
                id="reset-password-btn"
                type="submit"
                disabled={isLoading || phone.length < 10 || !newPassword}
                className="btn btn-primary auth-submit-btn"
                style={{ marginTop: '0.75rem' }}
              >
                {isLoading ? (
                  <span className="auth-spinner" />
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Success Screen */}
          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '1rem 0 0.5rem' }}>
              <div
                style={{
                  background: 'rgba(22, 163, 74, 0.08)',
                  border: '1px solid rgba(22, 163, 74, 0.25)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  marginBottom: '1.75rem',
                  color: '#166534',
                  fontSize: '0.95rem',
                  lineHeight: '1.5'
                }}
              >
                <p style={{ fontWeight: 600, marginBottom: '0.35rem' }}>
                  Your password has been changed successfully!
                </p>
                <p style={{ fontSize: '0.86rem', color: '#15803d', margin: 0 }}>
                  You can now log in using your new credentials.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  navigate('/login', {
                    replace: true,
                    state: {
                      message: 'Password reset successful! Please log in with your new password.',
                      email: userEmail
                    }
                  });
                }}
                className="btn btn-primary auth-submit-btn"
                style={{ width: '100%' }}
              >
                Proceed to Sign In
              </button>
            </div>
          )}

          {/* Back to Login link */}
          {step !== 'success' && (
            <div style={{ textAlign: 'center', marginTop: '1.75rem' }}>
              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: '#64748b',
                  fontSize: '0.88rem',
                  fontWeight: 500,
                  textDecoration: 'none'
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = '#ea580c')}
                onMouseOut={(e) => (e.currentTarget.style.color = '#64748b')}
              >
                <ArrowLeft size={16} />
                <span>Remember your password? Sign In</span>
              </Link>
            </div>
          )}
        </div>

        {/* Back to Home link */}
        <Link to="/" className="auth-back-link">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
