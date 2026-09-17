import React, { useState } from 'react';
import { Sparkles, ZoomIn, Image as ImageIcon } from 'lucide-react';
import LightboxModal from '../components/LightboxModal';
import { GALLERY_ITEMS } from '../data/restaurantData';

const GALLERY_CATEGORIES = ['All', 'Meals', 'Breakfast', 'Beverages', 'Ambience'];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeLightboxIndex, setActiveLightboxIndex] = useState(null);

  const fallbackImage = 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=1000&q=80';

  const filteredItems = selectedCategory === 'All'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter((item) => item.category.toLowerCase() === selectedCategory.toLowerCase());

  const getCategoryCount = (category) => {
    if (category === 'All') return GALLERY_ITEMS.length;
    return GALLERY_ITEMS.filter((item) => item.category.toLowerCase() === category.toLowerCase()).length;
  };

  const handleOpenLightbox = (index) => {
    setActiveLightboxIndex(index);
  };

  const handleCloseLightbox = () => {
    setActiveLightboxIndex(null);
  };

  const handlePrev = () => {
    if (activeLightboxIndex > 0) {
      setActiveLightboxIndex(activeLightboxIndex - 1);
    } else {
      setActiveLightboxIndex(filteredItems.length - 1);
    }
  };

  const handleNext = () => {
    if (activeLightboxIndex < filteredItems.length - 1) {
      setActiveLightboxIndex(activeLightboxIndex + 1);
    } else {
      setActiveLightboxIndex(0);
    }
  };

  return (
    <div className="animate-fade-in section-padding" style={{ backgroundColor: 'var(--color-bg-main)', minHeight: '85vh' }}>
      <div className="container">
        
        {/* Page Header */}
        <div className="section-header">
          <span className="section-badge">
            <Sparkles size={14} color="var(--color-primary)" /> Visual Feast
          </span>
          <h1 className="section-title">Photo & Dish Gallery</h1>
          <p className="section-subtitle">
            Take a visual tour of our freshly prepared South Indian dishes, crisp dosas, authentic meals, and dining ambience.
          </p>
        </div>

        {/* Category Filters with Counts */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.6rem',
          flexWrap: 'wrap',
          marginBottom: '3rem'
        }}>
          {GALLERY_CATEGORIES.map((category) => {
            const isActive = selectedCategory === category;
            const count = getCategoryCount(category);
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: '0.55rem 1.3rem',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  border: isActive ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                  backgroundColor: isActive ? 'var(--color-primary)' : '#ffffff',
                  color: isActive ? '#ffffff' : 'var(--color-text-main)',
                  boxShadow: isActive ? '0 4px 12px rgba(194, 65, 12, 0.25)' : 'var(--shadow-sm)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem'
                }}
              >
                <span>{category}</span>
                <span style={{
                  fontSize: '0.78rem',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '999px',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : 'var(--color-bg-subtle)',
                  color: isActive ? '#ffffff' : 'var(--color-text-muted)'
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Gallery Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.75rem'
        }}>
          {filteredItems.map((item, index) => (
            <div
              key={item.id}
              onClick={() => handleOpenLightbox(index)}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--color-border-light)',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all var(--transition-normal)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
            >
              {/* Image Container with overlay */}
              <div style={{ position: 'relative', width: '100%', height: '260px', overflow: 'hidden' }}>
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.src = fallbackImage; }}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform var(--transition-slow)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                />

                {/* Category Pill */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  backgroundColor: 'rgba(28, 25, 23, 0.8)',
                  backdropFilter: 'blur(4px)',
                  color: '#ffffff',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  {item.category}
                </div>

                {/* Hover Zoom Icon */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: 'var(--color-primary)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <ZoomIn size={16} />
                </div>
              </div>

              {/* Caption */}
              <div style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--color-text-main)', marginBottom: '0.35rem' }}>
                  {item.title}
                </h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', lineHeight: '1.5' }}>
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Viewer */}
        {activeLightboxIndex !== null && (
          <LightboxModal
            item={filteredItems[activeLightboxIndex]}
            onClose={handleCloseLightbox}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        )}

      </div>
    </div>
  );
}
