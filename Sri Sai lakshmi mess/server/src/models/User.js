/**
 * User Model Definition
 * Supports bcryptjs password hashing
 * Roles: 'customer' | 'admin'
 */
const bcrypt = require('bcryptjs');

class User {
  constructor({
    id,
    name,
    email,
    phone,
    passwordHash,
    role = 'customer',
    createdAt = new Date().toISOString()
  }) {
    this.id = id || `USR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    this.name = name.trim();
    this.email = email.trim().toLowerCase();
    this.phone = phone ? phone.trim() : '';
    this.passwordHash = passwordHash;
    this.role = role; // 'customer' | 'admin'
    this.createdAt = createdAt;
  }

  static async hashPassword(plainPassword) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(plainPassword, salt);
  }

  async verifyPassword(plainPassword) {
    return bcrypt.compare(plainPassword, this.passwordHash);
  }

  toPublic() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      role: this.role,
      createdAt: this.createdAt
    };
  }
}

module.exports = User;
