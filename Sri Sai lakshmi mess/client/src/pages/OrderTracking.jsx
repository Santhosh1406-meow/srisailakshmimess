import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search, Package, Clock, CheckCircle2, Truck, Star,
  XCircle, AlertCircle, Phone, Calendar, UtensilsCrossed,
  MapPin, CreditCard, RefreshCw, User, ShoppingBag, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { trackOrderById, trackOrderByPhone } from '../services/api';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const ORDER_STEPS = [
  {
    id: 'received',
    keys: ['order received', 'enquiry received', 'pending'],
    label: 'Order Received',
    icon: Package,
    desc: 'We have received your order enquiry'
  },
  {
    id: 'processing',
    keys: ['processing', 'in progress'],
    label: 'Processing',
    icon: Clock,
    desc: 'Our kitchen is reviewing and queuing your order'
  },
  {
    id: 'confirmed',
    keys: ['confirmed'],
    label: 'Confirmed',
    icon: CheckCircle2,
    desc: 'Order confirmed! Kitchen is cooking your meal'
  },
  {
    id: 'ready',
    keys: ['ready', 'food ready'],
    label: 'Food Ready',
    icon: UtensilsCrossed,
    desc: 'Freshly prepared and packed hot'
  },
  {
    id: 'out_for_delivery',
    keys: ['out for delivery', 'out_for_delivery'],
    label: 'Out for Delivery',
    icon: Truck,
    desc: 'Rider is on the way to your address'
  },
  {
    id: 'delivered',
    keys: ['delivered', 'completed'],
    label: 'Delivered',
    icon: Star,
    desc: 'Order delivered. Enjoy your meal! 🍛'
  }
];

function getStepIndex(status) {
  const clean = (status || '').toLowerCase().trim();
  for (let i = 0; i < ORDER_STEPS.length; i++) {
    if (ORDER_STEPS[i].keys.some((k) => clean === k || clean.includes(k))) {
      return i;
    }
  }
  return 0;
}

function StatusTimeline({ status, isDelivery = true }) {
  const activeIndex = getStepIndex(status);
  const isCancelled = (status || '').toLowerCase().includes('cancel');
  const isDelivered = (status || '').toLowerCase().includes('delivered') || (status || '').toLowerCase().includes('completed');

  // Filter out delivery step if dine-in / takeaway
  const visibleSteps = isDelivery ? ORDER_STEPS : ORDER_STEPS.filter(s => s.id !== 'out_for_delivery');

  return (
    <div className="track-timeline">
      {isCancelled ? (
        <div className="track-cancelled" style={{ textAlign: 'center', padding: '1.5rem', background: 'rgba(239,68,68,0.1)', borderRadius: '12px' }}>
          <XCircle size={36} color="#ef4444" style={{ marginBottom: '0.5rem' }} />
          <h3 style={{ color: '#ef4444', margin: '0 0 0.25rem 0' }}>Order Cancelled</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>
            This order has been cancelled. Please contact Sri Sai Lakshmi Mess for assistance.
          </p>
        </div>
      ) : (
        visibleSteps.map((step, idx) => {
          const Icon = step.icon;
          const isDone = isDelivered || idx < activeIndex;
          const isActive = !isDelivered && idx === activeIndex;
          const isPending = !isDelivered && idx > activeIndex;

          return (
            <div
              key={step.id}
              className={`track-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''} ${isPending ? 'pending' : ''}`}
            >
              <div className="track-step-connector" />
              <div className="track-step-icon">
                <Icon size={18} />
              </div>
              <div className="track-step-content">
                <span className="track-step-label">{step.label}</span>
                {isActive && (
                  <span className="track-step-desc" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>
                    {step.desc}
                  </span>
                )}
                {isDelivered && step.id === 'delivered' && (
                  <span className="track-step-desc" style={{ color: '#10b981', fontWeight: '600' }}>
                    {step.desc}
                  </span>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function OrderCard({ order }) {
  const isDelivery = (order.orderType || '').toLowerCase() === 'delivery';
  const isDelivered = (order.status || '').toLowerCase().includes('delivered') || (order.status || '').toLowerCase().includes('completed');

  return (
    <div className="track-order-card animate-fade-in" style={{ background: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0', padding: '1.75rem', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.06)' }}>
      {/* Header */}
      <div className="track-order-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div className="track-order-id" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '700', fontSize: '0.88rem', color: 'var(--color-primary)' }}>
            <Package size={16} />
            <span>{order.id}</span>
          </div>
          <div className="track-order-name" style={{ fontSize: '1.2rem', fontWeight: '800', color: '#1e293b', marginTop: '0.2rem' }}>
            {order.customerName}
          </div>
        </div>

        {/* Live Status Badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.35rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.85rem',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: '700',
              backgroundColor: isDelivered ? '#ecfdf5' : order.status === 'Out for Delivery' ? '#eff6ff' : order.status === 'Cancelled' ? '#fef2f2' : '#fffbeb',
              color: isDelivered ? '#059669' : order.status === 'Out for Delivery' ? '#2563eb' : order.status === 'Cancelled' ? '#dc2626' : '#d97706',
              border: `1px solid ${isDelivered ? '#a7f3d0' : order.status === 'Out for Delivery' ? '#bfdbfe' : order.status === 'Cancelled' ? '#fecaca' : '#fde68a'}`
            }}
          >
            {isDelivered ? <CheckCircle2 size={15} /> : order.status === 'Out for Delivery' ? <Truck size={15} /> : <Clock size={15} />}
            <span>{order.status}</span>
          </span>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
            Updated: {new Date(order.updatedAt || order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Delivery Rider Alert Card if Out for Delivery */}
      {order.status === 'Out for Delivery' && (
        <div style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={20} />
            </div>
            <div>
              <div style={{ fontWeight: '800', color: '#1e3a8a', fontSize: '0.95rem' }}>
                {order.deliveryPartnerName ? `Delivery Rider: ${order.deliveryPartnerName}` : 'Rider Assigned'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#3b82f6' }}>
                Your order is out for delivery and heading to your location!
              </div>
            </div>
          </div>
          {order.deliveryPartnerPhone && (
            <a
              href={`tel:${order.deliveryPartnerPhone}`}
              className="btn btn-primary btn-sm"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Phone size={14} />
              <span>Call Rider</span>
            </a>
          )}
        </div>
      )}

      {/* Details Grid */}
      <div className="track-order-details" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '1.5rem' }}>
        <div className="track-detail-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155', fontSize: '0.9rem' }}>
          <UtensilsCrossed size={16} style={{ color: 'var(--color-primary)' }} />
          <span><strong>{order.foodItem}</strong> × {order.quantity}</span>
        </div>

        <div className="track-detail-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155', fontSize: '0.9rem' }}>
          <Calendar size={16} style={{ color: 'var(--color-primary)' }} />
          <span>{order.preferredDate} at {order.preferredTime}</span>
        </div>

        <div className="track-detail-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155', fontSize: '0.9rem' }}>
          <CreditCard size={16} style={{ color: 'var(--color-primary)' }} />
          <span>
            Payment: <strong style={{ color: order.paymentStatus === 'Paid' ? '#10b981' : '#f59e0b' }}>{order.paymentStatus}</strong>
            {order.amount > 0 && <span> (₹{order.amount})</span>}
          </span>
        </div>

        {order.deliveryAddress && (
          <div className="track-detail-item" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155', fontSize: '0.9rem' }}>
            <MapPin size={16} style={{ color: 'var(--color-primary)' }} />
            <span>Delivery to: <strong>{order.deliveryAddress}</strong></span>
          </div>
        )}
      </div>

      {/* Individual items list if array present */}
      {Array.isArray(order.items) && order.items.length > 0 && (
        <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Order Items:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {order.items.map((it, i) => (
              <span key={i} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.2rem 0.6rem', fontSize: '0.8rem', color: '#1e293b' }}>
                {it.name} × {it.quantity || 1} {it.price ? `(₹${it.price * (it.quantity || 1)})` : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Status Timeline */}
      <StatusTimeline status={order.status} isDelivery={isDelivery} />

      {/* Footer */}
      <div className="track-order-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
        <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
          Placed on: {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <a
            href={`tel:+916383034188`}
            className="btn btn-secondary btn-sm"
            style={{ gap: '0.4rem' }}
          >
            <Phone size={14} /> Call Mess Hotline
          </a>
        </div>
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
  const [isLivePolling, setIsLivePolling] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
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
    if (phone) {
      setSearchType('phone');
      setSearchValue(phone);
      handleSearch('phone', phone);
    } else if (orderId) {
      setSearchType('orderId');
      setSearchValue(orderId);
      handleSearch('orderId', orderId);
    }
  }, []);

  const loadMyOrders = async (silent = false) => {
    if (!silent) setIsLoading(true);
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
        setLastSyncTime(new Date());
      }
    } catch (_) {
      // silent fallback
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const handleSearch = async (type = searchType, value = searchValue, silent = false) => {
    const trimmed = (value || '').trim();
    if (!trimmed) {
      if (!silent) setError('Please enter a phone number or order ID.');
      return;
    }
    if (!silent) setIsLoading(true);
    setError('');
    setHasSearched(true);

    try {
      let data = [];
      if (type === 'phone') {
        data = await trackOrderByPhone(trimmed);
      } else {
        const single = await trackOrderById(trimmed);
        data = single ? (Array.isArray(single) ? single : [single]) : [];
      }

      if (Array.isArray(data) && data.length > 0) {
        setOrders(data);
        setLastSyncTime(new Date());
      } else {
        if (!silent) {
          setOrders([]);
          setError('No orders found matching this query.');
        }
      }
    } catch (err) {
      if (!silent) {
        setError(err.message || 'Unable to connect to server. Please try again.');
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  // ── LIVE AUTO-POLLING & CROSS-TAB SYNC ──────────────────────────────────────────
  // Poll every 3.5 seconds whenever active (undelivered) orders are on screen
  useEffect(() => {
    if (!hasSearched || orders.length === 0) {
      setIsLivePolling(false);
      return;
    }

    const hasActiveOrders = orders.some((o) => {
      const s = (o.status || '').toLowerCase();
      return !s.includes('delivered') && !s.includes('completed') && !s.includes('cancelled');
    });

    setIsLivePolling(hasActiveOrders);
    if (!hasActiveOrders) return; // All orders are in final state

    const pollInterval = setInterval(() => {
      if (isLoggedIn && myOrdersLoaded) {
        loadMyOrders(true);
      } else if (searchValue.trim()) {
        handleSearch(searchType, searchValue, true);
      }
    }, 3500);

    return () => clearInterval(pollInterval);
  }, [hasSearched, orders, isLoggedIn, myOrdersLoaded, searchType, searchValue]);

  // Immediate storage & custom event listener
  useEffect(() => {
    const handleLiveEvent = () => {
      if (hasSearched) {
        if (isLoggedIn && myOrdersLoaded) {
          loadMyOrders(true);
        } else if (searchValue.trim()) {
          handleSearch(searchType, searchValue, true);
        }
      }
    };

    window.addEventListener('storage', handleLiveEvent);
    window.addEventListener('ssl_order_status_updated', handleLiveEvent);
    return () => {
      window.removeEventListener('storage', handleLiveEvent);
      window.removeEventListener('ssl_order_status_updated', handleLiveEvent);
    };
  }, [hasSearched, isLoggedIn, myOrdersLoaded, searchType, searchValue]);

  return (
    <div className="animate-fade-in section-padding" style={{ backgroundColor: '#f8fafc', minHeight: '85vh' }}>
      <div className="container" style={{ maxWidth: '860px' }}>

        {/* Header */}
        <div className="section-header" style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', backgroundColor: 'rgba(234,88,12,0.1)', color: '#ea580c', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '700', marginBottom: '0.75rem' }}>
            <Package size={14} />
            <span>Sri Sai Lakshmi Mess • Live Order Tracking</span>
          </div>
          <h1 className="section-title" style={{ fontSize: '2.2rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.5rem 0' }}>
            Track Your Food Order
          </h1>
          <p className="section-subtitle" style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>
            Enter your mobile number or Order ID to monitor live kitchen status, preparation, and delivery in real-time.
          </p>

          {/* Live Pulse Indicator when polling */}
          {isLivePolling && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.85rem', fontSize: '0.78rem', color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.3rem 0.75rem', borderRadius: '20px', fontWeight: '700' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981' }} />
              <span>Live Updates Active (Syncing automatically)</span>
            </div>
          )}
        </div>

        {/* Search Box */}
        <div className="track-search-card" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '18px', padding: '1.75rem', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.06)', marginBottom: '2rem' }}>

          {/* Toggle: Phone / Order ID */}
          <div className="track-toggle" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <button
              id="track-by-phone"
              type="button"
              className={`track-toggle-btn ${searchType === 'phone' ? 'active' : ''}`}
              onClick={() => { setSearchType('phone'); setSearchValue(''); setError(''); }}
              style={{
                flex: 1, padding: '0.65rem 1rem', borderRadius: '10px',
                border: searchType === 'phone' ? '2px solid #ea580c' : '1px solid #e2e8f0',
                backgroundColor: searchType === 'phone' ? 'rgba(234,88,12,0.06)' : '#ffffff',
                color: searchType === 'phone' ? '#ea580c' : '#64748b',
                fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
              }}
            >
              <Phone size={16} /> By Mobile Phone
            </button>
            <button
              id="track-by-orderid"
              type="button"
              className={`track-toggle-btn ${searchType === 'orderId' ? 'active' : ''}`}
              onClick={() => { setSearchType('orderId'); setSearchValue(''); setError(''); }}
              style={{
                flex: 1, padding: '0.65rem 1rem', borderRadius: '10px',
                border: searchType === 'orderId' ? '2px solid #ea580c' : '1px solid #e2e8f0',
                backgroundColor: searchType === 'orderId' ? 'rgba(234,88,12,0.06)' : '#ffffff',
                color: searchType === 'orderId' ? '#ea580c' : '#64748b',
                fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
              }}
            >
              <Package size={16} /> By Order ID
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="track-search-form" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div className="track-search-input-wrapper" style={{ flex: 1, position: 'relative', minWidth: '240px' }}>
              <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                id="track-search-input"
                type={searchType === 'phone' ? 'tel' : 'text'}
                value={searchValue}
                onChange={(e) => { setSearchValue(e.target.value); if (error) setError(''); }}
                placeholder={searchType === 'phone' ? 'Enter 10-digit mobile number e.g. 9876543210' : 'Enter Order ID e.g. ORD-1726848123-1234'}
                style={{
                  width: '100%', padding: '0.75rem 1rem 0.75rem 2.6rem', borderRadius: '10px',
                  border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box'
                }}
              />
            </div>
            <button
              id="track-search-btn"
              type="submit"
              className="btn btn-primary track-search-btn"
              disabled={isLoading}
              style={{ padding: '0.75rem 1.4rem', fontWeight: '700', gap: '0.5rem' }}
            >
              {isLoading ? <RefreshCw size={16} className="spin-slow" /> : <Search size={16} />}
              <span>Track Now</span>
            </button>
          </form>

          {error && (
            <div className="auth-alert auth-alert-error" style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '8px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Logged-in user quick bar */}
        {isLoggedIn && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '0.75rem 1.25rem', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', color: '#475569' }}>
              <User size={16} style={{ color: 'var(--color-primary)' }} />
              <span>Viewing your logged-in bookings</span>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => loadMyOrders(false)}
              style={{ gap: '0.4rem', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
            >
              <RefreshCw size={13} className={isLoading ? 'spin-slow' : ''} />
              <span>Refresh Orders</span>
            </button>
          </div>
        )}

        {/* Results */}
        {hasSearched && !isLoading && (
          <div className="track-results">
            {orders.length === 0 ? (
              <div className="track-empty" style={{ textAlign: 'center', padding: '3.5rem 1rem', background: '#ffffff', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
                <Package size={52} color="#94a3b8" style={{ marginBottom: '1rem' }} />
                <h3 style={{ color: '#1e293b', fontSize: '1.25rem', margin: '0 0 0.5rem 0' }}>No Orders Found</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
                  We couldn't find any orders matching this number or ID. Please double check the details, or place a new order.
                </p>
                <Link to="/order" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem' }}>
                  Place Food Order
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                    Found <strong>{orders.length}</strong> order{orders.length > 1 ? 's' : ''}
                  </span>
                  {lastSyncTime && (
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      Last updated: {lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  )}
                </div>
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
              <div className="track-hint-icon" style={{ background: 'rgba(234,88,12,0.1)' }}>
                <Phone size={22} color="var(--color-primary)" />
              </div>
              <h4>Track by Mobile</h4>
              <p>Enter the phone number provided during food booking for all recent orders.</p>
            </div>
            <div className="track-hint-card">
              <div className="track-hint-icon" style={{ background: 'rgba(59,130,246,0.1)' }}>
                <Package size={22} color="#3b82f6" />
              </div>
              <h4>Track by Order ID</h4>
              <p>Enter your exact ORD-XXXXXX booking ID for instant step-by-step progress.</p>
            </div>
            <div className="track-hint-card">
              <div className="track-hint-icon" style={{ background: 'rgba(16,185,129,0.1)' }}>
                <User size={22} color="#10b981" />
              </div>
              <h4>Sign In for History</h4>
              <p>
                <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: '700' }}>Log in</Link> to view live tracking for all your past and current food orders.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
