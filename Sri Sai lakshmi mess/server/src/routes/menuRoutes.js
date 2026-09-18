const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public routes
router.get('/categories', menuController.getCategories);
router.get('/', menuController.getMenu);
router.get('/:id', menuController.getMenuItemById);

// Admin-only routes
router.post('/', protect, adminOnly, menuController.createMenuItem);
router.put('/:id', protect, adminOnly, menuController.updateMenuItem);
router.delete('/:id', protect, adminOnly, menuController.deleteMenuItem);

module.exports = router;
