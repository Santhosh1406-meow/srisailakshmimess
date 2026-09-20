import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getAllOrdersAdmin, updateOrderStatusAdmin, getAdminStats, fetchMenu,
  getDeliveryPartners, assignDeliveryPartnerAdmin, createDeliveryPartner,
  createMenuItemAdmin, updateMenuItemAdmin, deleteMenuItemAdmin,
  fetchAllOffersAdmin, createOfferAdmin, updateOfferAdmin, deleteOfferAdmin,
  updateDeliveryPartner, deleteDeliveryPartner, getAllCustomers
} from '../services/api';
import {
  ShieldCheck, Package, Clock, CheckCircle2, AlertCircle, Search, Phone,
  MessageCircle, UtensilsCrossed, TrendingUp, RefreshCw, Calendar, Filter,
  Key, Layers, XCircle, ArrowRight, Plus, Pencil, Trash2, Tag, Users,
  Truck, Star, Eye, EyeOff, ChevronDown, Save, X, BrainCircuit, BarChart3
} from 'lucide-react';
import ProfitLossAnalytics from '../components/analytics/ProfitLossAnalytics';

// ─── Reusable Modal Component ──────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)',
        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem', overflowY: 'auto'
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '18px',
          padding: '2rem', width: '100%', maxWidth: '560px', maxHeight: '90vh',
          overflowY: 'auto', position: 'relative'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ color: '#ffffff', margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>{title}</h3>
          <button
            onClick={onClose}
            style={{ background: 'rgba(239,68,68,0.15)', border: 'none', color: '#fca5a5', borderRadius: '8px', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Input Field Helper ────────────────────────────────────────────────────────
function FormField({ label, children }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const INPUT_STYLE = {
  width: '100%', backgroundColor: '#0f172a', border: '1px solid #475569',
  borderRadius: '8px', padding: '0.65rem 0.9rem', color: '#ffffff',
  fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box'
};

const SELECT_STYLE = { ...INPUT_STYLE, cursor: 'pointer' };

// ─── Main Admin Component ──────────────────────────────────────────────────────
export default function Admin() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  // Core state
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [offers, setOffers] = useState([]);
  const [partners, setPartners] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Tab
  const [activeTab, setActiveTab] = useState('enquiries');

  // Order filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Delivery partner UI state
  const [newPartner, setNewPartner] = useState({ name: '', email: '', phone: '', password: 'delivery123', vehicleNumber: '' });
  const [partnerLoading, setPartnerLoading] = useState(false);
  const [partnerError, setPartnerError] = useState('');
  const [assigningId, setAssigningId] = useState(null);
  const [editingPartner, setEditingPartner] = useState(null);
  const [editPartnerData, setEditPartnerData] = useState({});

  // Menu CRUD state
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [menuForm, setMenuForm] = useState({
    name: '', tamilName: '', description: '', category: 'Breakfast',
    price: '', image: '', isVegetarian: true, isAvailable: true,
    isPopular: false, rating: '4.5', portion: 'Standard'
  });
  const [menuSaving, setMenuSaving] = useState(false);
  const [menuError, setMenuError] = useState('');

  // Offer CRUD state
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [offerForm, setOfferForm] = useState({
    title: '', description: '', code: '', discountType: 'percent',
    discountValue: '', minOrderAmount: '0', validFrom: '', validTo: '',
    isActive: true, imageUrl: ''
  });
  const [offerSaving, setOfferSaving] = useState(false);
  const [offerError, setOfferError] = useState('');

  // Admin Login
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const isAdmin = user && user.role === 'admin';

  // ── Load Admin Data ──────────────────────────────────────────────────────────
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
      setError(err.message || 'Failed to load admin data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadOffers = async () => {
    try {
      const data = await fetchAllOffersAdmin();
      setOffers(data);
    } catch (e) {
      console.warn('Offers load failed:', e.message);
    }
  };

  const loadPartners = async () => {
    try {
      const list = await getDeliveryPartners();
      setPartners(list || []);
    } catch (e) {
      console.warn('Partners load failed:', e.message);
    }
  };

  const loadCustomers = async () => {
    try {
      const list = await getAllCustomers();
      setCustomers(list || []);
    } catch (e) {
      console.warn('Customers load failed:', e.message);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
      loadOffers();
      loadPartners();
      loadCustomers();
      const timer = setInterval(loadAdminData, 20000);
      return () => clearInterval(timer);
    } else {
      setLoading(false);
    }
  }, [user]);

  // ── Admin Login ──────────────────────────────────────────────────────────────
  const handleAdminLogin = async (e) => {
    if (e) e.preventDefault();
    if (!adminEmail.trim() || !adminPassword) {
      setLoginError('Please enter your administrator email and password.');
      return;
    }
    try {
      setLoginLoading(true);
      setLoginError('');
      await login(adminEmail.trim(), adminPassword);
    } catch (err) {
      setLoginError(err.message || 'Admin login failed. Please verify your credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  // ── Status Update ────────────────────────────────────────────────────────────
  const handleStatusChange = async (orderId, newStatus, fallbackOrder = null) => {
    const targetOrder = fallbackOrder || orders.find((o) => o.id === orderId);
    const prevStatus = targetOrder?.status;
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus, updatedAt: new Date().toISOString() } : o)));
    try {
      setUpdatingId(orderId);
      await updateOrderStatusAdmin(orderId, newStatus, targetOrder);
      try { const ns = await getAdminStats(); if (ns) setStats(ns); } catch (_) {}
    } catch (err) {
      if (prevStatus) setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: prevStatus } : o)));
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Status Badge ─────────────────────────────────────────────────────────────
  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('delivered') || s.includes('completed'))
      return { bg: '#d1fae5', text: '#065f46', icon: <CheckCircle2 size={14} />, label: 'Delivered' };
    if (s.includes('out for delivery'))
      return { bg: '#e0e7ff', text: '#3730a3', icon: <Package size={14} />, label: 'Out for Delivery' };
    if (s.includes('ready'))
      return { bg: '#fae8ff', text: '#86198f', icon: <Package size={14} />, label: 'Food Ready' };
    if (s.includes('confirmed'))
      return { bg: '#dcfce7', text: '#166534', icon: <CheckCircle2 size={14} />, label: 'Confirmed' };
    if (s.includes('processing'))
      return { bg: '#e0f2fe', text: '#075985', icon: <RefreshCw size={14} className="spin-slow" />, label: 'Processing' };
    if (s.includes('cancel'))
      return { bg: '#fee2e2', text: '#991b1b', icon: <XCircle size={14} />, label: 'Cancelled' };
    return { bg: '#fef3c7', text: '#92400e', icon: <Clock size={14} />, label: status || 'Order Received' };
  };

  // ── Filtered Orders ───────────────────────────────────────────────────────────
  const filteredOrders = orders.filter((order) => {
    const s = (order.status || '').toLowerCase();
    const sel = selectedStatus.toLowerCase();
    let matchesStatus = selectedStatus === 'All' ? true :
      sel === 'delivered' ? (s === 'delivered' || s === 'completed') :
      (sel === 'order received' || sel === 'enquiry received') ? (s === 'order received' || s === 'enquiry received' || s === 'pending') :
      s === sel;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query ||
      (order.id || '').toLowerCase().includes(query) ||
      (order.customerName || '').toLowerCase().includes(query) ||
      (order.phone || '').includes(query) ||
      (order.foodItem || '').toLowerCase().includes(query) ||
      (order.email || '').toLowerCase().includes(query) ||
      (Array.isArray(order.items) && order.items.some((it) => (it.name || '').toLowerCase().includes(query)));
    return matchesStatus && matchesSearch;
  });

  // ── Menu Modal Helpers ────────────────────────────────────────────────────────
  const openAddMenuItem = () => {
    setEditingMenuItem(null);
    setMenuForm({ name: '', tamilName: '', description: '', category: 'Breakfast', price: '', image: '', isVegetarian: true, isAvailable: true, isPopular: false, rating: '4.5', portion: 'Standard' });
    setMenuError('');
    setShowMenuModal(true);
  };

  const openEditMenuItem = (item) => {
    setEditingMenuItem(item);
    setMenuForm({
      name: item.name || '', tamilName: item.tamilName || '', description: item.description || '',
      category: item.category || 'Breakfast', price: String(item.price || ''), image: item.image || '',
      isVegetarian: item.isVegetarian !== false, isAvailable: item.isAvailable !== false,
      isPopular: Boolean(item.isPopular), rating: String(item.rating || '4.5'), portion: item.portion || 'Standard'
    });
    setMenuError('');
    setShowMenuModal(true);
  };

  const handleSaveMenuItem = async () => {
    if (!menuForm.name.trim()) { setMenuError('Dish name is required.'); return; }
    if (!menuForm.price || isNaN(Number(menuForm.price))) { setMenuError('Valid price is required.'); return; }
    try {
      setMenuSaving(true);
      setMenuError('');
      const payload = { ...menuForm, price: Number(menuForm.price), rating: Number(menuForm.rating) };
      if (editingMenuItem) {
        const updated = await updateMenuItemAdmin(editingMenuItem.id, payload);
        setMenuItems((prev) => prev.map((m) => (m.id === editingMenuItem.id ? updated : m)));
      } else {
        const created = await createMenuItemAdmin(payload);
        setMenuItems((prev) => [...prev, created]);
      }
      setShowMenuModal(false);
    } catch (e) {
      setMenuError(e.message || 'Failed to save menu item.');
    } finally {
      setMenuSaving(false);
    }
  };

  const handleDeleteMenuItem = async (id, name) => {
    if (!window.confirm(`Delete "${name}" from the menu? This cannot be undone.`)) return;
    try {
      await deleteMenuItemAdmin(id);
      setMenuItems((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      alert('Failed to delete: ' + e.message);
    }
  };

  // ── Offer Modal Helpers ───────────────────────────────────────────────────────
  const openAddOffer = () => {
    setEditingOffer(null);
    setOfferForm({ title: '', description: '', code: '', discountType: 'percent', discountValue: '', minOrderAmount: '0', validFrom: '', validTo: '', isActive: true, imageUrl: '' });
    setOfferError('');
    setShowOfferModal(true);
  };

  const openEditOffer = (offer) => {
    setEditingOffer(offer);
    setOfferForm({
      title: offer.title || '', description: offer.description || '', code: offer.code || '',
      discountType: offer.discountType || 'percent', discountValue: String(offer.discountValue || ''),
      minOrderAmount: String(offer.minOrderAmount || '0'),
      validFrom: offer.validFrom ? offer.validFrom.split('T')[0] : '',
      validTo: offer.validTo ? offer.validTo.split('T')[0] : '',
      isActive: offer.isActive !== false, imageUrl: offer.imageUrl || ''
    });
    setOfferError('');
    setShowOfferModal(true);
  };

  const handleSaveOffer = async () => {
    if (!offerForm.title.trim()) { setOfferError('Offer title is required.'); return; }
    if (!offerForm.discountValue || isNaN(Number(offerForm.discountValue))) { setOfferError('Valid discount value is required.'); return; }
    try {
      setOfferSaving(true);
      setOfferError('');
      const payload = {
        ...offerForm,
        discountValue: Number(offerForm.discountValue),
        minOrderAmount: Number(offerForm.minOrderAmount) || 0,
        validFrom: offerForm.validFrom || null,
        validTo: offerForm.validTo || null,
        code: offerForm.code.toUpperCase().trim()
      };
      if (editingOffer) {
        const updated = await updateOfferAdmin(editingOffer.id, payload);
        setOffers((prev) => prev.map((o) => (o.id === editingOffer.id ? updated : o)));
      } else {
        const created = await createOfferAdmin(payload);
        setOffers((prev) => [created, ...prev]);
      }
      setShowOfferModal(false);
    } catch (e) {
      setOfferError(e.message || 'Failed to save offer.');
    } finally {
      setOfferSaving(false);
    }
  };

  const handleDeleteOffer = async (id, title) => {
    if (!window.confirm(`Delete offer "${title}"?`)) return;
    try {
      await deleteOfferAdmin(id);
      setOffers((prev) => prev.filter((o) => o.id !== id));
    } catch (e) {
      alert('Failed to delete offer: ' + e.message);
    }
  };

  const handleToggleOfferActive = async (offer) => {
    try {
      const updated = await updateOfferAdmin(offer.id, { ...offer, isActive: !offer.isActive });
      setOffers((prev) => prev.map((o) => (o.id === offer.id ? updated : o)));
    } catch (e) {
      alert('Failed to toggle offer: ' + e.message);
    }
  };

  // ── Partner Edit/Delete ───────────────────────────────────────────────────────
  const openEditPartner = (p) => {
    setEditingPartner(p);
    setEditPartnerData({ name: p.name, phone: p.phone, vehicleNumber: p.vehicleNumber || '', isAvailable: p.isAvailable });
  };

  const handleSavePartner = async () => {
    try {
      setPartnerLoading(true);
      const updated = await updateDeliveryPartner(editingPartner.id, editPartnerData);
      setPartners((prev) => prev.map((p) => (p.id === editingPartner.id ? updated : p)));
      setEditingPartner(null);
    } catch (e) {
      setPartnerError(e.message || 'Failed to update partner.');
    } finally {
      setPartnerLoading(false);
    }
  };

  const handleDeletePartner = async (id, name) => {
    if (!window.confirm(`Remove delivery partner "${name}"? They will no longer have access.`)) return;
    try {
      await deleteDeliveryPartner(id);
      setPartners((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert('Failed to remove partner: ' + e.message);
    }
  };

  const handleTogglePartnerAvailability = async (p) => {
    try {
      const updated = await updateDeliveryPartner(p.id, { isAvailable: !p.isAvailable });
      setPartners((prev) => prev.map((x) => (x.id === p.id ? updated : x)));
    } catch (e) {
      alert('Failed to update availability: ' + e.message);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // NON-ADMIN VIEW
  // ────────────────────────────────────────────────────────────────────────────
  if (!user || user.role !== 'admin') {
    return (
      <div style={{ minHeight: '80vh', backgroundColor: '#0f172a', color: '#f8fafc', padding: '4rem 1rem' }}>
        <div style={{ maxWidth: '440px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ width: '70px', height: '70px', borderRadius: '50%', backgroundColor: 'rgba(234,88,12,0.15)', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            <ShieldCheck size={36} />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.75rem', color: '#ffffff' }}>Admin Portal Sign In</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            Enter your restaurant administrator credentials to manage orders, menu, offers, and delivery partners.
          </p>

          <form onSubmit={handleAdminLogin} style={{ background: 'linear-gradient(135deg,rgba(30,41,59,0.95),rgba(15,23,42,0.95))', border: '1px solid rgba(249,115,22,0.3)', borderRadius: '16px', padding: '1.75rem', marginBottom: '2rem', textAlign: 'left' }}>
            <FormField label="Admin Email Address">
              <input type="email" required value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="admin@srisailakshmimess.com" style={INPUT_STYLE} />
            </FormField>
            <div style={{ marginBottom: '1.5rem' }}>
              <FormField label="Password">
                <input type="password" required value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="••••••••" style={INPUT_STYLE} />
              </FormField>
            </div>
            {loginError && <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#fca5a5', borderRadius: '8px', fontSize: '0.875rem', marginBottom: '1rem' }}>{loginError}</div>}
            <button type="submit" disabled={loginLoading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', fontWeight: '700', padding: '0.85rem' }}>
              {loginLoading ? <RefreshCw size={18} className="spin-slow" /> : <ShieldCheck size={18} />}
              <span>{loginLoading ? 'Authenticating...' : 'Sign In as Admin'}</span>
            </button>
          </form>

          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Not an administrator?{' '}
            <button onClick={() => logout()} style={{ background: 'none', border: 'none', color: '#ea580c', cursor: 'pointer', textDecoration: 'underline' }}>Return to Website</button>
          </p>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // ADMIN PORTAL
  // ────────────────────────────────────────────────────────────────────────────
  const CARD = { backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' };
  const BTN_DANGER = { background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)', padding: '0.4rem 0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' };
  const BTN_PRIMARY = { background: 'linear-gradient(135deg,#ea580c,#dc2626)', color: '#fff', border: 'none', padding: '0.4rem 0.85rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' };
  const BTN_BLUE = { background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', color: '#fff', border: 'none', padding: '0.4rem 0.85rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' };

  return (
    <div style={{ backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', padding: '2rem 1rem 4rem 1rem' }}>
      <div style={{ maxWidth: '1380px', margin: '0 auto' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', paddingBottom: '1.5rem', borderBottom: '1px solid #334155', marginBottom: '2rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ea580c', fontWeight: '700', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <ShieldCheck size={18} />
              <span>Sri Sai Lakshmi Mess • Admin Portal</span>
            </div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: '800', color: '#ffffff', margin: '0.25rem 0' }}>Management Dashboard</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>
              Logged in as <strong style={{ color: '#fb923c' }}>{user.name}</strong> ({user.email})
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={loadAdminData} disabled={refreshing} style={{ backgroundColor: '#1e293b', color: '#cbd5e1', border: '1px solid #475569', padding: '0.65rem 1.2rem', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
              <RefreshCw size={16} className={refreshing ? 'spin-slow' : ''} />
              <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>
            <button onClick={() => logout()} style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)', padding: '0.65rem 1.2rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>
              Sign Out
            </button>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
          {[
            { label: 'Total Orders', value: stats ? stats.totalOrders : orders.length, icon: <Package size={20} style={{ color: '#ea580c' }} />, color: '#ffffff', sub: 'All bookings' },
            { label: 'Pending Action', value: stats ? stats.pendingEnquiries : orders.filter(o => o.status === 'Order Received').length, icon: <Clock size={20} style={{ color: '#f59e0b' }} />, color: '#f59e0b', sub: 'Awaiting response' },
            { label: 'Confirmed Orders', value: stats ? stats.confirmedOrders : orders.filter(o => ['Confirmed','Delivered','Completed'].includes(o.status)).length, icon: <CheckCircle2 size={20} style={{ color: '#22c55e' }} />, color: '#22c55e', sub: 'Confirmed & delivered' },
            { label: 'Menu Items', value: menuItems.length, icon: <UtensilsCrossed size={20} style={{ color: '#38bdf8' }} />, color: '#38bdf8', sub: 'Active dishes' },
            { label: 'Active Offers', value: offers.filter(o => o.isActive).length, icon: <Tag size={20} style={{ color: '#a78bfa' }} />, color: '#a78bfa', sub: 'Live promotions' },
            { label: 'Delivery Partners', value: partners.length, icon: <Truck size={20} style={{ color: '#34d399' }} />, color: '#34d399', sub: `${partners.filter(p=>p.isAvailable).length} online` },
            { label: 'Customers', value: customers.length, icon: <Users size={20} style={{ color: '#fb923c' }} />, color: '#fb923c', sub: 'Registered users' }
          ].map((stat, i) => (
            <div key={i} style={CARD}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                <span>{stat.label}</span>{stat.icon}
              </div>
              <div style={{ fontSize: '1.9rem', fontWeight: '800', color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Tab Navigation ── */}
        <div style={{ display: 'flex', gap: '0.25rem', borderBottom: '1px solid #334155', marginBottom: '1.75rem', overflowX: 'auto' }}>
          {[
            { id: 'enquiries', label: `Orders & Bookings (${orders.length})`, icon: <Layers size={16} />, color: '#ea580c' },
            { id: 'analytics', label: 'Profit & Loss Analytics (AI)', icon: <BrainCircuit size={16} />, color: '#06b6d4' },
            { id: 'menu', label: `Menu (${menuItems.length})`, icon: <UtensilsCrossed size={16} />, color: '#ea580c' },
            { id: 'offers', label: `Offers (${offers.length})`, icon: <Tag size={16} />, color: '#a78bfa' },
            { id: 'delivery', label: `Delivery Partners (${partners.length})`, icon: <Truck size={16} />, color: '#3b82f6' },
            { id: 'customers', label: `Customers (${customers.length})`, icon: <Users size={16} />, color: '#fb923c' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.85rem 1.25rem', backgroundColor: 'transparent', border: 'none',
                borderBottom: activeTab === tab.id ? `3px solid ${tab.color}` : '3px solid transparent',
                color: activeTab === tab.id ? tab.color : '#94a3b8',
                fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center',
                gap: '0.5rem', fontSize: '0.9rem', whiteSpace: 'nowrap', transition: 'all 0.2s ease'
              }}
            >
              {tab.icon}<span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════════════
            TAB 1: ORDERS & BOOKINGS
        ════════════════════════════════════════════════ */}
        {activeTab === 'enquiries' && (
          <div>
            {/* Search & Filter Bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', ...CARD }}>
              <div style={{ position: 'relative', flex: '1', minWidth: '260px' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input type="text" placeholder="Search by name, phone, email, dish, or Order ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ ...INPUT_STYLE, paddingLeft: '2.4rem' }} />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                <Filter size={16} style={{ color: '#64748b' }} />
                {['All', 'Order Received', 'Processing', 'Confirmed', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled'].map((st) => (
                  <button key={st} onClick={() => setSelectedStatus(st)}
                    style={{ padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '600', border: 'none', cursor: 'pointer', backgroundColor: selectedStatus === st ? '#ea580c' : '#0f172a', color: selectedStatus === st ? '#ffffff' : '#94a3b8', transition: 'all 0.2s' }}>
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {error && <div style={{ padding: '1rem', backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#fca5a5', borderRadius: '10px', marginBottom: '1.5rem' }}>{error}</div>}

            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem 0', color: '#94a3b8' }}>
                <RefreshCw size={32} className="spin-slow" style={{ marginBottom: '1rem', color: '#ea580c' }} />
                <div>Loading orders...</div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div style={{ ...CARD, textAlign: 'center', padding: '3rem' }}>
                <Package size={48} style={{ color: '#475569', marginBottom: '1rem' }} />
                <h3 style={{ color: '#ffffff', marginBottom: '0.5rem' }}>No Orders Found</h3>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{searchQuery || selectedStatus !== 'All' ? 'Try clearing search or filters.' : 'No orders have been submitted yet.'}</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1.25rem' }}>
                {filteredOrders.map((order) => {
                  const badge = getStatusBadge(order.status);
                  const isUpdating = updatingId === order.id;
                  return (
                    <div key={order.id} style={{ ...CARD, transition: 'all 0.2s' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #334155', marginBottom: '1rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '1rem', fontWeight: '800', color: '#fb923c', fontFamily: 'monospace' }}>#{order.id}</span>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: badge.bg, color: badge.text, padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '700' }}>
                              {badge.icon}<span>{order.status}</span>
                            </span>
                            <span style={{ fontSize: '0.75rem', backgroundColor: order.paymentStatus === 'Paid' ? '#dcfce7' : '#fef3c7', color: order.paymentStatus === 'Paid' ? '#166534' : '#92400e', padding: '0.2rem 0.55rem', borderRadius: '4px', fontWeight: '600' }}>
                              {order.paymentStatus}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.3rem' }}>
                            Submitted: {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: '600' }}>Status:</span>
                          <select value={order.status === 'Completed' ? 'Delivered' : (order.status === 'Enquiry Received' || order.status === 'Pending' ? 'Order Received' : order.status)}
                            disabled={isUpdating} onChange={(e) => handleStatusChange(order.id, e.target.value, order)}
                            style={{ ...SELECT_STYLE, padding: '0.45rem 0.75rem', fontSize: '0.82rem', minWidth: '150px' }}>
                            <option value="Order Received">Order Received</option>
                            <option value="Processing">Processing</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Ready">Food Ready</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          {order.status !== 'Processing' && order.status !== 'Delivered' && order.status !== 'Completed' && (
                            <button type="button" onClick={() => handleStatusChange(order.id, 'Processing', order)} disabled={isUpdating}
                              style={{ background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.4rem 0.65rem', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                              <RefreshCw size={11} /><span>Processing</span>
                            </button>
                          )}
                          {order.status !== 'Delivered' && order.status !== 'Completed' && (
                            <button type="button" onClick={() => handleStatusChange(order.id, 'Delivered', order)} disabled={isUpdating}
                              style={{ background: '#059669', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.4rem 0.65rem', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                              <CheckCircle2 size={11} /><span>Delivered</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
                            Customer {order.orderType ? `• ${order.orderType.toUpperCase()}` : ''}
                          </div>
                          <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#ffffff' }}>{order.customerName}</div>
                          <div style={{ fontSize: '0.88rem', color: '#cbd5e1', marginTop: '0.15rem' }}>📞 {order.phone}</div>
                          {order.email && <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '0.1rem' }}>✉️ {order.email}</div>}
                          {order.deliveryAddress && <div style={{ fontSize: '0.82rem', color: '#f59e0b', marginTop: '0.3rem', lineHeight: '1.4' }}>📍 {order.deliveryAddress}</div>}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>Order Details</div>
                          <div style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff' }}>{order.foodItem || 'Menu Order'}</div>
                          <div style={{ fontSize: '0.88rem', color: '#ea580c', fontWeight: '700', marginTop: '0.2rem' }}>Qty: {order.quantity || 1}</div>
                          {order.amount > 0 && <div style={{ fontSize: '1rem', fontWeight: '800', color: '#22c55e', marginTop: '0.3rem' }}>₹{order.amount}</div>}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>Schedule</div>
                          <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Calendar size={14} style={{ color: '#ea580c' }} /><span>{order.preferredDate || 'Immediate'}</span>
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#cbd5e1', marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Clock size={13} style={{ color: '#94a3b8' }} /><span>{order.preferredTime || 'Immediate'}</span>
                          </div>
                          <span style={{ fontSize: '0.72rem', backgroundColor: '#334155', color: '#f1f5f9', padding: '0.15rem 0.5rem', borderRadius: '4px', marginTop: '0.35rem', display: 'inline-block', textTransform: 'capitalize' }}>
                            {order.orderType || 'delivery'}
                          </span>
                        </div>
                        {Array.isArray(order.items) && order.items.length > 0 && (
                          <div style={{ gridColumn: '1 / -1', backgroundColor: '#0f172a', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #334155' }}>
                            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Items Breakdown:</div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {order.items.map((it, idx) => (
                                <span key={idx} style={{ backgroundColor: '#1e293b', border: '1px solid #475569', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.82rem', color: '#f8fafc' }}>
                                  <strong>{it.name}</strong> × {it.quantity} {it.price ? `(₹${it.price * it.quantity})` : ''}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {order.specialInstructions && (
                        <div style={{ backgroundColor: '#0f172a', borderLeft: '4px solid #ea580c', padding: '0.65rem 1rem', borderRadius: '0 8px 8px 0', marginBottom: '0.75rem', fontSize: '0.85rem', color: '#e2e8f0' }}>
                          <strong style={{ color: '#fb923c' }}>Instructions: </strong>{order.specialInstructions}
                        </div>
                      )}

                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed #334155' }}>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Track: <code style={{ color: '#cbd5e1' }}>/track-order?phone={order.phone}</code></div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <a href={`https://wa.me/91${order.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${order.customerName}, regarding your order #${order.id} with Sri Sai Lakshmi Mess...`)}`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ backgroundColor: '#16a34a', color: '#ffffff', padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                            <MessageCircle size={14} /><span>WhatsApp</span>
                          </a>
                          <a href={`tel:${order.phone}`}
                            style={{ backgroundColor: '#2563eb', color: '#ffffff', padding: '0.45rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Phone size={14} /><span>Call</span>
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

        {/* ════════════════════════════════════════════════
            TAB: PROFIT & LOSS ANALYTICS (AI)
        ════════════════════════════════════════════════ */}
        {activeTab === 'analytics' && (
          <ProfitLossAnalytics />
        )}

        {/* ════════════════════════════════════════════════
            TAB 2: MENU MANAGEMENT
        ════════════════════════════════════════════════ */}
        {activeTab === 'menu' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ color: '#ffffff', margin: 0, fontSize: '1.4rem', fontWeight: '800' }}>Menu Management</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '0.25rem 0 0 0' }}>{menuItems.length} dishes — add, edit, or remove items</p>
              </div>
              <button onClick={openAddMenuItem} style={{ ...BTN_PRIMARY, padding: '0.7rem 1.25rem', fontSize: '0.9rem' }}>
                <Plus size={17} /><span>Add New Dish</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.1rem' }}>
              {menuItems.map((item) => (
                <div key={item.id} style={{ ...CARD, display: 'flex', flexDirection: 'column', gap: '0.75rem', opacity: item.isAvailable ? 1 : 0.6 }}>
                  {item.image && (
                    <div style={{ borderRadius: '10px', overflow: 'hidden', height: '160px' }}>
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontSize: '0.72rem', backgroundColor: '#0f172a', color: '#ea580c', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '700' }}>{item.category}</span>
                      {item.isPopular && <span style={{ fontSize: '0.72rem', backgroundColor: '#fef3c7', color: '#92400e', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '700', marginLeft: '0.4rem' }}>⭐ Popular</span>}
                    </div>
                    <span style={{ fontSize: '1.15rem', fontWeight: '800', color: '#22c55e' }}>₹{item.price}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#ffffff' }}>{item.name}</div>
                    {item.tamilName && <div style={{ fontSize: '0.82rem', color: '#fb923c' }}>{item.tamilName}</div>}
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.4', marginTop: '0.3rem' }}>{item.description}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <span style={{ fontSize: '0.72rem', backgroundColor: item.isVegetarian ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: item.isVegetarian ? '#22c55e' : '#f87171', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '700' }}>
                        {item.isVegetarian ? '🟢 Veg' : '🔴 Non-Veg'}
                      </span>
                      <span style={{ fontSize: '0.72rem', backgroundColor: item.isAvailable ? 'rgba(34,197,94,0.1)' : 'rgba(100,116,139,0.15)', color: item.isAvailable ? '#22c55e' : '#64748b', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '700' }}>
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <button onClick={() => openEditMenuItem(item)} style={BTN_BLUE}><Pencil size={13} /></button>
                      <button onClick={() => handleDeleteMenuItem(item.id, item.name)} style={BTN_DANGER}><Trash2 size={13} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Menu Item Modal */}
            {showMenuModal && (
              <Modal title={editingMenuItem ? 'Edit Menu Item' : 'Add New Dish'} onClose={() => setShowMenuModal(false)}>
                {menuError && <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#fca5a5', marginBottom: '1rem', fontSize: '0.85rem' }}>{menuError}</div>}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <FormField label="Dish Name *">
                      <input value={menuForm.name} onChange={e => setMenuForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Special Masala Dosa" style={INPUT_STYLE} />
                    </FormField>
                  </div>
                  <FormField label="Tamil Name">
                    <input value={menuForm.tamilName} onChange={e => setMenuForm(f => ({ ...f, tamilName: e.target.value }))} placeholder="தமிழ் பெயர்" style={INPUT_STYLE} />
                  </FormField>
                  <FormField label="Category *">
                    <select value={menuForm.category} onChange={e => setMenuForm(f => ({ ...f, category: e.target.value }))} style={SELECT_STYLE}>
                      {['Breakfast', 'Meals', 'Beverages', 'Snacks', 'Desserts', 'Specials'].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </FormField>
                  <FormField label="Price (₹) *">
                    <input type="number" value={menuForm.price} onChange={e => setMenuForm(f => ({ ...f, price: e.target.value }))} placeholder="e.g. 50" style={INPUT_STYLE} min="0" />
                  </FormField>
                  <FormField label="Rating">
                    <input type="number" value={menuForm.rating} onChange={e => setMenuForm(f => ({ ...f, rating: e.target.value }))} placeholder="e.g. 4.8" style={INPUT_STYLE} min="1" max="5" step="0.1" />
                  </FormField>
                  <FormField label="Portion / Serving">
                    <input value={menuForm.portion} onChange={e => setMenuForm(f => ({ ...f, portion: e.target.value }))} placeholder="e.g. 2 Pcs" style={INPUT_STYLE} />
                  </FormField>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <FormField label="Description">
                      <textarea value={menuForm.description} onChange={e => setMenuForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the dish..." rows={3}
                        style={{ ...INPUT_STYLE, resize: 'vertical', fontFamily: 'inherit' }} />
                    </FormField>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <FormField label="Image URL">
                      <input value={menuForm.image} onChange={e => setMenuForm(f => ({ ...f, image: e.target.value }))} placeholder="https://..." style={INPUT_STYLE} />
                    </FormField>
                  </div>
                  <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    {[
                      { key: 'isVegetarian', label: '🟢 Vegetarian' },
                      { key: 'isAvailable', label: '✅ Available' },
                      { key: 'isPopular', label: '⭐ Popular' }
                    ].map(({ key, label }) => (
                      <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '600' }}>
                        <input type="checkbox" checked={menuForm[key]} onChange={e => setMenuForm(f => ({ ...f, [key]: e.target.checked }))} style={{ width: '16px', height: '16px', accentColor: '#ea580c' }} />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button onClick={() => setShowMenuModal(false)} style={{ background: '#334155', color: '#cbd5e1', border: 'none', padding: '0.7rem 1.2rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                  <button onClick={handleSaveMenuItem} disabled={menuSaving}
                    style={{ background: 'linear-gradient(135deg,#ea580c,#dc2626)', color: '#fff', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: menuSaving ? 0.7 : 1 }}>
                    {menuSaving ? <RefreshCw size={16} className="spin-slow" /> : <Save size={16} />}
                    <span>{menuSaving ? 'Saving...' : (editingMenuItem ? 'Update Dish' : 'Add Dish')}</span>
                  </button>
                </div>
              </Modal>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════
            TAB 3: OFFERS MANAGEMENT
        ════════════════════════════════════════════════ */}
        {activeTab === 'offers' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ color: '#ffffff', margin: 0, fontSize: '1.4rem', fontWeight: '800' }}>Offers & Promotions</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '0.25rem 0 0 0' }}>
                  {offers.filter(o => o.isActive).length} active • {offers.length} total
                </p>
              </div>
              <button onClick={openAddOffer} style={{ ...BTN_PRIMARY, padding: '0.7rem 1.25rem', fontSize: '0.9rem', background: 'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
                <Plus size={17} /><span>Create Offer</span>
              </button>
            </div>

            {offers.length === 0 ? (
              <div style={{ ...CARD, textAlign: 'center', padding: '3rem' }}>
                <Tag size={48} style={{ color: '#475569', marginBottom: '1rem' }} />
                <h3 style={{ color: '#ffffff' }}>No Offers Yet</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Create your first promotional offer to attract more customers.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.1rem' }}>
                {offers.map((offer) => (
                  <div key={offer.id} style={{ ...CARD, borderColor: offer.isActive ? 'rgba(167,139,250,0.35)' : '#334155', opacity: offer.isActive ? 1 : 0.65 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff' }}>{offer.title}</div>
                        {offer.code && (
                          <div style={{ marginTop: '0.3rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#0f172a', border: '1px dashed #a78bfa', borderRadius: '8px', padding: '0.3rem 0.75rem' }}>
                            <Tag size={14} style={{ color: '#a78bfa' }} />
                            <code style={{ color: '#a78bfa', fontWeight: '800', fontSize: '0.95rem', letterSpacing: '0.05em' }}>{offer.code}</code>
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '800', color: offer.discountType === 'percent' ? '#34d399' : '#fb923c' }}>
                          {offer.discountType === 'percent' ? `${offer.discountValue}%` : `₹${offer.discountValue}`}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '600' }}>
                          {offer.discountType === 'percent' ? 'PERCENT OFF' : 'FLAT OFF'}
                        </div>
                      </div>
                    </div>

                    {offer.description && <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5', margin: '0 0 0.75rem 0' }}>{offer.description}</p>}

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.9rem' }}>
                      {offer.minOrderAmount > 0 && (
                        <span style={{ fontSize: '0.72rem', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#94a3b8', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                          Min. ₹{offer.minOrderAmount}
                        </span>
                      )}
                      {offer.validFrom && <span style={{ fontSize: '0.72rem', color: '#64748b', backgroundColor: '#0f172a', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>From {new Date(offer.validFrom).toLocaleDateString('en-IN')}</span>}
                      {offer.validTo && <span style={{ fontSize: '0.72rem', color: '#64748b', backgroundColor: '#0f172a', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>Until {new Date(offer.validTo).toLocaleDateString('en-IN')}</span>}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid #334155' }}>
                      <button onClick={() => handleToggleOfferActive(offer)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: offer.isActive ? 'rgba(34,197,94,0.15)' : 'rgba(100,116,139,0.15)', color: offer.isActive ? '#22c55e' : '#64748b', border: 'none', borderRadius: '8px', padding: '0.35rem 0.8rem', cursor: 'pointer', fontWeight: '700', fontSize: '0.8rem' }}>
                        {offer.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                        {offer.isActive ? 'Active' : 'Inactive'}
                      </button>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button onClick={() => openEditOffer(offer)} style={BTN_BLUE}><Pencil size={13} /></button>
                        <button onClick={() => handleDeleteOffer(offer.id, offer.title)} style={BTN_DANGER}><Trash2 size={13} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Offer Modal */}
            {showOfferModal && (
              <Modal title={editingOffer ? 'Edit Offer' : 'Create New Offer'} onClose={() => setShowOfferModal(false)}>
                {offerError && <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#fca5a5', marginBottom: '1rem', fontSize: '0.85rem' }}>{offerError}</div>}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <FormField label="Offer Title *">
                      <input value={offerForm.title} onChange={e => setOfferForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Weekend Special Deal" style={INPUT_STYLE} />
                    </FormField>
                  </div>
                  <FormField label="Coupon Code">
                    <input value={offerForm.code} onChange={e => setOfferForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. SAVE20" style={{ ...INPUT_STYLE, fontFamily: 'monospace', letterSpacing: '0.08em' }} />
                  </FormField>
                  <FormField label="Discount Type">
                    <select value={offerForm.discountType} onChange={e => setOfferForm(f => ({ ...f, discountType: e.target.value }))} style={SELECT_STYLE}>
                      <option value="percent">Percentage (%)</option>
                      <option value="flat">Flat Amount (₹)</option>
                    </select>
                  </FormField>
                  <FormField label={`Discount Value ${offerForm.discountType === 'percent' ? '(%)' : '(₹)'} *`}>
                    <input type="number" value={offerForm.discountValue} onChange={e => setOfferForm(f => ({ ...f, discountValue: e.target.value }))} placeholder={offerForm.discountType === 'percent' ? 'e.g. 15' : 'e.g. 30'} style={INPUT_STYLE} min="0" />
                  </FormField>
                  <FormField label="Min. Order Amount (₹)">
                    <input type="number" value={offerForm.minOrderAmount} onChange={e => setOfferForm(f => ({ ...f, minOrderAmount: e.target.value }))} placeholder="0" style={INPUT_STYLE} min="0" />
                  </FormField>
                  <FormField label="Valid From">
                    <input type="date" value={offerForm.validFrom} onChange={e => setOfferForm(f => ({ ...f, validFrom: e.target.value }))} style={INPUT_STYLE} />
                  </FormField>
                  <FormField label="Valid Until">
                    <input type="date" value={offerForm.validTo} onChange={e => setOfferForm(f => ({ ...f, validTo: e.target.value }))} style={INPUT_STYLE} />
                  </FormField>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <FormField label="Description">
                      <textarea value={offerForm.description} onChange={e => setOfferForm(f => ({ ...f, description: e.target.value }))} placeholder="Offer details for customers..." rows={2}
                        style={{ ...INPUT_STYLE, resize: 'vertical', fontFamily: 'inherit' }} />
                    </FormField>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <FormField label="Banner Image URL (optional)">
                      <input value={offerForm.imageUrl} onChange={e => setOfferForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." style={INPUT_STYLE} />
                    </FormField>
                  </div>
                  <div style={{ gridColumn: '1 / -1', marginBottom: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '600' }}>
                      <input type="checkbox" checked={offerForm.isActive} onChange={e => setOfferForm(f => ({ ...f, isActive: e.target.checked }))} style={{ width: '16px', height: '16px', accentColor: '#7c3aed' }} />
                      ✅ Active (visible to customers immediately)
                    </label>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button onClick={() => setShowOfferModal(false)} style={{ background: '#334155', color: '#cbd5e1', border: 'none', padding: '0.7rem 1.2rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                  <button onClick={handleSaveOffer} disabled={offerSaving}
                    style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', color: '#fff', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: offerSaving ? 0.7 : 1 }}>
                    {offerSaving ? <RefreshCw size={16} className="spin-slow" /> : <Save size={16} />}
                    <span>{offerSaving ? 'Saving...' : (editingOffer ? 'Update Offer' : 'Create Offer')}</span>
                  </button>
                </div>
              </Modal>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════
            TAB 4: DELIVERY PARTNERS
        ════════════════════════════════════════════════ */}
        {activeTab === 'delivery' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ color: '#ffffff', margin: 0, fontSize: '1.4rem', fontWeight: '800' }}>Delivery Partners</h2>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '0.25rem 0 0 0' }}>
                  {partners.length} partners • {partners.filter(p => p.isAvailable).length} online
                </p>
              </div>
            </div>

            {/* Add New Partner Form */}
            <div style={{ ...CARD, marginBottom: '2rem' }}>
              <h3 style={{ color: '#f1f5f9', marginBottom: '1rem', fontSize: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={18} style={{ color: '#3b82f6' }} /> Register New Delivery Partner
              </h3>
              {partnerError && !editingPartner && <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#fca5a5', marginBottom: '1rem', fontSize: '0.85rem' }}>{partnerError}</div>}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
                {[['name', 'Full Name *'], ['email', 'Email *'], ['phone', 'Phone'], ['vehicleNumber', 'Vehicle No.'], ['password', 'Password']].map(([field, label]) => (
                  <div key={field}>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.78rem', fontWeight: '700', marginBottom: '0.3rem' }}>{label}</label>
                    <input value={newPartner[field]} onChange={e => setNewPartner(p => ({ ...p, [field]: e.target.value }))}
                      style={{ ...INPUT_STYLE }} placeholder={field === 'password' ? 'delivery123' : ''} type={field === 'password' ? 'password' : 'text'} />
                  </div>
                ))}
              </div>
              <button
                onClick={async () => {
                  setPartnerLoading(true); setPartnerError('');
                  try {
                    await createDeliveryPartner(newPartner);
                    await loadPartners();
                    setNewPartner({ name: '', email: '', phone: '', password: 'delivery123', vehicleNumber: '' });
                  } catch (e) { setPartnerError(e.message); }
                  finally { setPartnerLoading(false); }
                }}
                disabled={partnerLoading}
                style={{ ...BTN_BLUE, padding: '0.7rem 1.4rem', fontSize: '0.9rem' }}>
                {partnerLoading ? <RefreshCw size={16} className="spin-slow" /> : <Plus size={16} />}
                <span>{partnerLoading ? 'Creating...' : 'Create Partner Account'}</span>
              </button>
            </div>

            {/* Partner Edit Modal */}
            {editingPartner && (
              <Modal title={`Edit Partner — ${editingPartner.name}`} onClose={() => setEditingPartner(null)}>
                {partnerError && <div style={{ padding: '0.75rem', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#fca5a5', marginBottom: '1rem', fontSize: '0.85rem' }}>{partnerError}</div>}
                <FormField label="Full Name">
                  <input value={editPartnerData.name || ''} onChange={e => setEditPartnerData(d => ({ ...d, name: e.target.value }))} style={INPUT_STYLE} />
                </FormField>
                <FormField label="Phone">
                  <input value={editPartnerData.phone || ''} onChange={e => setEditPartnerData(d => ({ ...d, phone: e.target.value }))} style={INPUT_STYLE} />
                </FormField>
                <FormField label="Vehicle Number">
                  <input value={editPartnerData.vehicleNumber || ''} onChange={e => setEditPartnerData(d => ({ ...d, vehicleNumber: e.target.value }))} style={INPUT_STYLE} placeholder="e.g. TN59 AB 1234" />
                </FormField>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', cursor: 'pointer', fontSize: '0.88rem', fontWeight: '600', marginBottom: '1.5rem' }}>
                  <input type="checkbox" checked={editPartnerData.isAvailable || false} onChange={e => setEditPartnerData(d => ({ ...d, isAvailable: e.target.checked }))} style={{ width: '16px', height: '16px', accentColor: '#22c55e' }} />
                  🟢 Mark as Online/Available
                </label>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button onClick={() => setEditingPartner(null)} style={{ background: '#334155', color: '#cbd5e1', border: 'none', padding: '0.7rem 1.2rem', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                  <button onClick={handleSavePartner} disabled={partnerLoading}
                    style={{ ...BTN_BLUE, padding: '0.7rem 1.4rem', fontSize: '0.9rem', opacity: partnerLoading ? 0.7 : 1 }}>
                    {partnerLoading ? <RefreshCw size={15} className="spin-slow" /> : <Save size={15} />}
                    <span>{partnerLoading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </Modal>
            )}

            {/* Partners List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1rem' }}>
              {partners.length === 0 ? (
                <div style={{ ...CARD, textAlign: 'center', gridColumn: '1/-1', padding: '2.5rem' }}>
                  <Truck size={40} style={{ color: '#475569', marginBottom: '1rem' }} />
                  <div style={{ color: '#64748b', fontSize: '0.9rem' }}>No delivery partners registered yet.</div>
                </div>
              ) : partners.map(p => (
                <div key={p.id} style={{ ...CARD, borderColor: p.isAvailable ? 'rgba(34,197,94,0.3)' : '#334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ color: '#f1f5f9', fontWeight: '800', fontSize: '1.05rem' }}>🛵 {p.name}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '0.15rem' }}>📞 {p.phone}</div>
                      {p.vehicleNumber && <div style={{ color: '#64748b', fontSize: '0.78rem' }}>🚗 {p.vehicleNumber}</div>}
                    </div>
                    <button
                      onClick={() => handleTogglePartnerAvailability(p)}
                      style={{ padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', border: 'none', cursor: 'pointer', background: p.isAvailable ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: p.isAvailable ? '#22c55e' : '#ef4444' }}>
                      {p.isAvailable ? '🟢 Online' : '🔴 Offline'}
                    </button>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                    <Star size={13} style={{ color: '#f59e0b', display: 'inline' }} /> {p.totalDeliveries || 0} deliveries completed
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #334155' }}>
                    <button onClick={() => openEditPartner(p)} style={{ ...BTN_BLUE, flex: 1, justifyContent: 'center' }}>
                      <Pencil size={13} /><span>Edit</span>
                    </button>
                    <button onClick={() => handleDeletePartner(p.id, p.name)} style={{ ...BTN_DANGER, flex: 1, justifyContent: 'center' }}>
                      <Trash2 size={13} /><span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════
            TAB 5: CUSTOMER LOG
        ════════════════════════════════════════════════ */}
        {activeTab === 'customers' && (
          <div>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#ffffff', margin: 0, fontSize: '1.4rem', fontWeight: '800' }}>Registered Customers</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '0.25rem 0 0 0' }}>{customers.length} registered customers</p>
            </div>

            {customers.length === 0 ? (
              <div style={{ ...CARD, textAlign: 'center', padding: '3rem' }}>
                <Users size={48} style={{ color: '#475569', marginBottom: '1rem' }} />
                <h3 style={{ color: '#ffffff' }}>No Customers Yet</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Customers who sign up will appear here.</p>
              </div>
            ) : (
              <div style={{ ...CARD, overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #334155' }}>
                      {['#', 'Name', 'Email', 'Phone', 'Joined On'].map(h => (
                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c, i) => (
                      <tr key={c.id} style={{ borderBottom: '1px solid #1e293b' }}>
                        <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontSize: '0.82rem' }}>{i + 1}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#ffffff', fontWeight: '600', fontSize: '0.9rem' }}>{c.name}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.85rem' }}>{c.email}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#94a3b8', fontSize: '0.85rem' }}>{c.phone || '—'}</td>
                        <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontSize: '0.82rem' }}>
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
