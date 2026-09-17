const Order = require('../models/Order');

/**
 * Order & Enquiry Service Layer
 * Abstracted so that swapping with MongoDB / PostgreSQL repository requires changing only this service.
 */
class OrderService {
  constructor() {
    this.orders = [];
    this._seedOrders();
  }

  _seedOrders() {
    this.orders = [
      new Order({
        id: 'ORD-8821',
        customerName: 'Ramesh Kumar',
        phone: '9840123456',
        email: 'ramesh.k@gmail.com',
        foodItem: 'Special South Indian Meals (Banquet Catering)',
        quantity: 150,
        preferredDate: '2026-09-15',
        preferredTime: '12:30 PM',
        specialInstructions: 'Banana leaf serving requested for all 150 guests.',
        orderType: 'delivery',
        deliveryAddress: '12, Gandhi Nagar, Sivakasi',
        status: 'Completed',
        paymentStatus: 'Paid',
        amount: 2250000,
        deliveryPartnerName: 'Murugan (Delivery)',
        deliveryPartnerId: 'USR-DEL-001',
        deliveredAt: new Date(Date.now() - 86400000).toISOString()
      }),
      new Order({
        id: 'ORD-8822',
        customerName: 'Priya Sundaram',
        phone: '9790987654',
        email: 'priya.events@techcorp.com',
        foodItem: 'Mini Tiffin Combo (Breakfast Catering)',
        quantity: 75,
        preferredDate: '2026-09-18',
        preferredTime: '08:00 AM',
        specialInstructions: 'Hot stainless steel thermal dispensers required.',
        orderType: 'delivery',
        deliveryAddress: '45, Anna Nagar, Sivakasi',
        status: 'Ready',
        paymentStatus: 'Pay on Delivery',
        amount: 750000
      }),
      new Order({
        id: 'ORD-8823',
        customerName: 'Karthik Subramanian',
        phone: '9940112233',
        email: 'karthik.s@gmail.com',
        foodItem: 'Chettinad Meal Buffet Box',
        quantity: 50,
        preferredDate: '2026-09-20',
        preferredTime: '01:00 PM',
        specialInstructions: '20 vegetarian, 30 non-vegetarian meal packs separated clearly.',
        orderType: 'parcel',
        status: 'Processing',
        paymentStatus: 'Pay on Delivery',
        amount: 900000
      })
    ];
  }

  async createOrder(orderData) {
    const newOrder = new Order(orderData);
    this.orders.unshift(newOrder);
    return newOrder;
  }

  async getAllOrders() {
    return [...this.orders];
  }

  async getOrderById(id) {
    return this.orders.find((o) => o.id === id) || null;
  }

  async getOrdersByPhone(phone) {
    const cleaned = phone.replace(/\D/g, '').slice(-10);
    return this.orders.filter((o) => o.phone.replace(/\D/g, '').slice(-10) === cleaned);
  }

  async getOrdersByUserId(userId) {
    return this.orders.filter((o) => o.userId === userId);
  }

  /** Delivery partner: get orders assigned to this partner OR available (Ready, no partner) */
  async getOrdersForDeliveryPartner(partnerId) {
    return this.orders.filter(
      (o) => o.deliveryPartnerId === partnerId || 
             (o.status === 'Ready' && !o.deliveryPartnerId && o.orderType === 'delivery')
    );
  }

  /** Delivery partner: get only available (unassigned) delivery orders */
  async getAvailableDeliveryOrders() {
    return this.orders.filter(
      (o) => o.status === 'Ready' && !o.deliveryPartnerId && o.orderType === 'delivery'
    );
  }

  /** Admin: assign a delivery partner to an order */
  async assignDeliveryPartner(orderId, partnerId, partnerName, partnerPhone) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return null;
    order.deliveryPartnerId = partnerId;
    order.deliveryPartnerName = partnerName;
    order.deliveryPartnerPhone = partnerPhone;
    order.updatedAt = new Date().toISOString();
    return order;
  }

  /** Delivery partner: accept/claim an order */
  async acceptOrder(orderId, partnerId, partnerName, partnerPhone) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return null;
    if (order.deliveryPartnerId && order.deliveryPartnerId !== partnerId) return null; // already taken
    order.deliveryPartnerId = partnerId;
    order.deliveryPartnerName = partnerName;
    order.deliveryPartnerPhone = partnerPhone;
    order.status = 'Out for Delivery';
    order.updatedAt = new Date().toISOString();
    return order;
  }

  /** Delivery partner: mark an order as delivered */
  async markDelivered(orderId, partnerId) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return null;
    if (order.deliveryPartnerId !== partnerId) return null; // not your order
    order.status = 'Completed';
    order.deliveredAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();
    return order;
  }

  async updateOrderStatus(id, status) {
    const order = this.orders.find((o) => o.id === id);
    if (!order) return null;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    return order;
  }

  async updatePaymentInfo(id, { paymentId, razorpayOrderId, paymentStatus, amount }) {
    const order = this.orders.find((o) => o.id === id);
    if (!order) return null;
    if (paymentId) order.paymentId = paymentId;
    if (razorpayOrderId) order.razorpayOrderId = razorpayOrderId;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (amount) order.amount = amount;
    order.updatedAt = new Date().toISOString();
    return order;
  }

  async getAdminStats() {
    const totalOrders = this.orders.length;
    const pendingEnquiries = this.orders.filter((o) => o.status === 'Enquiry Received').length;
    const processingOrders = this.orders.filter((o) => o.status === 'Processing').length;
    const confirmedOrders = this.orders.filter((o) => ['Confirmed', 'Completed'].includes(o.status)).length;
    const outForDelivery = this.orders.filter((o) => o.status === 'Out for Delivery').length;
    const totalPortions = this.orders.reduce((sum, o) => sum + (Number(o.quantity) || 0), 0);
    const deliveryOrders = this.orders.filter((o) => o.orderType === 'delivery').length;

    return {
      totalOrders,
      pendingEnquiries,
      processingOrders,
      confirmedOrders,
      outForDelivery,
      totalPortions,
      deliveryOrders
    };
  }
}

module.exports = new OrderService();
