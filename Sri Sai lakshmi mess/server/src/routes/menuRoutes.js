const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

router.get('/categories', menuController.getCategories);
router.get('/', menuController.getMenu);
router.get('/:id', menuController.getMenuItemById);

module.exports = router;
