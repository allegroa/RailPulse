import React from 'react';

function tqiToColor(tqi) {
  if (tqi < 7)     return '#22c55e';  // verde
  if (tqi < 10.75) return '#eab308';  // giallo
  if (tqi < 13.9)  return '#f97316';  // arancione
  return '#ef4444';                   // rosso
}

export default function TqiHeatmap({ segments, onSegmentClick }) {
  if (!segments || segments.length === 0) return null;

  const formatKm = (val) => {
    if (val == null || isNaN(val)) return '';
    const km = Math.floor(val);
    const m = Math.round((val - km) * 1000).toString().padStart(3, '0');
    return `K${km}+${m}`;
  };

  const translateTipo = (t) => {
    if (!t) return '';
    if (t.includes('介曲線')) return 'Transition';
    if (t.includes('曲線')) return 'Curve';
    if (t.includes('直線')) return 'Straight';
    return t;
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>TQI Heatmap</h3>
        <span 
          title="Each block represents a 200m track segment." 
          style={{ cursor: 'help', fontSize: '1.2rem', color: '#6b7280' }}
        >
          ❔
        </span>
      </div>
      <div style={{ display: 'flex', width: '100%', height: '40px', borderRadius: '4px', overflow: 'hidden', cursor: 'pointer' }}>
        {segments.map((seg, idx) => (
          <div
            key={idx}
            onClick={() => onSegmentClick && onSegmentClick(seg)}
            title={`${formatKm(seg.km)}\nTQI: ${seg.tqi}\nType: ${translateTipo(seg.tipo)}`}
            style={{
              flex: 1,
              backgroundColor: tqiToColor(seg.tqi),
              borderRight: '1px solid rgba(255,255,255,0.2)'
            }}
          />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
        <span>{formatKm(segments[0].km)}</span>
        <span>{formatKm(segments[segments.length - 1].km)}</span>
      </div>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', fontSize: '0.875rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: 12, height: 12, backgroundColor: '#22c55e' }}></div> Excellent (&lt; 7.0)</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: 12, height: 12, backgroundColor: '#eab308' }}></div> Warning (7.0 - 10.74)</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: 12, height: 12, backgroundColor: '#f97316' }}></div> Near Threshold (10.75 - 13.89)</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: 12, height: 12, backgroundColor: '#ef4444' }}></div> Alert (≥ 13.9)</div>
      </div>
    </div>
  );
}
