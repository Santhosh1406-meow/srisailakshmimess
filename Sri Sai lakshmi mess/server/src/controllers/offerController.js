const offerService = require('../services/offerService');

/**
 * GET /api/offers — Public: Get currently active offers
 */
exports.getActiveOffers = async (req, res, next) => {
  try {
    const offers = await offerService.getActiveOffers();
    return res.status(200).json({ success: true, count: offers.length, data: offers });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/offers/all — Admin: Get all offers (including inactive/expired)
 */
exports.getAllOffers = async (req, res, next) => {
  try {
    const offers = await offerService.getAllOffers();
    return res.status(200).json({ success: true, count: offers.length, data: offers });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/offers/validate — Public: Validate a coupon code
 */
exports.validateOfferCode = async (req, res, next) => {
  try {
    const { code, orderAmount } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required.' });
    }
    const result = await offerService.validateOfferCode(code, Number(orderAmount) || 0);
    return res.status(result.valid ? 200 : 400).json({ success: result.valid, ...result });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/offers — Admin: Create a new offer
 */
exports.createOffer = async (req, res, next) => {
  try {
    const { title, description, code, discountType, discountValue, minOrderAmount, validFrom, validTo, isActive, imageUrl } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Offer title is required.' });
    }
    if (!discountValue || isNaN(Number(discountValue))) {
      return res.status(400).json({ success: false, message: 'A valid discount value is required.' });
    }
    const offer = await offerService.addOffer({
      title,
      description,
      code,
      discountType: discountType || 'percent',
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount) || 0,
      validFrom: validFrom || null,
      validTo: validTo || null,
      isActive: isActive !== false,
      imageUrl: imageUrl || ''
    });
    return res.status(201).json({ success: true, message: 'Offer created successfully.', data: offer });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/offers/:id — Admin: Update an existing offer
 */
exports.updateOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await offerService.updateOffer(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }
    return res.status(200).json({ success: true, message: 'Offer updated successfully.', data: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/offers/:id — Admin: Delete an offer
 */
exports.deleteOffer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await offerService.deleteOffer(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }
    return res.status(200).json({ success: true, message: 'Offer deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
