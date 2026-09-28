const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const healthRoutes = require('./routes/healthRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const paymentController = require('./controllers/paymentController');
const offerRoutes = require('./routes/offerRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

// Security Headers
app.use(helmet());

// Cross-Origin Resource Sharing
const corsOptions = {
  origin: function (origin, callback) {
    // Allow server-to-server, curl, Postman, or proxy requests (no origin header)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/+$/, '').toLowerCase();

    // Always allow in development
    if (config.nodeEnv === 'development') {
      return callback(null, true);
    }

    // Always allow localhost
    if (/^https?:\/\/localhost(:\d+)?$/.test(cleanOrigin) || /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(cleanOrigin)) {
      return callback(null, true);
    }

    // Always allow any Netlify domain (including branch and preview deploys)
    if (cleanOrigin.endsWith('.netlify.app')) {
      return callback(null, true);
    }

    // Always allow Render domains
    if (cleanOrigin.endsWith('.onrender.com')) {
      return callback(null, true);
    }

    // Match against explicitly configured origins (case-insensitive & trailing-slash safe)
    const isAllowed = config.corsOrigins.some((allowed) => {
      const cleanAllowed = (allowed || '').replace(/\/+$/, '').toLowerCase();
      return cleanOrigin === cleanAllowed;
    });

    if (isAllowed) {
      return callback(null, true);
    }

    // Gracefully deny origin without throwing a 500 Internal Server Error
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
};
app.use(cors(corsOptions));

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
}

// Body parsing with limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Register auth routes before the remaining API routes.
app.use('/api/auth', authRoutes);

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
app.use('/api/payments', paymentRoutes);
app.post('/api/create-order', paymentController.createPaymentOrder);
app.post('/api/verify-payment', paymentController.verifyPayment);
app.use('/api/offers', offerRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 and Centralized Error Handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
