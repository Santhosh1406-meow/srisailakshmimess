import React from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle, Navigation, ExternalLink } from 'lucide-react';
import { RESTAURANT_CONFIG } from '../data/restaurantData';
import { Link } from 'react-router-dom';

export default function ContactPage() {
  const whatsappNumber = RESTAURANT_CONFIG.whatsappNumber.replace(/[^0-9]/g, '');
  const phoneTel = `tel:${RESTAURANT_CONFIG.phone.replace(/[^0-9+]/g, '')}`;

  return (
    <div className="animate-fade-in section-padding" style={{ backgroundColor: 'var(--color-bg-main)', minHeight: '85vh' }}>
      <div className="container">
        
        {/* Header */}
        <div className="section-header">
          <span className="section-badge">Get in Touch</span>
          <h1 className="section-title">Contact & Location</h1>
          <p className="section-subtitle">
            Visit us for hot meals or reach out for inquiries, catering bookings, and feedback.
          </p>
        </div>

        {/* Contact Info Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.75rem',
          marginBottom: '3.5rem'
        }}>
          
          {/* Card 1: Address */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '2rem 1.6rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem'
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-primary-subtle)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MapPin size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text-main)' }}>Our Address</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', lineHeight: '1.6' }}>
              {RESTAURANT_CONFIG.address}
            </p>
          </div>

          {/* Card 2: Phone */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '2rem 1.6rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem'
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-gold-light)',
              color: 'var(--color-gold-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Phone size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text-main)' }}>Phone Numbers</h3>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', lineHeight: '1.6' }}>
              <a href={phoneTel} style={{ color: 'var(--color-primary)', fontWeight: 600, display: 'block', fontSize: '1.05rem', marginBottom: '0.3rem' }}>
                {RESTAURANT_CONFIG.phone}
              </a>
              <span>Available for takeaway parcels & table reservations</span>
            </div>
          </div>

          {/* Card 3: Email */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '2rem 1.6rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem'
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-leaf-green-light)',
              color: 'var(--color-leaf-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Mail size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text-main)' }}>Email Address</h3>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', lineHeight: '1.6' }}>
              <a href={`mailto:${RESTAURANT_CONFIG.email}`} style={{ color: 'var(--color-primary-dark)', fontWeight: 600, display: 'block' }}>
                {RESTAURANT_CONFIG.email}
              </a>
              <span>For business & feedback</span>
            </div>
          </div>

          {/* Card 4: Hours */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: '2rem 1.6rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.8rem'
          }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              backgroundColor: 'rgba(217, 119, 6, 0.15)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Clock size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text-main)' }}>Opening Hours</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', lineHeight: '1.6' }}>
              <strong>{RESTAURANT_CONFIG.openingHours}</strong><br/>
              Open 7 days a week including festival holidays.
            </p>
          </div>

        </div>

        {/* Google Maps Section & Quick Connect */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--color-border)'
        }}>
          
          {/* Map Embed Frame */}
          <div style={{ position: 'relative', minHeight: '380px', width: '100%', backgroundColor: 'var(--color-bg-subtle)' }}>
            <iframe
              title="Sri Sai Lakshmi Mess Location Map"
              src={RESTAURANT_CONFIG.mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '380px', display: 'block' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Connect Action Box */}
          <div style={{ padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span className="section-badge" style={{ alignSelf: 'flex-start', marginBottom: '0.8rem' }}>
              Quick Navigation & Chat
            </span>
            <h2 style={{ fontSize: '1.8rem', color: 'var(--color-text-main)', marginBottom: '1rem' }}>
              How Can We Serve You Today?
            </h2>
            
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.98rem', lineHeight: '1.6', marginBottom: '2rem' }}>
              Whether you want to pre-order food parcels, enquire about our special Sunday meals, or check table availability, we are just a call or click away.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello Sri Sai Lakshmi Mess, I have an inquiry.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <MessageCircle size={18} />
                <span>Chat Instantly on WhatsApp</span>
              </a>

              <a
                href={phoneTel}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Phone size={18} color="var(--color-primary)" />
                <span>Call Restaurant: {RESTAURANT_CONFIG.phone}</span>
              </a>

              <Link
                to="/order"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
              >
                <span>Online Order / Booking Form</span>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
