const orderService = require('../services/orderService');
const userService = require('../services/userService');

exports.createOrder = async (req, res, next) => {
  try {
    const {
      customerName,
      phone,
      email,
      foodItem,
      quantity,
      preferredDate,
      preferredTime,
      specialInstructions,
      orderType,
      deliveryAddress,
      items,
      amount,
      paymentStatus,
      paymentId,
      razorpayOrderId
    } = req.body;

    let userId = req.user ? req.user.id : null;
    if (!userId) {
      try {
        if (email) {
          const u = await userService.findByEmail(email);
          if (u) userId = u.id;
        }
        if (!userId && phone) {
          const u = await userService.findByPhone(phone);
          if (u) userId = u.id;
        }
      } catch (_) {}
    }

    const newOrder = await orderService.createOrder({
      customerName,
      phone,
      email,
      foodItem,
      quantity,
      preferredDate: preferredDate || new Date().toISOString().split('T')[0],
      preferredTime: preferredTime || 'Immediate (30-45 mins)',
      specialInstructions,
      orderType: orderType || 'delivery',
      deliveryAddress: deliveryAddress || '',
      items: items || [],
      amount: amount || 0,
      paymentStatus: paymentStatus || 'Pay on Delivery',
      paymentId: paymentId || null,
      razorpayOrderId: razorpayOrderId || null,
      userId
    });

    return res.status(201).json({
      success: true,
      message: 'Your order has been submitted successfully.',
      data: {
        id: newOrder.id,
        enquiryId: newOrder.id,
        customerName: newOrder.customerName,
        phone: newOrder.phone,
        foodItem: newOrder.foodItem,
        quantity: newOrder.quantity,
        items: newOrder.items,
        amount: newOrder.amount,
        orderType: newOrder.orderType,
        deliveryAddress: newOrder.deliveryAddress,
        preferredDate: newOrder.preferredDate,
        preferredTime: newOrder.preferredTime,
        status: newOrder.status,
        paymentStatus: newOrder.paymentStatus,
        paymentId: newOrder.paymentId,
        createdAt: newOrder.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getAllOrders();
    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/:id — Get single order by ID
 */
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found. Please check your Order ID.' });
    }
    return res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/track?phone=9876543210 or ?orderId=ORD-xxx
 * Public order tracking by phone or order ID
 */
exports.trackOrder = async (req, res, next) => {
  try {
    const { phone, orderId } = req.query;

    if (!phone && !orderId) {
      return res.status(400).json({ success: false, message: 'Please provide a phone number or order ID to track.' });
    }

    let orders = [];
    if (orderId) {
      const found = await orderService.getOrderById(orderId.trim());
      if (found) orders = [found];
    } else if (phone) {
      orders = await orderService.getOrdersByPhone(phone.trim());
    }

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'No orders found. Please check your phone number or Order ID.' });
    }

    // Return sanitized order data (omit internal fields)
    const safeOrders = orders.map((o) => ({
      id: o.id,
      customerName: o.customerName,
      phone: o.phone.replace(/(\d{2})\d{6}(\d{2})/, '$1xxxxxx$2'), // mask phone
      foodItem: o.foodItem,
      quantity: o.quantity,
      preferredDate: o.preferredDate,
      preferredTime: o.preferredTime,
      status: o.status,
      paymentStatus: o.paymentStatus,
      specialInstructions: o.specialInstructions,
      orderType: o.orderType || 'dine-in',
      deliveryAddress: o.deliveryAddress || '',
      amount: o.amount || 0,
      items: o.items || [],
      deliveredAt: o.deliveredAt || null,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt
    }));

    return res.status(200).json({ success: true, count: safeOrders.length, data: safeOrders });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/my — Get orders for logged-in user
 */
exports.getMyOrders = async (req, res, next) => {
  try {
    let email = req.user.email;
    let phone = null;
    try {
      const u = await userService.findById(req.user.id);
      if (u) {
        email = u.email || email;
        phone = u.phone || null;
      }
    } catch (_) {}
    const orders = await orderService.getOrdersByUserId(req.user.id, email, phone);
    return res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

const STATUS_MAP = {
  'order received': 'Order Received',
  'enquiry received': 'Enquiry Received',
  'pending': 'Order Received',
  'processing': 'Processing',
  'in progress': 'Processing',
  'confirmed': 'Confirmed',
  'ready': 'Ready',
  'food ready': 'Ready',
  'out for delivery': 'Out for Delivery',
  'out_for_delivery': 'Out for Delivery',
  'delivered': 'Delivered',
  'completed': 'Delivered',
  'cancelled': 'Cancelled'
};

/**
 * PATCH /api/orders/:id/status — Admin: Update order status
 */
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || typeof status !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Status string is required.'
      });
    }

    const normalizedKey = status.trim().toLowerCase();
    const targetStatus = STATUS_MAP[normalizedKey];

    if (!targetStatus) {
      return res.status(400).json({
        success: false,
        message: `Invalid status "${status}". Allowed options: Order Received, Processing, Confirmed, Ready, Out for Delivery, Delivered, Cancelled.`
      });
    }

    const updated = await orderService.updateOrderStatus(id, targetStatus);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    return res.status(200).json({
      success: true,
      message: `Order status updated to "${targetStatus}".`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/stats — Admin: Get dashboard summary statistics
 */
exports.getAdminStats = async (req, res, next) => {
  try {
    const stats = await orderService.getAdminStats();
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

