const menuService = require('../services/menuService');

exports.getMenu = async (req, res, next) => {
  try {
    const { category, search, popular } = req.query;
    const items = await menuService.getAllMenuItems({
      category,
      search,
      isPopular: popular
    });

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

exports.getMenuItemById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await menuService.getMenuItemById(id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: `Dish with ID '${id}' not found`
      });
    }

    return res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await menuService.getCategories();
    return res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/menu — Admin: Create a new menu item
 */
exports.createMenuItem = async (req, res, next) => {
  try {
    const { name, tamilName, description, category, price, image, isVegetarian, isAvailable, isPopular, rating, portion } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Dish name is required.' });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Category is required.' });
    }
    if (price === undefined || isNaN(Number(price))) {
      return res.status(400).json({ success: false, message: 'A valid price is required.' });
    }
    const newItem = await menuService.addMenuItem({
      name: name.trim(),
      tamilName: tamilName || '',
      description: description || '',
      category: category.trim(),
      price: Number(price),
      image: image || '',
      isVegetarian: isVegetarian !== false,
      isAvailable: isAvailable !== false,
      isPopular: Boolean(isPopular),
      rating: Number(rating) || 4.5,
      portion: portion || 'Standard'
    });
    return res.status(201).json({ success: true, message: 'Menu item added successfully.', data: newItem });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/menu/:id — Admin: Update an existing menu item
 */
exports.updateMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await menuService.updateMenuItem(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: `Menu item '${id}' not found.` });
    }
    return res.status(200).json({ success: true, message: 'Menu item updated successfully.', data: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/menu/:id — Admin: Delete a menu item
 */
exports.deleteMenuItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await menuService.deleteMenuItem(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: `Menu item '${id}' not found.` });
    }
    return res.status(200).json({ success: true, message: 'Menu item deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
