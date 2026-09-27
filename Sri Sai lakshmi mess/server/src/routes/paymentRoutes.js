const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// GET /api/payments/config — Get Razorpay key ID
router.get('/config', paymentController.getPaymentConfig);

// POST /api/payments/create-order — Create Razorpay order for an existing mess order
router.post('/create-order', paymentController.createPaymentOrder);

// POST /api/payments/verify & /api/payments/verify-payment — Verify Razorpay payment signature
router.post('/verify', paymentController.verifyPayment);
router.post('/verify-payment', paymentController.verifyPayment);

module.exports = router;
