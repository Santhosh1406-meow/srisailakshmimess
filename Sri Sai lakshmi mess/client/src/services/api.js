/**
 * API Service Client for Sri Sai Lakshmi Mess
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getAuthHeader() {
  const token = localStorage.getItem('ssl_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ─── Menu ─────────────────────────────────────────────────────────────────────

export const fetchMenu = async ({ category, search, popular } = {}) => {
  try {
    const params = new URLSearchParams();
    if (category && category.toLowerCase() !== 'all') params.append('category', category);
    if (search) params.append('search', search);
    if (popular) params.append('popular', 'true');

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/menu${queryString}`, {
      headers: { 'Accept': 'application/json' }
    });

    if (!res.ok) throw new Error(`Failed to load menu (status: ${res.status})`);
    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.warn('[API Warning] Using fallback menu data due to connection error:', error.message);
    throw error;
  }
};

export const fetchMenuItemById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/menu/${id}`);
  if (!res.ok) throw new Error('Dish not found');
  const json = await res.json();
  return json.data;
};

// ─── Orders ───────────────────────────────────────────────────────────────────

export const submitOrderEnquiry = async (orderPayload) => {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...getAuthHeader()
    },
    body: JSON.stringify(orderPayload)
  });

  const json = await res.json();
  if (!res.ok) {
    const errorMsg = json.errors ? json.errors.join(', ') : (json.message || 'Unable to submit enquiry');
    throw new Error(errorMsg);
  }
  return json;
};

export const trackOrderByPhone = async (phone) => {
  const res = await fetch(`${API_BASE_URL}/orders/track?phone=${encodeURIComponent(phone)}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'No orders found.');
  return json.data;
};

export const trackOrderById = async (orderId) => {
  const res = await fetch(`${API_BASE_URL}/orders/track?orderId=${encodeURIComponent(orderId)}`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Order not found.');
  return json.data;
};

export const getMyOrders = async () => {
  const res = await fetch(`${API_BASE_URL}/orders/my`, {
    headers: { ...getAuthHeader() }
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to load your orders.');
  return json.data;
};

// ─── Admin API ────────────────────────────────────────────────────────────────

export const getAllOrdersAdmin = async () => {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    headers: { ...getAuthHeader() }
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to load all orders.');
  return json.data;
};

export const updateOrderStatusAdmin = async (orderId, status) => {
  const res = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ status })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to update order status.');
  return json.data;
};

export const assignDeliveryPartnerAdmin = async (orderId, { partnerId, partnerName, partnerPhone }) => {
  const res = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}/assign`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ partnerId, partnerName, partnerPhone })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to assign delivery partner.');
  return json.data;
};

export const getAdminStats = async () => {
  const res = await fetch(`${API_BASE_URL}/orders/stats`, {
    headers: { ...getAuthHeader() }
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to load admin stats.');
  return json.data;
};

export const getDeliveryPartners = async () => {
  const res = await fetch(`${API_BASE_URL}/delivery/partners`, {
    headers: { ...getAuthHeader() }
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to load delivery partners.');
  return json.data;
};

export const createDeliveryPartner = async ({ name, email, phone, password, vehicleNumber }) => {
  const res = await fetch(`${API_BASE_URL}/auth/register-delivery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ name, email, phone, password, vehicleNumber })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.errors ? json.errors.join(' ') : (json.message || 'Failed to create partner.'));
  return json;
};


// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginUser = async ({ email, password }) => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Login failed.');
  return json;
};

export const registerUser = async ({ name, email, phone, password }) => {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, phone, password })
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.errors ? json.errors.join(' ') : (json.message || 'Registration failed.'));
  }
  return json;
};

export const getCurrentUser = async () => {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { ...getAuthHeader() }
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Not authenticated.');
  return json.user;
};

// ─── Delivery Partner API ─────────────────────────────────────────────────────

export const getMyDeliveryOrders = async () => {
  const res = await fetch(`${API_BASE_URL}/delivery/orders`, {
    headers: { ...getAuthHeader() }
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to load delivery orders.');
  return json.data;
};

export const getAvailableDeliveryOrders = async () => {
  const res = await fetch(`${API_BASE_URL}/delivery/available`, {
    headers: { ...getAuthHeader() }
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to load available orders.');
  return json.data;
};

export const acceptDeliveryOrder = async (orderId) => {
  const res = await fetch(`${API_BASE_URL}/delivery/orders/${encodeURIComponent(orderId)}/accept`, {
    method: 'PATCH',
    headers: { ...getAuthHeader() }
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to accept order.');
  return json.data;
};

export const markOrderDelivered = async (orderId) => {
  const res = await fetch(`${API_BASE_URL}/delivery/orders/${encodeURIComponent(orderId)}/delivered`, {
    method: 'PATCH',
    headers: { ...getAuthHeader() }
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to mark order delivered.');
  return json.data;
};

export const toggleDeliveryAvailability = async (isAvailable) => {
  const res = await fetch(`${API_BASE_URL}/delivery/availability`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ isAvailable })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to update availability.');
  return json.data;
};

// ─── Payments ─────────────────────────────────────────────────────────────────

export const getPaymentConfig = async () => {
  const res = await fetch(`${API_BASE_URL}/payments/config`);
  const json = await res.json();
  return json;
};

export const createPaymentOrder = async ({ orderId, amount }) => {
  const res = await fetch(`${API_BASE_URL}/payments/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ orderId, amount })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to create payment order.');
  return json.data;
};

export const verifyPayment = async ({ razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId }) => {
  const res = await fetch(`${API_BASE_URL}/payments/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId })
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Payment verification failed.');
  return json;
};

// ─── Health ───────────────────────────────────────────────────────────────────

export const checkHealth = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    return await res.json();
  } catch (err) {
    return { status: 'ERROR', message: err.message };
  }
};
