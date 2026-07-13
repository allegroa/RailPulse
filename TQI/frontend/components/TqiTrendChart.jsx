import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function TqiTrendChart({ lineCode, lineObj }) {
  const [trendData, setTrendData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [mode, setMode] = useState('average'); // 'average' or 'segment'
  const [targetKm, setTargetKm] = useState('');

  const formatKm = (val) => {
    if (val == null || isNaN(val) || val === '') return '';
    const km = Math.floor(val);
    const m = Math.round((val - km) * 1000).toString().padStart(3, '0');
    return `K${km}+${m}`;
  };

  useEffect(() => {
    if (!lineCode) return;
    setLoading(true);
    
    let url = `/api/tqi/trend?line=${lineCode}`;
    if (mode === 'segment' && targetKm !== '') {
      url += `&km=${targetKm}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data && data.error) {
          throw new Error(data.error);
        }
        setTrendData(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching trend data:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [lineCode, mode, targetKm]);

  if (!lineCode) return null;

  const data = {
    labels: trendData.map(d => d.date.split('T')[0]),
    datasets: mode === 'segment' ? [
      {
        label: `TQI (${formatKm(targetKm)})`,
        data: trendData.map(d => d.averageTqi),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 8
      }
    ] : [
      {
        label: 'Line Average',
        data: trendData.map(d => d.averageTqi),
        borderColor: 'rgba(0, 0, 0, 0.8)',
        borderDash: [5, 5],
        borderWidth: 3,
        tension: 0.3,
        pointRadius: 5
      },
      {
        label: 'Straight UP',
        data: trendData.map(d => d.direction === 'UP' ? d.avgStraight : null),
        borderColor: 'rgba(0, 70, 180, 1)', // Dark Blue
        spanGaps: true,
        tension: 0.3
      },
      {
        label: 'Straight DN',
        data: trendData.map(d => d.direction === 'DN' ? d.avgStraight : null),
        borderColor: 'rgba(255, 50, 200, 1)', // Pink
        spanGaps: true,
        tension: 0.3
      },
      {
        label: 'Curve UP',
        data: trendData.map(d => d.direction === 'UP' ? d.avgCurve : null),
        borderColor: 'rgba(120, 50, 150, 1)', // Purple
        spanGaps: true,
        tension: 0.3
      },
      {
        label: 'Curve DN',
        data: trendData.map(d => d.direction === 'DN' ? d.avgCurve : null),
        borderColor: 'rgba(150, 0, 0, 1)', // Dark Red
        spanGaps: true,
        tension: 0.3
      },
      {
        label: 'Transition UP',
        data: trendData.map(d => d.direction === 'UP' ? d.avgTransition : null),
        borderColor: 'rgba(250, 200, 0, 1)', // Yellow
        spanGaps: true,
        tension: 0.3
      },
      {
        label: 'Transition DN',
        data: trendData.map(d => d.direction === 'DN' ? d.avgTransition : null),
        borderColor: 'rgba(0, 200, 255, 1)', // Light Blue
        spanGaps: true,
        tension: 0.3
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: `TQI Historical Trend - Line ${lineCode}`,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        title: { display: true, text: 'TQI Value' }
      }
    }
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      
      {/* Controlli Trend Chart */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', backgroundColor: '#f9fafb', padding: '0.75rem', borderRadius: '6px' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span 
            title="TQI = σ(左軌向) + σ(右軌向) + σ(左高低) + σ(右高低) + σ(水平) + σ(軌距) + σ(平面性)" 
            style={{ cursor: 'help', fontSize: '1.2rem', color: '#3b82f6' }}
          >
            ℹ️
          </span>
          <input 
            type="radio" 
            id="trend_avg" 
            checked={mode === 'average'} 
            onChange={() => setMode('average')} 
          />
          <label htmlFor="trend_avg" style={{ cursor: 'pointer', fontWeight: '500' }}>Line Average</label>
          <span 
            title="Represents the arithmetic mean of all valid segments for the entire acquisition (session), separated by track type and direction." 
            style={{ cursor: 'help', fontSize: '1.2rem', color: '#6b7280' }}
          >
            ❔
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input 
            type="radio" 
            id="trend_seg" 
            checked={mode === 'segment'} 
            onChange={() => setMode('segment')} 
          />
          <label htmlFor="trend_seg" style={{ cursor: 'pointer', fontWeight: '500' }}>
            Single Segment 
            {lineObj && lineObj.startKm !== undefined && lineObj.endKm !== undefined && 
              <span style={{ fontSize: '0.85em', color: '#666', marginLeft: '4px' }}>
                [Min: {formatKm(lineObj.startKm)}, Max: {formatKm(lineObj.endKm)}]
              </span>
            }:
          </label>
          <input 
            type="number" 
            step="0.001"
            value={targetKm}
            onChange={(e) => setTargetKm(e.target.value)}
            disabled={mode !== 'segment'}
            placeholder="e.g. 100.500"
            style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid #d1d5db', width: '120px' }}
          />
        </div>
      </div>

      <div style={{ height: '300px', position: 'relative' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>Loading trend data...</div>
        ) : error ? (
          <div style={{ color: 'red', textAlign: 'center' }}>Error: {error}</div>
        ) : trendData.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#6b7280', paddingTop: '2rem' }}>
            No historical data found {mode === 'segment' ? `for ${formatKm(targetKm)}` : 'for this line'}.
          </div>
        ) : (
          <Line options={options} data={data} />
        )}
      </div>
    </div>
  );
}
