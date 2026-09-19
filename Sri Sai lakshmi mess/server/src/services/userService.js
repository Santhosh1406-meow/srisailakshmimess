const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const { query, isDbConnected } = require('../config/db');

const DATA_DIR = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function rowToUser(row) {
  if (!row) return null;
  return new User({
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    passwordHash: row.password_hash,
    role: row.role,
    vehicleNumber: row.vehicle_number,
    isAvailable: row.is_available,
    totalDeliveries: Number(row.total_deliveries) || 0,
    createdAt: row.created_at
  });
}

/**
 * User Service with Neon PostgreSQL & Local File Persistence
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
        }
      }
      // Ensure default admin exists
      const hasAdmin = this.users.some((u) => u.role === 'admin');
      if (!hasAdmin) {
        await this._seedAdmin();
      }
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
    const cleanEmail = email.trim().toLowerCase();

    // Check DB first if connected
    if (isDbConnected()) {
      const existing = await query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [cleanEmail]);
      if (existing && existing.rows.length > 0) {
        const err = new Error('An account with this email already exists.');
        err.statusCode = 409;
        throw err;
      }
    } else {
      const existing = this.users.find((u) => u.email === cleanEmail);
      if (existing) {
        const err = new Error('An account with this email already exists.');
        err.statusCode = 409;
        throw err;
      }
    }

    const passwordHash = await User.hashPassword(password);
    const newUser = new User({ name, email: cleanEmail, phone, passwordHash, role, vehicleNumber });

    if (isDbConnected()) {
      try {
        await query(`
          INSERT INTO users (id, name, email, phone, password_hash, role, vehicle_number, is_available, total_deliveries, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
          newUser.id,
          newUser.name,
          newUser.email,
          newUser.phone,
          newUser.passwordHash,
          newUser.role,
          newUser.vehicleNumber,
          newUser.isAvailable,
          newUser.totalDeliveries,
          newUser.createdAt,
          new Date()
        ]);
      } catch (dbErr) {
        console.error('[UserService] Failed to insert into Neon DB:', dbErr.message);
      }
    }

    this.users.push(newUser);
    this._persist();
    return newUser;
  }

  async findByEmail(email) {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (isDbConnected()) {
      try {
        const res = await query('SELECT * FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1', [cleanEmail]);
        if (res && res.rows.length > 0) {
          return rowToUser(res.rows[0]);
        }
      } catch (err) {
        console.error('[UserService] Error querying user by email:', err.message);
      }
    }
    return this.users.find((u) => u.email === cleanEmail) || null;
  }

  async findById(id) {
    if (isDbConnected()) {
      try {
        const res = await query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
        if (res && res.rows.length > 0) {
          return rowToUser(res.rows[0]);
        }
      } catch (err) {
        console.error('[UserService] Error querying user by id:', err.message);
      }
    }
    return this.users.find((u) => u.id === id) || null;
  }

  async getAllUsers() {
    if (isDbConnected()) {
      try {
        const res = await query('SELECT * FROM users ORDER BY created_at DESC');
        if (res && res.rows) {
          return res.rows.map(rowToUser).map((u) => u.toPublic());
        }
      } catch (err) {
        console.error('[UserService] Error fetching users from DB:', err.message);
      }
    }
    return this.users.map((u) => u.toPublic());
  }

  async getAllDeliveryPartners() {
    if (isDbConnected()) {
      try {
        const res = await query("SELECT * FROM users WHERE role = 'delivery' ORDER BY created_at DESC");
        if (res && res.rows) {
          return res.rows.map(rowToUser).map((u) => u.toPublic());
        }
      } catch (err) {
        console.error('[UserService] Error fetching delivery partners from DB:', err.message);
      }
    }
    return this.users.filter((u) => u.role === 'delivery').map((u) => u.toPublic());
  }

  async updateAvailability(userId, isAvailable) {
    if (isDbConnected()) {
      try {
        await query('UPDATE users SET is_available = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [Boolean(isAvailable), userId]);
      } catch (err) {
        console.error('[UserService] Error updating availability in DB:', err.message);
      }
    }
    const user = this.users.find((u) => u.id === userId);
    if (!user) return null;
    user.isAvailable = isAvailable;
    this._persist();
    return user.toPublic();
  }

  async incrementDeliveries(userId) {
    if (isDbConnected()) {
      try {
        await query('UPDATE users SET total_deliveries = total_deliveries + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1', [userId]);
      } catch (err) {
        console.error('[UserService] Error incrementing deliveries in DB:', err.message);
      }
    }
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      user.totalDeliveries += 1;
      this._persist();
    }
  }

  async updateDeliveryPartner(id, { name, phone, vehicleNumber, isAvailable }) {
    if (isDbConnected()) {
      try {
        const fields = [];
        const vals = [];
        let idx = 1;
        if (name !== undefined) { fields.push(`name = $${idx++}`); vals.push(name.trim()); }
        if (phone !== undefined) { fields.push(`phone = $${idx++}`); vals.push(phone.trim()); }
        if (vehicleNumber !== undefined) { fields.push(`vehicle_number = $${idx++}`); vals.push(vehicleNumber.trim()); }
        if (isAvailable !== undefined) { fields.push(`is_available = $${idx++}`); vals.push(Boolean(isAvailable)); }
        if (fields.length > 0) {
          fields.push(`updated_at = CURRENT_TIMESTAMP`);
          vals.push(id);
          await query(`UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} AND role = 'delivery'`, vals);
        }
      } catch (err) {
        console.error('[UserService] Error updating delivery partner in DB:', err.message);
      }
    }

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
    if (isDbConnected()) {
      try {
        await query("DELETE FROM users WHERE id = $1 AND role = 'delivery'", [id]);
      } catch (err) {
        console.error('[UserService] Error deleting delivery partner in DB:', err.message);
      }
    }

    const idx = this.users.findIndex((u) => u.id === id && u.role === 'delivery');
    if (idx === -1) return false;
    this.users.splice(idx, 1);
    this._persist();
    return true;
  }

  async getAllCustomers() {
    if (isDbConnected()) {
      try {
        const res = await query("SELECT * FROM users WHERE role = 'customer' ORDER BY created_at DESC");
        if (res && res.rows) {
          return res.rows.map(rowToUser).map((u) => u.toPublic());
        }
      } catch (err) {
        console.error('[UserService] Error fetching customers in DB:', err.message);
      }
    }
    return this.users.filter((u) => u.role === 'customer').map((u) => u.toPublic());
  }
}

module.exports = new UserService();

