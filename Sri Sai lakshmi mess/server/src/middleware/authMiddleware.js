const jwt = require('jsonwebtoken');
const { jwtSecret: JWT_SECRET } = require('../config');

/**
 * Middleware: Verifies the JWT Authorization Bearer token.
 * Attaches decoded user payload to req.user.
 */
exports.protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];


  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, role, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token. Please log in again.' });
  }
};

/**
 * Middleware: Optional auth — attaches user if token present, otherwise continues.
 */
exports.optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (_) {
      req.user = null;
    }
  }
  next();
};

/**
 * Middleware: Admin access check — requires req.user.role === 'admin'
 */
exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
  }
  next();
};
