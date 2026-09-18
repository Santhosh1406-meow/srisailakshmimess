const fs = require('fs');
const path = require('path');
const User = require('../models/User');

const DATA_DIR = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

/**
 * User Service with Local File Persistence
 */
class UserService {
  constructor() {
    this.users = [];
    this._initStorage();
  }

  async _initStorage() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(USERS_FILE)) {
        const raw = fs.readFileSync(USERS_FILE, 'utf-8');
        const parsed = JSON.parse(raw || '[]');
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.users = parsed.map((u) => new User(u));
          // Ensure default admin exists
          const hasAdmin = this.users.some((u) => u.role === 'admin');
          if (!hasAdmin) {
            await this._seedAdmin();
          }
          return;
        }
      }
      // First-time setup: seed only the mess administrator
      await this._seedAdmin();
    } catch (err) {
      console.warn('[UserService] Could not load persisted users:', err.message);
      await this._seedAdmin();
    }
  }

  async _seedAdmin() {
    try {
      const adminHash = await User.hashPassword('admin123');
      const adminUser = new User({
        id: 'USR-ADMIN-001',
        name: 'Mess Manager (Admin)',
        email: 'admin@srisailakshmimess.com',
        phone: '9876543210',
        passwordHash: adminHash,
        role: 'admin'
      });
      const exists = this.users.some((u) => u.email === adminUser.email);
      if (!exists) {
        this.users.unshift(adminUser);
      }
      this._persist();
    } catch (e) {
      console.error('Failed to seed admin:', e);
    }
  }

  _persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(USERS_FILE, JSON.stringify(this.users, null, 2), 'utf-8');
    } catch (err) {
      console.error('[UserService] Failed to persist users to file:', err.message);
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
    this._persist();
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
    this._persist();
    return user.toPublic();
  }

  async incrementDeliveries(userId) {
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      user.totalDeliveries += 1;
      this._persist();
    }
  }

  async updateDeliveryPartner(id, { name, phone, vehicleNumber, isAvailable }) {
    const user = this.users.find((u) => u.id === id && u.role === 'delivery');
    if (!user) return null;
    if (name !== undefined) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (vehicleNumber !== undefined) user.vehicleNumber = vehicleNumber.trim();
    if (isAvailable !== undefined) user.isAvailable = Boolean(isAvailable);
    this._persist();
    return user.toPublic();
  }

  async deleteDeliveryPartner(id) {
    const idx = this.users.findIndex((u) => u.id === id && u.role === 'delivery');
    if (idx === -1) return false;
    this.users.splice(idx, 1);
    this._persist();
    return true;
  }

  async getAllCustomers() {
    return this.users.filter((u) => u.role === 'customer').map((u) => u.toPublic());
  }
}

module.exports = new UserService();
