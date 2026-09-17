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
