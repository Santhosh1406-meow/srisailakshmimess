const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
require('dotenv').config();

const parseClientUrls = () => {
  const defaultOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://srisailakshmimesssvks.netlify.app'
  ];
  const raw = process.env.CLIENT_URL || '';
  const userOrigins = raw.split(',').map((url) => url.trim().replace(/\/+$/, '')).filter(Boolean);
  return Array.from(new Set([...defaultOrigins, ...userOrigins]));
};

// Validate critical env vars in production
if (process.env.NODE_ENV === 'production') {
  const required = ['DATABASE_URL', 'JWT_SECRET', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    console.error(`[Config] FATAL: Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins: parseClientUrls(),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || (process.env.NODE_ENV !== 'production' ? 'srilakshmi_mess_secret_dev_2024' : null),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  googleClientId: process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
  restaurantInfo: {
    name: 'Sri Sai Lakshmi Mess',
    tagline: 'Authentic Taste • Homely Food • Happy Moments',
    phone: process.env.RESTAURANT_PHONE || '+91 63830 34188',
    email: process.env.RESTAURANT_EMAIL || 'santhoshs14277@gmail.com',
    address: process.env.RESTAURANT_ADDRESS || 'Rathanavillas bustop, Sivakasi-626123',
    openingHours: 'Monday - Sunday: 7:00 AM - 10:00 PM'
  }
};
