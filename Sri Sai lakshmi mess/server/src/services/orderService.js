const fs = require('fs');
const path = require('path');
const Order = require('../models/Order');
const { query, isDbConnected } = require('../config/db');

const DATA_DIR = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'orders.json');

function rowToOrder(row) {
  if (!row) return null;
  let items = [];
  try {
    items = typeof row.items === 'string' ? JSON.parse(row.items) : (row.items || []);
  } catch (e) {
    items = [];
  }
  return new Order({
    id: row.id,
    customerName: row.customer_name,
    phone: row.phone,
    email: row.email,
    foodItem: row.food_item,
    quantity: row.quantity,
    preferredDate: row.preferred_date,
    preferredTime: row.preferred_time,
    specialInstructions: row.special_instructions,
    orderType: row.order_type,
    deliveryAddress: row.delivery_address,
    status: row.status,
    userId: row.user_id,
    paymentStatus: row.payment_status,
    paymentId: row.payment_id,
    razorpayOrderId: row.razorpay_order_id,
    amount: Number(row.amount) || 0,
    items: items,
    deliveredAt: row.delivered_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  });
}

/**
 * Order & Enquiry Service Layer with Neon PostgreSQL & Local File Persistence
 */
class OrderService {
  constructor() {
    this.orders = [];
    this._initStorage();
  }

  async _initStorage() {
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

    if (isDbConnected()) {
      try {
        await query(`
          INSERT INTO orders (
            id, customer_name, phone, email, food_item, quantity,
            preferred_date, preferred_time, special_instructions,
            order_type, delivery_address, status, user_id,
            payment_status, payment_id, razorpay_order_id, amount,
            items, delivered_at, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
          ON CONFLICT (id) DO NOTHING;
        `, [
          newOrder.id,
          newOrder.customerName,
          newOrder.phone,
          newOrder.email,
          newOrder.foodItem,
          newOrder.quantity,
          newOrder.preferredDate,
          newOrder.preferredTime,
          newOrder.specialInstructions,
          newOrder.orderType,
          newOrder.deliveryAddress,
          newOrder.status,
          newOrder.userId,
          newOrder.paymentStatus,
          newOrder.paymentId,
          newOrder.razorpayOrderId,
          newOrder.amount,
          JSON.stringify(newOrder.items || []),
          newOrder.deliveredAt,
          newOrder.createdAt,
          newOrder.updatedAt
        ]);
      } catch (e) {
        console.error('[OrderService] Error inserting order into Neon DB:', e.message);
      }
    }

    this.orders.unshift(newOrder);
    this._persist();
    return newOrder;
  }

  async getAllOrders() {
    if (isDbConnected()) {
      try {
        const res = await query('SELECT * FROM orders ORDER BY created_at DESC');
        if (res && res.rows) {
          return res.rows.map(rowToOrder);
        }
      } catch (e) {
        console.error('[OrderService] Error fetching orders from Neon DB:', e.message);
      }
    }
    return [...this.orders];
  }

  async getOrderById(id) {
    const cleanId = (id || '').trim().toUpperCase();
    if (isDbConnected()) {
      try {
        const res = await query('SELECT * FROM orders WHERE UPPER(id) = $1 LIMIT 1', [cleanId]);
        if (res && res.rows.length > 0) {
          return rowToOrder(res.rows[0]);
        }
      } catch (e) {
        console.error('[OrderService] Error finding order by id in Neon DB:', e.message);
      }
    }
    return this.orders.find((o) => (o.id || '').toUpperCase() === cleanId) || null;
  }

  async getOrdersByPhone(phone) {
    const cleaned = (phone || '').replace(/\D/g, '').slice(-10);
    if (isDbConnected()) {
      try {
        const res = await query('SELECT * FROM orders ORDER BY created_at DESC');
        if (res && res.rows) {
          return res.rows.map(rowToOrder).filter((o) => (o.phone || '').replace(/\D/g, '').slice(-10) === cleaned);
        }
      } catch (e) {
        console.error('[OrderService] Error fetching orders by phone from Neon DB:', e.message);
      }
    }
    return this.orders.filter((o) => (o.phone || '').replace(/\D/g, '').slice(-10) === cleaned);
  }

  async getOrdersByUserId(userId, email = null, phone = null) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);

    if (isDbConnected()) {
      try {
        const res = await query(`
          SELECT * FROM orders 
          WHERE (user_id IS NOT NULL AND user_id = $1)
             OR ($2::text <> '' AND LOWER(COALESCE(email, '')) = $2)
             OR ($3::text <> '' AND RIGHT(REGEXP_REPLACE(COALESCE(phone, ''), '\\D', '', 'g'), 10) = $3)
          ORDER BY created_at DESC
        `, [userId || null, cleanEmail, cleanPhone]);
        if (res && res.rows) {
          return res.rows.map(rowToOrder);
        }
      } catch (e) {
        console.error('[OrderService] Error fetching orders by userId from Neon DB:', e.message);
      }
    }
    return this.orders.filter((o) => {
      if (userId && o.userId === userId) return true;
      if (cleanEmail && (o.email || '').trim().toLowerCase() === cleanEmail) return true;
      if (cleanPhone && (o.phone || '').replace(/\D/g, '').slice(-10) === cleanPhone) return true;
      return false;
    });
  }

  async updateOrderStatus(id, status) {
    const cleanId = (id || '').trim().toUpperCase();
    const deliveredAt = (status === 'Delivered' || status === 'Completed') ? new Date().toISOString() : null;
    let dbUpdatedOrder = null;

    if (isDbConnected()) {
      try {
        const res = await query(`
          UPDATE orders 
          SET status = $1, 
              delivered_at = CASE WHEN $2::text IS NOT NULL THEN CURRENT_TIMESTAMP ELSE delivered_at END,
              updated_at = CURRENT_TIMESTAMP
          WHERE UPPER(id) = UPPER($3)
          RETURNING *
        `, [status, deliveredAt, cleanId]);
        if (res && res.rows && res.rows.length > 0) {
          dbUpdatedOrder = rowToOrder(res.rows[0]);
        }
      } catch (e) {
        console.error('[OrderService] Error updating status in Neon DB:', e.message);
      }
    }

    const orderIndex = this.orders.findIndex((o) => (o.id || '').toUpperCase() === cleanId);
    if (orderIndex !== -1) {
      this.orders[orderIndex].status = status;
      if (deliveredAt) {
        this.orders[orderIndex].deliveredAt = deliveredAt;
      }
      this.orders[orderIndex].updatedAt = new Date().toISOString();
      this._persist();
      return dbUpdatedOrder || this.orders[orderIndex];
    } else if (dbUpdatedOrder) {
      this.orders.unshift(dbUpdatedOrder);
      this._persist();
      return dbUpdatedOrder;
    }

    return dbUpdatedOrder || null;
  }

  async updatePaymentInfo(id, { paymentId, razorpayOrderId, paymentStatus, amount }) {
    const cleanId = (id || '').trim().toUpperCase();

    if (isDbConnected()) {
      try {
        await query(`
          UPDATE orders SET 
            payment_id = COALESCE($1, payment_id),
            razorpay_order_id = COALESCE($2, razorpay_order_id),
            payment_status = COALESCE($3, payment_status),
            amount = COALESCE($4, amount),
            updated_at = CURRENT_TIMESTAMP
          WHERE UPPER(id) = UPPER($5)
        `, [paymentId || null, razorpayOrderId || null, paymentStatus || null, amount || null, cleanId]);
      } catch (e) {
        console.error('[OrderService] Error updating payment in Neon DB:', e.message);
      }
    }

    const order = this.orders.find((o) => (o.id || '').toUpperCase() === cleanId);
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
    const allOrders = await this.getAllOrders();
    const totalOrders = allOrders.length;
    const pendingEnquiries = allOrders.filter((o) => ['Enquiry Received', 'Order Received', 'Pending'].includes(o.status)).length;
    const processingOrders = allOrders.filter((o) => o.status === 'Processing').length;
    const confirmedOrders = allOrders.filter((o) => ['Confirmed', 'Completed', 'Delivered'].includes(o.status)).length;
    const totalPortions = allOrders.reduce((sum, o) => sum + (Number(o.quantity) || 0), 0);

    return {
      totalOrders,
      pendingEnquiries,
      processingOrders,
      confirmedOrders,
      totalPortions
    };
  }
}

module.exports = new OrderService();

