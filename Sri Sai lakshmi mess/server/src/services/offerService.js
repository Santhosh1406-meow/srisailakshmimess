const fs = require('fs');
const path = require('path');
const Offer = require('../models/Offer');
const { query, isDbConnected } = require('../config/db');

const DATA_DIR = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'offers.json');

function rowToOffer(row) {
  if (!row) return null;
  return new Offer({
    id: row.id,
    title: row.title,
    description: row.description,
    code: row.code,
    discountType: row.discount_type,
    discountValue: Number(row.discount_value),
    minOrderAmount: Number(row.min_order_amount),
    validFrom: row.valid_from,
    validTo: row.valid_to,
    isActive: row.is_active,
    imageUrl: row.image_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  });
}

/**
 * Offer Service with Neon PostgreSQL & Local File Persistence
 */
class OfferService {
  constructor() {
    this.offers = [];
    this._initStorage();
  }

  async _initStorage() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw || '[]');
        if (Array.isArray(parsed)) {
          this.offers = parsed.map((o) => new Offer(o));
        }
      } else {
        this._seedDefaultOffers();
        this._persist();
      }
    } catch (err) {
      console.warn('[OfferService] Could not load persisted offers, initializing empty:', err.message);
      this.offers = [];
    }
  }

  _seedDefaultOffers() {
    this.offers = [
      new Offer({
        id: 'OFFER-WELCOME-001',
        title: 'Welcome Discount',
        description: 'Get 10% off on your first order! Use code WELCOME10 at checkout.',
        code: 'WELCOME10',
        discountType: 'percent',
        discountValue: 10,
        minOrderAmount: 100,
        validFrom: null,
        validTo: null,
        isActive: true,
        imageUrl: ''
      }),
      new Offer({
        id: 'OFFER-MEAL-002',
        title: 'Lunch Combo Deal',
        description: 'Flat ₹20 off on all meal combos above ₹150. Limited time offer!',
        code: 'LUNCH20',
        discountType: 'flat',
        discountValue: 20,
        minOrderAmount: 150,
        validFrom: null,
        validTo: null,
        isActive: true,
        imageUrl: ''
      })
    ];
  }

  _persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.offers, null, 2), 'utf-8');
    } catch (err) {
      console.error('[OfferService] Failed to persist offers:', err.message);
    }
  }

  async getAllOffers() {
    if (isDbConnected()) {
      try {
        const res = await query('SELECT * FROM offers ORDER BY created_at DESC');
        if (res && res.rows && res.rows.length > 0) {
          return res.rows.map(rowToOffer);
        }
      } catch (err) {
        console.error('[OfferService] Error fetching offers from Neon DB:', err.message);
      }
    }
    return [...this.offers];
  }

  async getActiveOffers() {
    const all = await this.getAllOffers();
    return all.filter((o) => o.isCurrentlyValid());
  }

  async getOfferById(id) {
    if (isDbConnected()) {
      try {
        const res = await query('SELECT * FROM offers WHERE id = $1 LIMIT 1', [id]);
        if (res && res.rows.length > 0) {
          return rowToOffer(res.rows[0]);
        }
      } catch (err) {
        console.error('[OfferService] Error fetching offer by id from Neon DB:', err.message);
      }
    }
    return this.offers.find((o) => o.id === id) || null;
  }

  async validateOfferCode(code, orderAmount = 0) {
    const normalized = (code || '').toUpperCase().trim();
    const activeOffers = await this.getActiveOffers();
    const offer = activeOffers.find((o) => o.code === normalized);
    if (!offer) {
      return { valid: false, message: 'Invalid or expired offer code.' };
    }
    if (orderAmount < offer.minOrderAmount) {
      return {
        valid: false,
        message: `Minimum order amount of ₹${offer.minOrderAmount} required for this offer.`
      };
    }
    const discountAmount =
      offer.discountType === 'percent'
        ? Math.floor((orderAmount * offer.discountValue) / 100)
        : offer.discountValue;
    return {
      valid: true,
      offer,
      discountAmount,
      message: `Offer applied! You save ₹${discountAmount}.`
    };
  }

  async addOffer(offerData) {
    const newOffer = new Offer(offerData);

    if (isDbConnected()) {
      try {
        await query(`
          INSERT INTO offers (id, title, description, code, discount_type, discount_value, min_order_amount, valid_from, valid_to, is_active, image_url, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            code = EXCLUDED.code,
            discount_type = EXCLUDED.discount_type,
            discount_value = EXCLUDED.discount_value,
            min_order_amount = EXCLUDED.min_order_amount,
            valid_from = EXCLUDED.valid_from,
            valid_to = EXCLUDED.valid_to,
            is_active = EXCLUDED.is_active,
            image_url = EXCLUDED.image_url,
            updated_at = CURRENT_TIMESTAMP
        `, [
          newOffer.id,
          newOffer.title,
          newOffer.description,
          newOffer.code,
          newOffer.discountType,
          newOffer.discountValue,
          newOffer.minOrderAmount,
          newOffer.validFrom,
          newOffer.validTo,
          newOffer.isActive,
          newOffer.imageUrl,
          newOffer.createdAt,
          newOffer.updatedAt
        ]);
      } catch (err) {
        console.error('[OfferService] Error inserting offer into Neon DB:', err.message);
      }
    }

    this.offers.unshift(newOffer);
    this._persist();
    return newOffer;
  }

  async updateOffer(id, updates) {
    if (isDbConnected()) {
      try {
        const fields = [];
        const vals = [];
        let idx = 1;
        if (updates.title !== undefined) { fields.push(`title = $${idx++}`); vals.push(updates.title); }
        if (updates.description !== undefined) { fields.push(`description = $${idx++}`); vals.push(updates.description); }
        if (updates.code !== undefined) { fields.push(`code = $${idx++}`); vals.push(updates.code.toUpperCase().trim()); }
        if (updates.discountType !== undefined) { fields.push(`discount_type = $${idx++}`); vals.push(updates.discountType); }
        if (updates.discountValue !== undefined) { fields.push(`discount_value = $${idx++}`); vals.push(Number(updates.discountValue)); }
        if (updates.minOrderAmount !== undefined) { fields.push(`min_order_amount = $${idx++}`); vals.push(Number(updates.minOrderAmount)); }
        if (updates.validFrom !== undefined) { fields.push(`valid_from = $${idx++}`); vals.push(updates.validFrom); }
        if (updates.validTo !== undefined) { fields.push(`valid_to = $${idx++}`); vals.push(updates.validTo); }
        if (updates.isActive !== undefined) { fields.push(`is_active = $${idx++}`); vals.push(Boolean(updates.isActive)); }
        if (updates.imageUrl !== undefined) { fields.push(`image_url = $${idx++}`); vals.push(updates.imageUrl); }
        if (fields.length > 0) {
          fields.push(`updated_at = CURRENT_TIMESTAMP`);
          vals.push(id);
          await query(`UPDATE offers SET ${fields.join(', ')} WHERE id = $${idx}`, vals);
        }
      } catch (err) {
        console.error('[OfferService] Error updating offer in Neon DB:', err.message);
      }
    }

    const idx = this.offers.findIndex((o) => o.id === id);
    if (idx !== -1) {
      const existing = this.offers[idx];
      this.offers[idx] = new Offer({
        ...existing,
        ...updates,
        id: existing.id,
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString()
      });
      this._persist();
      return this.offers[idx];
    }
    return null;
  }

  async deleteOffer(id) {
    if (isDbConnected()) {
      try {
        await query('DELETE FROM offers WHERE id = $1', [id]);
      } catch (err) {
        console.error('[OfferService] Error deleting offer in Neon DB:', err.message);
      }
    }

    const idx = this.offers.findIndex((o) => o.id === id);
    if (idx === -1) return false;
    this.offers.splice(idx, 1);
    this._persist();
    return true;
  }
}

module.exports = new OfferService();

