const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { protect, deliveryOnly, adminOnly } = require('../middleware/authMiddleware');

// All routes below require a valid JWT (protect)

// GET /api/delivery/available — Any logged-in delivery partner
router.get('/available', protect, deliveryOnly, deliveryController.getAvailableOrders);

// GET /api/delivery/orders — This partner's active + available orders
router.get('/orders', protect, deliveryOnly, deliveryController.getDeliveryOrders);

// PATCH /api/delivery/orders/:id/accept — Accept/claim an order
router.patch('/orders/:id/accept', protect, deliveryOnly, deliveryController.acceptOrder);

// PATCH /api/delivery/orders/:id/delivered — Mark as delivered
router.patch('/orders/:id/delivered', protect, deliveryOnly, deliveryController.markDelivered);

// PATCH /api/delivery/availability — Toggle online/offline
router.patch('/availability', protect, deliveryOnly, deliveryController.toggleAvailability);

// GET /api/delivery/partners — Admin: see all delivery partners
router.get('/partners', protect, adminOnly, deliveryController.getAllPartners);

module.exports = router;
