const fs = require('fs');
const path = require('path');
const Offer = require('../models/Offer');

const DATA_DIR = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'offers.json');

/**
 * Offer Service with Local File Persistence
 * Admin manages offers; customers see active ones.
 */
class OfferService {
  constructor() {
    this.offers = [];
    this._initStorage();
  }

  _initStorage() {
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
        // Seed a welcome offer on first run
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
    return [...this.offers];
  }

  async getActiveOffers() {
    return this.offers.filter((o) => o.isCurrentlyValid());
  }

  async getOfferById(id) {
    return this.offers.find((o) => o.id === id) || null;
  }

  async validateOfferCode(code, orderAmount = 0) {
    const normalized = (code || '').toUpperCase().trim();
    const offer = this.offers.find((o) => o.code === normalized && o.isCurrentlyValid());
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
    this.offers.unshift(newOffer);
    this._persist();
    return newOffer;
  }

  async updateOffer(id, updates) {
    const idx = this.offers.findIndex((o) => o.id === id);
    if (idx === -1) return null;
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

  async deleteOffer(id) {
    const idx = this.offers.findIndex((o) => o.id === id);
    if (idx === -1) return false;
    this.offers.splice(idx, 1);
    this._persist();
    return true;
  }
}

module.exports = new OfferService();
