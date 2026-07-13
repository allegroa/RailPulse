import React from 'react';

export default function TqiAlertTable({ segments, onSegmentClick }) {
  if (!segments) return null;

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

  const alertedSegments = segments.filter(s => s.alerts && s.alerts.length > 0);

  if (alertedSegments.length === 0) {
    return (
      <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>TQI Alerts</h3>
        <p>No segments in alert state for this session.</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#ef4444' }}>TQI Alerts Found ({alertedSegments.length})</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ minWidth: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb', color: '#374151' }}>
              <th style={{ padding: '0.5rem' }}>Km</th>
              <th style={{ padding: '0.5rem' }}>Type</th>
              <th style={{ padding: '0.5rem' }}>TQI</th>
              <th style={{ padding: '0.5rem' }}>Alert Details</th>
            </tr>
          </thead>
          <tbody>
            {alertedSegments.map((seg, idx) => (
              <tr 
                key={idx} 
                style={{ borderBottom: '1px solid #e5e7eb', cursor: 'pointer' }}
                onClick={() => onSegmentClick && onSegmentClick(seg)}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ padding: '0.5rem', fontWeight: '500' }}>{formatKm(seg.km)}</td>
                <td style={{ padding: '0.5rem' }}>{translateTipo(seg.tipo)}</td>
                <td style={{ padding: '0.5rem', fontWeight: 'bold', color: '#ef4444' }}>{seg.tqi.toFixed(4)}</td>
                <td style={{ padding: '0.5rem' }}>
                  <ul style={{ margin: 0, paddingLeft: '1.2rem' }}>
                    {seg.alerts.map((a, i) => (
                      <li key={i} style={{ fontSize: '0.875rem' }}>
                        {a.type === 'ABSOLUTE' && `Exceeds fixed absolute threshold (${a.threshold})`}
                        {a.type === 'STAT_3SIGMA' && `Exceeds 3σ threshold (${a.threshold}) for ${translateTipo(seg.tipo)}`}
                        {a.type === 'TRANSITION_A_20PCT' && `Degradation > 20% (${a.deltaPercent}%) compared to previous TQI (${a.prevTqi})`}
                        {a.type === 'TRANSITION_B_10PCT_X2' && `Chronic degradation > 10% consecutively`}
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
