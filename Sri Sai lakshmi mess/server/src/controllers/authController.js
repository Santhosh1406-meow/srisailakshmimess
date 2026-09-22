const jwt = require('jsonwebtoken');
const userService = require('../services/userService');

const JWT_SECRET = process.env.JWT_SECRET || 'srilakshmi_mess_secret_2024_change_in_prod';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

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

    // 10-digit Indian Mobile Number validation
    let normalizedPhone = '';
    if (phone) {
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
