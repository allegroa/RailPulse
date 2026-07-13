import React, { useState, useEffect } from 'react';
import TqiTrendChart from '../components/TqiTrendChart';
import TqiHeatmap from '../components/TqiHeatmap';
import TqiAlertTable from '../components/TqiAlertTable';
import TqiSigmaBreakdown from '../components/TqiSigmaBreakdown';

export default function TqiDashboard() {
  const [lines, setLines] = useState([]);
  const [selectedLine, setSelectedLine] = useState('');
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  
  const [segmentsData, setSegmentsData] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [loadingSegments, setLoadingSegments] = useState(false);

  const formatKm = (val) => {
    if (val == null || isNaN(val)) return '';
    const km = Math.floor(val);
    const m = Math.round((val - km) * 1000).toString().padStart(3, '0');
    return `K${km}+${m}`;
  };

  // Controlli visibilità
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showAlerts, setShowAlerts] = useState(true);

  useEffect(() => {
    fetch('/api/tqi/lines')
      .then(res => res.json())
      .then(data => setLines(data))
      .catch(err => console.error("Error fetching lines:", err));

    fetch('/api/tqi/sessions')
      .then(res => res.json())
      .then(data => setSessions(data))
      .catch(err => console.error("Error fetching sessions:", err));
  }, []);

  useEffect(() => {
    if (selectedSession) {
      setLoadingSegments(true);
      fetch(`/api/tqi/segments?session=${encodeURIComponent(selectedSession)}`)
        .then(res => res.json())
        .then(data => {
          setSegmentsData(data);
          setLoadingSegments(false);
          setSelectedSegment(null); // Reset
        })
        .catch(err => {
          console.error("Error fetching segments:", err);
          setLoadingSegments(false);
        });
    } else {
      setSegmentsData(null);
      setSelectedSegment(null);
    }
  }, [selectedSession]);

  const filteredSessions = sessions.filter(s => s.lineCode === selectedLine || !selectedLine);

  return (
    <div className="p-4" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1rem', backgroundColor: '#f3f4f6', overflowY: 'auto' }}>
      
      {/* HEADER AND CONTROLS */}
      <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>TQI Dashboard</h1>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <label style={{ fontWeight: '500' }}>Select Line:</label>
            <select 
              value={selectedLine} 
              onChange={(e) => {
                setSelectedLine(e.target.value);
                setSelectedSession('');
              }}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db', minWidth: '300px' }}
            >
              <option value="">-- Select Line --</option>
              {lines.map(l => (
                <option key={l.id} value={l.id}>{l.name} ({l.id})</option>
              ))}
            </select>
          </div>

          {selectedLine && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label style={{ fontWeight: '500' }}>Select Session:</label>
                <select 
                  value={selectedSession} 
                  onChange={(e) => setSelectedSession(e.target.value)}
                  style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid #d1d5db', minWidth: '300px' }}
                >
                  <option value="">-- Select Session --</option>
                  {filteredSessions.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.datetime ? `${s.datetime.replace('T', ' ')} (${formatKm(s.kmStart)} - ${formatKm(s.kmEnd)})` : s.id}
                    </option>
                  ))}
                </select>
              </div>

              {selectedSession && (
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={showHeatmap} onChange={e => setShowHeatmap(e.target.checked)} />
                    Show Heatmap
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={showAlerts} onChange={e => setShowAlerts(e.target.checked)} />
                    Show Alerts
                  </label>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* GRAFICO TREND (Sempre visibile se una linea è selezionata) */}
      {selectedLine && (
        <TqiTrendChart 
          lineCode={selectedLine} 
          lineObj={lines.find(l => l.id === selectedLine)} 
        />
      )}

      {/* DETTAGLI SESSIONE */}
      {selectedSession && loadingSegments && (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Caricamento dati geometria...</div>
      )}

      {selectedSession && segmentsData && segmentsData.segments && !loadingSegments && (
        <>
          {showHeatmap && (
            <TqiHeatmap 
              segments={segmentsData.segments} 
              onSegmentClick={(seg) => setSelectedSegment(seg)} 
            />
          )}
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {showAlerts && (
              <div style={{ flex: '1 1 25%', minWidth: '350px', maxWidth: '35%' }}>
                <TqiAlertTable 
                  segments={segmentsData.segments} 
                  onSegmentClick={(seg) => setSelectedSegment(seg)} 
                />
              </div>
            )}
            
            <div style={{ flex: '1 1 70%', minWidth: '500px' }}>
              {selectedSegment ? (
                <TqiSigmaBreakdown segment={selectedSegment} />
              ) : (
                <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', textAlign: 'center' }}>
                  Select a segment from the Heatmap or the Alerts Table to view the Sigma Breakdown parameters.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
