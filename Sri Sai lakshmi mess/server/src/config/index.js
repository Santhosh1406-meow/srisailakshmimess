require('dotenv').config();

const parseClientUrls = () => {
  const raw = process.env.CLIENT_URL || 'http://localhost:5173,http://localhost:3000';
  return raw.split(',').map((url) => url.trim()).filter(Boolean);
};

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins: parseClientUrls(),
  databaseUrl: process.env.DATABASE_URL || '',
  restaurantInfo: {
    name: 'Sri Sai Lakshmi Mess',
    tagline: 'Authentic Taste • Homely Food • Happy Moments',
    phone: process.env.RESTAURANT_PHONE || '+91 63830 34188',
    email: process.env.RESTAURANT_EMAIL || 'santhoshs14277@gmail.com',
    address: process.env.RESTAURANT_ADDRESS || 'Rathanavillas bustop, Sivakasi-626123',
    openingHours: 'Monday - Sunday: 7:00 AM - 10:00 PM'
  }
};
