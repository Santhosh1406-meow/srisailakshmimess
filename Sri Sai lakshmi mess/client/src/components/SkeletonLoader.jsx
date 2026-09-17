import React from 'react';

export function DishCardSkeleton() {
  return (
    <div className="food-card" style={{ pointerEvents: 'none' }}>
      <div className="skeleton" style={{ height: '210px', width: '100%' }} />
      <div className="food-card-body" style={{ gap: '0.8rem' }}>
        <div className="skeleton" style={{ height: '24px', width: '70%', borderRadius: '4px' }} />
        <div className="skeleton" style={{ height: '14px', width: '40%', borderRadius: '4px' }} />
        <div className="skeleton" style={{ height: '40px', width: '100%', borderRadius: '4px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
          <div className="skeleton" style={{ height: '28px', width: '60px', borderRadius: '4px' }} />
          <div className="skeleton" style={{ height: '36px', width: '120px', borderRadius: '20px' }} />
        </div>
      </div>
    </div>
  );
}

export function MenuGridSkeleton({ count = 6 }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '2rem'
    }}>
      {Array.from({ length: count }).map((_, idx) => (
        <DishCardSkeleton key={idx} />
      ))}
    </div>
  );
}
