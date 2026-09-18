import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Utensils, Sparkles, CheckCircle2, PhoneCall, ChevronRight, Award, Tag, Gift, Clock } from 'lucide-react';
import DishCard from '../components/DishCard';
import { DishCardSkeleton } from '../components/SkeletonLoader';
import { fetchMenu, fetchActiveOffers } from '../services/api';
import { RESTAURANT_CONFIG, HIGHLIGHTS_DATA, ABOUT_STATS } from '../data/restaurantData';

export default function Home() {
  const [popularDishes, setPopularDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOffers, setActiveOffers] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function loadPopular() {
      try {
        const dishes = await fetchMenu({ popular: true });
        if (isMounted) {
          setPopularDishes(dishes.slice(0, 6));
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching popular dishes:', err);
        if (isMounted) setLoading(false);
      }
    }
    async function loadOffers() {
      try {
        const offers = await fetchActiveOffers();
        if (isMounted) setActiveOffers(offers || []);
      } catch (_) {}
    }
    loadPopular();
    loadOffers();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="animate-fade-in">

      {/* 1. HERO SECTION */}
      <section style={{
        position: 'relative',
        minHeight: '88vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(rgba(17, 10, 5, 0.75), rgba(28, 15, 8, 0.85)), url(https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=1920&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        color: '#ffffff',
        padding: '5rem 0'
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: '780px' }}>

            {/* Top Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(217, 119, 6, 0.25)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#fef3c7',
              padding: '0.45rem 1.1rem',
              borderRadius: '999px',
              fontSize: '0.9rem',
              fontWeight: 600,
              marginBottom: '1.5rem',
              backdropFilter: 'blur(6px)'
            }}>
              <Sparkles size={16} color="#fbbf24" />
              <span>{RESTAURANT_CONFIG.tagline}</span>
            </div>

            {/* Main Heading */}
            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: '1.25rem',
              color: '#ffffff',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)'
            }}>
              Sri Sai Lakshmi Mess
            </h1>

            <h2 style={{
              fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)',
              color: '#fed7aa',
              fontWeight: 600,
              marginBottom: '1.2rem'
            }}>
              Authentic South Indian Homely Food
            </h2>

            {/* Description */}
            <p style={{
              fontSize: '1.15rem',
              lineHeight: 1.7,
              color: '#e7e5e4',
              marginBottom: '2.5rem',
              maxWidth: '650px'
            }}>
              Freshly prepared meals with authentic flavours, quality ingredients and the warmth of home. Serving piping hot ghee dosas, soft idlis, hearty meals and aromatic Kumbakonam filter coffee.
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/menu" className="btn btn-primary btn-lg" id="hero-menu-btn">
                <Utensils size={20} />
                <span>View Full Menu</span>
              </Link>

              <Link to="/order" className="btn btn-secondary btn-lg" id="hero-order-btn" style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}>
                <span>Bulk Catering Enquiry</span>
                <ArrowRight size={20} />
              </Link>
            </div>

            {/* Trust Badges */}
            <div style={{
              marginTop: '3.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '2rem',
              flexWrap: 'wrap',
              borderTop: '1px solid rgba(255,255,255,0.15)',
              paddingTop: '1.5rem',
              fontSize: '0.92rem',
              color: '#fed7aa'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={18} color="#4ade80" /> 100% Homely Spices
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={18} color="#4ade80" /> Traditional Banana Leaf Dining
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={18} color="#4ade80" /> Fresh Daily Preparation
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. RESTAURANT HIGHLIGHTS */}
      <section className="section-padding" style={{ backgroundColor: '#ffffff' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Why Dine With Us</span>
            <h2 className="section-title">The Essence of Our Kitchen</h2>
            <p className="section-subtitle">
              We bring the timeless warmth and wholesome goodness of traditional South Indian mess dining to your plate every day.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '2rem'
          }}>
            {HIGHLIGHTS_DATA.map((item) => (
              <div
                key={item.id}
                style={{
                  backgroundColor: 'var(--color-bg-main)',
                  padding: '2.2rem 1.8rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  transition: 'all var(--transition-normal)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.8rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                  e.currentTarget.style.borderColor = 'var(--color-gold)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'var(--color-border)';
                }}
              >
                <div style={{ fontSize: '2.6rem', marginBottom: '0.25rem' }}>{item.icon}</div>
                <h3 style={{ fontSize: '1.35rem', color: 'var(--color-text-main)' }}>{item.title}</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-gold-dark)', fontWeight: 600 }}>
                  {item.tamilTitle}
                </span>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.94rem', lineHeight: '1.6' }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. POPULAR / SPECIAL DISHES */}
      <section className="section-padding" style={{ backgroundColor: 'var(--color-bg-main)' }}>
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Customer Favorites</span>
            <h2 className="section-title">Our Popular Dishes</h2>
            <p className="section-subtitle">
              Crafted fresh on order with signature sambar, coconut chutneys, and pure farm ghee.
            </p>
          </div>

          {loading ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '2rem'
            }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <DishCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '2rem'
            }}>
              {popularDishes.map((dish) => (
                <DishCard key={dish.id} dish={dish} />
              ))}
            </div>
          )}

          {/* View Menu Button */}
          <div style={{ textAlign: 'center', marginTop: '3.5rem' }}>
            <Link to="/menu" className="btn btn-primary btn-lg" id="explore-menu-btn">
              <span>View Full Menu & Categories</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* 3b. OFFERS & DEALS SECTION */}
      {activeOffers.length > 0 && (
        <section className="section-padding" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1235 50%, #0f172a 100%)' }}>
          <div className="container">
            <div className="section-header">
              <span className="section-badge" style={{ background: 'rgba(167,139,250,0.2)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' }}>🎁 Exclusive Deals</span>
              <h2 className="section-title" style={{ color: '#ffffff' }}>Current Offers & Discounts</h2>
              <p className="section-subtitle" style={{ color: '#94a3b8' }}>Use these exclusive coupon codes when placing your order to save big!</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
              {activeOffers.map((offer, idx) => (
                <div
                  key={offer.id}
                  style={{
                    background: 'linear-gradient(135deg, rgba(30,18,53,0.95), rgba(15,23,42,0.95))',
                    border: '1px solid rgba(167,139,250,0.3)',
                    borderRadius: '18px',
                    padding: '1.75rem',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(124,58,237,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  {/* Decorative circle */}
                  <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(124,58,237,0.1)' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(167,139,250,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Gift size={24} style={{ color: '#a78bfa' }} />
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '2rem', fontWeight: '900', color: offer.discountType === 'percent' ? '#34d399' : '#fb923c', lineHeight: 1 }}>
                        {offer.discountType === 'percent' ? `${offer.discountValue}%` : `₹${offer.discountValue}`}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>OFF</div>
                    </div>
                  </div>

                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.4rem' }}>{offer.title}</div>
                  {offer.description && <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5', margin: '0 0 1rem 0' }}>{offer.description}</p>}

                  {offer.minOrderAmount > 0 && (
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <CheckCircle2 size={13} style={{ color: '#22c55e' }} />
                      Min. order ₹{offer.minOrderAmount}
                    </div>
                  )}

                  {offer.validTo && (
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Clock size={13} style={{ color: '#f59e0b' }} />
                      Valid until {new Date(offer.validTo).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </div>
                  )}

                  {offer.code && (
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      backgroundColor: '#0f172a', border: '1px dashed rgba(167,139,250,0.5)',
                      borderRadius: '10px', padding: '0.65rem 1rem', marginTop: '0.5rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Tag size={14} style={{ color: '#a78bfa' }} />
                        <code style={{ color: '#a78bfa', fontWeight: '900', fontSize: '1rem', letterSpacing: '0.1em' }}>{offer.code}</code>
                      </div>
                      <button
                        onClick={() => { navigator.clipboard?.writeText(offer.code); }}
                        style={{ background: 'rgba(167,139,250,0.2)', border: 'none', color: '#a78bfa', padding: '0.25rem 0.65rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700' }}
                      >
                        Copy
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. ABOUT SECTION PREVIEW */}
      <section className="section-padding" style={{ backgroundColor: '#ffffff' }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '4rem',
            alignItems: 'center'
          }}>

            {/* Left: Image Card */}
            <div style={{ position: 'relative' }}>
              <div style={{
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-xl)',
                border: '4px solid #ffffff'
              }}>
                <img
                  src="https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=900&q=80"
                  alt="Sri Sai Lakshmi Mess Homely Meals"
                  style={{ width: '100%', height: '420px', objectFit: 'cover' }}
                />
              </div>

              {/* Floating Badge */}
              <div style={{
                position: 'absolute',
                bottom: '-20px',
                right: '20px',
                backgroundColor: 'var(--color-primary-dark)',
                color: '#ffffff',
                padding: '1.2rem 1.6rem',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-xl)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.8rem'
              }}>
                <Award size={32} color="#f59e0b" />
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>Homely Taste</div>
                  <div style={{ fontSize: '0.8rem', color: '#fed7aa' }}>Authentic Spices & Ghee</div>
                </div>
              </div>
            </div>

            {/* Right: Content */}
            <div>
              <span className="section-badge">About Sri Sai Lakshmi Mess</span>
              <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '1.25rem' }}>
                Homely South Indian Dining with Authentic Heart
              </h2>

              <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', lineHeight: '1.7', marginBottom: '1.25rem' }}>
                At <strong>Sri Sai Lakshmi Mess</strong>, we cherish the authentic culinary heritage of Tamil Nadu. Every sambar, rasam, and poriyal is prepared fresh each morning following age-old family recipes.
              </p>

              <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', lineHeight: '1.7', marginBottom: '2rem' }}>
                We believe delicious, wholesome food should be pure and affordable for everyone. We do not use artificial preservatives or taste enhancers—just pure love, high-grade spices, and fresh vegetables.
              </p>

              {/* Stats / Commitments Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '1.25rem',
                marginBottom: '2.5rem'
              }}>
                {ABOUT_STATS.map((stat, idx) => (
                  <div key={idx} style={{
                    backgroundColor: 'var(--color-bg-subtle)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-sm)',
                    borderLeft: '3px solid var(--color-primary)'
                  }}>
                    <div style={{ fontWeight: 700, color: 'var(--color-text-main)', fontSize: '0.98rem' }}>
                      {stat.label}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>
                      {stat.detail}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/about" className="btn btn-secondary">
                  <span>Read Full Story</span>
                  <ChevronRight size={16} />
                </Link>
                <Link to="/order" className="btn btn-primary">
                  <span>Book / Enquire Food</span>
                </Link>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 5. QUICK ENQUIRY BANNER */}
      <section style={{
        background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, #7c2d12 100%)',
        color: '#ffffff',
        padding: '4rem 0'
      }}>
        <div className="container">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '2rem'
          }}>
            <div style={{ maxWidth: '650px' }}>
              <span style={{
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: '#fed7aa',
                padding: '0.3rem 0.8rem',
                borderRadius: '999px',
                fontSize: '0.82rem',
                fontWeight: 700,
                textTransform: 'uppercase'
              }}>
                Bulk Orders & Catering Available
              </span>
              <h3 style={{ fontSize: '2.2rem', fontFamily: 'var(--font-heading)', color: '#ffffff', marginTop: '0.8rem', marginBottom: '0.5rem' }}>
                Planning a Family Gathering or Office Event?
              </h3>
              <p style={{ color: '#fed7aa', fontSize: '1.05rem', lineHeight: '1.6' }}>
                We provide hygienic packed meals, mini tiffins, and bulk catering with fresh South Indian homestyle taste.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/order" className="btn btn-secondary btn-lg" style={{ backgroundColor: '#ffffff', color: 'var(--color-primary-dark)' }}>
                Enquire Online
              </Link>
              <a
                href={`tel:${RESTAURANT_CONFIG.phone.replace(/[^0-9+]/g, '')}`}
                className="btn btn-outline-gold btn-lg"
                style={{ borderColor: '#ffffff', color: '#ffffff' }}
              >
                <PhoneCall size={18} />
                <span>Call {RESTAURANT_CONFIG.phone}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
