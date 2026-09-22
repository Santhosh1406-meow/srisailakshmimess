const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { validateOrderInput } = require('../middleware/validator');
const { orderLimiter } = require('../middleware/rateLimiter');
const { protect, optionalAuth, adminOnly } = require('../middleware/authMiddleware');

// POST /api/orders — Submit new order enquiry (optionally linked to logged-in user)
router.post('/', orderLimiter, optionalAuth, validateOrderInput, orderController.createOrder);

// GET /api/orders — Get all orders (Admin or authorized user)
router.get('/', protect, adminOnly, orderController.getOrders);

// GET /api/orders/stats — Get dashboard aggregate stats (Admin)
router.get('/stats', protect, adminOnly, orderController.getAdminStats);

// GET /api/orders/track?phone=xxx or ?orderId=xxx — Public order tracking
router.get('/track', orderController.trackOrder);

// GET /api/orders/my — Get orders for the logged-in user
router.get('/my', protect, orderController.getMyOrders);

// PATCH /api/orders/:id/status — Admin update order status
router.patch('/:id/status', protect, adminOnly, orderController.updateOrderStatus);


// GET /api/orders/:id — Get single order by ID
router.get('/:id', orderController.getOrderById);

module.exports = router;

