import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function DishCard({ dish }) {
  const [imgError, setImgError] = useState(false);
  const { addToCart, updateQuantity, getItemQuantity } = useCart();

  const fallbackImage = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80';
  const quantityInCart = getItemQuantity(dish.id);

  return (
    <div className="food-card" id={`dish-${dish.id}`}>
      {/* Image Container */}
      <div className="food-card-img-wrapper">
        <img
          src={imgError ? fallbackImage : (dish.image || fallbackImage)}
          alt={dish.name}
          className="food-card-img"
          loading="lazy"
          onError={() => setImgError(true)}
        />
        
        {/* Category / Popular Badge */}
        {dish.isPopular && (
          <div className="food-card-badge">
            🔥 Popular
          </div>
        )}
      </div>

      {/* Body Content */}
      <div className="food-card-body">
        
        {/* Title & Veg Badge Row */}
        <div className="food-card-title-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            {dish.isVegetarian && (
              <span className="veg-badge" title="100% Pure Vegetarian">
                <span className="veg-badge-dot"></span>
              </span>
            )}
            <h3 className="food-card-title">{dish.name}</h3>
          </div>
          
          {/* Rating */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.2rem',
            backgroundColor: 'var(--color-gold-light)',
            padding: '0.15rem 0.45rem',
            borderRadius: '4px',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--color-gold-dark)',
            flexShrink: 0
          }}>
            <Star size={12} fill="#d97706" color="#d97706" />
            <span>{dish.rating || 4.8}</span>
          </div>
        </div>

        {/* Tamil subtitle if available */}
        {dish.tamilName && (
          <div className="food-card-tamil">{dish.tamilName}</div>
        )}

        {/* Description */}
        <p className="food-card-desc">{dish.description}</p>

        {/* Card Footer with Price & Quick Action */}
        <div className="food-card-footer" style={{ flexDirection: 'column', gap: '0.65rem', alignItems: 'stretch' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-light)', display: 'block', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Price</span>
              <div className="food-card-price" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>₹{dish.price}</div>
            </div>

            {quantityInCart === 0 ? (
              <button
                type="button"
                id={`add-to-cart-${dish.id}`}
                onClick={() => addToCart(dish)}
                className="btn btn-primary btn-sm add-to-cart-btn"
                style={{
                  borderRadius: 'var(--radius-full)',
                  padding: '0.45rem 1.1rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  boxShadow: '0 4px 12px rgba(194, 65, 12, 0.25)',
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                <ShoppingCart size={15} />
                <span>Add to Cart</span>
              </button>
            ) : (
              <div
                className="cart-qty-stepper"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  backgroundColor: 'var(--color-primary)',
                  color: '#ffffff',
                  borderRadius: 'var(--radius-full)',
                  padding: '0.25rem 0.5rem',
                  gap: '0.6rem',
                  boxShadow: '0 4px 12px rgba(194, 65, 12, 0.3)'
                }}
              >
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => updateQuantity(dish.id, quantityInCart - 1)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: '#ffffff',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                >
                  <Minus size={13} strokeWidth={3} />
                </button>
                <span style={{ fontWeight: 800, fontSize: '0.95rem', minWidth: '18px', textAlign: 'center' }}>
                  {quantityInCart}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => updateQuantity(dish.id, quantityInCart + 1)}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none',
                    color: '#ffffff',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                >
                  <Plus size={13} strokeWidth={3} />
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px dashed #f1f5f9', paddingTop: '0.35rem' }}>
            <Link
              to={`/order?dish=${encodeURIComponent(dish.name)}`}
              style={{
                fontSize: '0.78rem',
                color: 'var(--color-gold-dark)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
                fontWeight: 600
              }}
            >
              <span>Need bulk catering? (10+ plates)</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
