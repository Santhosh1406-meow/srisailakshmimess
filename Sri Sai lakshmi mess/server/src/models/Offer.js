/**
 * Offer / Promo Model Definition
 * Supports flat and percentage discounts with coupon codes and validity periods.
 */

class Offer {
  constructor({
    id,
    title,
    description = '',
    code = '',                  // coupon code e.g. "WELCOME20"
    discountType = 'percent',   // 'percent' | 'flat'
    discountValue = 0,          // e.g. 20 (for 20% or ₹20)
    minOrderAmount = 0,         // minimum order to apply offer
    validFrom = null,           // ISO date string
    validTo = null,             // ISO date string
    isActive = true,
    imageUrl = '',
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString()
  }) {
    this.id = id || `OFFER-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    this.title = (title || '').trim();
    this.description = (description || '').trim();
    this.code = (code || '').toUpperCase().trim();
    this.discountType = discountType; // 'percent' | 'flat'
    this.discountValue = Number(discountValue);
    this.minOrderAmount = Number(minOrderAmount);
    this.validFrom = validFrom;
    this.validTo = validTo;
    this.isActive = Boolean(isActive);
    this.imageUrl = (imageUrl || '').trim();
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  isCurrentlyValid() {
    if (!this.isActive) return false;
    const now = new Date();
    if (this.validFrom && new Date(this.validFrom) > now) return false;
    if (this.validTo && new Date(this.validTo) < now) return false;
    return true;
  }
}

module.exports = Offer;
