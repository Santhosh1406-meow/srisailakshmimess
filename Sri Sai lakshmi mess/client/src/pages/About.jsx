import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, Utensils, ShieldCheck, Flame, Users, Clock, Coffee } from 'lucide-react';
import { RESTAURANT_CONFIG, ABOUT_STATS } from '../data/restaurantData';

export default function AboutPage() {
  return (
    <div className="animate-fade-in section-padding" style={{ backgroundColor: 'var(--color-bg-main)' }}>
      <div className="container">
        
        {/* Page Header */}
        <div className="section-header">
          <span className="section-badge">Our Story & Heritage</span>
          <h1 className="section-title">About Sri Sai Lakshmi Mess</h1>
          <p className="section-subtitle">
            Dedicated to bringing honest, soul-satisfying South Indian homely food prepared with pure ingredients and traditional care.
          </p>
        </div>

        {/* Section 1: Main Story Block with Image */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '3.5rem',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          padding: '3rem',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--color-border)',
          marginBottom: '4rem'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--color-gold-dark)',
              fontWeight: 700,
              fontSize: '0.9rem',
              marginBottom: '0.5rem'
            }}>
              <Sparkles size={16} /> TRADITIONAL MESS PHILOSOPHY
            </div>
            
            <h2 style={{ fontSize: '2rem', marginBottom: '1.25rem', color: 'var(--color-primary-dark)' }}>
              "Food Cooked with the Simplicity and Love of Home"
            </h2>

            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.02rem', lineHeight: '1.7', marginBottom: '1.25rem' }}>
              <strong>Sri Sai Lakshmi Mess</strong> was founded with a straightforward mission: to serve clean, hygienic, and authentically seasoned South Indian meals that make you feel right at home.
            </p>

            <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: '1.7', marginBottom: '1.25rem' }}>
              We steer clear of heavy artificial food colorings, synthetic flavoring powders, and excessive oil. Instead, we rely on fresh seasonal vegetables, stone-ground masala blends, freshly extracted coconut milk, and fragrant clarified butter (ghee).
            </p>

            <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: '1.7', marginBottom: '2rem' }}>
              Whether you are dropping by for a crispy morning Ghee Roast Dosa, savoring our unlimited afternoon South Indian Banana Leaf Thali, or sipping steaming Kumbakonam Degree Coffee, our goal is your complete satisfaction.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/menu" className="btn btn-primary">
                <Utensils size={16} /> Explore Today's Menu
              </Link>
              <Link to="/contact" className="btn btn-secondary">
                Find Our Location
              </Link>
            </div>
          </div>

          <div>
            <div style={{
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              border: '4px solid var(--color-bg-subtle)'
            }}>
              <img
                src="https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=900&q=80"
                alt="Traditional South Indian Cooking & Ingredients"
                style={{ width: '100%', height: '420px', objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Four Core Pillars */}
        <div style={{ marginBottom: '4rem' }}>
          <div className="section-header" style={{ marginBottom: '2.5rem' }}>
            <span className="section-badge">Our Guiding Pillars</span>
            <h2 className="section-title" style={{ fontSize: '2.1rem' }}>What Defines Sri Sai Lakshmi Mess</h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.8rem'
          }}>
            <div style={{
              backgroundColor: '#ffffff',
              padding: '2.2rem 1.6rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-primary-subtle)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <Flame size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.6rem' }}>Freshly Prepared</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', lineHeight: '1.6' }}>
                We cook in small, frequent batches throughout the day to ensure your food is always steaming, aromatic, and crispy.
              </p>
            </div>

            <div style={{
              backgroundColor: '#ffffff',
              padding: '2.2rem 1.6rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-gold-light)',
                color: 'var(--color-gold-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <ShieldCheck size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.6rem' }}>Affordable Prices</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', lineHeight: '1.6' }}>
                Wholesome food should be accessible. We maintain honest, pocket-friendly pricing for daily diners, students, and families.
              </p>
            </div>

            <div style={{
              backgroundColor: '#ffffff',
              padding: '2.2rem 1.6rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'var(--color-leaf-green-light)',
                color: 'var(--color-leaf-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <Heart size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.6rem' }}>Authentic Recipes</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', lineHeight: '1.6' }}>
                Every sambar, rasam, and chutney honors traditional regional cooking techniques without shortcuts.
              </p>
            </div>

            <div style={{
              backgroundColor: '#ffffff',
              padding: '2.2rem 1.6rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(217, 119, 6, 0.15)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                <Users size={24} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.6rem' }}>Customer Satisfaction</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.92rem', lineHeight: '1.6' }}>
                We treat every customer who walks in as our honored guest with friendly service and genuine hospitality.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Dining Experience Highlights */}
        <div style={{
          backgroundColor: '#1c1917',
          color: '#ffffff',
          padding: '3.5rem',
          borderRadius: 'var(--radius-lg)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '3rem',
          alignItems: 'center'
        }}>
          <div>
            <span style={{
              color: '#fbbf24',
              fontSize: '0.85rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              The Mess Experience
            </span>
            <h3 style={{ fontSize: '1.9rem', fontFamily: 'var(--font-heading)', color: '#ffffff', marginTop: '0.5rem', marginBottom: '1rem' }}>
              Pure Flavors, Hygienic Ambiance & Warm Hospitality
            </h3>
            <p style={{ color: '#a8a29e', fontSize: '0.96rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
              We maintain spotless clean dining tables, sanitized kitchen stations, and eco-friendly banana leaves. Come with your family or friends to enjoy an authentic meal.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.94rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fed7aa' }}>
                ✓ Filtered drinking water & RO purification
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fed7aa' }}>
                ✓ 100% Vegetarian fresh kitchen
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fed7aa' }}>
                ✓ Takeaway & Parcel packing available
              </div>
            </div>
          </div>

          <div style={{
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            border: '2px solid rgba(255,255,255,0.1)'
          }}>
            <img
              src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80"
              alt="Hygienic Mess Dining Space"
              style={{ width: '100%', height: '300px', objectFit: 'cover' }}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
