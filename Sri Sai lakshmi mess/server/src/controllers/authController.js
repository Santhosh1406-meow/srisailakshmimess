const jwt = require('jsonwebtoken');
const userService = require('../services/userService');
const googleAuthService = require('../services/googleAuthService');
const { jwtSecret: JWT_SECRET, jwtExpiresIn: JWT_EXPIRES_IN } = require('../config');

/**
 * Generate a signed JWT for a user
 */
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * POST /api/auth/register
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    const errors = [];
    if (!name || name.trim().length < 2) errors.push('Full name must be at least 2 characters.');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.push('Valid email address is required.');
    if (!password || password.length < 6) errors.push('Password must be at least 6 characters.');

    // 10-digit Indian Mobile Number validation (optional if left blank)
    let normalizedPhone = '';
    if (phone && String(phone).trim() !== '') {
      const rawPhone = String(phone).replace(/\s+/g, '').replace(/[-()+]/g, '');
      normalizedPhone = rawPhone;
      if (normalizedPhone.startsWith('91') && normalizedPhone.length === 12) {
        normalizedPhone = normalizedPhone.slice(2);
      } else if (normalizedPhone.startsWith('0') && normalizedPhone.length === 11) {
        normalizedPhone = normalizedPhone.slice(1);
      }
      if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
        errors.push('Mobile number must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const user = await userService.register({ name, email, phone: normalizedPhone || phone, password });
    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to Sri Sai Lakshmi Mess.',
      token,
      user: user.toPublic()
    });
  } catch (error) {
    if (error.statusCode === 409) {
      return res.status(409).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await userService.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isValid = await user.verifyPassword(password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: user.toPublic()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/google
 * Google OAuth: handles login & sign up automatically with verified Google ID token
 */
exports.googleLogin = async (req, res, next) => {
  try {
    const { credential, token } = req.body;
    const idToken = credential || token;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'Google credential / ID token is required.'
      });
    }

    const googlePayload = await googleAuthService.verifyGoogleToken(idToken);
    if (!googlePayload || !googlePayload.email) {
      return res.status(401).json({
        success: false,
        message: 'Could not verify Google account details.'
      });
    }

    // Find or create customer account with Google identity
    const user = await userService.findOrCreateGoogleUser({
      googleId: googlePayload.googleId,
      email: googlePayload.email,
      name: googlePayload.name,
      avatar: googlePayload.avatar
    });

    const jwtToken = generateToken(user);

    return res.status(200).json({
      success: true,
      message: `Welcome to Sri Sai Lakshmi Mess, ${user.name}!`,
      token: jwtToken,
      user: user.toPublic()
    });
  } catch (error) {
    console.error('[AuthController] Google auth error:', error.message);
    return res.status(401).json({
      success: false,
      message: error.message || 'Google authentication failed. Please try again.'
    });
  }
};

/**
 * GET /api/auth/me  (Protected)
 */
exports.getMe = async (req, res, next) => {
  try {
    const user = await userService.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.status(200).json({ success: true, user: user.toPublic() });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/customers (Admin only)
 * List all registered customers
 */
exports.getCustomers = async (req, res, next) => {
  try {
    const customers = await userService.getAllCustomers();
    return res.status(200).json({ success: true, count: customers.length, data: customers });
  } catch (error) {
    next(error);
  }
};
