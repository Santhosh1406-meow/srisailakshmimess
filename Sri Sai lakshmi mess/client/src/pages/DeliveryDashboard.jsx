import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getMyDeliveryOrders, acceptDeliveryOrder,
  markOrderDelivered, toggleDeliveryAvailability
} from '../services/api';
import {
  Truck, Package, CheckCircle2, MapPin, Phone, User,
  Star, Clock, RefreshCw, LogOut, ToggleLeft, ToggleRight,
  AlertCircle, UtensilsCrossed, Calendar, ArrowRight, Bike
} from 'lucide-react';

const STATUS_COLOR = {
  'Enquiry Received': '#6366f1',
  'Processing':       '#f59e0b',
  'Confirmed':        '#10b981',
  'Ready':            '#3b82f6',
  'Out for Delivery': '#f97316',
  'Completed':        '#22c55e',
  'Cancelled':        '#ef4444',
};

function OrderCard({ order, onAccept, onDeliver, myId, actionLoading }) {
  const isAssigned = order.deliveryPartnerId === myId;
  const isAvailable = !order.deliveryPartnerId && order.status === 'Ready';
  const statusColor = STATUS_COLOR[order.status] || '#6b7280';
  const loading = actionLoading === order.id;

  return (
    <div style={{
      background: 'white', borderRadius: '16px', padding: '1.25rem',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: `1px solid ${isAssigned ? '#fed7aa' : '#f5f5f4'}`,
      transition: 'box-shadow 0.2s',
      borderLeft: `4px solid ${statusColor}`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '0.72rem', color: '#a8a29e', fontFamily: 'monospace' }}>{order.id}</div>
          <div style={{ fontWeight: '800', color: '#1c1917', fontSize: '1rem', marginTop: '0.15rem' }}>{order.customerName}</div>
        </div>
        <span style={{ background: statusColor + '18', color: statusColor, padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700' }}>
          {order.status}
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.83rem', color: '#78716c', marginBottom: '1rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><UtensilsCrossed size={13} /> {order.foodItem} × {order.quantity}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={13} /> {order.preferredDate} {order.preferredTime}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Phone size={13} /> {order.phone}</span>
        {order.deliveryAddress && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={13} /> {order.deliveryAddress}</span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {isAvailable && (
          <button onClick={() => onAccept(order.id)} disabled={loading} style={{
            flex: 1, minWidth: '120px', background: 'linear-gradient(135deg, #ea580c, #c2410c)',
            color: 'white', border: 'none', padding: '0.65rem 1rem', borderRadius: '10px',
            fontWeight: '700', fontSize: '0.875rem', cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
          }}>
            {loading ? <RefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Truck size={14} />}
            {loading ? 'Accepting…' : 'Accept Order'}
          </button>
        )}
        {isAssigned && order.status === 'Out for Delivery' && (
          <button onClick={() => onDeliver(order.id)} disabled={loading} style={{
            flex: 1, minWidth: '120px', background: 'linear-gradient(135deg, #16a34a, #15803d)',
            color: 'white', border: 'none', padding: '0.65rem 1rem', borderRadius: '10px',
            fontWeight: '700', fontSize: '0.875rem', cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
          }}>
            {loading ? <RefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <CheckCircle2 size={14} />}
            {loading ? 'Updating…' : 'Mark Delivered'}
          </button>
        )}
        {isAssigned && order.status === 'Completed' && (
          <span style={{ color: '#22c55e', fontWeight: '700', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Star size={14} /> Delivered!
          </span>
        )}
      </div>
    </div>
  );
}

export default function DeliveryDashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [availTogglingLoading, setAvailToggleLoading] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
    if (!authLoading && user && user.role === 'customer') navigate('/dashboard');
    if (!authLoading && user && user.role === 'admin') navigate('/admin');
    if (user) setIsAvailable(user.isAvailable || false);
  }, [user, authLoading, navigate]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const loadOrders = useCallback(async () => {
    try {
      setRefreshing(true);
      setError('');
      const data = await getMyDeliveryOrders();
      setOrders(data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { if (user) loadOrders(); }, [user, loadOrders]);

  const handleAccept = async (orderId) => {
    setActionLoading(orderId);
    try {
      await acceptDeliveryOrder(orderId);
      showToast('✅ Order accepted! Go pick it up.');
      await loadOrders();
    } catch (e) {
      showToast('❌ ' + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeliver = async (orderId) => {
    setActionLoading(orderId);
    try {
      await markOrderDelivered(orderId);
      showToast('🎉 Great job! Order marked as delivered.');
      await loadOrders();
    } catch (e) {
      showToast('❌ ' + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleAvailability = async () => {
    setAvailToggleLoading(true);
    try {
      const next = !isAvailable;
      await toggleDeliveryAvailability(next);
      setIsAvailable(next);
      showToast(next ? '🟢 You are now Online!' : '🔴 You are now Offline.');
    } catch (e) {
      showToast('❌ ' + e.message);
    } finally {
      setAvailToggleLoading(false);
    }
  };

  const activeOrders = orders.filter(o => o.deliveryPartnerId === user?.id && o.status === 'Out for Delivery');
  const availableOrders = orders.filter(o => !o.deliveryPartnerId && o.status === 'Ready');
  const completedToday = orders.filter(o => o.deliveryPartnerId === user?.id && o.status === 'Completed' && o.deliveredAt && new Date(o.deliveredAt).toDateString() === new Date().toDateString());

  if (authLoading || loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid #bfdbfe', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: '#78716c' }}>Loading your dashboard…</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)', paddingBottom: '4rem' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: '1.5rem', left: '50%', transform: 'translateX(-50%)', background: '#1c1917', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '50px', fontWeight: '700', fontSize: '0.9rem', zIndex: 9999, boxShadow: '0 8px 24px rgba(0,0,0,0.25)', animation: 'fadeIn 0.3s ease' }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)', color: 'white', padding: '2.5rem 1.5rem 4rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bike size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', opacity: 0.85 }}>Delivery Partner 🛵</div>
                <h1 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0 }}>{user.name}</h1>
              </div>
            </div>
            {user.vehicleNumber && <div style={{ fontSize: '0.83rem', opacity: 0.75 }}>Vehicle: {user.vehicleNumber} · {user.totalDeliveries || 0} deliveries</div>}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Availability Toggle */}
            <button onClick={handleToggleAvailability} disabled={availTogglingLoading} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: isAvailable ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
              color: 'white', padding: '0.6rem 1.2rem', borderRadius: '50px',
              border: `1px solid ${isAvailable ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)'}`,
              cursor: 'pointer', fontWeight: '700', fontSize: '0.875rem'
            }}>
              {isAvailable ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              {isAvailable ? '🟢 Online' : '🔴 Offline'}
            </button>
            <button onClick={() => { logout(); navigate('/'); }} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '0.6rem 1.2rem', borderRadius: '50px', fontWeight: '700', fontSize: '0.875rem', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '-2.5rem auto 0', padding: '0 1.5rem' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { icon: Truck, label: 'Active Deliveries', value: activeOrders.length, color: '#f97316' },
            { icon: Package, label: 'Available Orders', value: availableOrders.length, color: '#3b82f6' },
            { icon: Star, label: "Today's Deliveries", value: completedToday.length, color: '#22c55e' },
            { icon: Clock, label: 'Total Deliveries', value: user.totalDeliveries || 0, color: '#8b5cf6' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} style={{ background: 'white', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={22} color={color} />
              </div>
              <div>
                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#1c1917', lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: '0.78rem', color: '#78716c', marginTop: '0.1rem' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', color: '#dc2626', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button onClick={loadOrders} disabled={refreshing} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'white', color: '#3b82f6', border: '1px solid #bfdbfe', padding: '0.45rem 1rem', borderRadius: '50px', fontWeight: '700', fontSize: '0.825rem', cursor: 'pointer' }}>
            <RefreshCw size={14} style={{ animation: refreshing ? 'spin 0.8s linear infinite' : 'none' }} /> Refresh
          </button>
        </div>

        {/* Active Deliveries */}
        {activeOrders.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#f97316', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Truck size={18} /> Active Deliveries ({activeOrders.length})
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {activeOrders.map(o => <OrderCard key={o.id} order={o} myId={user.id} onAccept={handleAccept} onDeliver={handleDeliver} actionLoading={actionLoading} />)}
            </div>
          </div>
        )}

        {/* Available Orders */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#3b82f6', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={18} /> Available Orders ({availableOrders.length})
          </h2>
          {!isAvailable && (
            <div style={{ padding: '1.25rem', background: '#fef9c3', border: '1px solid #fde68a', borderRadius: '12px', color: '#92400e', fontWeight: '600', marginBottom: '1rem', fontSize: '0.875rem' }}>
              ⚠️ You are currently <strong>Offline</strong>. Toggle to Online to accept orders.
            </div>
          )}
          {availableOrders.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '16px', padding: '3rem 2rem', textAlign: 'center', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <Package size={48} color="#d4c5b0" style={{ marginBottom: '1rem' }} />
              <p style={{ color: '#a8a29e', fontWeight: '600' }}>No available delivery orders right now.</p>
              <p style={{ color: '#d4c5b0', fontSize: '0.85rem' }}>Check back in a few minutes!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {availableOrders.map(o => <OrderCard key={o.id} order={o} myId={user.id} onAccept={handleAccept} onDeliver={handleDeliver} actionLoading={actionLoading} />)}
            </div>
          )}
        </div>

        {/* Completed Today */}
        {completedToday.length > 0 && (
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#22c55e', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Star size={18} /> Completed Today ({completedToday.length})
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {completedToday.map(o => <OrderCard key={o.id} order={o} myId={user.id} onAccept={handleAccept} onDeliver={handleDeliver} actionLoading={actionLoading} />)}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(-8px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
      `}</style>
    </div>
  );
}
