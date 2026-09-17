import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search, Package, Clock, CheckCircle2, Truck, Star,
  XCircle, AlertCircle, Phone, Calendar, UtensilsCrossed,
  MapPin, CreditCard, RefreshCw, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const ORDER_STEPS = [
  { key: 'Enquiry Received', label: 'Enquiry Received', icon: Package, desc: 'We have received your order enquiry' },
  { key: 'Processing',       label: 'Processing',       icon: Clock,    desc: 'Our team is reviewing your order' },
  { key: 'Confirmed',        label: 'Confirmed',         icon: CheckCircle2, desc: 'Order confirmed! Preparing your meal' },
  { key: 'Ready',            label: 'Ready for Pickup',  icon: Truck,    desc: 'Your order is ready and packed' },
  { key: 'Completed',        label: 'Completed',         icon: Star,     desc: 'Order delivered. Enjoy your meal! 🍛' }
];

function getStepIndex(status) {
  const idx = ORDER_STEPS.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

function StatusTimeline({ status }) {
  const activeIndex = getStepIndex(status);
  const isCancelled = status === 'Cancelled';

  return (
    <div className="track-timeline">
      {isCancelled ? (
        <div className="track-cancelled">
          <XCircle size={40} color="#ef4444" />
          <h3>Order Cancelled</h3>
          <p>This order has been cancelled. Please contact us for assistance.</p>
        </div>
      ) : (
        ORDER_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < activeIndex;
          const isActive = idx === activeIndex;
          const isPending = idx > activeIndex;
          return (
            <div key={step.key} className={`track-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''} ${isPending ? 'pending' : ''}`}>
              <div className="track-step-connector" />
              <div className="track-step-icon">
                <Icon size={18} />
              </div>
              <div className="track-step-content">
                <span className="track-step-label">{step.label}</span>
                {isActive && <span className="track-step-desc">{step.desc}</span>}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function OrderCard({ order }) {
  return (
    <div className="track-order-card animate-fade-in">
      <div className="track-order-header">
        <div>
          <div className="track-order-id">
            <Package size={14} />
            {order.id}
          </div>
          <div className="track-order-name">{order.customerName}</div>
        </div>
        <div className={`track-status-badge track-status-${order.status.replace(/\s+/g, '-').toLowerCase()}`}>
          {order.status}
        </div>
      </div>

      <div className="track-order-details">
        <div className="track-detail-item">
          <UtensilsCrossed size={15} />
          <span>{order.foodItem} × {order.quantity}</span>
        </div>
        <div className="track-detail-item">
          <Calendar size={15} />
          <span>{order.preferredDate} at {order.preferredTime}</span>
        </div>
        <div className="track-detail-item">
          <CreditCard size={15} />
          <span className={`track-payment-badge ${order.paymentStatus === 'Paid' ? 'paid' : ''}`}>
            {order.paymentStatus}
          </span>
        </div>
        {order.specialInstructions && (
          <div className="track-detail-item">
            <MapPin size={15} />
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
              {order.specialInstructions}
            </span>
          </div>
        )}
      </div>

      <StatusTimeline status={order.status} />


      <div className="track-order-footer">
        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
          Placed: {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
        </span>
        <a
          href={`tel:+916383034188`}
          className="btn btn-secondary btn-sm"
          style={{ gap: '0.4rem' }}
        >
          <Phone size={14} /> Call Us
        </a>
      </div>
    </div>
  );
}

export default function OrderTracking() {
  const { isLoggedIn, getAuthHeaders } = useAuth();
  const [searchParams] = useSearchParams();

  const [searchType, setSearchType] = useState('phone'); // 'phone' | 'orderId'
  const [searchValue, setSearchValue] = useState(searchParams.get('phone') || searchParams.get('orderId') || '');
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [myOrdersLoaded, setMyOrdersLoaded] = useState(false);

  // Auto-load my orders if logged in
  useEffect(() => {
    if (isLoggedIn && !myOrdersLoaded) {
      loadMyOrders();
    }
  }, [isLoggedIn]);

  // Auto-search if URL params present
  useEffect(() => {
    const phone = searchParams.get('phone');
    const orderId = searchParams.get('orderId');
    if (phone) { setSearchType('phone'); setSearchValue(phone); handleSearch('phone', phone); }
    else if (orderId) { setSearchType('orderId'); setSearchValue(orderId); handleSearch('orderId', orderId); }
  }, []);

  const loadMyOrders = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/orders/my`, {
        headers: { ...getAuthHeaders() }
      });
      const json = await res.json();
      if (res.ok) {
        setOrders(json.data || []);
        setMyOrdersLoaded(true);
        setHasSearched(true);
      }
    } catch (_) {
      // Silently fail, user can search manually
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (type = searchType, value = searchValue) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setError('Please enter a phone number or order ID.');
      return;
    }
    setIsLoading(true);
    setError('');
    setHasSearched(true);
    try {
      const param = type === 'phone' ? `phone=${encodeURIComponent(trimmed)}` : `orderId=${encodeURIComponent(trimmed)}`;
      const res = await fetch(`${API_BASE}/orders/track?${param}`);
      const json = await res.json();
      if (res.ok) {
        setOrders(json.data || []);
      } else {
        setOrders([]);
        setError(json.message || 'No orders found.');
      }
    } catch (_) {
      setError('Unable to connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="animate-fade-in section-padding" style={{ backgroundColor: 'var(--color-bg-main)', minHeight: '85vh' }}>
      <div className="container" style={{ maxWidth: '860px' }}>

        {/* Header */}
        <div className="section-header">
          <span className="section-badge">
            <Package size={14} color="var(--color-primary)" />
            Real-Time Updates
          </span>
          <h1 className="section-title">Track Your Order</h1>
          <p className="section-subtitle">
            Enter your registered phone number or Order ID to see the latest status of your enquiry.
          </p>
        </div>

        {/* Search Box */}
        <div className="track-search-card">

          {/* Toggle: Phone / Order ID */}
          <div className="track-toggle">
            <button
              id="track-by-phone"
              className={`track-toggle-btn ${searchType === 'phone' ? 'active' : ''}`}
              onClick={() => { setSearchType('phone'); setSearchValue(''); setError(''); }}
            >
              <Phone size={15} /> By Phone
            </button>
            <button
              id="track-by-orderid"
              className={`track-toggle-btn ${searchType === 'orderId' ? 'active' : ''}`}
              onClick={() => { setSearchType('orderId'); setSearchValue(''); setError(''); }}
            >
              <Package size={15} /> By Order ID
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="track-search-form">
            <div className="track-search-input-wrapper">
              <Search size={18} className="track-search-icon" />
              <input
                id="track-search-input"
                type={searchType === 'phone' ? 'tel' : 'text'}
                value={searchValue}
                onChange={(e) => { setSearchValue(e.target.value); if (error) setError(''); }}
                placeholder={searchType === 'phone' ? 'Enter your mobile number e.g. 9876543210' : 'Enter Order ID e.g. ORD-1234567890-5678'}
                className="form-control track-search-input"
              />
            </div>
            <button id="track-search-btn" type="submit" className="btn btn-primary track-search-btn" disabled={isLoading}>
              {isLoading ? <span className="auth-spinner" /> : <><Search size={16} /> Track Order</>}
            </button>
          </form>

          {error && (
            <div className="auth-alert auth-alert-error" style={{ marginTop: '1rem' }}>
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Logged-in user quick actions */}
        {isLoggedIn && (
          <div className="track-user-bar">
            <User size={15} />
            <span>Showing your orders</span>
            <button className="btn btn-secondary btn-sm" onClick={loadMyOrders} style={{ gap: '0.4rem' }}>
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
        )}

        {/* Results */}
        {hasSearched && !isLoading && (
          <div className="track-results">
            {orders.length === 0 ? (
              <div className="track-empty">
                <Package size={48} color="var(--color-text-light)" />
                <h3>No Orders Found</h3>
                <p>
                  We couldn't find any orders matching your search. Please check the details and try again, or{' '}
                  <Link to="/order" style={{ color: 'var(--color-primary)' }}>place a new enquiry</Link>.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                  Found <strong>{orders.length}</strong> order{orders.length > 1 ? 's' : ''}
                </p>
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>
        )}

        {!hasSearched && (
          <div className="track-hint-grid">
            <div className="track-hint-card">
              <div className="track-hint-icon" style={{ background: 'var(--color-primary-subtle)' }}>
                <Phone size={22} color="var(--color-primary)" />
              </div>
              <h4>Track by Phone</h4>
              <p>Use the mobile number you provided when placing your order enquiry.</p>
            </div>
            <div className="track-hint-card">
              <div className="track-hint-icon" style={{ background: 'var(--color-gold-light)' }}>
                <Package size={22} color="var(--color-gold-dark)" />
              </div>
              <h4>Track by Order ID</h4>
              <p>Your unique Order ID (ORD-XXXXXX) was shown when your enquiry was submitted.</p>
            </div>
            <div className="track-hint-card">
              <div className="track-hint-icon" style={{ background: 'var(--color-leaf-green-light)' }}>
                <User size={22} color="var(--color-leaf-green)" />
              </div>
              <h4>Sign In to Auto-Track</h4>
              <p>
                <Link to="/login" style={{ color: 'var(--color-primary)' }}>Log in</Link> to automatically see all your past and current orders.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
