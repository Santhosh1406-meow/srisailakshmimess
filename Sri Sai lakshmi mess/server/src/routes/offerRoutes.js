const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public routes
router.get('/', offerController.getActiveOffers);
router.post('/validate', offerController.validateOfferCode);

// Admin-only routes
router.get('/all', protect, adminOnly, offerController.getAllOffers);
router.post('/', protect, adminOnly, offerController.createOffer);
router.put('/:id', protect, adminOnly, offerController.updateOffer);
router.delete('/:id', protect, adminOnly, offerController.deleteOffer);

module.exports = router;
