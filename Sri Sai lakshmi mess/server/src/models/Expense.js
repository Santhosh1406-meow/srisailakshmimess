/**
 * Expense Model Definition
 * Tracks operational costs, ingredient procurement, utilities, staff wages, etc.
 */

class Expense {
  constructor({
    id,
    title,
    category = 'Raw Materials', // 'Raw Materials' | 'Utilities & LPG' | 'Staff Wages' | 'Packaging' | 'Rent & Maintenance' | 'Marketing' | 'Other'
    amount = 0,
    date = new Date().toISOString().split('T')[0],
    notes = '',
    paymentMethod = 'Cash', // 'Cash' | 'UPI' | 'Bank Transfer'
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString()
  }) {
    this.id = id || `EXP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    this.title = (title || '').trim();
    this.category = category;
    this.amount = Math.max(0, Number(amount) || 0);
    this.date = date;
    this.notes = (notes || '').trim();
    this.paymentMethod = paymentMethod;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

module.exports = Expense;
