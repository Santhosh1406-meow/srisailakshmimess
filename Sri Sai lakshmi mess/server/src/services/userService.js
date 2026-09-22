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
          this.users = parsed
            .filter((u) => u.role !== 'delivery') // filter out any old delivery accounts
            .map((u) => new User(u));
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

  async register({ name, email, phone, password, role = 'customer' }) {
    const cleanEmail = email.trim().toLowerCase();

    // Only allow 'customer' and 'admin' roles
    const allowedRole = ['customer', 'admin'].includes(role) ? role : 'customer';

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
    const newUser = new User({ name, email: cleanEmail, phone, passwordHash, role: allowedRole });

    if (isDbConnected()) {
      try {
        await query(`
          INSERT INTO users (id, name, email, phone, password_hash, role, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          newUser.id,
          newUser.name,
          newUser.email,
          newUser.phone,
          newUser.passwordHash,
          newUser.role,
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
