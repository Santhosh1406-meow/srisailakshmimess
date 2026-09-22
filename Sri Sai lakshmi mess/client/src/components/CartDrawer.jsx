import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Truck,
  Utensils,
  MapPin,
  Phone,
  User,
  CreditCard,
  Banknote,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { submitOrderEnquiry, createPaymentOrder, verifyPayment, getPaymentConfig } from '../services/api';

export default function CartDrawer() {
  const {
    cartItems,
    cartCount,
    cartTotal,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart
  } = useCart();

  const { user } = useAuth();

  // Step: 'cart' | 'details' | 'success'
  const [step, setStep] = useState('cart');

  // Customer & Delivery state
  const [orderType, setOrderType] = useState('delivery'); // 'delivery' | 'takeaway'
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' | 'cod'

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Sync user details when drawer opens or user changes
  useEffect(() => {
    if (user) {
      if (user.name) setCustomerName(user.name);
      if (user.phone) setPhone(user.phone);
      if (user.email) setEmail(user.email);
    }
  }, [user, isCartOpen]);

  // Reset step if cart emptied while inside
  useEffect(() => {
    if (cartItems.length === 0 && step !== 'success') {
      setStep('cart');
    }
  }, [cartItems.length, step]);

  // Lock background scroll when drawer is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  // Bill calculations
  const subtotal = cartTotal;
  const deliveryFee = orderType === 'delivery' ? (subtotal >= 200 ? 0 : 25) : 0;
  const grandTotal = subtotal + deliveryFee;

  const SIVAKASI_PINCODES = ['626123', '626124', '626130', '626189', '626128'];
  const SIVAKASI_LOCALITIES = [
    'sivakasi', 'thiruthangal', 'satchiyapuram', 'vilampatti', 'paraipatti',
    'viswanatham', 'anaiyur', 'meenampatti', 'palayampatti', 'chinnakamanpatti',
    'maraneri', 'pappakudi', 'reserve line', 'housing board', 'ngo colony',
    'rathanavillas', 'coronation', 'badrakali', 'velayutham', 'bus stand'
  ];
  const OTHER_CITIES = [
    'madurai', 'chennai', 'coimbatore', 'bangalore', 'bengaluru', 'trichy',
    'tiruchirappalli', 'salem', 'tirunelveli', 'dindigul', 'erode', 'tiruppur',
    'virudhunagar', 'rajapalayam', 'srivilliputhur', 'sattur', 'kovilpatti'
  ];

  const validateDetails = () => {
    if (!customerName.trim() || customerName.trim().length < 2) {
      setError('Please provide your full name (minimum 2 characters).');
      return false;
    }

    // 10-digit Indian mobile number validation
    const rawDigits = phone.replace(/\D/g, '');
    let norm = rawDigits;
    if (norm.startsWith('91') && norm.length === 12) {
      norm = norm.slice(2);
    } else if (norm.startsWith('0') && norm.length === 11) {
      norm = norm.slice(1);
    }

    if (!/^[6-9]\d{9}$/.test(norm)) {
      setError('Please provide a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.');
      return false;
    }

    // Sivakasi delivery address validation
    if (orderType === 'delivery') {
      if (!deliveryAddress.trim() || deliveryAddress.trim().length < 5) {
        setError('Please provide your complete delivery address inside Sivakasi.');
        return false;
      }
      const lower = deliveryAddress.toLowerCase();
      const hasOtherCity = OTHER_CITIES.some((city) => {
        const regex = new RegExp(`\\b${city}\\b`, 'i');
        return regex.test(lower);
      });
      const hasSivakasiPincode = SIVAKASI_PINCODES.some((pin) => lower.includes(pin));
      const hasSivakasiLocality = SIVAKASI_LOCALITIES.some((loc) => lower.includes(loc));

      if (hasOtherCity && !hasSivakasiLocality) {
        setError('Orders are accepted inside Sivakasi only. Delivery to other cities is not available.');
        return false;
      }
      if (!hasSivakasiPincode && !hasSivakasiLocality) {
        setError('Delivery is available inside Sivakasi only (Pincodes: 626123, 626124, 626130). Please provide a Sivakasi address.');
        return false;
      }
    }

    setError('');
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateDetails()) return;

    setLoading(true);
    setError('');

    try {
      const summaryItems = cartItems.map((i) => `${i.name} (x${i.quantity})`).join(', ');

      // Clean phone to exact 10 digits
      const rawDigits = phone.replace(/\D/g, '');
      let normPhone = rawDigits;
      if (normPhone.startsWith('91') && normPhone.length === 12) normPhone = normPhone.slice(2);
      else if (normPhone.startsWith('0') && normPhone.length === 11) normPhone = normPhone.slice(1);

      const orderPayload = {
        customerName: customerName.trim(),
        phone: normPhone,
        email: email.trim(),
        foodItem: summaryItems,
        quantity: cartCount,
        items: cartItems,
        amount: grandTotal,
        orderType,
        deliveryAddress: orderType === 'delivery' ? deliveryAddress.trim() : '',
        specialInstructions: specialInstructions.trim(),
        preferredDate: new Date().toISOString().split('T')[0],
        preferredTime: 'Immediate (30-45 mins)',
        paymentStatus: paymentMethod === 'online' ? 'Pending' : 'Pay on Delivery',
        userId: user ? user.id : null
      };

      // 1. Submit order to server
      const res = await submitOrderEnquiry(orderPayload);
      const createdOrder = res.data;

      // If COD / Pay on Delivery, finish immediately!
      if (paymentMethod === 'cod') {
        setConfirmedOrder(createdOrder);
        clearCart();
        setStep('success');
        triggerConfetti();
        return;
      }

      // 2. Online Payment via Razorpay
      try {
        const paymentData = await createPaymentOrder({
          orderId: createdOrder.id,
          amount: grandTotal
        });

        // Check if Razorpay SDK is loaded on window
        if (typeof window.Razorpay !== 'undefined' && paymentData?.keyId && paymentData.keyId !== 'DEMO_KEY') {
          const options = {
            key: paymentData.keyId,
            amount: paymentData.amount,
            currency: 'INR',
            name: 'Sri Sai Lakshmi Mess',
            description: `Order #${createdOrder.id}`,
            image: '/logo.png',
            order_id: paymentData.razorpayOrderId,
            prefill: {
              name: customerName,
              email: email || 'customer@srisailakshmi.com',
              contact: phone
            },
            theme: {
              color: '#c2410c'
            },
            handler: async (response) => {
              try {
                await verifyPayment({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  orderId: createdOrder.id
                });
                createdOrder.paymentStatus = 'Paid';
                setConfirmedOrder(createdOrder);
                clearCart();
                setStep('success');
                triggerConfetti();
              } catch (verifyErr) {
                setError('Payment verification failed: ' + verifyErr.message);
              }
            },
            modal: {
              ondismiss: () => {
                setLoading(false);
                setError('Payment cancelled. Your order remains pending.');
              }
            }
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
          return;
        } else {
          // Demo Mode or Razorpay key not configured in backend:
          // Simulate instant online payment success for seamless testing!
          await verifyPayment({
            razorpayOrderId: paymentData?.razorpayOrderId || `order_DEMO_${Date.now()}`,
            razorpayPaymentId: `pay_DEMO_${Date.now()}`,
            razorpaySignature: 'demo_signature',
            orderId: createdOrder.id
          });
          createdOrder.paymentStatus = 'Paid';
          setConfirmedOrder(createdOrder);
          clearCart();
          setStep('success');
          triggerConfetti();
        }
      } catch (payErr) {
        console.warn('Online payment flow notice:', payErr);
        // Fallback: Order is placed, mark for payment on delivery
        setConfirmedOrder(createdOrder);
        clearCart();
        setStep('success');
        triggerConfetti();
      }
    } catch (err) {
      console.error('Failed to submit order:', err);
      setError(err.message || 'Unable to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }
  };

  const handleClose = () => {
    closeCart();
    if (step === 'success') {
      setStep('cart');
      setConfirmedOrder(null);
    }
  };

  return (
    <div className="cart-drawer-overlay" onClick={handleClose}>
      <div
        className="cart-drawer-container animate-slide-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="cart-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="cart-header-icon-wrap">
              <ShoppingBag size={20} color="var(--color-primary)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#1c1917' }}>
                {step === 'success' ? 'Order Confirmed!' : 'Your Food Cart'}
              </h2>
              {step !== 'success' && (
                <span style={{ fontSize: '0.8rem', color: '#78716c' }}>
                  {cartCount} {cartCount === 1 ? 'item' : 'items'} selected
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleClose}
            className="cart-drawer-close-btn"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="cart-drawer-body">
          {/* STEP 1: EMPTY CART */}
          {cartItems.length === 0 && step !== 'success' && (
            <div className="cart-empty-state">
              <div className="cart-empty-icon">
                <ShoppingBag size={48} color="#d6d3d1" />
              </div>
              <h3 style={{ color: '#292524', fontWeight: 800, marginBottom: '0.4rem' }}>
                Your cart is empty
              </h3>
              <p style={{ color: '#78716c', fontSize: '0.9rem', maxWidth: '260px', margin: '0 auto 1.5rem' }}>
                Explore our authentic South Indian delicacies and add your favourite dishes!
              </p>
              <button
                onClick={handleClose}
                className="btn btn-primary btn-sm"
                style={{ borderRadius: 'var(--radius-full)', padding: '0.6rem 1.4rem' }}
              >
                Browse Menu
              </button>
            </div>
          )}

          {/* STEP 2: CART REVIEW */}
          {cartItems.length > 0 && step === 'cart' && (
            <div className="cart-items-wrapper">
              <div className="cart-items-list">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item-card">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="cart-item-img" />
                    ) : (
                      <div className="cart-item-placeholder">
                        <Utensils size={18} color="var(--color-primary)" />
                      </div>
                    )}

                    <div className="cart-item-info">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        {item.isVegetarian && (
                          <span className="veg-badge" style={{ width: '13px', height: '13px' }}>
                            <span className="veg-badge-dot" style={{ width: '5px', height: '5px' }}></span>
                          </span>
                        )}
                        <h4 className="cart-item-name">{item.name}</h4>
                      </div>
                      <div className="cart-item-price">₹{item.price}</div>
                    </div>

                    {/* Quantity stepper */}
                    <div className="cart-item-controls">
                      <div className="cart-stepper-sm">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          aria-label="Decrease"
                        >
                          <Minus size={12} />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          aria-label="Increase"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <div className="cart-item-total">
                        ₹{item.price * item.quantity}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="cart-item-delete"
                        title="Remove"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery / Takeaway Switch */}
              <div className="cart-order-type-box">
                <span className="cart-section-title">Order Option</span>
                <div className="cart-type-toggle">
                  <button
                    type="button"
                    className={`cart-type-btn ${orderType === 'delivery' ? 'active' : ''}`}
                    onClick={() => setOrderType('delivery')}
                  >
                    <Truck size={16} />
                    <span>Doorstep Delivery</span>
                  </button>
                  <button
                    type="button"
                    className={`cart-type-btn ${orderType === 'takeaway' ? 'active' : ''}`}
                    onClick={() => setOrderType('takeaway')}
                  >
                    <Utensils size={16} />
                    <span>Takeaway / Parcel</span>
                  </button>
                </div>
              </div>

              {/* Bill Details */}
              <div className="cart-bill-summary">
                <span className="cart-section-title">Bill Details</span>
                <div className="cart-bill-row">
                  <span>Item Total</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="cart-bill-row">
                  <span>Packaging Charges</span>
                  <span style={{ color: 'var(--color-leaf-green)', fontWeight: 700 }}>FREE</span>
                </div>
                <div className="cart-bill-row">
                  <span>Delivery Fee</span>
                  {orderType === 'takeaway' ? (
                    <span style={{ color: 'var(--color-text-muted)' }}>Not applicable</span>
                  ) : deliveryFee === 0 ? (
                    <span style={{ color: 'var(--color-leaf-green)', fontWeight: 700 }}>FREE (Order ₹200+)</span>
                  ) : (
                    <span>₹{deliveryFee}</span>
                  )}
                </div>
                <div className="cart-bill-divider" />
                <div className="cart-bill-row grand-total">
                  <span>To Pay</span>
                  <span>₹{grandTotal}</span>
                </div>
              </div>

              {subtotal < 200 && orderType === 'delivery' && (
                <div className="cart-free-delivery-tip">
                  💡 Add items worth <strong>₹{200 - subtotal}</strong> more for <strong>FREE delivery</strong>!
                </div>
              )}
            </div>
          )}

          {/* STEP 3: CUSTOMER & PAYMENT DETAILS */}
          {cartItems.length > 0 && step === 'details' && (
            <div className="cart-checkout-form">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span className="cart-section-title" style={{ margin: 0 }}>Contact & Delivery Details</span>
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  ← Edit Cart
                </button>
              </div>

              {error && (
                <div className="auth-alert auth-alert-error" style={{ marginBottom: '1rem', padding: '0.6rem 0.8rem' }}>
                  <AlertCircle size={15} />
                  <span>{error}</span>
                </div>
              )}

              {/* Name */}
              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label className="form-label" style={{ fontSize: '0.82rem' }}>
                  Full Name <span className="required">*</span>
                </label>
                <div className="auth-input-wrapper">
                  <User size={16} className="auth-input-icon" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="form-control auth-input-with-icon"
                    required
                  />
                </div>
              </div>

              {/* Mobile */}
              <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                <label className="form-label" style={{ fontSize: '0.82rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Mobile Number <span className="required">*</span></span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>10 digits (India)</span>
                </label>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.2rem',
                    background: '#f1f5f9', border: '1px solid #cbd5e1',
                    borderRadius: '8px', padding: '0 0.6rem', height: '40px',
                    fontSize: '0.85rem', fontWeight: '700', color: '#334155'
                  }}>
                    <span>🇮🇳 +91</span>
                  </div>
                  <div className="auth-input-wrapper" style={{ flex: 1 }}>
                    <Phone size={16} className="auth-input-icon" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhone(digits);
                      }}
                      placeholder="9876543210"
                      className="form-control auth-input-with-icon"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Address (If delivery) */}
              {orderType === 'delivery' && (
                <div className="form-group" style={{ marginBottom: '0.85rem' }}>
                  <div style={{
                    backgroundColor: '#fffbeb', border: '1px solid #fef3c7',
                    borderRadius: '8px', padding: '0.45rem 0.65rem', marginBottom: '0.5rem',
                    fontSize: '0.75rem', color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.4rem'
                  }}>
                    <MapPin size={13} style={{ flexShrink: 0, color: '#d97706' }} />
                    <span><strong>Sivakasi Only:</strong> We deliver inside Sivakasi town & nearby areas (626123, 626124, 626130).</span>
                  </div>

                  <label className="form-label" style={{ fontSize: '0.82rem' }}>
                    Delivery Address in Sivakasi <span className="required">*</span>
                  </label>
                  <div className="auth-input-wrapper">
                    <MapPin size={16} className="auth-input-icon" style={{ alignSelf: 'flex-start', marginTop: '0.75rem' }} />
                    <textarea
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Door No., Street, Landmark, Sivakasi - 626123"
                      className="form-control auth-input-with-icon"
                      rows={2}
                      style={{ resize: 'none' }}
                      required
                    />
                  </div>

                  {/* Quick locality suggestions */}
                  <div style={{ marginTop: '0.35rem', display: 'flex', flexWrap: 'wrap', gap: '0.3rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Quick areas:</span>
                    {['Rathanavillas', 'Thiruthangal', 'Satchiyapuram', 'Vilampatti Rd', 'Paraipatti', 'Reserve Line'].map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => {
                          if (!deliveryAddress.includes(area)) {
                            setDeliveryAddress((prev) => (prev ? `${prev}, ${area}, Sivakasi` : `${area}, Sivakasi`));
                          }
                        }}
                        style={{
                          background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px',
                          padding: '0.15rem 0.4rem', fontSize: '0.68rem', color: '#475569', cursor: 'pointer'
                        }}
                      >
                        +{area}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cooking Instructions */}
              <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                <label className="form-label" style={{ fontSize: '0.82rem' }}>
                  Cooking Instructions / Notes <span style={{ color: '#a8a29e', fontWeight: 400 }}>(Optional)</span>
                </label>
                <input
                  type="text"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Less spicy sambar, extra chutney pack"
                  className="form-control"
                  style={{ fontSize: '0.85rem' }}
                />
              </div>

              {/* Payment Method Selection */}
              <div className="cart-payment-method-box">
                <span className="cart-section-title">Select Payment Mode</span>
                
                <div className="payment-options-grid">
                  {/* Online Payment */}
                  <label className={`payment-option-card ${paymentMethod === 'online' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={paymentMethod === 'online'}
                      onChange={() => setPaymentMethod('online')}
                    />
                    <div className="payment-option-content">
                      <div className="payment-option-title">
                        <CreditCard size={18} color="var(--color-primary)" />
                        <span>Pay Online (UPI / Card / NetBanking)</span>
                      </div>
                      <p className="payment-option-desc">
                        Instant confirmation via Google Pay, PhonePe, Cards or NetBanking.
                      </p>
                    </div>
                  </label>

                  {/* Cash on Delivery */}
                  <label className={`payment-option-card ${paymentMethod === 'cod' ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                    />
                    <div className="payment-option-content">
                      <div className="payment-option-title">
                        <Banknote size={18} color="var(--color-leaf-green)" />
                        <span>Pay on Delivery / Counter</span>
                      </div>
                      <p className="payment-option-desc">
                        Pay cash or UPI when food arrives at your doorstep or upon pickup.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order total banner */}
              <div className="cart-checkout-total-banner">
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#78716c', display: 'block' }}>Total Amount</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>
                    ₹{grandTotal}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--color-leaf-green)', fontWeight: 700 }}>
                  <ShieldCheck size={16} /> 100% Safe & Secure
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: ORDER CONFIRMED SUCCESS */}
          {step === 'success' && confirmedOrder && (
            <div className="cart-success-view">
              <div className="cart-success-icon-wrap">
                <CheckCircle2 size={56} color="var(--color-leaf-green)" />
              </div>

              <span className="cart-success-badge">
                <Sparkles size={14} /> ORDER CONFIRMED!
              </span>

              <h3 className="cart-success-title">Thank You, {confirmedOrder.customerName || customerName}!</h3>
              <p className="cart-success-desc">
                Your food is being freshly prepared with authentic spices and love.
              </p>

              <div className="cart-success-card">
                <div className="cart-success-row">
                  <span className="label">Order Reference</span>
                  <span className="val order-id">#{confirmedOrder.id}</span>
                </div>
                <div className="cart-success-row">
                  <span className="label">Estimated Time</span>
                  <span className="val">
                    <Clock size={14} /> 30 - 45 Minutes
                  </span>
                </div>
                <div className="cart-success-row">
                  <span className="label">Payment Status</span>
                  <span className={`val status-${confirmedOrder.paymentStatus === 'Paid' ? 'paid' : 'pending'}`}>
                    {confirmedOrder.paymentStatus === 'Paid' ? '✅ Paid Online' : '💵 Pay on Delivery'}
                  </span>
                </div>
                <div className="cart-success-row">
                  <span className="label">Total Amount</span>
                  <span className="val" style={{ fontWeight: 800 }}>₹{confirmedOrder.amount || grandTotal}</span>
                </div>
                {confirmedOrder.orderType === 'delivery' && confirmedOrder.deliveryAddress && (
                  <div className="cart-success-row" style={{ borderBottom: 'none' }}>
                    <span className="label">Delivery To</span>
                    <span className="val" style={{ maxWidth: '180px', textAlign: 'right' }}>
                      {confirmedOrder.deliveryAddress}
                    </span>
                  </div>
                )}
              </div>

              <div className="cart-success-actions">
                <Link
                  to={`/track-order?orderId=${encodeURIComponent(confirmedOrder.id)}`}
                  onClick={handleClose}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', borderRadius: 'var(--radius-full)' }}
                >
                  <Truck size={17} /> Track Live Order Status
                </Link>

                <button
                  type="button"
                  onClick={handleClose}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', justifyContent: 'center', borderRadius: 'var(--radius-full)' }}
                >
                  Close & Continue Browsing
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Buttons */}
        {step !== 'success' && cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            {step === 'cart' ? (
              <button
                type="button"
                id="cart-proceed-checkout-btn"
                onClick={() => setStep('details')}
                className="btn btn-primary cart-checkout-submit-btn"
              >
                <span>Proceed to Checkout (₹{grandTotal})</span>
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                type="button"
                id="cart-submit-payment-btn"
                onClick={handlePlaceOrder}
                disabled={loading}
                className="btn btn-primary cart-checkout-submit-btn"
              >
                {loading ? (
                  <>
                    <span className="auth-spinner" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {paymentMethod === 'online' ? `Pay Now ₹${grandTotal}` : `Confirm Order (₹${grandTotal})`}
                    </span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
