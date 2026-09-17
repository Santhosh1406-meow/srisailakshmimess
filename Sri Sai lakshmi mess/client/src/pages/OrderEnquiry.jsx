import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Phone,
  MessageCircle,
  UtensilsCrossed,
  Info,
  Package
} from 'lucide-react';
import { submitOrderEnquiry } from '../services/api';
import { RESTAURANT_CONFIG } from '../data/restaurantData';
import { useAuth } from '../context/AuthContext';

const BULK_MENU_OPTIONS = [
  'South Indian Special Meals (Bulk)',
  'Mini Meals (Bulk)',
  'Ghee Podi Idli — Bulk Box',
  'Special Masala Dosa — Bulk',
  'Ghee Roast Dosa — Bulk',
  'Crispy Medu Vada — Bulk',
  'Hot Ven Pongal & Vada — Bulk',
  'Poori Masala — Bulk',
  'Authentic Sambar Rice — Bulk',
  'Tempered Curd Rice — Bulk',
  'Traditional Kumbakonam Degree Coffee — Bulk',
  'Mixed Tiffin Boxes (Assorted)',
  'Wedding / Housewarming Full Catering',
  'Birthday Party / Puja Function Catering',
  'Corporate Tiffin Box Service',
  'Custom Bulk Combination / Other'
];

export default function OrderEnquiry() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const prefilledDish = searchParams.get('dish') || '';

  // Get tomorrow's date formatted as YYYY-MM-DD for min date
  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    foodItem: prefilledDish || 'South Indian Special Meals (Bulk)',
    quantity: '10',
    preferredDate: todayStr,
    preferredTime: '12:30 PM',
    specialInstructions: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    if (prefilledDish) {
      setFormData((prev) => ({ ...prev, foodItem: prefilledDish }));
    }
  }, [prefilledDish]);

  const validateForm = () => {
    const errors = {};

    if (!formData.customerName.trim()) {
      errors.customerName = 'Please enter your full name.';
    } else if (formData.customerName.trim().length < 2) {
      errors.customerName = 'Name must be at least 2 characters.';
    }

    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{7,15}$/;
    if (!formData.phone.trim()) {
      errors.phone = 'Mobile number is required.';
    } else if (!phoneRegex.test(formData.phone.replace(/\s+/g, ''))) {
      errors.phone = 'Please enter a valid mobile number (e.g., 9876543210).';
    }

    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = 'Please enter a valid email address or leave it blank.';
      }
    }

    if (!formData.foodItem.trim()) {
      errors.foodItem = 'Please choose a food item or enter your required dish.';
    }

    const qty = parseInt(formData.quantity, 10);
    if (isNaN(qty) || qty < 10 || qty > 5000) {
      errors.quantity = 'Minimum quantity for bulk orders is 10 (max 5000).';
    }

    if (!formData.preferredDate) {
      errors.preferredDate = 'Please select a preferred date.';
    }

    if (!formData.preferredTime) {
      errors.preferredTime = 'Please select a preferred time slot.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await submitOrderEnquiry({
        customerName: formData.customerName,
        phone: formData.phone,
        email: formData.email,
        foodItem: formData.foodItem,
        quantity: parseInt(formData.quantity, 10),
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        specialInstructions: formData.specialInstructions,
        userId: user ? user.id : null
      });

      setSubmissionSuccess(response);

      // Trigger celebratory confetti effect
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // Confetti is purely decorative
      }
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong while sending your enquiry. Please try again or reach out to us by phone.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmissionSuccess(null);
    setFormData({
      customerName: '',
      phone: '',
      email: '',
      foodItem: 'South Indian Special Meals (Bulk)',
      quantity: '10',
      preferredDate: todayStr,
      preferredTime: '12:30 PM',
      specialInstructions: ''
    });
  };

  return (
    <div className="animate-fade-in section-padding" style={{ backgroundColor: 'var(--color-bg-main)', minHeight: '85vh' }}>
      <div className="container">

        {/* Page Header */}
        <div className="section-header">
          <span className="section-badge">
            <UtensilsCrossed size={14} color="var(--color-primary)" />
            Bulk &amp; Catering Orders
          </span>
          <h1 className="section-title">Bulk Order Enquiry</h1>
          <p className="section-subtitle">
            Submit your bulk or catering requirement and our team will get back to you within 24 hours with availability, pricing, and delivery details.
          </p>
        </div>


        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3rem',
          maxWidth: '1100px',
          margin: '0 auto'
        }}>

          {/* Left Column: Form or Success Card */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '2.5rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--color-border)'
          }}>
            {submissionSuccess ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-leaf-green-light)',
                  color: 'var(--color-leaf-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem auto',
                  border: '2px solid var(--color-leaf-green-border)'
                }}>
                  <CheckCircle2 size={42} />
                </div>

                <h3 style={{ fontSize: '1.8rem', color: 'var(--color-text-main)', marginBottom: '0.8rem' }}>
                  Enquiry Submitted!
                </h3>

                <p style={{
                  fontSize: '1.05rem',
                  color: 'var(--color-primary-dark)',
                  fontWeight: 600,
                  backgroundColor: 'var(--color-primary-subtle)',
                  padding: '0.85rem 1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1.5rem',
                  border: '1px solid rgba(194,65,12,0.2)'
                }}>
                  "Your enquiry has been submitted successfully. We will contact you shortly."
                </p>

                {/* Enquiry Details Summary */}
                <div style={{
                  backgroundColor: 'var(--color-bg-subtle)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  marginBottom: '2rem',
                  border: '1px solid var(--color-border)'
                }}>
                  <div><strong>Reference ID:</strong> {submissionSuccess.data?.enquiryId}</div>
                  <div><strong>Customer Name:</strong> {submissionSuccess.data?.customerName}</div>
                  <div><strong>Mobile Number:</strong> {submissionSuccess.data?.phone}</div>
                  <div><strong>Requested Dish:</strong> {submissionSuccess.data?.foodItem} (Qty: {submissionSuccess.data?.quantity})</div>
                  <div><strong>Preferred Slot:</strong> {submissionSuccess.data?.preferredDate} at {submissionSuccess.data?.preferredTime}</div>
                  <div style={{ marginTop: '0.25rem', padding: '0.5rem 0.75rem', backgroundColor: 'var(--color-gold-light)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--color-gold-dark)' }}>
                    💳 <strong>Payment:</strong> Pay on delivery / after parcel collection
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link
                    to={`/track-order?orderId=${submissionSuccess.data?.enquiryId}`}
                    className="btn btn-primary"
                    style={{ gap: '0.4rem' }}
                  >
                    <Package size={16} /> Track Your Order
                  </Link>
                  <button onClick={handleResetForm} className="btn btn-secondary">
                    Submit Another Enquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>

                {submitError && (
                  <div style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    padding: '0.9rem 1.2rem',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    fontSize: '0.9rem'
                  }}>
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* Customer Name */}
                <div className="form-group">
                  <label htmlFor="customerName" className="form-label">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="e.g. Ramesh Kumar"
                    className={`form-control ${formErrors.customerName ? 'error' : ''}`}
                    required
                  />
                  {formErrors.customerName && (
                    <div className="form-error-msg">
                      <AlertCircle size={14} /> {formErrors.customerName}
                    </div>
                  )}
                </div>

                {/* Contact Phone & Email Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>

                  {/* Phone */}
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">
                      Mobile Number <span className="required">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="e.g. 9876543210"
                      className={`form-control ${formErrors.phone ? 'error' : ''}`}
                      required
                    />
                    {formErrors.phone && (
                      <div className="form-error-msg">
                        <AlertCircle size={14} /> {formErrors.phone}
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email Address <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>(Optional)</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. ramesh@example.com"
                      className={`form-control ${formErrors.email ? 'error' : ''}`}
                    />
                    {formErrors.email && (
                      <div className="form-error-msg">
                        <AlertCircle size={14} /> {formErrors.email}
                      </div>
                    )}
                  </div>

                </div>

                {/* Food Item & Quantity Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>

                  {/* Food Item */}
                  <div className="form-group">
                    <label htmlFor="foodItem" className="form-label">
                      Bulk Item / Category <span className="required">*</span>
                    </label>
                    <select
                      id="foodItem"
                      name="foodItem"
                      value={formData.foodItem}
                      onChange={handleChange}
                      className={`form-control ${formErrors.foodItem ? 'error' : ''}`}
                      required
                    >
                      {BULK_MENU_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    {formErrors.foodItem && (
                      <div className="form-error-msg">
                        <AlertCircle size={14} /> {formErrors.foodItem}
                      </div>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="form-group">
                    <label htmlFor="quantity" className="form-label">
                      Quantity <span className="required">*</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-light)', fontWeight: 400, marginLeft: '0.4rem' }}>(Min. 10)</span>
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      min="10"
                      max="5000"
                      value={formData.quantity}
                      onChange={handleChange}
                      className={`form-control ${formErrors.quantity ? 'error' : ''}`}
                      required
                    />
                    {formErrors.quantity && (
                      <div className="form-error-msg">
                        <AlertCircle size={14} /> {formErrors.quantity}
                      </div>
                    )}
                  </div>

                </div>

                {/* Date & Time Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>

                  {/* Preferred Date */}
                  <div className="form-group">
                    <label htmlFor="preferredDate" className="form-label">
                      Preferred Date <span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      id="preferredDate"
                      name="preferredDate"
                      min={todayStr}
                      value={formData.preferredDate}
                      onChange={handleChange}
                      className={`form-control ${formErrors.preferredDate ? 'error' : ''}`}
                      required
                    />
                    {formErrors.preferredDate && (
                      <div className="form-error-msg">
                        <AlertCircle size={14} /> {formErrors.preferredDate}
                      </div>
                    )}
                  </div>

                  {/* Preferred Time */}
                  <div className="form-group">
                    <label htmlFor="preferredTime" className="form-label">
                      Preferred Time Slot <span className="required">*</span>
                    </label>
                    <select
                      id="preferredTime"
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleChange}
                      className={`form-control ${formErrors.preferredTime ? 'error' : ''}`}
                      required
                    >
                      <option value="07:30 AM">07:30 AM (Breakfast)</option>
                      <option value="08:30 AM">08:30 AM (Breakfast)</option>
                      <option value="09:30 AM">09:30 AM (Breakfast)</option>
                      <option value="12:30 PM">12:30 PM (Lunch Meals)</option>
                      <option value="01:30 PM">01:30 PM (Lunch Meals)</option>
                      <option value="02:30 PM">02:30 PM (Lunch Meals)</option>
                      <option value="06:30 PM">06:30 PM (Dinner Tiffin)</option>
                      <option value="07:30 PM">07:30 PM (Dinner Tiffin)</option>
                      <option value="08:30 PM">08:30 PM (Dinner Tiffin)</option>
                      <option value="09:15 PM">09:15 PM (Dinner Tiffin)</option>
                    </select>
                    {formErrors.preferredTime && (
                      <div className="form-error-msg">
                        <AlertCircle size={14} /> {formErrors.preferredTime}
                      </div>
                    )}
                  </div>

                </div>

                {/* Special Instructions */}
                <div className="form-group">
                  <label htmlFor="specialInstructions" className="form-label">
                    Special Instructions / Notes <span style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>(Optional)</span>
                  </label>
                  <textarea
                    id="specialInstructions"
                    name="specialInstructions"
                    rows="3"
                    value={formData.specialInstructions}
                    onChange={handleChange}
                    placeholder="e.g. Special menu requirements, event venue, or specific dietary requests..."
                    className="form-control"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.95rem', fontSize: '1.05rem', marginTop: '0.5rem' }}
                >
                  {isSubmitting ? (
                    <span>Submitting Enquiry...</span>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Request Bulk Catering</span>
                    </>
                  )}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '1rem', fontSize: '0.82rem', color: 'var(--color-text-muted)', justifyContent: 'center' }}>
                  <Info size={14} /> Our team will call you within 24 hours to confirm availability, pricing, and delivery details.
                </div>

              </form>
            )}
          </div>

          {/* Right Column: Direct Instant Help & Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>

            {/* Quick Contact Box */}
            <div style={{
              backgroundColor: '#ffffff',
              padding: '2rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: 'var(--color-primary-dark)' }}>
                Quick Catering Enquiry?
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.94rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                Need an instant quote or want to discuss your event menu in detail? Call or WhatsApp us directly to speak with our catering team.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <a
                  href={`tel:${RESTAURANT_CONFIG.phone.replace(/[^0-9+]/g, '')}`}
                  className="btn btn-secondary"
                  style={{ justifyContent: 'flex-start' }}
                >
                  <Phone size={18} color="var(--color-primary)" />
                  <span>Call Direct: {RESTAURANT_CONFIG.phone}</span>
                </a>

                <a
                  href={`https://wa.me/${RESTAURANT_CONFIG.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello, I have an enquiry regarding bulk catering.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-whatsapp"
                  style={{ justifyContent: 'flex-start' }}
                >
                  <MessageCircle size={18} />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Catering Note */}
            <div style={{
              backgroundColor: 'var(--color-primary-subtle)',
              padding: '1.5rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(194, 65, 12, 0.2)'
            }}>
              <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary-dark)', marginBottom: '0.4rem' }}>
                🍛 What We Cater For
              </h4>
              <ul style={{ listStyle: 'none', fontSize: '0.86rem', color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
                <li>✅ Weddings &amp; Housewarmings</li>
                <li>✅ Birthday Parties &amp; Puja Functions</li>
                <li>✅ Corporate Tiffin Box Services</li>
                <li>✅ School / College Events</li>
                <li>✅ Office Lunch Deliveries (bulk)</li>
                <li>✅ Travel Parcel Boxes (bulk)</li>
              </ul>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
