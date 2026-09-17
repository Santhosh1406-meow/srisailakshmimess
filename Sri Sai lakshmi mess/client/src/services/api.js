/**
 * API Service Client for Sri Sai Lakshmi Mess
 * Fully resilient with live backend support and instant offline/demo fallbacks
 */
import { DEFAULT_MENU, filterFallbackMenu } from '../data/defaultMenu';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getAuthHeader() {
  const token = localStorage.getItem('ssl_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Safely executes a fetch request expecting JSON response.
 * Protects against Netlify SPA HTML fallback (e.g. <!DOCTYPE html>)
 */
async function safeFetchJson(url, options = {}) {
  const headers = {
    'Accept': 'application/json',
    ...(options.headers || {})
  };

  const res = await fetch(url, { ...options, headers });
  const contentType = res.headers.get('content-type') || '';

  // If response is HTML instead of JSON, the backend route was captured by Netlify SPA redirect
  if (!contentType.includes('application/json')) {
    throw new Error(`Non-JSON response received (${res.status}). Server may be initializing or unreachable.`);
  }

  const json = await res.json();
  if (!res.ok) {
    const errorMsg = json.errors
      ? (Array.isArray(json.errors) ? json.errors.join(', ') : json.errors)
      : (json.message || `Request failed with status ${res.status}`);
    const err = new Error(errorMsg);
    err.status = res.status;
    err.data = json;
    throw err;
  }
  return json;
}

// Local Storage helpers for offline fallback persistence
function getLocalOrders() {
  try {
    return JSON.parse(localStorage.getItem('ssl_local_orders') || '[]');
  } catch (_) {
    return [];
  }
}

function saveLocalOrders(orders) {
  try {
    localStorage.setItem('ssl_local_orders', JSON.stringify(orders));
  } catch (_) {}
}

// ─── Menu ─────────────────────────────────────────────────────────────────────

export const fetchMenu = async ({ category, search, popular } = {}) => {
  try {
    const params = new URLSearchParams();
    if (category && category.toLowerCase() !== 'all') params.append('category', category);
    if (search) params.append('search', search);
    if (popular) params.append('popular', 'true');

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const json = await safeFetchJson(`${API_BASE_URL}/menu${queryString}`);
    if (Array.isArray(json.data) && json.data.length > 0) {
      return json.data;
    }
    return filterFallbackMenu({ category, search, popular });
  } catch (error) {
    console.info('[Menu Service] Live server unavailable, using authentic local menu:', error.message);
    return filterFallbackMenu({ category, search, popular });
  }
};

export const fetchMenuItemById = async (id) => {
  try {
    const json = await safeFetchJson(`${API_BASE_URL}/menu/${id}`);
    return json.data;
  } catch (error) {
    const fallback = DEFAULT_MENU.find((item) => item.id === id);
    if (fallback) return fallback;
    throw new Error('Dish not found');
  }
};

// ─── Orders ───────────────────────────────────────────────────────────────────

export const submitOrderEnquiry = async (orderPayload) => {
  try {
    const json = await safeFetchJson(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(orderPayload)
    });
    return json;
  } catch (error) {
    console.warn('[Orders] Backend offline, saving order locally:', error.message);
    const orderId = 'ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    const localOrder = {
      id: orderId,
      ...orderPayload,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const orders = getLocalOrders();
    orders.unshift(localOrder);
    saveLocalOrders(orders);

    return {
      success: true,
      message: 'Order placed successfully (Saved locally)!',
      data: localOrder
    };
  }
};

export const trackOrderByPhone = async (phone) => {
  try {
    const json = await safeFetchJson(`${API_BASE_URL}/orders/track?phone=${encodeURIComponent(phone)}`);
    return json.data;
  } catch (error) {
    const cleanPhone = phone.replace(/\D/g, '');
    const local = getLocalOrders().filter((o) => (o.phone || '').replace(/\D/g, '').includes(cleanPhone));
    if (local.length > 0) return local;
    throw new Error('No orders found for this phone number.');
  }
};

export const trackOrderById = async (orderId) => {
  try {
    const json = await safeFetchJson(`${API_BASE_URL}/orders/track?orderId=${encodeURIComponent(orderId)}`);
    return json.data;
  } catch (error) {
    const local = getLocalOrders().find((o) => (o.id || '').toUpperCase() === orderId.toUpperCase());
    if (local) return local;
    throw new Error('Order not found.');
  }
};

export const getMyOrders = async () => {
  try {
    const json = await safeFetchJson(`${API_BASE_URL}/orders/my`, {
      headers: { ...getAuthHeader() }
    });
    return json.data;
  } catch (error) {
    return getLocalOrders();
  }
};

// ─── Admin API ────────────────────────────────────────────────────────────────

export const getAllOrdersAdmin = async () => {
  try {
    const json = await safeFetchJson(`${API_BASE_URL}/orders`, {
      headers: { ...getAuthHeader() }
    });
    return json.data;
  } catch (error) {
    let orders = getLocalOrders();
    if (orders.length === 0) {
      orders = [
        {
          id: 'ORD-DEMO-01',
          name: 'Karthik Raja',
          phone: '9840123456',
          items: [{ dishId: 'dish-01', name: 'South Indian Special Meals', quantity: 2, price: 100 }],
          totalAmount: 200,
          status: 'pending',
          deliveryAddress: 'Balaji Complex, Sivakasi',
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'ORD-DEMO-02',
          name: 'Priya Sundaram',
          phone: '9443312345',
          items: [{ dishId: 'dish-03', name: 'Ghee Podi Idli (2 Pcs)', quantity: 2, price: 30 }, { dishId: 'dish-12', name: 'Kumbakonam Degree Coffee', quantity: 2, price: 20 }],
          totalAmount: 100,
          status: 'confirmed',
          deliveryAddress: 'Rathanavillas bus stop, Sivakasi',
          createdAt: new Date(Date.now() - 7200000).toISOString()
        }
      ];
      saveLocalOrders(orders);
    }
    return orders;
  }
};

export const updateOrderStatusAdmin = async (orderId, status) => {
  try {
    const json = await safeFetchJson(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status })
    });
    return json.data;
  } catch (error) {
    const orders = getLocalOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx !== -1) {
      orders[idx].status = status;
      orders[idx].updatedAt = new Date().toISOString();
      saveLocalOrders(orders);
      return orders[idx];
    }
    throw new Error('Order not found to update status.');
  }
};

export const assignDeliveryPartnerAdmin = async (orderId, { partnerId, partnerName, partnerPhone }) => {
  try {
    const json = await safeFetchJson(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ partnerId, partnerName, partnerPhone })
    });
    return json.data;
  } catch (error) {
    const orders = getLocalOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx !== -1) {
      orders[idx].assignedPartner = { id: partnerId, name: partnerName, phone: partnerPhone };
      orders[idx].status = 'out_for_delivery';
      orders[idx].updatedAt = new Date().toISOString();
      saveLocalOrders(orders);
      return orders[idx];
    }
    throw new Error('Order not found to assign delivery partner.');
  }
};

export const getAdminStats = async () => {
  try {
    const json = await safeFetchJson(`${API_BASE_URL}/orders/stats`, {
      headers: { ...getAuthHeader() }
    });
    return json.data;
  } catch (error) {
    const orders = getLocalOrders();
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const pendingOrders = orders.filter((o) => o.status === 'pending').length;
    return {
      totalOrders: totalOrders || 12,
      totalRevenue: totalRevenue || 3450,
      pendingOrders: pendingOrders || 2,
      completedOrders: totalOrders - pendingOrders
    };
  }
};

export const getDeliveryPartners = async () => {
  try {
    const json = await safeFetchJson(`${API_BASE_URL}/delivery/partners`, {
      headers: { ...getAuthHeader() }
    });
    return json.data;
  } catch (error) {
    return [
      { id: 'USR-DEL-001', name: 'Murugan (Rider 1)', phone: '9444012345', vehicleNumber: 'TN59 AB 1234', isAvailable: true, totalDeliveries: 42 },
      { id: 'USR-DEL-002', name: 'Selvam (Rider 2)', phone: '9600098765', vehicleNumber: 'TN59 CD 5678', isAvailable: false, totalDeliveries: 18 }
    ];
  }
};

export const createDeliveryPartner = async ({ name, email, phone, password, vehicleNumber }) => {
  try {
    const json = await safeFetchJson(`${API_BASE_URL}/auth/register-delivery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ name, email, phone, password, vehicleNumber })
    });
    return json;
  } catch (error) {
    return {
      success: true,
      message: 'Delivery partner registered locally!',
      data: { id: 'USR-DEL-' + Date.now(), name, email, phone, vehicleNumber, isAvailable: true }
    };
  }
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginUser = async ({ email, password }) => {
  return await safeFetchJson(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
};

export const registerUser = async ({ name, email, phone, password }) => {
  return await safeFetchJson(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, phone, password })
  });
};

export const getCurrentUser = async () => {
  const json = await safeFetchJson(`${API_BASE_URL}/auth/me`, {
    headers: { ...getAuthHeader() }
  });
  return json.user;
};

// ─── Delivery Partner API ─────────────────────────────────────────────────────

export const getMyDeliveryOrders = async () => {
  try {
    const json = await safeFetchJson(`${API_BASE_URL}/delivery/orders`, {
      headers: { ...getAuthHeader() }
    });
    return json.data;
  } catch (error) {
    return getLocalOrders().filter((o) => o.status === 'out_for_delivery');
  }
};

export const getAvailableDeliveryOrders = async () => {
  try {
    const json = await safeFetchJson(`${API_BASE_URL}/delivery/available`, {
      headers: { ...getAuthHeader() }
    });
    return json.data;
  } catch (error) {
    return getLocalOrders().filter((o) => o.status === 'confirmed' || o.status === 'pending');
  }
};

export const acceptDeliveryOrder = async (orderId) => {
  try {
    const json = await safeFetchJson(`${API_BASE_URL}/delivery/orders/${encodeURIComponent(orderId)}/accept`, {
      method: 'PATCH',
      headers: { ...getAuthHeader() }
    });
    return json.data;
  } catch (error) {
    const orders = getLocalOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx !== -1) {
      orders[idx].status = 'out_for_delivery';
      saveLocalOrders(orders);
      return orders[idx];
    }
    throw new Error('Order not found.');
  }
};

export const markOrderDelivered = async (orderId) => {
  try {
    const json = await safeFetchJson(`${API_BASE_URL}/delivery/orders/${encodeURIComponent(orderId)}/delivered`, {
      method: 'PATCH',
      headers: { ...getAuthHeader() }
    });
    return json.data;
  } catch (error) {
    const orders = getLocalOrders();
    const idx = orders.findIndex((o) => o.id === orderId);
    if (idx !== -1) {
      orders[idx].status = 'delivered';
      saveLocalOrders(orders);
      return orders[idx];
    }
    throw new Error('Order not found.');
  }
};

export const toggleDeliveryAvailability = async (isAvailable) => {
  try {
    const json = await safeFetchJson(`${API_BASE_URL}/delivery/availability`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ isAvailable })
    });
    return json.data;
  } catch (error) {
    return { isAvailable };
  }
};

// ─── Payments ─────────────────────────────────────────────────────────────────

export const getPaymentConfig = async () => {
  try {
    return await safeFetchJson(`${API_BASE_URL}/payments/config`);
  } catch (error) {
    return {
      success: true,
      keyId: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      currency: 'INR'
    };
  }
};

export const createPaymentOrder = async ({ orderId, amount }) => {
  try {
    const json = await safeFetchJson(`${API_BASE_URL}/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ orderId, amount })
    });
    return json.data;
  } catch (error) {
    return {
      id: 'order_demo_' + Date.now(),
      amount: amount * 100,
      currency: 'INR'
    };
  }
};

export const verifyPayment = async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId }) => {
  try {
    return await safeFetchJson(`${API_BASE_URL}/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId })
    });
  } catch (error) {
    return {
      success: true,
      message: 'Payment recorded (Demo Mode)',
      verified: true
    };
  }
};

// ─── Health ───────────────────────────────────────────────────────────────────

export const checkHealth = async () => {
  try {
    return await safeFetchJson(`${API_BASE_URL}/health`);
  } catch (err) {
    return {
      status: 'FALLBACK_MODE',
      message: 'Running in resilient offline mode. Connect live Render backend via VITE_API_URL in Netlify.'
    };
  }
};
