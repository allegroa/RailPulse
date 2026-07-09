import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import FiltersPanel from './components/FiltersPanel';
import AcquisitionsList from './components/AcquisitionsList';

export default function DatabaseViewPage() {
  const { t, i18n } = useTranslation();
  const [stationsList, setStationsList] = useState([]);
  
  useEffect(() => {
    // Carica la lingua attiva
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data && data.language && data.language.active) {
          i18n.changeLanguage(data.language.active);
        }
      })
      .catch(err => console.error("Errore caricamento config:", err));

    // Carica la lista stazioni
    fetch('/api/config/stations')
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.stations)) {
          setStationsList(data.stations);
        }
      })
      .catch(err => console.error("Errore caricamento stazioni:", err));
  }, [i18n]);

  const [filters, setFilters] = useState({
    system: '',
    date: '',
    time: '',
    startKm: '',
    endKm: '',
    length: '',
    stazionePartenza: '',
    direction: ''
  });

  const [acquisitions, setAcquisitions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Recupera i dati reali dal backend
  useEffect(() => {
    setLoading(true);
    fetch('/api/files/database-view/acquisitions', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.success) {
          // Arricchisci con stazione di partenza se i KM coincidono
          const enriched = data.acquisitions.map(acq => {
            if (!acq.stazionePartenza) {
              // Cerca in stationList un match coi KM
              const targetKm = Math.min(acq.startKm, acq.endKm); // O usiamo startKm
              const possibleStation = stationsList.find(s => {
                // Troviamo se il km è vicino (es. entro 1 km) a una stazione nota
                if (s.KM != null) return Math.abs(s.KM - targetKm) < 1.0;
                return false;
              });
              if (possibleStation) acq.stazionePartenza = possibleStation.Name || possibleStation.code;
              else acq.stazionePartenza = 'Sconosciuta';
            }
            return acq;
          });
          setAcquisitions(enriched);
        }
      })
      .catch(err => console.error("Errore fetch acquisizioni:", err))
      .finally(() => setLoading(false));
  }, [stationsList]);

  const handleFilterChange = (column, value) => {
    setFilters(prev => ({ ...prev, [column]: value }));
  };

  const filteredAcquisitions = useMemo(() => {
    return acquisitions.filter(s => {
      if (filters.system && s.system !== filters.system) return false;
      if (filters.date && !s.date.includes(filters.date)) return false;
      if (filters.time && !s.time.includes(filters.time)) return false;
      if (filters.startKm && !s.startKm.toString().includes(filters.startKm)) return false;
      if (filters.endKm && !s.endKm.toString().includes(filters.endKm)) return false;
      if (filters.length) {
        const len = Math.abs((s.endKm || 0) - (s.startKm || 0)).toFixed(3);
        if (!len.includes(filters.length)) return false;
      }
      if (filters.stazionePartenza && (!s.stazionePartenza || !s.stazionePartenza.toLowerCase().includes(filters.stazionePartenza.toLowerCase()))) return false;
      if (filters.direction && (!s.direction || !s.direction.toLowerCase().includes(filters.direction.toLowerCase()))) return false;
      return true;
    });
  }, [acquisitions, filters]);

  // Group by common track: Stazione Iniziale + Direction
  const groupedAcquisitions = useMemo(() => {
    const groups = {};
    filteredAcquisitions.forEach(acq => {
      const key = `${acq.stazionePartenza}_${acq.direction}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(acq);
    });
    return Object.values(groups);
  }, [filteredAcquisitions]);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden text-slate-800 font-sans">
      {/* Left Panel: 50% */}
      <div className="w-1/2 flex flex-col h-full border-r border-slate-200">
        <div className="p-4 bg-white shadow-sm shrink-0 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">{t('dbViewTitle')}</h1>
            <p className="text-sm text-slate-400">{t('dbViewSubtitle')}</p>
          </div>
          <span className="bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded text-xs">v1.0</span>
        </div>

        <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4">
          <FiltersPanel filters={filters} onFilterChange={handleFilterChange} stationsList={stationsList} />
          <AcquisitionsList groups={groupedAcquisitions} />
        </div>
      </div>

      {/* Right Column: Map Preview */}
      <div className="w-1/2 bg-slate-50 relative flex flex-col">
        <iframe 
          src="/taipei_static/index.html?hideSidebar=true" 
          title="Taipei Map Node Graph"
          className="w-full h-full border-0 absolute inset-0"
        />
      </div>
    </div>
  );
}
