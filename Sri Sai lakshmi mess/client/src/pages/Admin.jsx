import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllOrdersAdmin, updateOrderStatusAdmin, getAdminStats, fetchMenu, getDeliveryPartners, assignDeliveryPartnerAdmin, createDeliveryPartner } from '../services/api';
import {
  ShieldCheck,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Phone,
  MessageCircle,
  UtensilsCrossed,
  TrendingUp,
  RefreshCw,
  Calendar,
  Filter,
  Key,
  Layers,
  XCircle,
  ArrowRight
} from 'lucide-react';

export default function Admin() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  // State
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [activeTab, setActiveTab] = useState('enquiries'); // 'enquiries' | 'analytics' | 'menu' | 'delivery'

  // Delivery partner state
  const [partners, setPartners] = useState([]);
  const [newPartner, setNewPartner] = useState({ name: '', email: '', phone: '', password: 'delivery123', vehicleNumber: '' });
  const [partnerLoading, setPartnerLoading] = useState(false);
  const [partnerError, setPartnerError] = useState('');
  const [assigningId, setAssigningId] = useState(null);

  // Quick Admin Login state
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const isAdmin = user && user.role === 'admin';

  // Load Admin Data
  const loadAdminData = async () => {
    if (!isAdmin) return;
    try {
      setRefreshing(true);
      setError(null);
      const [ordersData, statsData, menuData] = await Promise.all([
        getAllOrdersAdmin(),
        getAdminStats(),
        fetchMenu().catch(() => [])
      ]);
      setOrders(ordersData || []);
      setStats(statsData || null);
      setMenuItems(menuData || []);
    } catch (err) {
      console.error('Error loading admin data:', err);
      setError(err.message || 'Failed to load admin dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Handle Quick Admin Login
  const handleQuickAdminLogin = async () => {
    try {
      setLoginLoading(true);
      setLoginError('');
      await login('admin@srisailakshmimess.com', 'admin123');
    } catch (err) {
      setLoginError(err.message || 'Quick login failed.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Status Update
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdatingId(orderId);
      await updateOrderStatusAdmin(orderId, newStatus);
      // Optimistic update
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o))
      );
      // Refresh stats
      const newStats = await getAdminStats();
      setStats(newStats);
    } catch (err) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Status Colors & Badges
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Enquiry Received':
        return { bg: '#fef3c7', text: '#92400e', icon: <Clock size={14} />, label: 'Enquiry Received' };
      case 'Processing':
        return { bg: '#e0f2fe', text: '#075985', icon: <RefreshCw size={14} className="spin-slow" />, label: 'Processing' };
      case 'Confirmed':
        return { bg: '#dcfce7', text: '#166534', icon: <CheckCircle2 size={14} />, label: 'Confirmed' };
      case 'Ready':
        return { bg: '#fae8ff', text: '#86198f', icon: <Package size={14} />, label: 'Ready' };
      case 'Completed':
        return { bg: '#d1fae5', text: '#065f46', icon: <CheckCircle2 size={14} />, label: 'Completed' };
      case 'Cancelled':
        return { bg: '#fee2e2', text: '#991b1b', icon: <XCircle size={14} />, label: 'Cancelled' };
      default:
        return { bg: '#f3f4f6', text: '#374151', icon: <Clock size={14} />, label: status };
    }
  };

  // Filtered Orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      order.id.toLowerCase().includes(query) ||
      order.customerName.toLowerCase().includes(query) ||
      order.phone.includes(query) ||
      order.foodItem.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  // Render Non-Admin View (Prompt to Login)
  if (!user || user.role !== 'admin') {
    return (
      <div style={{ minHeight: '80vh', backgroundColor: '#0f172a', color: '#f8fafc', padding: '4rem 1rem' }}>
        <div style={{ maxWidth: '520px', margin: '0 auto', textAlign: 'center' }}>
          <div
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              backgroundColor: 'rgba(234, 88, 12, 0.15)',
              color: '#ea580c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}
          >
            <ShieldCheck size={36} />
          </div>

          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.75rem', color: '#ffffff' }}>
            Admin Portal Access
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            Log in with an administrator account to view order stats, manage bulk enquiries, and update delivery statuses.
          </p>

          {/* Quick Demo Login Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.9))',
              border: '1px solid rgba(249, 115, 22, 0.3)',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '2rem',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fb923c', fontWeight: '700', marginBottom: '0.5rem' }}>
              <Key size={18} />
              <span>Demo Admin Credentials</span>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '1.25rem', fontFamily: 'monospace' }}>
              <div><strong>Email:</strong> admin@srisailakshmimess.com</div>
              <div><strong>Password:</strong> admin123</div>
            </div>

            {loginError && (
              <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {loginError}
              </div>
            )}

            <button
              onClick={handleQuickAdminLogin}
              disabled={loginLoading}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', fontWeight: '700', padding: '0.85rem' }}
            >
              {loginLoading ? <RefreshCw size={18} className="spin-slow" /> : <ShieldCheck size={18} />}
              <span>{loginLoading ? 'Authenticating...' : '⚡ Quick Admin Login (1-Click)'}</span>
            </button>
          </div>

          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Already logged in as a regular customer?{' '}
            <button onClick={() => logout()} style={{ background: 'none', border: 'none', color: '#ea580c', cursor: 'pointer', textDecoration: 'underline' }}>
              Sign Out
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', padding: '2rem 1rem 4rem 1rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid #334155',
            marginBottom: '2rem'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ea580c', fontWeight: '700', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <ShieldCheck size={18} />
              <span>Sri Sai Lakshmi Mess • Admin Portal</span>
            </div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#ffffff', margin: '0.25rem 0' }}>
              Catering & Bulk Order Manager
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
              Logged in as <strong style={{ color: '#fb923c' }}>{user.name}</strong> ({user.email})
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={loadAdminData}
              disabled={refreshing}
              style={{
                backgroundColor: '#1e293b',
                color: '#cbd5e1',
                border: '1px solid #475569',
                padding: '0.65rem 1.2rem',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
            >
              <RefreshCw size={16} className={refreshing ? 'spin-slow' : ''} />
              <span>{refreshing ? 'Syncing...' : 'Refresh Data'}</span>
            </button>
            <button
              onClick={() => logout()}
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#fca5a5',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '0.65rem 1.2rem',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2.5rem'
          }}
        >
          {/* Stat 1 */}
          <div
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '14px',
              padding: '1.25rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              <span>Total Bulk Enquiries</span>
              <Package size={20} style={{ color: '#ea580c' }} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff' }}>
              {stats ? stats.totalOrders : orders.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Submitted via web & app</div>
          </div>

          {/* Stat 2 */}
          <div
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '14px',
              padding: '1.25rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              <span>Pending Action</span>
              <Clock size={20} style={{ color: '#f59e0b' }} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#f59e0b' }}>
              {stats ? stats.pendingEnquiries : orders.filter((o) => o.status === 'Enquiry Received').length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#92400e', marginTop: '0.25rem' }}>Requires customer callback</div>
          </div>

          {/* Stat 3 */}
          <div
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '14px',
              padding: '1.25rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              <span>Confirmed Orders</span>
              <CheckCircle2 size={20} style={{ color: '#22c55e' }} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#22c55e' }}>
              {stats ? stats.confirmedOrders : orders.filter((o) => o.status === 'Confirmed' || o.status === 'Completed').length}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#166534', marginTop: '0.25rem' }}>Booked for execution</div>
          </div>

          {/* Stat 4 */}
          <div
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '14px',
              padding: '1.25rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              <span>Total Portions</span>
              <UtensilsCrossed size={20} style={{ color: '#38bdf8' }} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: '#38bdf8' }}>
              {stats ? stats.totalPortions : orders.reduce((s, o) => s + (o.quantity || 0), 0)}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#075985', marginTop: '0.25rem' }}>Meals to be served</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #334155', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setActiveTab('enquiries')}
            style={{
              padding: '0.85rem 1.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'enquiries' ? '3px solid #ea580c' : '3px solid transparent',
              color: activeTab === 'enquiries' ? '#fb923c' : '#94a3b8',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1rem',
              transition: 'all 0.2s ease'
            }}
          >
            <Layers size={18} />
            <span>Bulk Enquiries ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            style={{
              padding: '0.85rem 1.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'menu' ? '3px solid #ea580c' : '3px solid transparent',
              color: activeTab === 'menu' ? '#fb923c' : '#94a3b8',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1rem',
              transition: 'all 0.2s ease'
            }}
          >
            <UtensilsCrossed size={18} />
            <span>Menu Items ({menuItems.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('delivery'); if (partners.length === 0) getDeliveryPartners().then(setPartners).catch(console.error); }}
            style={{
              padding: '0.85rem 1.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'delivery' ? '3px solid #3b82f6' : '3px solid transparent',
              color: activeTab === 'delivery' ? '#60a5fa' : '#94a3b8',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '1rem',
              transition: 'all 0.2s ease'
            }}
          >
            🛵 <span>Delivery Partners ({partners.length})</span>
          </button>
        </div>

        {/* TAB 1: Enquiries */}
        {activeTab === 'enquiries' && (
          <div>
            {/* Filter & Search Bar */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
                backgroundColor: '#1e293b',
                padding: '1rem',
                borderRadius: '12px',
                border: '1px solid #334155'
              }}
            >
              {/* Search Box */}
              <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  placeholder="Search by customer name, phone, or Order ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#0f172a',
                    border: '1px solid #475569',
                    borderRadius: '8px',
                    padding: '0.65rem 1rem 0.65rem 2.4rem',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Status Filter Pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                <Filter size={16} style={{ color: '#64748b', marginRight: '0.2rem' }} />
                {['All', 'Enquiry Received', 'Processing', 'Confirmed', 'Ready', 'Completed', 'Cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setSelectedStatus(st)}
                    style={{
                      padding: '0.45rem 0.85rem',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: selectedStatus === st ? '#ea580c' : '#0f172a',
                      color: selectedStatus === st ? '#ffffff' : '#94a3b8',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', borderRadius: '10px', marginBottom: '1.5rem' }}>
                {error}
              </div>
            )}

            {/* Loading Skeleton */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
                <RefreshCw size={32} className="spin-slow" style={{ marginBottom: '1rem', color: '#ea580c' }} />
                <div>Loading bulk order enquiries...</div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div
                style={{
                  backgroundColor: '#1e293b',
                  borderRadius: '12px',
                  border: '1px solid #334155',
                  padding: '3rem 1.5rem',
                  textAlign: 'center',
                  color: '#94a3b8'
                }}
              >
                <Package size={48} style={{ color: '#475569', marginBottom: '1rem' }} />
                <h3 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>No Enquiries Found</h3>
                <p style={{ fontSize: '0.9rem' }}>
                  {searchQuery || selectedStatus !== 'All'
                    ? 'No orders match your filter criteria. Try clearing search or status filters.'
                    : 'No bulk enquiries have been submitted yet.'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                {filteredOrders.map((order) => {
                  const badge = getStatusBadge(order.status);
                  const isUpdating = updatingId === order.id;

                  return (
                    <div
                      key={order.id}
                      style={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: '14px',
                        padding: '1.5rem',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                    >
                      {/* Top Header */}
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '1rem',
                          paddingBottom: '1rem',
                          borderBottom: '1px solid #334155',
                          marginBottom: '1rem'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#fb923c', fontFamily: 'monospace' }}>
                              #{order.id}
                            </span>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                backgroundColor: badge.bg,
                                color: badge.text,
                                padding: '0.25rem 0.75rem',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: '700'
                              }}
                            >
                              {badge.icon}
                              <span>{order.status}</span>
                            </span>
                            <span
                              style={{
                                fontSize: '0.75rem',
                                backgroundColor: order.paymentStatus === 'Paid' ? '#dcfce7' : '#fef3c7',
                                color: order.paymentStatus === 'Paid' ? '#166534' : '#92400e',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '4px',
                                fontWeight: '600'
                              }}
                            >
                              {order.paymentStatus}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.35rem' }}>
                            Submitted on: {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                          </div>
                        </div>

                        {/* Status Updater Dropdown */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600' }}>Change Status:</span>
                          <select
                            value={order.status}
                            disabled={isUpdating}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            style={{
                              backgroundColor: '#0f172a',
                              color: '#ffffff',
                              border: '1px solid #475569',
                              padding: '0.5rem 0.85rem',
                              borderRadius: '8px',
                              fontWeight: '600',
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              outline: 'none'
                            }}
                          >
                            <option value="Enquiry Received">Enquiry Received</option>
                            <option value="Processing">Processing</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Ready">Ready</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>

                      {/* Main Details Grid */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                          gap: '1.25rem',
                          marginBottom: '1rem'
                        }}
                      >
                        {/* Customer Info */}
                        <div>
                          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                            Customer Details
                          </div>
                          <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#ffffff' }}>{order.customerName}</div>
                          <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginTop: '0.2rem' }}>📞 {order.phone}</div>
                          {order.email && <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.1rem' }}>✉️ {order.email}</div>}
                        </div>

                        {/* Menu & Quantity */}
                        <div>
                          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                            Requirement / Package
                          </div>
                          <div style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff' }}>{order.foodItem}</div>
                          <div style={{ fontSize: '0.9rem', color: '#ea580c', fontWeight: '700', marginTop: '0.25rem' }}>
                            Portions: {order.quantity} Plates
                          </div>
                        </div>

                        {/* Date & Time */}
                        <div>
                          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>
                            Event Date & Time
                          </div>
                          <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Calendar size={15} style={{ color: '#ea580c' }} />
                            <span>{order.preferredDate || 'Not specified'}</span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Clock size={14} style={{ color: '#94a3b8' }} />
                            <span>{order.preferredTime || 'Not specified'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Special Instructions Callout */}
                      {order.specialInstructions && (
                        <div
                          style={{
                            backgroundColor: '#0f172a',
                            borderLeft: '4px solid #ea580c',
                            padding: '0.75rem 1rem',
                            borderRadius: '0 8px 8px 0',
                            marginBottom: '1rem',
                            fontSize: '0.875rem',
                            color: '#e2e8f0'
                          }}
                        >
                          <strong style={{ color: '#fb923c' }}>Special Instructions: </strong>
                          {order.specialInstructions}
                        </div>
                      )}

                      {/* Bottom Actions */}
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.75rem',
                          paddingTop: '0.75rem',
                          borderTop: '1px dashed #334155'
                        }}
                      >
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          Order Track URL: <code style={{ color: '#cbd5e1' }}>/track-order?phone={order.phone}</code>
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <a
                            href={`https://wa.me/91${order.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${order.customerName}, regarding your bulk catering enquiry #${order.id} with Sri Sai Lakshmi Mess...`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              backgroundColor: '#16a34a',
                              color: '#ffffff',
                              padding: '0.5rem 0.9rem',
                              borderRadius: '8px',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem'
                            }}
                          >
                            <MessageCircle size={15} />
                            <span>WhatsApp</span>
                          </a>

                          <a
                            href={`tel:${order.phone}`}
                            style={{
                              backgroundColor: '#2563eb',
                              color: '#ffffff',
                              padding: '0.5rem 0.9rem',
                              borderRadius: '8px',
                              fontSize: '0.85rem',
                              fontWeight: '600',
                              textDecoration: 'none',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem'
                            }}
                          >
                            <Phone size={15} />
                            <span>Call</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Menu Quick View */}
        {activeTab === 'menu' && (
          <div>
            <div style={{ backgroundColor: '#1e293b', padding: '1.25rem', borderRadius: '12px', border: '1px solid #334155', marginBottom: '1.5rem' }}>
              <h3 style={{ color: '#ffffff', margin: 0 }}>Catering Menu Catalog</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                Dishes available for selection during bulk enquiry.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', backgroundColor: '#0f172a', color: '#ea580c', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: '700' }}>
                        {item.category}
                      </span>
                      <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#22c55e' }}>₹{item.price}</span>
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#ffffff' }}>{item.name}</div>
                    {item.tamilName && <div style={{ fontSize: '0.85rem', color: '#fb923c', margin: '0.1rem 0 0.4rem 0' }}>{item.tamilName}</div>}
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.4' }}>{item.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'delivery' && (
          <div>
            <div style={{ color: '#94a3b8', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Manage delivery partners, view their availability, and assign orders.
            </div>

            {/* Add New Partner Form */}
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '1.5rem', marginBottom: '2rem' }}>
              <h3 style={{ color: '#f1f5f9', marginBottom: '1rem', fontSize: '1rem', fontWeight: '700' }}>➕ Add New Delivery Partner</h3>
              {partnerError && <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#fca5a5', marginBottom: '1rem', fontSize: '0.85rem' }}>{partnerError}</div>}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                {[['name','Name *'],['email','Email *'],['phone','Phone'],['vehicleNumber','Vehicle No.'],['password','Password *']].map(([field, label]) => (
                  <div key={field}>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', marginBottom: '0.3rem' }}>{label}</label>
                    <input
                      value={newPartner[field]}
                      onChange={e => setNewPartner(p => ({...p, [field]: e.target.value}))}
                      style={{ width: '100%', background: '#0f172a', border: '1px solid #475569', borderRadius: '8px', padding: '0.55rem 0.75rem', color: '#f1f5f9', fontSize: '0.875rem', boxSizing: 'border-box' }}
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={async () => {
                  setPartnerLoading(true); setPartnerError('');
                  try {
                    await createDeliveryPartner(newPartner);
                    const list = await getDeliveryPartners();
                    setPartners(list);
                    setNewPartner({ name: '', email: '', phone: '', password: 'delivery123', vehicleNumber: '' });
                  } catch(e) { setPartnerError(e.message); }
                  finally { setPartnerLoading(false); }
                }}
                disabled={partnerLoading}
                style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', color: 'white', border: 'none', padding: '0.65rem 1.5rem', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', opacity: partnerLoading ? 0.7 : 1 }}
              >
                {partnerLoading ? 'Creating…' : 'Create Partner Account'}
              </button>
            </div>

            {/* Partners List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {partners.length === 0 ? (
                <div style={{ color: '#64748b', padding: '2rem', textAlign: 'center', gridColumn: '1/-1' }}>No delivery partners yet. Add one above.</div>
              ) : partners.map(p => (
                <div key={p.id} style={{ background: '#1e293b', border: `1px solid ${p.isAvailable ? '#22c55e44' : '#334155'}`, borderRadius: '14px', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ color: '#f1f5f9', fontWeight: '800' }}>🛵 {p.name}</div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{p.email}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{p.phone} · {p.vehicleNumber || 'No vehicle'}</div>
                    </div>
                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', background: p.isAvailable ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: p.isAvailable ? '#22c55e' : '#ef4444' }}>
                      {p.isAvailable ? '🟢 Online' : '🔴 Offline'}
                    </span>
                  </div>
                  <div style={{ marginTop: '0.75rem', fontSize: '0.82rem', color: '#94a3b8' }}>{p.totalDeliveries || 0} total deliveries</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
