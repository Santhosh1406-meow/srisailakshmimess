const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const { apiLimiter } = require('./middleware/rateLimiter');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const healthRoutes = require('./routes/healthRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const deliveryRoutes = require('./routes/deliveryRoutes');
const offerRoutes = require('./routes/offerRoutes');

const app = express();

// Security Headers
app.use(helmet());

// Cross-Origin Resource Sharing
const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    // In development or if origin matches config
    if (config.nodeEnv === 'development' || config.corsOrigins.includes(origin) || config.corsOrigins.includes('*')) {
      return callback(null, true);
    }

    // Check if origin matches netlify subdomains or localhost
    if (origin.endsWith('.netlify.app') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }

    return callback(null, true); // Permissive for easy testing and hosting, can be restricted via CLIENT_URL
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
}

// Body parsing with limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Apply General Rate Limiter to all API endpoints
app.use('/api', apiLimiter);

// Root Welcome Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Sri Sai Lakshmi Mess - REST API',
    tagline: 'Authentic Taste • Homely Food • Happy Moments',
    version: '2.0.0',
    documentation: {
      health: 'GET /api/health',
      menu: 'GET /api/menu',
      dishById: 'GET /api/menu/:id',
      menuCategories: 'GET /api/menu/categories',
      submitOrderEnquiry: 'POST /api/orders',
      trackOrder: 'GET /api/orders/track?phone=xxx or ?orderId=xxx',
      myOrders: 'GET /api/orders/my (requires auth)',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      me: 'GET /api/auth/me (requires auth)',
      paymentConfig: 'GET /api/payments/config',
      createPaymentOrder: 'POST /api/payments/create-order',
      verifyPayment: 'POST /api/payments/verify'
    }
  });
});

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/offers', offerRoutes);

// 404 and Centralized Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
