import React, { useEffect, useState, useMemo, useRef } from 'react';
import axios from 'axios';
import { Line } from "react-chartjs-2";
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
import zoomPlugin from 'chartjs-plugin-zoom';
import annotationPlugin from 'chartjs-plugin-annotation';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, zoomPlugin, annotationPlugin);

const RailProfilePage = () => {
  const getStations = (lineCode, direction) => {
    if (!lineCode) return { start: 'N/A', end: 'N/A' };
    
    // The LineCode in the filename only represents the departure station
    return { start: lineCode, end: 'N/A' };
  };

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [sortConfig, setSortConfig] = useState({ key: 'measurement_date', direction: 'desc' });

  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const [showConfigModal, setShowConfigModal] = useState(false);
  const initialConfig = {
    W1: { T1: 0, T2: 0, T3: 0, T4: 0 },
    W2: { T1: 0, T2: 0, T3: 0, T4: 0 },
    W3: { T1: 0, T2: 0, T3: 0, T4: 0 },
    W4: { T1: 0, T2: 0, T3: 0, T4: 0 }
  };
  const [configParams, setConfigParams] = useState(initialConfig);

  const chartRef = useRef(null);
  const [selectedSessionIds, setSelectedSessionIds] = useState(null);
  const [selectedSessionData, setSelectedSessionData] = useState(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState(null);

  const [showLeftRail, setShowLeftRail] = useState(true);
  const [showRightRail, setShowRightRail] = useState(true);

  const [hoveredSessionId, setHoveredSessionId] = useState(null);

  const renderHoverSummary = (session) => {
    if (!session.exceedances || session.exceedances.length === 0) {
      return (
        <div className="text-xs text-slate-400 italic">
          Nessun dato di eccedenza elaborato per questa acquisizione.
        </div>
      );
    }

    // Group exceedances by parameter
    const grouped = {};
    session.exceedances.forEach(e => {
      if (!grouped[e.parameter]) {
        grouped[e.parameter] = {
          total_samples: 0,
          t1: 0,
          t2: 0,
          t3: 0,
          t4: 0
        };
      }
      grouped[e.parameter].total_samples += e.total_samples || 0;
      grouped[e.parameter].t1 += e.t1_count || 0;
      grouped[e.parameter].t2 += e.t2_count || 0;
      grouped[e.parameter].t3 += e.t3_count || 0;
      grouped[e.parameter].t4 += e.t4_count || 0;
    });

    const wearParams = ['W1', 'W2', 'W3', 'W4'];

    return (
      <div className="flex items-center gap-6 text-xs py-1 text-slate-600 bg-slate-50/50 p-2.5 rounded border border-slate-100 shadow-sm">
        <span className="font-bold text-blue-600 uppercase tracking-wider text-[10px]">
          Sintesi Eccedenze:
        </span>
        {wearParams.map(param => {
          const stats = grouped[param];
          const pConfig = configParams[param] || {};
          if (!stats || stats.total_samples === 0) {
            return (
              <span key={param} className="text-slate-400 font-medium">
                {param}: n/d
              </span>
            );
          }

          const t1_perc = ((stats.t1 / stats.total_samples) * 100).toFixed(1);
          const t2_perc = ((stats.t2 / stats.total_samples) * 100).toFixed(1);
          const t3_perc = ((stats.t3 / stats.total_samples) * 100).toFixed(1);
          const t4_perc = ((stats.t4 / stats.total_samples) * 100).toFixed(1);

          return (
            <div key={param} className="flex items-center gap-2 border-r border-slate-200 pr-5 last:border-0 last:pr-0">
              <span className="font-extrabold text-slate-700">{param}</span>
              <span className="text-slate-400 text-[10px]">({stats.total_samples} pt):</span>
              <span className="flex items-center gap-1">
                {pConfig.T1 > 0 && (
                  <span className="px-1.5 py-0.5 bg-white text-slate-700 rounded border border-slate-200 text-[10px]">
                    T1: {t1_perc}%
                  </span>
                )}
                {pConfig.T2 > 0 && (
                  <span className="px-1.5 py-0.5 bg-yellow-50 text-yellow-700 rounded border border-yellow-200 text-[10px] font-medium">
                    T2: {t2_perc}%
                  </span>
                )}
                {pConfig.T3 > 0 && (
                  <span className="px-1.5 py-0.5 bg-orange-50 text-orange-700 rounded border border-orange-200 text-[10px] font-medium">
                    T3: {t3_perc}%
                  </span>
                )}
                {pConfig.T4 > 0 && (
                  <span className="px-1.5 py-0.5 bg-red-50 text-red-700 rounded border border-red-200 text-[10px] font-bold">
                    T4: {t4_perc}%
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const getQualityIndexValue = (session) => {
    if (!session.exceedances || session.exceedances.length === 0) return 100;

    let totalWeight = 0;
    let penalty = 0;

    session.exceedances.forEach(e => {
      const t1 = e.t1_percentage || 0;
      const t2 = e.t2_percentage || 0;
      const t3 = e.t3_percentage || 0;
      const t4 = e.t4_percentage || 0;

      penalty += (t1 * 0.1 + t2 * 0.2 + t3 * 0.3 + t4 * 0.4);
      totalWeight += 1;
    });

    if (totalWeight === 0) return 100;
    return Math.max(0, 100 - (penalty / totalWeight));
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedSessions = useMemo(() => {
    let sortableSessions = [...sessions];
    if (sortConfig.key !== null) {
      sortableSessions.sort((a, b) => {
        let aValue, bValue;
        if (sortConfig.key === 'length') {
          aValue = Math.abs((Number(a.starting_km) || 0) - (Number(a.ending_km) || 0));
          bValue = Math.abs((Number(b.starting_km) || 0) - (Number(b.ending_km) || 0));
        } else if (sortConfig.key === 'quality_index') {
          aValue = getQualityIndexValue(a);
          bValue = getQualityIndexValue(b);
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        }

        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;

        const numA = Number(aValue);
        const numB = Number(bValue);
        if (!isNaN(numA) && !isNaN(numB)) {
          return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
        }

        const strA = String(aValue).toLowerCase();
        const strB = String(bValue).toLowerCase();
        if (strA < strB) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (strA > strB) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableSessions;
  }, [sessions, sortConfig]);

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <span className="text-slate-300 ml-1 text-xs select-none">↕</span>;
    }
    return sortConfig.direction === 'asc' ? 
      <span className="text-blue-600 ml-1 text-xs select-none">↑</span> : 
      <span className="text-blue-600 ml-1 text-xs select-none">↓</span>;
  };

  const formatRailwayKm = (kmValue) => {
    const num = Number(kmValue);
    if (isNaN(num)) return String(kmValue);
    const isNeg = num < 0;
    const absNum = Math.abs(num);
    const km = Math.floor(absNum);
    const meters = Math.round((absNum - km) * 1000);
    return (isNeg ? '-' : '') + km + '+' + meters.toString().padStart(3, '0');
  };

  const handleCheckboxChange = async (session) => {
    if (selectedSessionIds === session.session_ids) {
      setSelectedSessionIds(null);
      setSelectedSessionData(null);
      setChartError(null);
    } else {
      setSelectedSessionIds(session.session_ids);
      setSelectedSessionData(null);
      setChartError(null);
      setChartLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/railprofile/sessions/${session.session_ids}/data`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data && response.data.success) {
          setSelectedSessionData(response.data);
        } else {
          setChartError('Failed to load wear data');
        }
      } catch (err) {
        console.error(err);
        setChartError(err.message || 'Error loading wear data');
      } finally {
        setChartLoading(false);
      }
    }
  };

  const chartData = useMemo(() => {
    if (!selectedSessionData) return { datasets: [] };

    const leftData = selectedSessionData.left || [];
    const rightData = selectedSessionData.right || [];
    const datasets = [];

    const colors = {
      W1: { left: '#3b82f6', right: '#ef4444' },
      W2: { left: '#10b981', right: '#f59e0b' },
      W3: { left: '#8b5cf6', right: '#ec4899' },
      W4: { left: '#06b6d4', right: '#14b8a6' }
    };

    const wearParams = ['W1', 'W2', 'W3', 'W4'];

    wearParams.forEach((param, idx) => {
      const pConfig = configParams[param] || {};
      
      const getSegmentColor = (ctx) => {
        if (!ctx.p0 || !ctx.p1 || ctx.p0.parsed.y === undefined || ctx.p1.parsed.y === undefined) return undefined;
        const val = Math.max(Math.abs(ctx.p0.parsed.y), Math.abs(ctx.p1.parsed.y));
        if (pConfig.T1 > 0 && val <= pConfig.T1) return 'rgb(34, 197, 94)'; // green
        if (pConfig.T2 > 0 && val <= pConfig.T2) return 'rgb(234, 179, 8)'; // yellow
        if (pConfig.T3 > 0 && val <= pConfig.T3) return 'rgb(249, 115, 22)'; // orange
        if (pConfig.T4 > 0 && val <= pConfig.T4) return 'rgb(234, 88, 12)'; // darker orange
        if (pConfig.T4 > 0 && val > pConfig.T4) return 'rgb(239, 68, 68)'; // red
        if (pConfig.T3 > 0 && val > pConfig.T3) return 'rgb(239, 68, 68)'; // fallback to red if > T3 and no T4
        return undefined;
      };

      if (showLeftRail && leftData.length > 0) {
        datasets.push({
          label: `${param} Left`,
          data: leftData.map(d => ({ x: d.km, y: d[param] })).filter(p => p.y !== null),
          yAxisID: `y${idx}`,
          borderColor: colors[param].left,
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0.1,
          fill: false,
          segment: {
            borderColor: getSegmentColor
          }
        });
      }

      if (showRightRail && rightData.length > 0) {
        datasets.push({
          label: `${param} Right`,
          data: rightData.map(d => ({ x: d.km, y: d[param] })).filter(p => p.y !== null),
          yAxisID: `y${idx}`,
          borderColor: colors[param].right,
          borderWidth: 1.5,
          pointRadius: 0,
          tension: 0.1,
          fill: false,
          segment: {
            borderColor: getSegmentColor
          }
        });
      }
    });

    return { datasets };
  }, [selectedSessionData, showLeftRail, showRightRail, configParams]);

  const chartOptions = useMemo(() => {
    const scales = {
      x: {
        type: 'linear',
        display: true,
        title: {
          display: true,
          text: 'Kilometer (Railway format)',
          font: { weight: 'bold' }
        },
        ticks: {
          callback: function(val) {
            return formatRailwayKm(val);
          }
        }
      }
    };

    const wearParams = ['W1', 'W2', 'W3', 'W4'];

    wearParams.forEach((param, idx) => {
      scales[`y${idx}`] = {
        type: 'linear',
        display: true,
        position: 'left',
        stack: 'oscilloscope',
        stackWeight: 1,
        offset: true,
        border: { display: true },
        title: {
          display: true,
          text: `${param} (mm)`,
          font: { size: 11, weight: 'bold' }
        },
        ticks: {
          maxTicksLimit: 5,
          padding: 4
        }
      };
    });

    const annotations = {};
    const thresholdColors = {
      T1: 'rgba(156, 163, 175, 0.7)',
      T2: 'rgba(234, 179, 8, 0.7)',
      T3: 'rgba(249, 115, 22, 0.7)',
      T4: 'rgba(239, 68, 68, 0.8)'
    };

    wearParams.forEach((param, idx) => {
      const paramThresholds = configParams[param] || {};
      ['T1', 'T2', 'T3', 'T4'].forEach(t => {
        const val = paramThresholds[t];
        if (val && val > 0) {
          annotations[`tol-${param}-${t}-pos`] = {
            type: 'line',
            yScaleID: `y${idx}`,
            yMin: val,
            yMax: val,
            borderColor: thresholdColors[t],
            borderWidth: 1.2,
            borderDash: [5, 5],
            label: {
              display: true,
              content: `${param} ${t}: ${val}mm`,
              position: 'end',
              font: { size: 9, weight: 'bold' },
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              color: '#0f172a',
              borderColor: thresholdColors[t],
              borderWidth: 1,
              borderRadius: 3,
              padding: 3
            },
            drawTime: 'beforeDatasetsDraw'
          };
        }
      });
    });

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          mode: 'index',
          intersect: false
        },
        legend: {
          position: 'top',
          labels: {
            boxWidth: 12,
            font: { size: 10 }
          }
        },
        zoom: {
          zoom: {
            drag: {
              enabled: true,
              backgroundColor: 'rgba(14, 165, 233, 0.1)',
              borderColor: 'rgba(14, 165, 233, 0.4)',
              borderWidth: 1
            },
            wheel: { enabled: true },
            mode: 'x'
          },
          pan: {
            enabled: true,
            mode: 'x'
          }
        },
        annotation: {
          annotations
        }
      },
      scales
    };
  }, [configParams]);

  // BUG-1 FIX: Use pre-computed backend exceedances (full CSV) instead of
  // recomputing from the downsampled chart data. This keeps hover summary and
  // the stats panel consistent. Rail filter (Sx/Dx) is applied by filtering
  // the per-side rows returned by the backend.
  const computedExceedanceStats = useMemo(() => {
    if (!selectedSessionIds) return null;

    // Find the selected session in the sessions array
    const selectedSession = sessions.find(s => s.session_ids === selectedSessionIds);
    if (!selectedSession || !selectedSession.exceedances || selectedSession.exceedances.length === 0) return null;

    const wearParams = ['W1', 'W2', 'W3', 'W4'];
    const stats = {};

    wearParams.forEach(param => {
      // Filter exceedances by visible rails
      const rows = selectedSession.exceedances.filter(e =>
        e.parameter === param &&
        ((showLeftRail && e.wear_side === 'left') || (showRightRail && e.wear_side === 'right'))
      );

      if (rows.length === 0) {
        stats[param] = null;
        return;
      }

      // Sum counts across the filtered sides
      const totalCount = rows.reduce((acc, r) => acc + (r.total_samples || 0), 0);
      const t1 = rows.reduce((acc, r) => acc + (r.t1_count || 0), 0);
      const t2 = rows.reduce((acc, r) => acc + (r.t2_count || 0), 0);
      const t3 = rows.reduce((acc, r) => acc + (r.t3_count || 0), 0);
      const t4 = rows.reduce((acc, r) => acc + (r.t4_count || 0), 0);
      const pct = (n) => totalCount > 0 ? ((n / totalCount) * 100).toFixed(1) : '0.0';

      stats[param] = {
        totalCount,
        exceedances: {
          T1: { count: t1, perc: pct(t1) },
          T2: { count: t2, perc: pct(t2) },
          T3: { count: t3, perc: pct(t3) },
          T4: { count: t4, perc: pct(t4) },
        },
      };
    });

    return stats;
  }, [selectedSessionIds, sessions, showLeftRail, showRightRail]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/railprofile/sessions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.success) {
        setSessions(response.data.data);
      } else {
        setError('Failed to fetch data');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error loading sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/railprofile/config', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.success && response.data.data && Object.keys(response.data.data).length > 0) {
        const fetchedData = response.data.data;
        const newConfig = { ...initialConfig };
        for (const w of ['W1', 'W2', 'W3', 'W4']) {
          if (fetchedData[w]) {
            newConfig[w] = { ...newConfig[w], ...fetchedData[w] };
          }
        }
        setConfigParams(newConfig);
      }
    } catch (err) {
      console.error('Error loading config', err);
    }
  };

  const saveConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/railprofile/config', configParams, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowConfigModal(false);
    } catch (err) {
      alert('Error saving config: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleConfigChange = (wearType, thresholdType, value) => {
    setConfigParams(prev => ({
      ...prev,
      [wearType]: {
        ...prev[wearType],
        [thresholdType]: Number(value)
      }
    }));
  };

  const handleEditClick = (session) => {
    setEditingId(session.session_ids);
    setEditFormData({
      measurement_date: session.measurement_date,
      measurement_time: session.measurement_time,
      starting_km: session.starting_km,
      ending_km: session.ending_km,
      line_code: session.line_code,
      direction: session.direction
    });
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleSaveClick = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/railprofile/sessions/${id}`, editFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingId(null);
      fetchSessions();
    } catch (err) {
      alert('Error updating session: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Sei sicuro di voler cancellare questo record?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/railprofile/sessions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSessions();
    } catch (err) {
      alert('Error deleting session: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="flex flex-col w-full h-full p-8 bg-slate-50 overflow-y-auto">
      {/* Header section mirroring the Maintenance box style */}
      <div className="flex justify-between items-center px-6 py-4 bg-white border border-slate-200 rounded-xl shadow-sm mb-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight font-sans">RailProfile</h1>
            <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded shadow-sm">v1.0</span>
          </div>
          <p className="text-slate-500 mt-1 text-sm">visualizeExplore</p>
        </div>
        <div>
          <button 
            onClick={() => setShowConfigModal(true)} 
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-md font-semibold transition-colors shadow-sm text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            Configuration
          </button>
        </div>
      </div>

      {/* Table section */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th scope="col" className="w-12 px-6 py-3 font-semibold text-center">Select</th>
                <th scope="col" className="px-6 py-3 font-semibold cursor-pointer hover:bg-slate-100 select-none transition-colors" onClick={() => requestSort('measurement_date')}>
                  <div className="flex items-center gap-1">Measurement Date {getSortIcon('measurement_date')}</div>
                </th>
                <th scope="col" className="px-6 py-3 font-semibold cursor-pointer hover:bg-slate-100 select-none transition-colors" onClick={() => requestSort('measurement_time')}>
                  <div className="flex items-center gap-1">Measurement Time {getSortIcon('measurement_time')}</div>
                </th>
                <th scope="col" className="px-6 py-3 font-semibold cursor-pointer hover:bg-slate-100 select-none transition-colors" onClick={() => requestSort('starting_km')}>
                  <div className="flex items-center gap-1">Starting Km {getSortIcon('starting_km')}</div>
                </th>
                <th scope="col" className="px-6 py-3 font-semibold cursor-pointer hover:bg-slate-100 select-none transition-colors" onClick={() => requestSort('ending_km')}>
                  <div className="flex items-center gap-1">Ending Km {getSortIcon('ending_km')}</div>
                </th>
                <th scope="col" className="px-6 py-3 font-semibold cursor-pointer hover:bg-slate-100 select-none transition-colors" onClick={() => requestSort('length')}>
                  <div className="flex items-center gap-1">Length (Km) {getSortIcon('length')}</div>
                </th>
                <th scope="col" className="px-6 py-3 font-semibold">Stazione Partenza</th>
                <th scope="col" className="px-6 py-3 font-semibold">Stazione Arrivo</th>
                <th scope="col" className="px-6 py-3 font-semibold">Direction</th>
                <th scope="col" className="px-6 py-3 font-semibold text-center cursor-pointer hover:bg-slate-100 select-none transition-colors" onClick={() => requestSort('quality_index')}>
                  <div className="flex items-center justify-center gap-1">Quality Index {getSortIcon('quality_index')}</div>
                </th>
                <th scope="col" className="px-6 py-3 font-semibold text-right">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="11" className="px-6 py-4 text-center text-slate-500">Caricamento in corso...</td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan="11" className="px-6 py-4 text-center text-red-500">{error}</td>
                </tr>
              )}
              {!loading && !error && sortedSessions.length === 0 && (
                <tr>
                  <td colSpan="11" className="px-6 py-4 text-center text-slate-500">Nessuna sessione trovata.</td>
                </tr>
              )}
              {!loading && !error && sortedSessions.map((session, idx) => {
                const { start, end } = getStations(session.line_code, session.direction);
                const isEditing = editingId === session.session_ids;
                const isHovered = hoveredSessionId === session.session_ids;
                // BUG-4 FIX: compute once, use twice (for class + display)
                const qi = getQualityIndexValue(session);

                return (
                  <React.Fragment key={session.session_ids || idx}>
                    <tr
                      onMouseEnter={() => setHoveredSessionId(session.session_ids)}
                      onMouseLeave={() => setHoveredSessionId(null)}
                      className="bg-white border-b hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedSessionIds === session.session_ids}
                          onChange={() => handleCheckboxChange(session)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? <input type="text" name="measurement_date" value={editFormData.measurement_date} onChange={handleEditChange} className="border border-slate-300 rounded px-2 py-1 w-24" /> : session.measurement_date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {isEditing ? <input type="text" name="measurement_time" value={editFormData.measurement_time} onChange={handleEditChange} className="border border-slate-300 rounded px-2 py-1 w-24" /> : session.measurement_time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? <input type="number" step="0.001" name="starting_km" value={editFormData.starting_km} onChange={handleEditChange} className="border border-slate-300 rounded px-2 py-1 w-20" /> : (session.starting_km != null ? Number(session.starting_km).toFixed(3) : 'N/A')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {isEditing ? <input type="number" step="0.001" name="ending_km" value={editFormData.ending_km} onChange={handleEditChange} className="border border-slate-300 rounded px-2 py-1 w-20" /> : (session.ending_km != null ? Number(session.ending_km).toFixed(3) : 'N/A')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-700">
                        {(session.starting_km != null && session.ending_km != null) ? Math.abs(Number(session.starting_km) - Number(session.ending_km)).toFixed(3) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? <input type="text" name="line_code" value={editFormData.line_code} onChange={handleEditChange} className="border border-slate-300 rounded px-2 py-1 w-20" title="Line Code (determines station)" /> : start}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">{end}</td>
                      <td className="px-6 py-4 whitespace-nowrap font-bold text-blue-600">
                        {isEditing ? <select name="direction" value={editFormData.direction} onChange={handleEditChange} className="border border-slate-300 rounded px-2 py-1"><option value="UP">UP</option><option value="DN">DN</option></select> : session.direction}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center font-bold">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                          qi > 95 ? 'bg-green-100 text-green-700 border border-green-200' :
                          qi > 85 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                          qi > 70 ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                          'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                          {qi.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-slate-500">
                        {isEditing ? (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleSaveClick(session.session_ids)} className="text-green-600 hover:text-green-800" title="Salva">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                            </button>
                            <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600" title="Annulla">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleEditClick(session)} className="hover:text-blue-600 transition-colors" title="Modifica">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                            </button>
                            <button onClick={() => handleDeleteClick(session.session_ids)} className="hover:text-red-600 transition-colors" title="Elimina">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                    {isHovered && !isEditing && (
                      <tr 
                        onMouseEnter={() => setHoveredSessionId(session.session_ids)}
                        onMouseLeave={() => setHoveredSessionId(null)}
                        className="bg-slate-50 border-b"
                      >
                        <td colSpan="11" className="px-6 py-2">
                          {renderHoverSummary(session)}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart Section */}
      {selectedSessionIds && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 mt-8 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
                Wear Profile Visualization
              </h2>
              {selectedSessionData?.metadata && (
                <p className="text-xs text-slate-500 mt-1">
                  Line: <span className="font-semibold text-slate-700">{selectedSessionData.metadata.line_code}</span> | 
                  Direction: <span className="font-semibold text-slate-700">{selectedSessionData.metadata.direction}</span> | 
                  Date: <span className="font-semibold text-slate-700">{selectedSessionData.metadata.measurement_date}</span> | 
                  Time: <span className="font-semibold text-slate-700">{selectedSessionData.metadata.measurement_time}</span>
                </p>
              )}
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex gap-3 mr-2 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={showLeftRail} onChange={e => setShowLeftRail(e.target.checked)} className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500" />
                  Rotaia Sx
                </label>
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={showRightRail} onChange={e => setShowRightRail(e.target.checked)} className="w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500" />
                  Rotaia Dx
                </label>
              </div>
              <button
                onClick={() => chartRef.current?.resetZoom()}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded text-sm font-medium border border-slate-200 transition-colors"
              >
                Reset Zoom
              </button>
              <button
                onClick={() => {
                  setSelectedSessionIds(null);
                  setSelectedSessionData(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5"
                title="Chiudi"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          <div className="relative" style={{ height: '500px' }}>
            {chartLoading && (
              <div className="absolute inset-0 bg-white/80 z-10 flex flex-col items-center justify-center">
                <svg className="w-10 h-10 animate-spin text-blue-600 mb-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                </svg>
                <span className="text-sm text-slate-600">Loading wear data...</span>
              </div>
            )}
            {chartError && (
              <div className="absolute inset-0 bg-red-50/50 z-10 flex flex-col items-center justify-center border border-red-100 rounded">
                <span className="text-sm text-red-600 font-medium mb-1">Error Loading Data</span>
                <span className="text-xs text-red-500">{chartError}</span>
              </div>
            )}
            {!chartLoading && !chartError && selectedSessionData && !showLeftRail && !showRightRail && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
                Seleziona almeno una rotaia (Sx o Dx) per visualizzare i dati.
              </div>
            )}
            {!chartLoading && !chartError && selectedSessionData && (showLeftRail || showRightRail) && (
              <Line
                ref={chartRef}
                data={chartData}
                options={chartOptions}
                key={selectedSessionIds}
              />
            )}
          </div>
        </div>
      )}

      {/* Exceedance Stats Section */}
      {selectedSessionIds && computedExceedanceStats && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 mt-8 p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002-2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Statistiche Eccedenze sul Tratto Misurato
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {['W1', 'W2', 'W3', 'W4'].map(param => {
              const data = computedExceedanceStats[param];
              const pConfig = configParams[param] || {};
              if (!data) return null;
              return (
                <div key={param} className="border border-slate-200 rounded-xl p-5 bg-slate-50 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-extrabold text-slate-800 text-lg">{param}</span>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                        {data.totalCount} campioni
                      </span>
                    </div>
                    
                    <div className="space-y-3.5">
                      {['T1', 'T2', 'T3', 'T4'].map((t, idx) => {
                        const thresholdVal = pConfig[t];
                        const exc = data.exceedances[t];
                        const progressColors = [
                          'bg-slate-400',
                          'bg-yellow-400',
                          'bg-orange-500',
                          'bg-red-500'
                        ];
                        const textColors = [
                          'text-slate-700 font-medium',
                          'text-yellow-700 font-medium',
                          'text-orange-700 font-medium',
                          'text-red-700 font-semibold'
                        ];

                        if (thresholdVal === undefined || thresholdVal === null || thresholdVal === 0) {
                          return (
                            <div key={t} className="flex justify-between text-xs text-slate-400 py-1.5 border-b border-slate-100 last:border-0">
                              <span>Soglia {t}:</span>
                              <span>Non impostata</span>
                            </div>
                          );
                        }

                        return (
                          <div key={t} className="pb-2.5 border-b border-slate-100 last:border-0 last:pb-0">
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className="font-medium text-slate-600">Soglia {t} ({thresholdVal} mm)</span>
                              <span className={textColors[idx]}>
                                {exc.count} ({exc.perc}%)
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                              <div 
                                className={`h-2 rounded-full ${progressColors[idx]}`} 
                                style={{ width: `${Math.min(100, Number(exc.perc))}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-3/4 max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">Configuration (Wear Thresholds)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['W1', 'W2', 'W3', 'W4'].map(wearType => (
                <div key={wearType} className="border border-slate-200 rounded p-4 bg-slate-50">
                  <h3 className="font-bold text-slate-800 mb-3">{wearType} Thresholds</h3>
                  <div className="space-y-3">
                    {['T1', 'T2', 'T3', 'T4'].map(t => (
                      <div key={t} className="flex justify-between items-center">
                        <label className="font-semibold text-slate-600 text-sm">{t} (mm):</label>
                        <input 
                          type="number" 
                          step="0.1" 
                          value={configParams[wearType][t]} 
                          onChange={(e) => handleConfigChange(wearType, t, e.target.value)} 
                          className="border border-slate-300 rounded px-2 py-1 w-24 text-right text-sm" 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-end gap-3 border-t pt-4">
              <button onClick={() => setShowConfigModal(false)} className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded font-medium">Cancel</button>
              <button onClick={saveConfig} className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded font-semibold">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RailProfilePage;
