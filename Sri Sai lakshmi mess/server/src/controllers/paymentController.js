const crypto = require('crypto');
const orderService = require('../services/orderService');

// Lazily initialize Razorpay client
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
 * POST /api/create-order or /api/payments/create-order
 * Creates a Razorpay order.
 * Accepts: { amount (in paise or INR), currency, receipt, orderId }
 * Returns: { order_id, amount, currency }
 * Minimum amount: 100 paise
 */
exports.createPaymentOrder = async (req, res, next) => {
  try {
    let { amount, currency = 'INR', receipt, orderId } = req.body;

    // Validate amount presence and number
    if (amount === undefined || amount === null || isNaN(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount. Amount is required and must be a number.'
      });
    }

    let parsedAmount = Number(amount);

    // If orderId is provided and amount is small (e.g. from existing cart sending ₹ rupees),
    // convert if less than 100 paise and likely in rupees, or enforce minimum 100 paise
    // Minimum amount allowed by Razorpay is 100 paise (₹1.00)
    if (parsedAmount < 100) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be at least 100 paise (₹1.00).'
      });
    }

    // Check if credentials are set
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay API credentials are not configured on the server.'
      });
    }

    const razorpay = getRazorpay();

    const options = {
      amount: Math.round(parsedAmount),
      currency: currency || 'INR',
      receipt: receipt || (orderId ? `receipt_${orderId}_${Date.now()}` : `receipt_${Date.now()}`)
    };

    if (orderId) {
      options.notes = {
        orderId: String(orderId)
      };
    }

    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create(options);
    } catch (razorpayErr) {
      console.error('[Razorpay API Error]:', razorpayErr);
      // Handle authentication failures (return 401)
      if (
        razorpayErr.statusCode === 401 ||
        razorpayErr.status === 401 ||
        (razorpayErr.error && razorpayErr.error.code === 'BAD_REQUEST_ERROR' && String(razorpayErr.error.description).toLowerCase().includes('auth'))
      ) {
        return res.status(401).json({
          success: false,
          message: 'Razorpay authentication failed. Invalid API credentials.'
        });
      }

      // Handle Razorpay API errors (return 500)
      return res.status(500).json({
        success: false,
        message: razorpayErr.error?.description || razorpayErr.description || razorpayErr.message || 'Razorpay order creation failed.'
      });
    }

    // If an existing mess orderId was provided, attach payment order info to the local order
    if (orderId) {
      try {
        await orderService.updatePaymentInfo(orderId, {
          razorpayOrderId: razorpayOrder.id,
          amount: razorpayOrder.amount
        });
      } catch (dbErr) {
        console.warn('[Razorpay] Could not update payment info on local order:', dbErr.message);
      }
    }

    // Return format required by Razorpay Standard Web Checkout:
    // { order_id, amount, currency }
    return res.status(200).json({
      success: true,
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      // Backward compatibility aliases
      id: razorpayOrder.id,
      razorpayOrderId: razorpayOrder.id,
      receipt: razorpayOrder.receipt,
      keyId: process.env.RAZORPAY_KEY_ID,
      data: {
        order_id: razorpayOrder.id,
        id: razorpayOrder.id,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/verify-payment or /api/payments/verify
 * Verifies Razorpay payment signature using HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET).
 */
exports.verifyPayment = async (req, res, next) => {
  try {
    const order_id = req.body.razorpay_order_id || req.body.order_id || req.body.razorpayOrderId;
    const payment_id = req.body.razorpay_payment_id || req.body.payment_id || req.body.razorpayPaymentId;
    const razorpay_signature = req.body.razorpay_signature || req.body.signature || req.body.razorpaySignature;
    const orderId = req.body.orderId;

    // Missing fields: return 400
    if (!order_id || !payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment verification fields: order_id, payment_id, and razorpay_signature are required.'
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay secret key is not configured on the server.'
      });
    }

    // Verify HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const payload = `${order_id}|${payment_id}`;
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    // Signature mismatch: return 400, do NOT mark as paid
    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Verification failed.'
      });
    }

    // Payment verified: update local order if orderId provided
    if (orderId) {
      try {
        await orderService.updatePaymentInfo(orderId, {
          paymentId: payment_id,
          paymentStatus: 'Paid'
        });
        await orderService.updateOrderStatus(orderId, 'Confirmed');
      } catch (dbErr) {
        console.warn('[Razorpay] Could not update order in database:', dbErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully.',
      order_id,
      payment_id,
      data: {
        orderId: orderId || null,
        paymentStatus: 'Paid',
        orderStatus: 'Confirmed'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/payments/config — Return the Razorpay key ID (safe to expose, never secret)
 */
exports.getPaymentConfig = (req, res) => {
  return res.status(200).json({
    success: true,
    keyId: process.env.RAZORPAY_KEY_ID || null,
    configured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
  });
};

