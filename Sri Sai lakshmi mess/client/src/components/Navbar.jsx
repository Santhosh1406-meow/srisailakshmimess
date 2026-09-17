import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Phone,
  Clock,
  ChevronRight,
  Package,
  LogIn,
  LogOut,
  User,
  ChevronDown,
  ShieldCheck,
  Truck,
  LayoutDashboard,
  MapPin,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { RESTAURANT_CONFIG } from '../data/restaurantData';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isLoggedIn } = useAuth();
  const { cartCount, openCart } = useCart();
  const profileRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer and dropdown on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'About Us', path: '/about' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Track Order', path: '/track-order', hasIcon: true },
    { name: 'Contact', path: '/contact' }
  ];

  const initials = user ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : '';

  return (
    <>
      {/* Top Notification / Info Bar */}
      <div className="navbar-top-bar">
        <div className="navbar-top-bar-inner">
          <div className="top-bar-left">
            <span className="top-bar-item">
              <Clock size={13} className="top-bar-icon" />
              <span>{RESTAURANT_CONFIG.openingHours}</span>
            </span>
            <span className="top-bar-divider">•</span>
            <span className="top-bar-item">
              <MapPin size={13} className="top-bar-icon" />
              <span>Sivakasi, Tamil Nadu</span>
            </span>
          </div>

          <div className="top-bar-center">
            <span className="top-bar-badge">
              <Sparkles size={12} /> Authentic South Indian Homely Taste
            </span>
          </div>

          <div className="top-bar-right">
            <a
              href={`tel:${RESTAURANT_CONFIG.phone.replace(/[^0-9+]/g, '')}`}
              className="top-bar-phone"
              title="Call restaurant"
            >
              <Phone size={12} />
              <span>{RESTAURANT_CONFIG.phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className={`navbar-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navbar-container">

          {/* Brand Logo & Name */}
          <Link to="/" className="navbar-brand">
            <div className="navbar-logo-wrapper">
              <img
                src="/logo.png"
                alt="Sri Sai Lakshmi Mess Official Logo"
                className="navbar-logo-img"
              />
            </div>
            <div className="navbar-brand-text">
              <div className="navbar-brand-title">
                Sri Sai Lakshmi Mess
              </div>
              <div className="navbar-brand-tagline">
                South Indian Homely Food
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="desktop-nav" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}
              >
                {link.hasIcon && <Package size={14} className="navbar-link-icon" />}
                <span>{link.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* Right Actions: Login/Profile & Cart */}
          <div className="navbar-actions">
            {/* Auth: User Dropdown or Login Button */}
            {isLoggedIn ? (
              <div className="navbar-profile" ref={profileRef}>
                <button
                  id="navbar-profile-btn"
                  className="navbar-avatar-btn"
                  onClick={() => setProfileOpen((v) => !v)}
                  aria-expanded={profileOpen}
                  aria-label="User profile menu"
                >
                  <div className="navbar-avatar">{initials}</div>
                  <ChevronDown size={14} className={`navbar-chevron ${profileOpen ? 'open' : ''}`} />
                </button>

                {profileOpen && (
                  <div className="navbar-dropdown">
                    <div className="navbar-dropdown-user">
                      <strong className="user-name-text">{user.name}</strong>
                      <span className="user-email-text">{user.email}</span>
                      <span
                        className="user-role-badge"
                        style={{
                          backgroundColor: user.role === 'admin' ? 'rgba(234,88,12,0.15)' : user.role === 'delivery' ? 'rgba(59,130,246,0.15)' : 'rgba(34,197,94,0.15)',
                          color: user.role === 'admin' ? '#ea580c' : user.role === 'delivery' ? '#2563eb' : '#16a34a'
                        }}
                      >
                        {user.role === 'admin' ? '🛡️ Administrator' : user.role === 'delivery' ? '🛵 Delivery Partner' : '👤 Customer'}
                      </span>
                    </div>

                    {user.role === 'admin' && (
                      <Link to="/admin" className="navbar-dropdown-item admin-link">
                        <ShieldCheck size={15} /> Admin Portal
                      </Link>
                    )}
                    {user.role === 'delivery' && (
                      <Link to="/delivery" className="navbar-dropdown-item delivery-link">
                        <Truck size={15} /> Delivery Dashboard
                      </Link>
                    )}
                    {user.role === 'customer' && (
                      <Link to="/dashboard" className="navbar-dropdown-item customer-link">
                        <LayoutDashboard size={15} /> My Dashboard
                      </Link>
                    )}
                    <Link to="/track-order" className="navbar-dropdown-item">
                      <Package size={15} /> Track Active Order
                    </Link>
                    <button className="navbar-dropdown-item navbar-dropdown-logout" onClick={logout}>
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn btn-secondary btn-sm navbar-login-btn">
                <LogIn size={15} />
                <span>Login</span>
              </Link>
            )}

            {/* Cart Button */}
            <button
              id="navbar-cart-btn"
              onClick={openCart}
              className="navbar-cart-btn"
              aria-label={`View food cart with ${cartCount} items`}
              title="View Cart"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="navbar-cart-badge">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-menu-toggle"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>
      </header>

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img
                  src="/logo.png"
                  alt="Sri Sai Lakshmi Mess Logo"
                  style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid #d97706' }}
                />
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, color: 'var(--color-primary-dark)', fontSize: '1.15rem' }}>
                    Sri Sai Lakshmi Mess
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-gold-dark)', fontWeight: 600 }}>
                    SOUTH INDIAN HOMELY FOOD
                  </div>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="mobile-drawer-close"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Cart Action Button */}
            <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid #f1f5f9' }}>
              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); openCart(); }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--color-primary)',
                  color: '#ffffff',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(194,65,12,0.25)'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <ShoppingBag size={18} /> View Food Cart
                </span>
                <span style={{ backgroundColor: 'rgba(255,255,255,0.25)', padding: '0.2rem 0.55rem', borderRadius: '20px', fontSize: '0.8rem' }}>
                  {cartCount} {cartCount === 1 ? 'item' : 'items'}
                </span>
              </button>
            </div>

            {/* Mobile Nav Links */}
            <nav className="mobile-nav-list">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    {link.hasIcon && <Package size={16} color="var(--color-primary)" />}
                    {link.name}
                  </span>
                  <ChevronRight size={16} className="mobile-nav-chevron" />
                </NavLink>
              ))}
            </nav>

            {/* Mobile Actions */}
            <div className="mobile-drawer-actions">
              {isLoggedIn ? (
                <>
                  {user.role === 'customer' && (
                    <Link to="/dashboard" className="btn btn-secondary mobile-drawer-btn" onClick={() => setMobileMenuOpen(false)}>
                      <LayoutDashboard size={17} color="#16a34a" /> My Customer Dashboard
                    </Link>
                  )}
                  {user.role === 'delivery' && (
                    <Link to="/delivery" className="btn btn-secondary mobile-drawer-btn" onClick={() => setMobileMenuOpen(false)}>
                      <Truck size={17} color="#2563eb" /> Delivery Partner Dashboard
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin" className="btn btn-secondary mobile-drawer-btn" onClick={() => setMobileMenuOpen(false)}>
                      <ShieldCheck size={17} color="#ea580c" /> Admin Portal
                    </Link>
                  )}
                  <button className="btn btn-secondary mobile-drawer-btn" onClick={logout}>
                    <LogOut size={17} color="var(--color-primary)" /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login?role=customer"
                    className="btn btn-secondary mobile-drawer-btn"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogIn size={17} color="var(--color-primary)" /> Customer Login / Register
                  </Link>
                  <Link
                    to="/login?role=delivery"
                    className="btn btn-secondary mobile-drawer-btn"
                    style={{ borderColor: '#bfdbfe', color: '#1d4ed8' }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Truck size={17} color="#2563eb" /> 🛵 Delivery Partner Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}