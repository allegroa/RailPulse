import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function TqiSigmaBreakdown({ segment }) {
  if (!segment || !segment.sigma) return null;

  const formatKm = (val) => {
    if (val == null || isNaN(val)) return '';
    const km = Math.floor(val);
    const m = Math.round((val - km) * 1000).toString().padStart(3, '0');
    return `K${km}+${m}`;
  };
  const formattedKm = formatKm(segment.km);

  const translateTipo = (t) => {
    if (!t) return '';
    if (t.includes('介曲線')) return 'Transition';
    if (t.includes('曲線')) return 'Curve';
    if (t.includes('直線')) return 'Straight';
    return t;
  };
  const typeTranslated = translateTipo(segment.tipo);

  const dataStacked = {
    labels: [formattedKm],
    datasets: [
      { label: 'Align L', data: [segment.sigma.leftAlign], backgroundColor: '#ef4444' },
      { label: 'Align R', data: [segment.sigma.rightAlign], backgroundColor: '#f97316' },
      { label: 'Level L', data: [segment.sigma.leftLevel], backgroundColor: '#eab308' },
      { label: 'Level R', data: [segment.sigma.rightLevel], backgroundColor: '#84cc16' },
      { label: 'Cant', data: [segment.sigma.cant], backgroundColor: '#22c55e' },
      { label: 'Gauge', data: [segment.sigma.gauge], backgroundColor: '#06b6d4' },
      { label: 'Twist', data: [segment.sigma.twist], backgroundColor: '#3b82f6' },
    ],
  };

  const optionsStacked = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: `Sigma Contributions to TQI (Total: ${segment.tqi.toFixed(4)}) - Type: ${typeTranslated}`,
      },
      tooltip: { mode: 'index', intersect: false },
      legend: { position: 'bottom' }
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, title: { display: true, text: 'Standard Deviation (σ)' } },
    },
  };

  const dataGrouped = {
    labels: ['Align L', 'Align R', 'Level L', 'Level R', 'Cant', 'Gauge', 'Twist'],
    datasets: [
      {
        label: 'σ Value',
        data: [
          segment.sigma.leftAlign, segment.sigma.rightAlign,
          segment.sigma.leftLevel, segment.sigma.rightLevel,
          segment.sigma.cant, segment.sigma.gauge, segment.sigma.twist
        ],
        backgroundColor: ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6']
      }
    ]
  };

  const optionsGrouped = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: `Individual Sigma Values`,
      },
      legend: { display: false }
    },
    scales: {
      y: { title: { display: true, text: 'Standard Deviation (σ)' } },
    }
  };

  return (
    <div style={{ display: 'flex', gap: '1rem', height: '400px' }}>
      <div style={{ flex: 1, backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <Bar options={optionsStacked} data={dataStacked} />
      </div>
      <div style={{ flex: 1, backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <Bar options={optionsGrouped} data={dataGrouped} />
      </div>
    </div>
  );
}
