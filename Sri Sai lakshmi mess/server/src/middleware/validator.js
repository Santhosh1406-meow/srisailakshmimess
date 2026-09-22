/**
 * Request Validation Middleware for Order / Enquiry form
 */

// Sivakasi postal codes and locality keywords
const SIVAKASI_PINCODES = ['626123', '626124', '626130', '626189', '626128'];
const SIVAKASI_LOCALITIES = [
  'sivakasi', 'thiruthangal', 'satchiyapuram', 'vilampatti', 'paraipatti',
  'viswanatham', 'anaiyur', 'meenampatti', 'palayampatti', 'chinnakamanpatti',
  'maraneri', 'pappakudi', 'reserve line', 'housing board', 'ngo colony',
  'rathanavillas', 'coronation', 'badrakali', 'velayutham', 'bus stand'
];

const OTHER_CITIES = [
  'madurai', 'chennai', 'coimbatore', 'bangalore', 'bengaluru', 'trichy',
  'tiruchirappalli', 'salem', 'tirunelveli', 'dindigul', 'erode', 'tiruppur',
  'virudhunagar', 'rajapalayam', 'srivilliputhur', 'sattur', 'kovilpatti'
];

exports.validateOrderInput = (req, res, next) => {
  // If cart items array is provided, auto-populate foodItem and quantity if missing
  if (Array.isArray(req.body.items) && req.body.items.length > 0) {
    if (!req.body.foodItem) {
      req.body.foodItem = req.body.items.map((i) => `${i.name} (x${i.quantity})`).join(', ');
    }
    if (!req.body.quantity) {
      req.body.quantity = req.body.items.reduce((sum, i) => sum + (Number(i.quantity) || 1), 0);
    }
    if (!req.body.preferredDate) {
      req.body.preferredDate = new Date().toISOString().split('T')[0];
    }
    if (!req.body.preferredTime) {
      req.body.preferredTime = 'Immediate (30-45 mins)';
    }
  }

  if (!req.body.preferredDate) {
    req.body.preferredDate = new Date().toISOString().split('T')[0];
  }
  if (!req.body.preferredTime) {
    req.body.preferredTime = 'Immediate (30-45 mins)';
  }

  const {
    customerName,
    phone,
    email,
    foodItem,
    quantity,
    preferredDate,
    preferredTime,
    orderType,
    deliveryAddress
  } = req.body;

  const errors = [];

  if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
    errors.push('Customer name is required and must be at least 2 characters.');
  }

  // 10-digit Indian Mobile Number validation (starts with 6, 7, 8, 9)
  const rawPhone = String(phone || '').replace(/\s+/g, '').replace(/[-()+]/g, '');
  let normalizedPhone = rawPhone;
  if (normalizedPhone.startsWith('91') && normalizedPhone.length === 12) {
    normalizedPhone = normalizedPhone.slice(2);
  } else if (normalizedPhone.startsWith('0') && normalizedPhone.length === 11) {
    normalizedPhone = normalizedPhone.slice(1);
  }

  const indianMobileRegex = /^[6-9]\d{9}$/;
  if (!indianMobileRegex.test(normalizedPhone)) {
    errors.push('Mobile number must be a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
  } else {
    // Save sanitized 10-digit number back to request body
    req.body.phone = normalizedPhone;
  }

  if (email && email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('Please provide a valid email address or leave it blank.');
    }
  }

  // Strict Sivakasi-only delivery validation
  if (orderType === 'delivery') {
    if (!deliveryAddress || typeof deliveryAddress !== 'string' || deliveryAddress.trim().length < 5) {
      errors.push('Delivery address inside Sivakasi is required for delivery orders.');
    } else {
      const lowerAddress = deliveryAddress.toLowerCase();

      // Check if user specified a non-Sivakasi city
      const hasOtherCity = OTHER_CITIES.some((city) => {
        const regex = new RegExp(`\\b${city}\\b`, 'i');
        return regex.test(lowerAddress);
      });

      // Check if address mentions Sivakasi localities or valid Sivakasi pincodes
      const hasSivakasiPincode = SIVAKASI_PINCODES.some((pin) => lowerAddress.includes(pin));
      const hasSivakasiLocality = SIVAKASI_LOCALITIES.some((loc) => lowerAddress.includes(loc));

      if (hasOtherCity && !hasSivakasiLocality) {
        errors.push('Orders are accepted inside Sivakasi only. Delivery to other cities is currently not available.');
      } else if (!hasSivakasiPincode && !hasSivakasiLocality) {
        errors.push('Delivery is available inside Sivakasi only (Pincodes: 626123, 626124, 626130). Please provide a Sivakasi address.');
      }
    }
  }

  if (!foodItem || typeof foodItem !== 'string' || foodItem.trim().length < 2) {
    errors.push('Please select or specify the food item(s) you wish to order/enquire.');
  }

  const parsedQty = parseInt(quantity, 10);
  if (isNaN(parsedQty) || parsedQty < 1 || parsedQty > 5000) {
    errors.push('Quantity must be a valid number between 1 and 5000.');
  }

  if (!preferredDate || typeof preferredDate !== 'string') {
    errors.push('Preferred date is required.');
  }

  if (!preferredTime || typeof preferredTime !== 'string') {
    errors.push('Preferred time is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};
