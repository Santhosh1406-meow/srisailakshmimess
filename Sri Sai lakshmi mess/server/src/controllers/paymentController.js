const crypto = require('crypto');
const orderService = require('../services/orderService');

// Lazily initialize Razorpay only if keys are configured
let razorpayInstance = null;
function getRazorpay() {
  if (!razorpayInstance) {
    const Razorpay = require('razorpay');
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || ''
    });
  }
  return razorpayInstance;
}

/**
 * POST /api/payments/create-order
 * Creates a Razorpay order for a given mess order amount.
 * Called when restaurant wants to send a payment link after delivery.
 */
exports.createPaymentOrder = async (req, res, next) => {
  try {
    const { orderId, amount } = req.body; // amount in INR (e.g. 120)

    if (!orderId || !amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid orderId and amount (in INR) are required.' });
    }

    const messOrder = await orderService.getOrderById(orderId);
    if (!messOrder) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Check Razorpay keys are configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      // Demo mode: return mock payment data
      const mockRazorpayOrderId = `order_DEMO_${Date.now()}`;
      await orderService.updatePaymentInfo(orderId, { razorpayOrderId: mockRazorpayOrderId });
      return res.status(200).json({
        success: true,
        demo: true,
        message: 'Demo mode: Razorpay keys not configured.',
        data: {
          razorpayOrderId: mockRazorpayOrderId,
          amount: Number(amount) * 100,
          currency: 'INR',
          orderId,
          keyId: 'DEMO_KEY'
        }
      });
    }

    const razorpay = getRazorpay();
    const options = {
      amount: Math.round(Number(amount) * 100), // convert INR → paise
      currency: 'INR',
      receipt: `receipt_${orderId}`,
      notes: {
        orderId,
        customerName: messOrder.customerName,
        phone: messOrder.phone
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Save razorpay order ID to our order
    await orderService.updatePaymentInfo(orderId, {
      razorpayOrderId: razorpayOrder.id,
      amount: options.amount
    });

    return res.status(200).json({
      success: true,
      data: {
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        orderId,
        keyId: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/payments/verify
 * Verifies Razorpay payment signature and marks order as Paid.
 */
exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
      return res.status(400).json({ success: false, message: 'Missing required payment verification fields.' });
    }

    // Demo mode
    if (!process.env.RAZORPAY_KEY_SECRET || razorpayOrderId.startsWith('order_DEMO_')) {
      await orderService.updatePaymentInfo(orderId, {
        paymentId: razorpayPaymentId || `pay_DEMO_${Date.now()}`,
        paymentStatus: 'Paid'
      });
      await orderService.updateOrderStatus(orderId, 'Confirmed');
      return res.status(200).json({
        success: true,
        demo: true,
        message: 'Demo payment verified. Order confirmed!',
        data: { orderId, paymentStatus: 'Paid', orderStatus: 'Confirmed' }
      });
    }

    // Verify HMAC signature
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
    }

    // Update order with payment success
    await orderService.updatePaymentInfo(orderId, {
      paymentId: razorpayPaymentId,
      paymentStatus: 'Paid'
    });
    await orderService.updateOrderStatus(orderId, 'Confirmed');

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully! Your order is confirmed.',
      data: { orderId, paymentStatus: 'Paid', orderStatus: 'Confirmed' }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/payments/config — Return the Razorpay key ID (safe to expose)
 */
exports.getPaymentConfig = (req, res) => {
  return res.status(200).json({
    success: true,
    keyId: process.env.RAZORPAY_KEY_ID || null,
    configured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
  });
};
