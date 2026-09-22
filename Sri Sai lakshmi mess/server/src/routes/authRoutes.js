const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login
router.post('/login', authController.login);

// GET /api/auth/me  (requires token)
router.get('/me', protect, authController.getMe);

// GET /api/auth/customers — Admin: list all registered customers
router.get('/customers', protect, adminOnly, authController.getCustomers);

module.exports = router;
