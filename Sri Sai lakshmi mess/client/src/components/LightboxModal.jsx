import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function LightboxModal({ item, onClose, onPrev, onNext }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onPrev, onNext]);

  if (!item) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        backdropFilter: 'blur(8px)'
      }}
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          color: '#ffffff',
          borderRadius: '50%',
          width: '44px',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: 'none',
          transition: 'background 0.2s ease'
        }}
        aria-label="Close Lightbox"
      >
        <X size={26} />
      </button>

      {/* Previous Button */}
      {onPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          style={{
            position: 'absolute',
            left: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: 'none'
          }}
          aria-label="Previous Image"
        >
          <ChevronLeft size={30} />
        </button>
      )}

      {/* Main Content Modal */}
      <div
        style={{
          maxWidth: '900px',
          maxHeight: '90vh',
          backgroundColor: '#1c1917',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ position: 'relative', overflow: 'hidden', maxHeight: '65vh', backgroundColor: '#000000' }}>
          <img
            src={item.image}
            alt={item.title}
            style={{
              width: '100%',
              height: '100%',
              maxHeight: '65vh',
              objectFit: 'contain',
              display: 'block',
              margin: '0 auto'
            }}
          />
        </div>

        <div style={{ padding: '1.5rem', color: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              backgroundColor: 'var(--color-primary)',
              padding: '0.2rem 0.6rem',
              borderRadius: '999px'
            }}>
              {item.category}
            </span>
            <h3 style={{ fontSize: '1.3rem', color: '#ffffff', fontFamily: 'var(--font-heading)' }}>
              {item.title}
            </h3>
          </div>
          <p style={{ color: '#a8a29e', fontSize: '0.94rem' }}>{item.description}</p>
        </div>
      </div>

      {/* Next Button */}
      {onNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          style={{
            position: 'absolute',
            right: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: 'none'
          }}
          aria-label="Next Image"
        >
          <ChevronRight size={30} />
        </button>
      )}
    </div>
  );
}
