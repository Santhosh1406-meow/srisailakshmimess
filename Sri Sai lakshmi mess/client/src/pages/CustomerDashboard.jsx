import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyOrders } from '../services/api';
import {
  User, Package, Clock, CheckCircle2, XCircle, Truck,
  Star, CreditCard, UtensilsCrossed, Calendar, ArrowRight,
  RefreshCw, LogOut, ShoppingBag, AlertCircle, MapPin
} from 'lucide-react';

const STATUS_CONFIG = {
  'Order Received':   { color: '#d97706', bg: '#fef3c7', icon: Package },
  'Enquiry Received': { color: '#6366f1', bg: '#eef2ff', icon: Package },
  'Processing':       { color: '#0284c7', bg: '#e0f2fe', icon: Clock },
  'Confirmed':        { color: '#10b981', bg: '#ecfdf5', icon: CheckCircle2 },
  'Ready':            { color: '#8b5cf6', bg: '#f5f3ff', icon: ShoppingBag },
  'Out for Delivery': { color: '#2563eb', bg: '#eff6ff', icon: Truck },
  'Delivered':        { color: '#059669', bg: '#ecfdf5', icon: Star },
  'Completed':        { color: '#059669', bg: '#ecfdf5', icon: Star },
  'Cancelled':        { color: '#ef4444', bg: '#fef2f2', icon: XCircle },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Order Received'] || STATUS_CONFIG['Enquiry Received'];
  const Icon = cfg.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
      backgroundColor: cfg.bg, color: cfg.color,
      padding: '0.3rem 0.75rem', borderRadius: '20px',
      fontSize: '0.78rem', fontWeight: '700', whiteSpace: 'nowrap'
    }}>
      <Icon size={13} /> {status}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <div style={{
      background: bg || 'white', borderRadius: '16px',
      padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      border: '1px solid rgba(0,0,0,0.06)',
      display: 'flex', alignItems: 'center', gap: '1rem'
    }}>
      <div style={{
        width: '52px', height: '52px', borderRadius: '14px',
        background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={24} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1c1917', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.82rem', color: '#78716c', marginTop: '0.2rem' }}>{label}</div>
      </div>
    </div>
  );
}

export default function CustomerDashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
    if (!authLoading && user && user.role === 'delivery') navigate('/delivery');
    if (!authLoading && user && user.role === 'admin') navigate('/admin');
  }, [user, authLoading, navigate]);

  const loadOrders = async (silent = false) => {
    try {
      if (!silent) setRefreshing(true);
      setError('');
      const data = await getMyOrders();
      setOrders(data || []);
    } catch (e) {
      if (!silent) setError(e.message);
    } finally {
      setLoading(false);
      if (!silent) setRefreshing(false);
    }
  };

  useEffect(() => { if (user) loadOrders(); }, [user]);

  // Real-time live polling every 4 seconds for active orders
  useEffect(() => {
    if (!user || orders.length === 0) return;
    const hasActive = orders.some(o => {
      const s = (o.status || '').toLowerCase();
      return !s.includes('delivered') && !s.includes('completed') && !s.includes('cancelled');
    });
    if (!hasActive) return;

    const pollInterval = setInterval(() => {
      loadOrders(true);
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [user, orders]);

  // Listen to live order update events across tabs
  useEffect(() => {
    const handleUpdate = () => { if (user) loadOrders(true); };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('ssl_order_status_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('ssl_order_status_updated', handleUpdate);
    };
  }, [user]);

  const stats = {
    total: orders.length,
    active: orders.filter(o => !['Completed','Delivered','Cancelled'].includes(o.status)).length,
    completed: orders.filter(o => ['Completed','Delivered'].includes(o.status)).length,
    paid: orders.filter(o => o.paymentStatus === 'Paid').length,
  };

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid #fed7aa', borderTopColor: '#ea580c', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#78716c' }}>Loading your dashboard…</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff7ed 0%, #fffbeb 50%, #f0fdf4 100%)', paddingBottom: '4rem' }}>

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', color: 'white', padding: '2.5rem 1.5rem 4rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', opacity: 0.85 }}>Welcome back 👋</div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0 }}>{user.name}</h1>
              </div>
            </div>
            <div style={{ fontSize: '0.85rem', opacity: 0.75 }}>{user.email} · Customer Account</div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/order" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '50px', textDecoration: 'none', fontWeight: '700', fontSize: '0.875rem', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShoppingBag size={16} /> Place Order
            </Link>
            <button onClick={() => { logout(); navigate('/'); }} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '50px', fontWeight: '700', fontSize: '0.875rem', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '-2.5rem auto 0', padding: '0 1.5rem' }}>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard icon={Package} label="Total Orders" value={stats.total} color="#ea580c" />
          <StatCard icon={Clock} label="Active Orders" value={stats.active} color="#f59e0b" />
          <StatCard icon={Star} label="Completed" value={stats.completed} color="#22c55e" />
          <StatCard icon={CreditCard} label="Paid Orders" value={stats.paid} color="#6366f1" />
        </div>

        {/* Orders Section */}
        <div style={{ background: 'white', borderRadius: '20px', boxShadow: '0 2px 20px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #f5f5f4', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#1c1917' }}>📦 My Orders</h2>
            <button onClick={loadOrders} disabled={refreshing} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa', padding: '0.45rem 1rem', borderRadius: '50px', fontWeight: '700', fontSize: '0.825rem', cursor: 'pointer' }}>
              <RefreshCw size={14} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} /> Refresh
            </button>
          </div>

          {error && (
            <div style={{ margin: '1.5rem', padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#dc2626', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {orders.length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <ShoppingBag size={56} color="#d4c5b0" style={{ marginBottom: '1rem' }} />
              <h3 style={{ color: '#78716c', fontWeight: '700' }}>No orders yet</h3>
              <p style={{ color: '#a8a29e', fontSize: '0.9rem' }}>Place your first order and track it here!</p>
              <Link to="/order" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '1rem', background: '#ea580c', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '50px', textDecoration: 'none', fontWeight: '700' }}>
                Order Now <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div style={{ padding: '1rem' }}>
              {orders.map(order => (
                <div key={order.id} style={{ border: '1px solid #f5f5f4', borderRadius: '14px', padding: '1.25rem', marginBottom: '0.75rem', transition: 'box-shadow 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#a8a29e', fontFamily: 'monospace', marginBottom: '0.25rem' }}>{order.id}</div>
                      <div style={{ fontWeight: '800', color: '#1c1917', fontSize: '1rem' }}>{order.foodItem}</div>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.83rem', color: '#78716c' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><UtensilsCrossed size={13} /> Qty: {order.quantity}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={13} /> {order.preferredDate} at {order.preferredTime}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><CreditCard size={13} />
                      <span style={{ color: order.paymentStatus === 'Paid' ? '#16a34a' : '#f59e0b', fontWeight: '700' }}>{order.paymentStatus}</span>
                    </span>
                    {order.deliveryPartnerName && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Truck size={13} /> {order.deliveryPartnerName}</span>
                    )}
                    {order.orderType === 'delivery' && order.deliveryAddress && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={13} /> {order.deliveryAddress}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
          {[
            { to: '/order', label: '🍛 Place New Order', desc: 'Catering & bulk orders' },
            { to: '/track-order', label: '📦 Track Order', desc: 'Track by phone or ID' },
            { to: '/menu', label: '📋 View Menu', desc: 'Browse our full menu' },
          ].map(link => (
            <Link key={link.to} to={link.to} style={{ background: 'white', padding: '1.25rem', borderRadius: '16px', textDecoration: 'none', border: '1px solid #f5f5f4', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'box-shadow 0.2s' }}>
              <div>
                <div style={{ fontWeight: '800', color: '#1c1917', fontSize: '0.95rem' }}>{link.label}</div>
                <div style={{ fontSize: '0.8rem', color: '#a8a29e', marginTop: '0.15rem' }}>{link.desc}</div>
              </div>
              <ArrowRight size={18} color="#ea580c" />
            </Link>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
