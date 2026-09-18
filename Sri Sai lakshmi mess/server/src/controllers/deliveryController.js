const orderService = require('../services/orderService');
const userService = require('../services/userService');

/**
 * GET /api/delivery/orders
 * Returns available delivery orders + this partner's active/assigned orders
 */
exports.getDeliveryOrders = async (req, res, next) => {
  try {
    const partnerId = req.user.id;
    const orders = await orderService.getOrdersForDeliveryPartner(partnerId);
    return res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/delivery/available
 * All unassigned Ready delivery orders (public to any delivery partner)
 */
exports.getAvailableOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getAvailableDeliveryOrders();
    return res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/delivery/orders/:id/accept
 * Delivery partner accepts / claims an order
 */
exports.acceptOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const partner = await userService.findById(req.user.id);
    if (!partner) return res.status(404).json({ success: false, message: 'Partner not found.' });
    if (!partner.isAvailable) {
      return res.status(400).json({ success: false, message: 'Set your status to Online before accepting orders.' });
    }

    const order = await orderService.acceptOrder(id, partner.id, partner.name, partner.phone);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or already taken by another partner.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Order accepted! Head to the restaurant to pick it up.',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/delivery/orders/:id/delivered
 * Delivery partner marks order as delivered
 */
exports.markDelivered = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await orderService.markDelivered(id, req.user.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or not assigned to you.' });
    }
    // Increment partner delivery count
    await userService.incrementDeliveries(req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Great job! Order marked as delivered.',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/delivery/availability
 * Toggle delivery partner online/offline availability
 */
exports.toggleAvailability = async (req, res, next) => {
  try {
    const { isAvailable } = req.body;
    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isAvailable must be a boolean.' });
    }
    const updated = await userService.updateAvailability(req.user.id, isAvailable);
    return res.status(200).json({
      success: true,
      message: `You are now ${isAvailable ? 'Online 🟢' : 'Offline 🔴'}.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/delivery/partners — Admin: list all delivery partners
 */
exports.getAllPartners = async (req, res, next) => {
  try {
    const partners = await userService.getAllDeliveryPartners();
    return res.status(200).json({ success: true, data: partners });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/delivery/partners/:id — Admin: Edit a delivery partner's details
 */
exports.updatePartner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone, vehicleNumber, isAvailable } = req.body;
    const updated = await userService.updateDeliveryPartner(id, { name, phone, vehicleNumber, isAvailable });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Delivery partner not found.' });
    }
    return res.status(200).json({ success: true, message: 'Delivery partner updated successfully.', data: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/delivery/partners/:id — Admin: Remove a delivery partner
 */
exports.deletePartner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await userService.deleteDeliveryPartner(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Delivery partner not found.' });
    }
    return res.status(200).json({ success: true, message: 'Delivery partner removed successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/delivery/customers — Admin: list all registered customers
 */
exports.getAllCustomers = async (req, res, next) => {
  try {
    const customers = await userService.getAllCustomers();
    return res.status(200).json({ success: true, count: customers.length, data: customers });
  } catch (error) {
    next(error);
  }
};
