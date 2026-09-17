import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="animate-fade-in section-padding" style={{
      minHeight: '75vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--color-bg-main)',
      textAlign: 'center'
    }}>
      <div className="container" style={{ maxWidth: '600px' }}>
        <div style={{
          fontSize: '4.5rem',
          marginBottom: '1rem',
          filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.1))'
        }}>
          🍛
        </div>
        <h1 style={{
          fontSize: '4.5rem',
          fontFamily: 'var(--font-heading)',
          color: 'var(--color-primary)',
          lineHeight: 1,
          marginBottom: '0.5rem'
        }}>
          404
        </h1>
        <h2 style={{ fontSize: '1.8rem', color: 'var(--color-text-main)', marginBottom: '1rem' }}>
          Dish or Page Not Found!
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '2rem' }}>
          Looks like this recipe isn't on our stove today. Let's get you back to our delicious South Indian home menu.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/" className="btn btn-primary">
            <Home size={18} />
            <span>Go to Homepage</span>
          </Link>
          <Link to="/menu" className="btn btn-secondary">
            <Utensils size={18} />
            <span>Explore Menu</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
