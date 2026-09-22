import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2, UtensilsCrossed } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (globalError) setGlobalError('');
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim() || formData.name.trim().length < 2)
      errs.name = 'Full name must be at least 2 characters.';
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errs.email = 'Please enter a valid email address.';
    if (formData.phone.trim()) {
      const raw = formData.phone.replace(/\D/g, '');
      let norm = raw;
      if (norm.startsWith('91') && norm.length === 12) norm = norm.slice(2);
      else if (norm.startsWith('0') && norm.length === 11) norm = norm.slice(1);
      if (!/^[6-9]\d{9}$/.test(norm)) {
        errs.phone = 'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.';
      }
    }
    if (!formData.password || formData.password.length < 6)
      errs.password = 'Password must be at least 6 characters.';
    if (formData.password !== formData.confirmPassword)
      errs.confirmPassword = 'Passwords do not match.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setGlobalError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = () => {
    const p = formData.password;
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

      <div className="auth-container auth-container-wide">
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
          <div className="auth-card-header">
            <h2 className="auth-card-title">Create Account</h2>
            <p className="auth-card-subtitle">Join us for a homely dining experience</p>
          </div>

          {globalError && (
            <div className="auth-alert auth-alert-error">
              <AlertCircle size={16} />
              <span>{globalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="signup-name" className="form-label">
                Full Name <span className="required">*</span>
              </label>
              <div className="auth-input-wrapper">
                <User size={17} className="auth-input-icon" />
                <input
                  id="signup-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Ramesh Kumar"
                  className={`form-control auth-input-with-icon ${errors.name ? 'error' : ''}`}
                  autoComplete="name"
                />
              </div>
              {errors.name && <div className="form-error-msg"><AlertCircle size={13} /> {errors.name}</div>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="signup-email" className="form-label">
                Email Address <span className="required">*</span>
              </label>
              <div className="auth-input-wrapper">
                <Mail size={17} className="auth-input-icon" />
                <input
                  id="signup-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className={`form-control auth-input-with-icon ${errors.email ? 'error' : ''}`}
                  autoComplete="email"
                />
              </div>
              {errors.email && <div className="form-error-msg"><AlertCircle size={13} /> {errors.email}</div>}
            </div>

            {/* Phone */}
            <div className="form-group">
              <label htmlFor="signup-phone" className="form-label">
                Mobile Number <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>(Optional — for order tracking)</span>
              </label>
              <div className="auth-input-wrapper">
                <Phone size={17} className="auth-input-icon" />
                <input
                  id="signup-phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                  className={`form-control auth-input-with-icon ${errors.phone ? 'error' : ''}`}
                  autoComplete="tel"
                />
              </div>
              {errors.phone && <div className="form-error-msg"><AlertCircle size={13} /> {errors.phone}</div>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="signup-password" className="form-label">
                Password <span className="required">*</span>
              </label>
              <div className="auth-input-wrapper">
                <Lock size={17} className="auth-input-icon" />
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className={`form-control auth-input-with-icon auth-input-with-toggle ${errors.password ? 'error' : ''}`}
                  autoComplete="new-password"
                />
                <button type="button" className="auth-password-toggle" onClick={() => setShowPassword((v) => !v)}>
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {/* Password strength bar */}
              {strength && (
                <div className="auth-strength-bar">
                  <div className="auth-strength-fill" style={{ width: strength.width, backgroundColor: strength.color }} />
                  <span style={{ color: strength.color }}>{strength.label}</span>
                </div>
              )}
              {errors.password && <div className="form-error-msg"><AlertCircle size={13} /> {errors.password}</div>}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="signup-confirm" className="form-label">
                Confirm Password <span className="required">*</span>
              </label>
              <div className="auth-input-wrapper">
                <Lock size={17} className="auth-input-icon" />
                <input
                  id="signup-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className={`form-control auth-input-with-icon auth-input-with-toggle ${errors.confirmPassword ? 'error' : ''}`}
                  autoComplete="new-password"
                />
                <button type="button" className="auth-password-toggle" onClick={() => setShowConfirm((v) => !v)}>
                  {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.82rem', color: 'var(--color-leaf-green)', marginTop: '0.35rem' }}>
                  <CheckCircle2 size={14} /> Passwords match
                </div>
              )}
              {errors.confirmPassword && <div className="form-error-msg"><AlertCircle size={13} /> {errors.confirmPassword}</div>}
            </div>

            <button
              id="signup-submit-btn"
              type="submit"
              disabled={isLoading}
              className="btn btn-primary auth-submit-btn"
            >
              {isLoading ? (
                <span className="auth-spinner" />
              ) : (
                <>
                  <UserPlus size={18} />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>Already have an account?</span>
          </div>

          <Link to="/login" className="btn btn-secondary auth-alt-btn">
            Sign In Instead
          </Link>
        </div>

        <Link to="/" className="auth-back-link">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
