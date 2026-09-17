const User = require('../models/User');

/**
 * User Service — in-memory store (swap for DB repository in production)
 */
class UserService {
  constructor() {
    this.users = [];
    this._seedUsers();
  }

  async _seedUsers() {
    try {
      // Seed Admin
      const adminHash = await User.hashPassword('admin123');
      this.users.push(new User({
        id: 'USR-ADMIN-001',
        name: 'Mess Manager (Admin)',
        email: 'admin@srisailakshmimess.com',
        phone: '9876543210',
        passwordHash: adminHash,
        role: 'admin'
      }));

      // Seed Delivery Partners
      const deliveryHash = await User.hashPassword('delivery123');
      this.users.push(new User({
        id: 'USR-DEL-001',
        name: 'Murugan (Delivery)',
        email: 'delivery@srisailakshmimess.com',
        phone: '9444012345',
        passwordHash: deliveryHash,
        role: 'delivery',
        vehicleNumber: 'TN59 AB 1234',
        isAvailable: true,
        totalDeliveries: 42
      }));
      this.users.push(new User({
        id: 'USR-DEL-002',
        name: 'Selvam (Delivery)',
        email: 'selvam@srisailakshmimess.com',
        phone: '9600098765',
        passwordHash: deliveryHash,
        role: 'delivery',
        vehicleNumber: 'TN59 CD 5678',
        isAvailable: false,
        totalDeliveries: 18
      }));

      // Seed Demo Customer
      const customerHash = await User.hashPassword('customer123');
      this.users.push(new User({
        id: 'USR-CUST-001',
        name: 'Karthik Raja',
        email: 'customer@srisailakshmimess.com',
        phone: '9840123456',
        passwordHash: customerHash,
        role: 'customer'
      }));
    } catch (e) {
      console.error('Failed to seed users:', e);
    }
  }

  async register({ name, email, phone, password, role = 'customer', vehicleNumber = null }) {
    const existing = this.users.find((u) => u.email === email.trim().toLowerCase());
    if (existing) {
      const err = new Error('An account with this email already exists.');
      err.statusCode = 409;
      throw err;
    }
    const passwordHash = await User.hashPassword(password);
    const newUser = new User({ name, email, phone, passwordHash, role, vehicleNumber });
    this.users.push(newUser);
    return newUser;
  }

  async findByEmail(email) {
    return this.users.find((u) => u.email === email.trim().toLowerCase()) || null;
  }

  async findById(id) {
    return this.users.find((u) => u.id === id) || null;
  }

  async getAllUsers() {
    return this.users.map((u) => u.toPublic());
  }

  async getAllDeliveryPartners() {
    return this.users.filter((u) => u.role === 'delivery').map((u) => u.toPublic());
  }

  async updateAvailability(userId, isAvailable) {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return null;
    user.isAvailable = isAvailable;
    return user.toPublic();
  }

  async incrementDeliveries(userId) {
    const user = this.users.find((u) => u.id === userId);
    if (user) user.totalDeliveries += 1;
  }
}

module.exports = new UserService();
