const fs = require('fs');
const path = require('path');
const Order = require('../models/Order');

const DATA_DIR = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'orders.json');

/**
 * Order & Enquiry Service Layer with Local File Persistence
 * Ensures customer placed orders are never lost across server restarts.
 */
class OrderService {
  constructor() {
    this.orders = [];
    this._initStorage();
  }

  _initStorage() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw || '[]');
        if (Array.isArray(parsed)) {
          this.orders = parsed.map((item) => new Order(item));
        }
      } else {
        // Initialize empty orders storage (no dummy demo orders)
        this.orders = [];
        this._persist();
      }
    } catch (err) {
      console.warn('[OrderService] Could not load persisted orders, initializing empty in-memory store:', err.message);
      this.orders = [];
    }
  }

  _persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.orders, null, 2), 'utf-8');
    } catch (err) {
      console.error('[OrderService] Failed to persist orders to file:', err.message);
    }
  }

  async createOrder(orderData) {
    const newOrder = new Order(orderData);
    this.orders.unshift(newOrder);
    this._persist();
    return newOrder;
  }

  async getAllOrders() {
    return [...this.orders];
  }

  async getOrderById(id) {
    const cleanId = (id || '').trim().toUpperCase();
    return this.orders.find((o) => (o.id || '').toUpperCase() === cleanId) || null;
  }

  async getOrdersByPhone(phone) {
    const cleaned = phone.replace(/\D/g, '').slice(-10);
    return this.orders.filter((o) => (o.phone || '').replace(/\D/g, '').slice(-10) === cleaned);
  }

  async getOrdersByUserId(userId) {
    return this.orders.filter((o) => o.userId === userId);
  }

  /** Delivery partner: get orders assigned to this partner OR available (Ready, no partner) */
  async getOrdersForDeliveryPartner(partnerId) {
    return this.orders.filter(
      (o) => o.deliveryPartnerId === partnerId || 
             (o.status === 'Ready' && !o.deliveryPartnerId && o.orderType === 'delivery')
    );
  }

  /** Delivery partner: get only available (unassigned) delivery orders */
  async getAvailableDeliveryOrders() {
    return this.orders.filter(
      (o) => o.status === 'Ready' && !o.deliveryPartnerId && o.orderType === 'delivery'
    );
  }

  /** Admin: assign a delivery partner to an order */
  async assignDeliveryPartner(orderId, partnerId, partnerName, partnerPhone) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return null;
    order.deliveryPartnerId = partnerId;
    order.deliveryPartnerName = partnerName;
    order.deliveryPartnerPhone = partnerPhone;
    order.updatedAt = new Date().toISOString();
    this._persist();
    return order;
  }

  /** Delivery partner: accept/claim an order */
  async acceptOrder(orderId, partnerId, partnerName, partnerPhone) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return null;
    if (order.deliveryPartnerId && order.deliveryPartnerId !== partnerId) return null; // already taken
    order.deliveryPartnerId = partnerId;
    order.deliveryPartnerName = partnerName;
    order.deliveryPartnerPhone = partnerPhone;
    order.status = 'Out for Delivery';
    order.updatedAt = new Date().toISOString();
    this._persist();
    return order;
  }

  /** Delivery partner: mark an order as delivered */
  async markDelivered(orderId, partnerId) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return null;
    if (order.deliveryPartnerId !== partnerId) return null; // not your order
    order.status = 'Delivered';
    order.deliveredAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();
    this._persist();
    return order;
  }

  async updateOrderStatus(id, status) {
    const cleanId = (id || '').trim().toUpperCase();
    const order = this.orders.find((o) => (o.id || '').toUpperCase() === cleanId);
    if (!order) return null;
    order.status = status;
    if (status === 'Delivered' || status === 'Completed') {
      order.deliveredAt = new Date().toISOString();
    }
    order.updatedAt = new Date().toISOString();
    this._persist();
    return order;
  }

  async updatePaymentInfo(id, { paymentId, razorpayOrderId, paymentStatus, amount }) {
    const order = this.orders.find((o) => o.id === id);
    if (!order) return null;
    if (paymentId) order.paymentId = paymentId;
    if (razorpayOrderId) order.razorpayOrderId = razorpayOrderId;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (amount) order.amount = amount;
    order.updatedAt = new Date().toISOString();
    this._persist();
    return order;
  }

  async getAdminStats() {
    const totalOrders = this.orders.length;
    const pendingEnquiries = this.orders.filter((o) => ['Enquiry Received', 'Order Received', 'Pending'].includes(o.status)).length;
    const processingOrders = this.orders.filter((o) => o.status === 'Processing').length;
    const confirmedOrders = this.orders.filter((o) => ['Confirmed', 'Completed', 'Delivered'].includes(o.status)).length;
    const outForDelivery = this.orders.filter((o) => o.status === 'Out for Delivery').length;
    const totalPortions = this.orders.reduce((sum, o) => sum + (Number(o.quantity) || 0), 0);
    const deliveryOrders = this.orders.filter((o) => o.orderType === 'delivery').length;

    return {
      totalOrders,
      pendingEnquiries,
      processingOrders,
      confirmedOrders,
      outForDelivery,
      totalPortions,
      deliveryOrders
    };
  }
}

module.exports = new OrderService();
