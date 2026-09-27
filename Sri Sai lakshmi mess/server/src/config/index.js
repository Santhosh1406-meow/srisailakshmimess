const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
require('dotenv').config();

const parseClientUrls = () => {
  const raw = process.env.CLIENT_URL || 'http://localhost:5173,http://localhost:3000';
  return raw.split(',').map((url) => url.trim()).filter(Boolean);
};

const NEON_DATABASE_URL = 'postgresql://neondb_owner:npg_Its9KJe0yiDS@ep-aged-frost-b3oiwfi2-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins: parseClientUrls(),
  databaseUrl: process.env.DATABASE_URL || NEON_DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'srilakshmi_mess_secret_dev_2024',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_Th84zfuhLcZDnL',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || 'gW4XpGu4Yt26N68QLsi5kDWF',
  restaurantInfo: {
    name: 'Sri Sai Lakshmi Mess',
    tagline: 'Authentic Taste • Homely Food • Happy Moments',
    phone: process.env.RESTAURANT_PHONE || '+91 63830 34188',
    email: process.env.RESTAURANT_EMAIL || 'santhoshs14277@gmail.com',
    address: process.env.RESTAURANT_ADDRESS || 'Rathanavillas bustop, Sivakasi-626123',
    openingHours: 'Monday - Sunday: 7:00 AM - 10:00 PM'
  }
};

