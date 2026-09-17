import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Heart, ExternalLink } from 'lucide-react';
import { RESTAURANT_CONFIG } from '../data/restaurantData';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{
      backgroundColor: '#1c1917',
      color: '#e7e0d6',
      paddingTop: '4.5rem',
      paddingBottom: '2rem',
      borderTop: '4px solid var(--color-primary)',
      marginTop: 'auto'
    }}>
      <div className="container">

        {/* Main Footer Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '3rem',
          marginBottom: '3.5rem'
        }}>

          {/* Col 1: Brand & Tagline */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
              <img
                src="/logo.png"
                alt="Sri Sai Lakshmi Mess Logo"
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #d97706',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                  flexShrink: 0
                }}
              />
              <h3 style={{
                color: '#ffffff',
                fontFamily: 'var(--font-heading)',
                fontSize: '1.5rem',
                letterSpacing: '-0.01em'
              }}>
                Sri Sai Lakshmi Mess
              </h3>
            </div>

            <p style={{
              color: '#d97706',
              fontWeight: 600,
              fontSize: '0.92rem',
              marginBottom: '1rem',
              fontStyle: 'italic'
            }}>
              "{RESTAURANT_CONFIG.tagline}"
            </p>

            <p style={{ color: '#a8a29e', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
              Freshly prepared South Indian meals, soft idlis, crispy dosas, and aromatic degree filter coffee crafted with homely care and authentic spices.
            </p>

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <span style={{
                background: 'rgba(255,255,255,0.08)',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                color: '#86efac'
              }}>
                🌱 100% Pure & Hygienic
              </span>
              <span style={{
                background: 'rgba(255,255,255,0.08)',
                padding: '0.35rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
                color: '#fed7aa'
              }}>
                ☕ Filter Coffee
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 style={{
              color: '#ffffff',
              fontSize: '1.15rem',
              marginBottom: '1.25rem',
              position: 'relative',
              paddingBottom: '0.5rem',
              borderBottom: '2px solid rgba(194, 65, 12, 0.4)'
            }}>
              Quick Links
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.94rem' }}>
              <li>
                <Link to="/" style={{ color: '#d6d3d1', transition: 'all 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fb923c'} onMouseLeave={(e) => e.currentTarget.style.color = '#d6d3d1'}>
                  → Home
                </Link>
              </li>
              <li>
                <Link to="/menu" style={{ color: '#d6d3d1', transition: 'all 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fb923c'} onMouseLeave={(e) => e.currentTarget.style.color = '#d6d3d1'}>
                  → Our Menu & Specials
                </Link>
              </li>
              <li>
                <Link to="/about" style={{ color: '#d6d3d1', transition: 'all 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fb923c'} onMouseLeave={(e) => e.currentTarget.style.color = '#d6d3d1'}>
                  → About Us & Tradition
                </Link>
              </li>
              <li>
                <Link to="/gallery" style={{ color: '#d6d3d1', transition: 'all 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fb923c'} onMouseLeave={(e) => e.currentTarget.style.color = '#d6d3d1'}>
                  → Food & Ambience Gallery
                </Link>
              </li>
              <li>
                <Link to="/order" style={{ color: '#d6d3d1', transition: 'all 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fb923c'} onMouseLeave={(e) => e.currentTarget.style.color = '#d6d3d1'}>
                  → Bulk &amp; Catering Enquiry
                </Link>
              </li>
              <li>
                <Link to="/login?role=customer" style={{ color: '#d6d3d1', transition: 'all 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#fb923c'} onMouseLeave={(e) => e.currentTarget.style.color = '#d6d3d1'}>
                  → Customer Login
                </Link>
              </li>
              <li>
                <Link to="/login?role=delivery" style={{ color: '#93c5fd', transition: 'all 0.2s ease' }} onMouseEnter={(e) => e.currentTarget.style.color = '#60a5fa'} onMouseLeave={(e) => e.currentTarget.style.color = '#93c5fd'}>
                  → 🛵 Delivery Partner Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Timings & Operating Hours */}
          <div>
            <h4 style={{
              color: '#ffffff',
              fontSize: '1.15rem',
              marginBottom: '1.25rem',
              position: 'relative',
              paddingBottom: '0.5rem',
              borderBottom: '2px solid rgba(194, 65, 12, 0.4)'
            }}>
              Serving Timings
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.92rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <Clock size={18} color="#fb923c" style={{ marginTop: '3px', flexShrink: 0 }} />
                <div>
                  <div style={{ color: '#ffffff', fontWeight: 600 }}>All Days Open</div>
                  <div style={{ color: '#a8a29e' }}>7:00 AM – 10:00 PM</div>
                </div>
              </div>

              <div style={{ backgroundColor: 'rgba(255,255,255,0.04)', padding: '0.85rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ color: '#fed7aa', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Meal Timings:</div>
                <div style={{ color: '#d6d3d1', fontSize: '0.82rem', lineHeight: '1.5' }}>
                  • Breakfast: 7:00 AM – 11:30 AM<br />
                  • Meals & Lunch: 12:00 PM – 3:30 PM<br />
                  • Tiffin & Dinner: 6:00 PM – 10:00 PM
                </div>
              </div>
            </div>
          </div>

          {/* Col 4: Contact Info */}
          <div>
            <h4 style={{
              color: '#ffffff',
              fontSize: '1.15rem',
              marginBottom: '1.25rem',
              position: 'relative',
              paddingBottom: '0.5rem',
              borderBottom: '2px solid rgba(194, 65, 12, 0.4)'
            }}>
              Contact Us
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', fontSize: '0.92rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <MapPin size={18} color="#fb923c" style={{ marginTop: '3px', flexShrink: 0 }} />
                <span style={{ color: '#d6d3d1' }}>{RESTAURANT_CONFIG.address}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Phone size={18} color="#fb923c" style={{ flexShrink: 0 }} />
                <a href={`tel:${RESTAURANT_CONFIG.phone.replace(/[^0-9+]/g, '')}`} style={{ color: '#ffffff', fontWeight: 600 }}>
                  {RESTAURANT_CONFIG.phone}
                </a>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Mail size={18} color="#fb923c" style={{ flexShrink: 0 }} />
                <a href={`mailto:${RESTAURANT_CONFIG.email}`} style={{ color: '#d6d3d1' }}>
                  {RESTAURANT_CONFIG.email}
                </a>
              </div>

              <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link to="/order" className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                  Bulk Catering Enquiry
                </Link>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar / Copyright */}
        <div style={{
          paddingTop: '2rem',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.86rem',
          color: '#a8a29e'
        }}>
          <div>
            © {currentYear} <strong>Sri Sai Lakshmi Mess</strong>. All Rights Reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Authentic South Indian Homely Food with <Heart size={14} color="#ef4444" fill="#ef4444" />
          </div>
        </div>

      </div>
    </footer>
  );
}
