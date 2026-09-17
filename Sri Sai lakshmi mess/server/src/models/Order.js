/**
 * Order / Enquiry Model Definition
 * Supports user auth, payment tracking, delivery partner assignment, and full order status lifecycle.
 */

class Order {
  constructor({
    id,
    customerName,
    phone,
    email = '',
    foodItem,
    quantity,
    preferredDate,
    preferredTime,
    specialInstructions = '',
    orderType = 'dine-in',      // 'dine-in' | 'delivery' | 'parcel'
    deliveryAddress = '',        // Required when orderType === 'delivery'
    status = 'Enquiry Received', // 'Enquiry Received' | 'Processing' | 'Confirmed' | 'Ready' | 'Out for Delivery' | 'Completed' | 'Cancelled'
    userId = null,
    // Payment
    paymentStatus = 'Pay on Delivery', // 'Pay on Delivery' | 'Paid' | 'Pending' | 'Failed'
    paymentId = null,
    razorpayOrderId = null,
    amount = 0,
    items = [],
    // Delivery partner assignment
    deliveryPartnerId = null,
    deliveryPartnerName = null,
    deliveryPartnerPhone = null,
    deliveredAt = null,
    createdAt = new Date().toISOString(),
    updatedAt = new Date().toISOString()
  }) {
    this.id = id || `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    this.customerName = customerName.trim();
    this.phone = phone.trim();
    this.email = email ? email.trim() : '';
    this.foodItem = foodItem.trim();
    this.quantity = Number(quantity);
    this.preferredDate = preferredDate;
    this.preferredTime = preferredTime;
    this.specialInstructions = specialInstructions ? specialInstructions.trim() : '';
    this.orderType = orderType;
    this.deliveryAddress = deliveryAddress ? deliveryAddress.trim() : '';
    this.status = status;
    this.userId = userId;
    this.paymentStatus = paymentStatus;
    this.paymentId = paymentId;
    this.razorpayOrderId = razorpayOrderId;
    this.amount = amount;
    this.items = Array.isArray(items) ? items : [];
    this.deliveryPartnerId = deliveryPartnerId;
    this.deliveryPartnerName = deliveryPartnerName;
    this.deliveryPartnerPhone = deliveryPartnerPhone;
    this.deliveredAt = deliveredAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

module.exports = Order;
