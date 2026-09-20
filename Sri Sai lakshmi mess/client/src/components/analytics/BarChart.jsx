import React, { useState } from 'react';

/**
 * Modern Interactive SVG Bar Chart
 * Supports multi-series grouped bars, positive/negative values, hover tooltips, and custom styling.
 */
export default function BarChart({
  data = [],
  series = [
    { key: 'revenue', label: 'Revenue', color: '#10b981' },
    { key: 'expenses', label: 'Expenses', color: '#ef4444' },
    { key: 'netProfit', label: 'Net Profit', color: '#06b6d4' }
  ],
  xKey = 'period',
  height = 320,
  title = '',
  currency = true,
  showLegend = true,
  unit = ''
}) {
  const [hoveredBar, setHoveredBar] = useState(null);
  const [activeSeries, setActiveSeries] = useState(
    series.reduce((acc, s) => ({ ...acc, [s.key]: true }), {})
  );

  if (!data || data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
        No data available to display
      </div>
    );
  }

  const enabledSeries = series.filter((s) => activeSeries[s.key]);

  // Compute scale boundaries
  let minVal = 0;
  let maxVal = 0;
  data.forEach((item) => {
    enabledSeries.forEach((s) => {
      const val = Number(item[s.key]) || 0;
      if (val < minVal) minVal = val;
      if (val > maxVal) maxVal = val;
    });
  });

  // Add 15% headroom
  if (maxVal === 0 && minVal === 0) maxVal = 100;
  const paddingHeadroom = maxVal * 0.15;
  const chartMax = maxVal > 0 ? maxVal + paddingHeadroom : 0;
  const chartMin = minVal < 0 ? minVal - Math.abs(minVal * 0.15) : 0;
  const valRange = (chartMax - chartMin) || 1;

  // Layout Dimensions
  const paddingLeft = 70;
  const paddingRight = 24;
  const paddingTop = 28;
  const paddingBottom = 45;
  const svgWidth = 800;
  const plotWidth = svgWidth - paddingLeft - paddingRight;
  const plotHeight = height - paddingTop - paddingBottom;

  // Zero-line Y coordinate
  const zeroY = paddingTop + plotHeight * (chartMax / valRange);

  // Group width
  const groupCount = data.length;
  const groupSlotWidth = plotWidth / groupCount;
  const barGap = 4;
  const groupPadding = Math.min(24, groupSlotWidth * 0.2);
  const availableGroupWidth = groupSlotWidth - groupPadding * 2;
  const barWidth = enabledSeries.length > 0 ? Math.max(6, (availableGroupWidth - (enabledSeries.length - 1) * barGap) / enabledSeries.length) : 0;

  // Format currency helper
  const formatVal = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '0';
    if (currency) {
      if (Math.abs(val) >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
      if (Math.abs(val) >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
      return `₹${val.toLocaleString('en-IN')}`;
    }
    return `${val.toLocaleString('en-IN')}${unit}`;
  };

  const formatTooltipVal = (val) => {
    if (currency) return `₹${Number(val).toLocaleString('en-IN')}`;
    return `${val}${unit}`;
  };

  // Generate 5 grid ticks
  const tickCount = 4;
  const ticks = [];
  for (let i = 0; i <= tickCount; i++) {
    const val = chartMin + (valRange / tickCount) * i;
    const y = paddingTop + plotHeight * ((chartMax - val) / valRange);
    ticks.push({ val: Math.round(val), y });
  }

  const toggleSeries = (key) => {
    // Keep at least one active
    const activeCount = Object.values(activeSeries).filter(Boolean).length;
    if (activeSeries[key] && activeCount <= 1) return;
    setActiveSeries((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ width: '100%', position: 'relative', userSelect: 'none' }}>
      {/* Chart Header & Dynamic Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
        {title && (
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {title}
          </h4>
        )}
        {showLegend && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
            {series.map((s) => {
              const active = activeSeries[s.key];
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => toggleSeries(s.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: active ? 'rgba(30,41,59,0.9)' : 'rgba(15,23,42,0.4)',
                    border: `1px solid ${active ? s.color : '#475569'}`,
                    borderRadius: '8px',
                    padding: '0.3rem 0.65rem',
                    cursor: 'pointer',
                    color: active ? '#ffffff' : '#64748b',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    transition: 'all 0.18s ease'
                  }}
                >
                  <span
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '3px',
                      backgroundColor: active ? s.color : '#64748b'
                    }}
                  />
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* SVG Canvas */}
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${svgWidth} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block', minWidth: '460px' }}
        >
          <defs>
            {/* Gradients for bars */}
            <linearGradient id="grad-revenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.75" />
            </linearGradient>
            <linearGradient id="grad-expenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f87171" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#dc2626" stopOpacity="0.75" />
            </linearGradient>
            <linearGradient id="grad-netProfit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.75" />
            </linearGradient>
            <linearGradient id="grad-amber" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#d97706" stopOpacity="0.75" />
            </linearGradient>
            <linearGradient id="grad-purple" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.75" />
            </linearGradient>
          </defs>

          {/* Gridlines and Y-axis labels */}
          {ticks.map((t, idx) => (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={t.y}
                x2={svgWidth - paddingRight}
                y2={t.y}
                stroke="#334155"
                strokeDasharray={t.val === 0 ? 'none' : '3 3'}
                strokeWidth={t.val === 0 ? 1.5 : 0.8}
              />
              <text
                x={paddingLeft - 8}
                y={t.y + 4}
                textAnchor="end"
                fontSize="11"
                fill="#94a3b8"
                fontWeight="500"
              >
                {formatVal(t.val)}
              </text>
            </g>
          ))}

          {/* Zero baseline highlight if needed */}
          {minVal < 0 && (
            <line
              x1={paddingLeft}
              y1={zeroY}
              x2={svgWidth - paddingRight}
              y2={zeroY}
              stroke="#e2e8f0"
              strokeWidth="1.5"
            />
          )}

          {/* Data Bars */}
          {data.map((item, groupIndex) => {
            const groupCenterX = paddingLeft + groupIndex * groupSlotWidth + groupSlotWidth / 2;
            const groupStartX = groupCenterX - availableGroupWidth / 2;

            return (
              <g key={groupIndex}>
                {/* X-axis label */}
                <text
                  x={groupCenterX}
                  y={height - 15}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#cbd5e1"
                  fontWeight="600"
                >
                  {item[xKey]}
                </text>

                {/* Group Bars */}
                {enabledSeries.map((s, seriesIndex) => {
                  const val = Number(item[s.key]) || 0;
                  const barX = groupStartX + seriesIndex * (barWidth + barGap);

                  let barY = zeroY;
                  let barHeight = 0;

                  if (val >= 0) {
                    const topY = paddingTop + plotHeight * ((chartMax - val) / valRange);
                    barY = topY;
                    barHeight = Math.max(2, zeroY - topY);
                  } else {
                    const bottomY = paddingTop + plotHeight * ((chartMax - val) / valRange);
                    barY = zeroY;
                    barHeight = Math.max(2, bottomY - zeroY);
                  }

                  const isHovered =
                    hoveredBar &&
                    hoveredBar.groupIndex === groupIndex &&
                    hoveredBar.seriesKey === s.key;

                  const fillId =
                    s.key === 'revenue'
                      ? 'url(#grad-revenue)'
                      : s.key === 'expenses'
                      ? 'url(#grad-expenses)'
                      : s.key === 'netProfit'
                      ? val >= 0 ? 'url(#grad-netProfit)' : 'url(#grad-expenses)'
                      : s.color || '#3b82f6';

                  return (
                    <rect
                      key={s.key}
                      x={barX}
                      y={barY}
                      width={barWidth}
                      height={barHeight}
                      rx={val >= 0 ? 4 : 0}
                      ry={val >= 0 ? 4 : 0}
                      fill={fillId}
                      opacity={isHovered ? 1 : 0.88}
                      style={{
                        cursor: 'pointer',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        filter: isHovered ? 'drop-shadow(0 0 6px rgba(255,255,255,0.3))' : 'none'
                      }}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredBar({
                          groupIndex,
                          seriesKey: s.key,
                          seriesLabel: s.label,
                          seriesColor: s.color,
                          period: item[xKey],
                          fullName: item.fullName || item[xKey],
                          value: val,
                          item,
                          clientX: rect.x + rect.width / 2,
                          clientY: rect.y
                        });
                      }}
                      onMouseLeave={() => setHoveredBar(null)}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Floating Hover Card */}
      {hoveredBar && (
        <div
          style={{
            position: 'absolute',
            bottom: '105%',
            left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none',
            zIndex: 100,
            background: 'rgba(15, 23, 42, 0.96)',
            border: `1px solid ${hoveredBar.seriesColor || '#475569'}`,
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
            borderRadius: '10px',
            padding: '0.65rem 1rem',
            color: '#ffffff',
            fontSize: '0.85rem',
            minWidth: '170px',
            textAlign: 'center',
            backdropFilter: 'blur(8px)'
          }}
        >
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', marginBottom: '0.2rem' }}>
            {hoveredBar.fullName || hoveredBar.period}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontWeight: '800', fontSize: '1.1rem', color: hoveredBar.seriesColor }}>
            <span>{formatTooltipVal(hoveredBar.value)}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '0.2rem' }}>
            {hoveredBar.seriesLabel}
            {hoveredBar.item.marginPercent !== undefined && hoveredBar.seriesKey === 'netProfit' && (
              <span style={{ marginLeft: '0.35rem', color: hoveredBar.item.marginPercent >= 0 ? '#34d399' : '#f87171', fontWeight: '700' }}>
                ({hoveredBar.item.marginPercent}%)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
