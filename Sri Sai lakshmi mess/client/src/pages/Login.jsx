import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  AlertCircle, 
  UtensilsCrossed, 
  Truck, 
  User, 
  ArrowRight, 
  ShieldCheck, 
  Zap,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const from = location.state?.from?.pathname;
  const initialRole = searchParams.get('role') || searchParams.get('tab') || 'customer';

  const [activeTab, setActiveTab] = useState(initialRole === 'delivery' ? 'delivery' : 'customer');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sync state if query parameter changes
  useEffect(() => {
    const roleParam = searchParams.get('role') || searchParams.get('tab');
    if (roleParam === 'delivery' && activeTab !== 'delivery') {
      setActiveTab('delivery');
    } else if (roleParam === 'customer' && activeTab !== 'customer') {
      setActiveTab('customer');
    }
  }, [searchParams]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setError('');
    setInfoMessage('');
    setSearchParams({ role: tab });
    setFormData({ email: '', password: '' });
  };

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

      if (activeTab === 'delivery') {
        if (role === 'delivery') {
          navigate('/delivery', { replace: true });
        } else if (role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          // A customer account attempted login through the delivery portal tab
          setError('⚠️ This account is registered as a Customer, not a Delivery Partner. Please switch to the Customer Login tab above.');
        }
      } else {
        // activeTab === 'customer'
        if (role === 'delivery') {
          setInfoMessage('You are logged in with a Delivery Partner account. Taking you to Delivery Dashboard...');
          setTimeout(() => navigate('/delivery', { replace: true }), 800);
        } else if (role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          if (from) {
            navigate(from, { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
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

          {/* Role Switcher Tabs */}
          <div className="auth-role-tabs" role="tablist" aria-label="Login account type selection">
            <button
              type="button"
              role="tab"
              id="tab-customer-login"
              aria-selected={activeTab === 'customer'}
              className={`auth-role-tab ${activeTab === 'customer' ? 'active customer' : ''}`}
              onClick={() => handleTabSwitch('customer')}
            >
              <div className="auth-role-tab-icon">
                <User size={18} />
              </div>
              <div className="auth-role-tab-text">
                <span className="auth-role-tab-title">Customer Login</span>
                <span className="auth-role-tab-desc">Food Orders & Dining</span>
              </div>
            </button>

            <button
              type="button"
              role="tab"
              id="tab-delivery-login"
              aria-selected={activeTab === 'delivery'}
              className={`auth-role-tab ${activeTab === 'delivery' ? 'active delivery' : ''}`}
              onClick={() => handleTabSwitch('delivery')}
            >
              <div className="auth-role-tab-icon">
                <Truck size={18} />
              </div>
              <div className="auth-role-tab-text">
                <span className="auth-role-tab-title">Delivery Partner</span>
                <span className="auth-role-tab-desc">Rider Fleet Portal</span>
              </div>
            </button>
          </div>

          {/* Header */}
          <div className="auth-card-header">
            {activeTab === 'customer' ? (
              <>
                <span className="auth-role-badge auth-role-badge-customer">
                  <User size={13} /> Customer Account
                </span>
                <h2 className="auth-card-title">Customer Sign In</h2>
                <p className="auth-card-subtitle">
                  Sign in to order food, track deliveries & view order history
                </p>
              </>
            ) : (
              <>
                <span className="auth-role-badge auth-role-badge-delivery">
                  <Truck size={13} /> Delivery Partner Fleet
                </span>
                <h2 className="auth-card-title">Delivery Partner Portal</h2>
                <p className="auth-card-subtitle">
                  Sign in to accept assigned orders & update live delivery status
                </p>
              </>
            )}
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
                {activeTab === 'delivery' ? 'Partner Email Address' : 'Email Address'}
              </label>
              <div className="auth-input-wrapper">
                <Mail size={17} className="auth-input-icon" />
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={activeTab === 'delivery' ? 'delivery@srisailakshmimess.com' : 'your@email.com'}
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
              className={`btn btn-primary auth-submit-btn ${activeTab === 'delivery' ? 'auth-submit-delivery' : ''}`}
            >
              {isLoading ? (
                <span className="auth-spinner" />
              ) : (
                <>
                  {activeTab === 'delivery' ? <Truck size={18} /> : <LogIn size={18} />}
                  <span>{activeTab === 'delivery' ? 'Sign In as Delivery Partner' : 'Sign In as Customer'}</span>
                </>
              )}
            </button>
          </form>

          {/* Customer Tab: Quick Demo / Sign up */}
          {activeTab === 'customer' ? ( 
            <>
              
              <div className="auth-divider">
                <span>Don't have a customer account?</span>
              </div>

              <Link to="/signup" className="btn btn-secondary auth-alt-btn">
                Create New Customer Account
              </Link>
            </>
          ) : (
            /* Delivery Tab: Quick Demo Riders / Fleet note */
            <>
              {/* Delivery Partner registration note */}
              <div className="auth-partner-notice">
                <p>
                  <strong>Want to join our delivery fleet?</strong><br />
                  Delivery partner accounts are registered and approved by the restaurant management. Please visit Sri Sai Lakshmi Mess or call <strong>+91 94440 12345</strong> to get onboarded.
                </p>
              </div>
            </>
          )}

          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>
              {activeTab === 'customer' ? 'Are you a delivery rider?' : 'Are you ordering food?'}
            </span>
            <button
              type="button"
              onClick={() => handleTabSwitch(activeTab === 'customer' ? 'delivery' : 'customer')}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === 'customer' ? '#2563eb' : 'var(--color-primary)',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '0.2rem 0.4rem',
                textDecoration: 'underline'
              }}
            >
              {activeTab === 'customer' ? 'Switch to Delivery Login →' : 'Switch to Customer Login →'}
            </button>
          </div>

          <p className="auth-footer-note" style={{ marginTop: '0.75rem' }}>
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
