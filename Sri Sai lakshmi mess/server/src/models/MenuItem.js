/**
 * MenuItem Model Definition
 * Ready to be mapped to Mongoose Schema or Sequelize / Prisma Model
 */

class MenuItem {
  constructor({
    id,
    name,
    tamilName = '',
    description,
    category,
    price,
    image,
    isVegetarian = true,
    isAvailable = true,
    isPopular = false,
    rating = 4.8,
    portion = 'Standard'
  }) {
    this.id = id;
    this.name = name;
    this.tamilName = tamilName;
    this.description = description;
    this.category = category; // 'Breakfast', 'Meals', 'Beverages', 'Snacks'
    this.price = Number(price);
    this.image = image;
    this.isVegetarian = Boolean(isVegetarian);
    this.isAvailable = Boolean(isAvailable);
    this.isPopular = Boolean(isPopular);
    this.rating = Number(rating);
    this.portion = portion;
  }
}

module.exports = MenuItem;
