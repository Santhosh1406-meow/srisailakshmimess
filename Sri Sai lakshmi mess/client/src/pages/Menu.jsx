import React, { useState, useEffect } from 'react';
import { Search, Utensils, Sparkles, Filter, Leaf, RefreshCw, ShoppingBag, ArrowRight } from 'lucide-react';
import DishCard from '../components/DishCard';
import { MenuGridSkeleton } from '../components/SkeletonLoader';
import { fetchMenu } from '../services/api';
import { useCart } from '../context/CartContext';

const CATEGORIES = ['All', 'Breakfast', 'Meals', 'Beverages'];

export default function MenuPage() {
  const { cartCount, cartTotal, openCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyVeg, setOnlyVeg] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadMenu = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMenu({
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        search: searchQuery.trim() || undefined
      });
      setMenuItems(data);
    } catch (err) {
      console.error('Failed to load menu:', err);
      setError('Unable to load latest menu items from server. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search slightly
    const timer = setTimeout(() => {
      loadMenu();
    }, 250);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery]);

  const displayedItems = onlyVeg
    ? menuItems.filter((item) => item.isVegetarian)
    : menuItems;

  return (
    <div className="animate-fade-in section-padding" style={{ backgroundColor: 'var(--color-bg-main)', minHeight: '80vh' }}>
      <div className="container">
        
        {/* Page Header */}
        <div className="section-header">
          <span className="section-badge">
            <Sparkles size={14} color="var(--color-primary)" />
            Traditional South Indian Delicacies
          </span>
          <h1 className="section-title">Our Food Menu</h1>
          <p className="section-subtitle">
            Every dish is prepared using fresh ingredients, time-tested recipes, and authentic South Indian spices.
          </p>
        </div>

        {/* Filter Controls & Search Bar */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '1.5rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--color-border)',
          marginBottom: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}>
          
          {/* Category Tabs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.65rem',
            flexWrap: 'wrap'
          }}>
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '0.6rem 1.4rem',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    border: isActive ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                    backgroundColor: isActive ? 'var(--color-primary)' : '#ffffff',
                    color: isActive ? '#ffffff' : 'var(--color-text-main)',
                    boxShadow: isActive ? '0 4px 12px rgba(194, 65, 12, 0.25)' : 'none'
                  }}
                >
                  {cat === 'All' ? '🍽️ All Dishes' : cat === 'Breakfast' ? '🥞 Breakfast' : cat === 'Meals' ? '🍛 Meals & Lunch' : '☕ Beverages'}
                </button>
              );
            })}
          </div>

          {/* Search & Veg Filter Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            paddingTop: '0.75rem',
            borderTop: '1px dashed var(--color-border)'
          }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: '1 1 280px', maxWidth: '450px' }}>
              <Search
                size={18}
                color="var(--color-text-light)"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                placeholder="Search dishes (e.g., Dosa, Idli, Meals, Coffee)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>

            {/* Veg-Only Filter Button */}
            <button
              onClick={() => setOnlyVeg(!onlyVeg)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1.1rem',
                borderRadius: 'var(--radius-sm)',
                border: onlyVeg ? '1.5px solid var(--color-leaf-green)' : '1.5px solid var(--color-border)',
                backgroundColor: onlyVeg ? 'var(--color-leaf-green-light)' : '#ffffff',
                color: onlyVeg ? 'var(--color-leaf-green)' : 'var(--color-text-muted)',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              <Leaf size={16} />
              <span>{onlyVeg ? '✓ Pure Veg Only' : 'Filter Pure Veg'}</span>
            </button>
          </div>

        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            padding: '1rem 1.5rem',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>{error}</span>
            <button onClick={loadMenu} className="btn btn-sm btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* Dishes Grid */}
        {loading ? (
          <MenuGridSkeleton count={8} />
        ) : displayedItems.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '5rem 1.5rem',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--color-border)'
          }}>
            <Utensils size={48} color="var(--color-text-light)" style={{ margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: '1.4rem', color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>
              No dishes found matching your criteria
            </h3>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
              Try searching with a different term or reset your category filters.
            </p>
            <button
              onClick={() => { setSelectedCategory('All'); setSearchQuery(''); setOnlyVeg(false); }}
              className="btn btn-primary btn-sm"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '2rem'
          }}>
            {displayedItems.map((dish) => (
              <DishCard key={dish.id} dish={dish} />
            ))}
          </div>
        )}

        {/* Notice */}
        <div style={{
          marginTop: '3.5rem',
          marginBottom: cartCount > 0 ? '5rem' : '0',
          textAlign: 'center',
          fontSize: '0.9rem',
          color: 'var(--color-text-muted)',
          backgroundColor: 'var(--color-primary-subtle)',
          padding: '1rem 1.5rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid rgba(194, 65, 12, 0.15)'
        }}>
          💡 <em>All dishes are prepared fresh to order. For party orders, bulk tiffin boxes, or special dietary requirements, please contact us or submit an enquiry.</em>
        </div>

        {/* Floating Cart CTA Bar */}
        {cartCount > 0 && (
          <div className="floating-cart-bar animate-slide-up">
            <div className="floating-cart-inner">
              <div className="floating-cart-info">
                <div className="floating-cart-badge">
                  <ShoppingBag size={18} />
                  <span>{cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
                </div>
                <div className="floating-cart-amount">
                  ₹{cartTotal}
                </div>
              </div>

              <button
                type="button"
                id="floating-view-cart-btn"
                onClick={openCart}
                className="floating-cart-btn"
              >
                <span>View Cart & Checkout</span>
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
