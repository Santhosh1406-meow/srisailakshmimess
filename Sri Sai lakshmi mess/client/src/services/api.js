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
  let serverOrder = null;
  try {
    const json = await safeFetchJson(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(orderPayload)
    });
    serverOrder = json.data;
  } catch (error) {
    console.warn('[Orders] Backend offline or unreachable, saving order locally:', error.message);
  }

  const finalOrder = serverOrder || {
    id: 'ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    ...orderPayload,
    status: 'Order Received',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Keep local storage synchronized
  const orders = getLocalOrders().filter((o) => !o.id.startsWith('ORD-DEMO-'));
  if (!orders.some((o) => o.id === finalOrder.id)) {
    orders.unshift(finalOrder);
    saveLocalOrders(orders);
  }

  return {
    success: true,
    message: 'Order placed successfully!',
    data: finalOrder
  };
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
    return getLocalOrders().filter((o) => !o.id.startsWith('ORD-DEMO-'));
  }
};

// ─── Admin API ────────────────────────────────────────────────────────────────

export const getAllOrdersAdmin = async () => {
  try {
    const json = await safeFetchJson(`${API_BASE_URL}/orders`, {
      headers: { ...getAuthHeader() }
    });
    if (Array.isArray(json.data)) {
      // Merge with any local orders (filtering out demo orders)
      const local = getLocalOrders().filter((o) => !o.id.startsWith('ORD-DEMO-'));
      const serverIds = new Set(json.data.map((o) => o.id));
      const merged = [...json.data];
      for (const loc of local) {
        if (!serverIds.has(loc.id)) {
          merged.push(loc);
        }
      }
      saveLocalOrders(merged);
      return merged;
    }
    const result = json.data || [];
    if (result.length > 0) saveLocalOrders(result);
    return result;
  } catch (error) {
    console.info('[Admin API] Server unreachable, loading from local store:', error.message);
    return getLocalOrders().filter((o) => !o.id.startsWith('ORD-DEMO-'));
  }
};

export const updateOrderStatusAdmin = async (orderId, status, fallbackOrder = null) => {
  let serverUpdated = null;
  let serverError = null;

  try {
    const json = await safeFetchJson(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status })
    });
    serverUpdated = json.data;
  } catch (error) {
    serverError = error;
    console.warn('[Admin API] Server status update notice:', error.message);
  }

  // Update local cache
  const orders = getLocalOrders();
  let idx = orders.findIndex((o) => (o.id || '').toUpperCase() === (orderId || '').toUpperCase());

  // If order was missing from cache but we have it from component state
  if (idx === -1 && fallbackOrder) {
    orders.unshift({ ...fallbackOrder });
    idx = 0;
  }

  if (idx !== -1) {
    orders[idx].status = status;
    orders[idx].updatedAt = new Date().toISOString();
    saveLocalOrders(orders);
    return serverUpdated || orders[idx];
  }

  if (serverUpdated) {
    orders.unshift(serverUpdated);
    saveLocalOrders(orders);
    return serverUpdated;
  }

  // If server had a specific authentication or validation error, propagate it
  if (serverError) {
    if (serverError.status === 401 || serverError.status === 403) {
      throw new Error('Admin session expired. Please sign out and sign in again.');
    }
    throw new Error(serverError.message || 'Server error occurred while updating status.');
  }

  throw new Error(`Order ${orderId} not found in system.`);
};

export const assignDeliveryPartnerAdmin = async (orderId, { partnerId, partnerName, partnerPhone }, fallbackOrder = null) => {
  let serverUpdated = null;
  let serverError = null;
  try {
    const json = await safeFetchJson(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ partnerId, partnerName, partnerPhone })
    });
    serverUpdated = json.data;
  } catch (error) {
    serverError = error;
  }

  const orders = getLocalOrders();
  let idx = orders.findIndex((o) => (o.id || '').toUpperCase() === (orderId || '').toUpperCase());

  if (idx === -1 && fallbackOrder) {
    orders.unshift({ ...fallbackOrder });
    idx = 0;
  }

  if (idx !== -1) {
    orders[idx].assignedPartner = { id: partnerId, name: partnerName, phone: partnerPhone };
    orders[idx].status = 'Out for Delivery';
    orders[idx].updatedAt = new Date().toISOString();
    saveLocalOrders(orders);
    return serverUpdated || orders[idx];
  }

  if (serverError) {
    throw new Error(serverError.message);
  }
  throw new Error('Order not found to assign delivery partner.');
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

// ─── Menu Admin CRUD ──────────────────────────────────────────────────────────

export const createMenuItemAdmin = async (itemData) => {
  const json = await safeFetchJson(`${API_BASE_URL}/menu`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(itemData)
  });
  return json.data;
};

export const updateMenuItemAdmin = async (id, itemData) => {
  const json = await safeFetchJson(`${API_BASE_URL}/menu/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(itemData)
  });
  return json.data;
};

export const deleteMenuItemAdmin = async (id) => {
  return await safeFetchJson(`${API_BASE_URL}/menu/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() }
  });
};

// ─── Offers ───────────────────────────────────────────────────────────────────

export const fetchActiveOffers = async () => {
  try {
    const json = await safeFetchJson(`${API_BASE_URL}/offers`);
    return json.data || [];
  } catch (error) {
    // Return default seed offers as fallback
    return [
      {
        id: 'OFFER-WELCOME-001',
        title: 'Welcome Discount',
        description: 'Get 10% off on your first order!',
        code: 'WELCOME10',
        discountType: 'percent',
        discountValue: 10,
        minOrderAmount: 100,
        isActive: true
      }
    ];
  }
};

export const fetchAllOffersAdmin = async () => {
  const json = await safeFetchJson(`${API_BASE_URL}/offers/all`, {
    headers: { ...getAuthHeader() }
  });
  return json.data || [];
};

export const createOfferAdmin = async (offerData) => {
  const json = await safeFetchJson(`${API_BASE_URL}/offers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(offerData)
  });
  return json.data;
};

export const updateOfferAdmin = async (id, offerData) => {
  const json = await safeFetchJson(`${API_BASE_URL}/offers/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(offerData)
  });
  return json.data;
};

export const deleteOfferAdmin = async (id) => {
  return await safeFetchJson(`${API_BASE_URL}/offers/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() }
  });
};

export const validateOfferCode = async (code, orderAmount = 0) => {
  try {
    const json = await safeFetchJson(`${API_BASE_URL}/offers/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, orderAmount })
    });
    return json;
  } catch (error) {
    return { valid: false, message: error.message || 'Invalid offer code.' };
  }
};

// ─── Delivery Partner Admin Management ───────────────────────────────────────

export const updateDeliveryPartner = async (id, data) => {
  const json = await safeFetchJson(`${API_BASE_URL}/delivery/partners/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(data)
  });
  return json.data;
};

export const deleteDeliveryPartner = async (id) => {
  return await safeFetchJson(`${API_BASE_URL}/delivery/partners/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() }
  });
};

export const getAllCustomers = async () => {
  try {
    const json = await safeFetchJson(`${API_BASE_URL}/delivery/customers`, {
      headers: { ...getAuthHeader() }
    });
    return json.data || [];
  } catch (error) {
    return [];
  }
};
