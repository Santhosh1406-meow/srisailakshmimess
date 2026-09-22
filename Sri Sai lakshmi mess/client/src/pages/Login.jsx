import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
    if (infoMessage) setInfoMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setError('');
    setInfoMessage('');

    try {
      const user = await login(formData);
      const role = user?.role || 'customer';

      if (role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        if (from) {
          navigate(from, { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-decoration" />

      <div className="auth-container">
        {/* Logo / Brand */}
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
            <h2 className="auth-card-title">Sign In</h2>
            <p className="auth-card-subtitle">
              Sign in to order food, track orders & view order history
            </p>
          </div>

          {error && (
            <div className="auth-alert auth-alert-error" role="alert">
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {infoMessage && (
            <div className="auth-alert auth-alert-success" role="status">
              <Info size={16} style={{ flexShrink: 0 }} />
              <span>{infoMessage}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Email Address */}
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">
                Email Address
              </label>
              <div className="auth-input-wrapper">
                <Mail size={17} className="auth-input-icon" />
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="form-control auth-input-with-icon"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="login-password" className="form-label">Password</label>
              <div className="auth-input-wrapper">
                <Lock size={17} className="auth-input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="form-control auth-input-with-icon auth-input-with-toggle"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="btn btn-primary auth-submit-btn"
            >
              {isLoading ? (
                <span className="auth-spinner" />
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Sign up */}
          <div className="auth-divider">
            <span>Don't have an account?</span>
          </div>

          <Link to="/signup" className="btn btn-secondary auth-alt-btn">
            Create New Account
          </Link>

          <p className="auth-footer-note" style={{ marginTop: '1.25rem' }}>
            Restaurant Manager?{' '}
            <Link to="/admin" style={{ color: '#ea580c', fontWeight: 600 }}>
              Admin Portal
            </Link>
          </p>
        </div>

        <Link to="/" className="auth-back-link">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
