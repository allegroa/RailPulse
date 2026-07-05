import React, { useState, useEffect } from 'react';

// API always points to /api/config
const API_BASE = import.meta.env.DEV ? 'http://localhost:5002/api/config' : '/api/config';

const translations = {
  it: {
    headerTitle: "Configurazione di Sistema",
    headerBadge: "V2.0",
    headerSubtitle: "Gestione centralizzata e persistente delle configurazioni",
    tabLanguage: "Lingua",
    tabLines: "Linee e Binari",
    tabOperators: "Operatori",
    tabTaskTypes: "Tipologie Intervento",
    tabStations: "Stazioni",
    langCardTitle: "Lingua di Default",
    langCardDesc: "Imposta la lingua predefinita della piattaforma.",
    selectActiveLang: "Seleziona Lingua Attiva",
    applyChanges: "Applica Modifiche",
    toastLangSuccess: "Lingua aggiornata con successo.",
    toastLangError: "Errore durante il salvataggio della lingua.",
    addLineTitle: "Aggiungi Linea",
    editLineTitle: "Modifica Linea",
    lineIdLabel: "Codice ID Linea",
    lineNameLabel: "Nome Visualizzato",
    lineStartKm: "Km Inizio",
    lineEndKm: "Km Fine",
    lineTracksLabel: "Binari Associati (separati da virgola)",
    lineTracksPlaceholder: "Binario 1, Binario 2",
    lineTracksHelp: "Esempio: Binario 1, Binario 2",
    btnSaveLine: "Salva Linea",
    btnAddTrack: "Aggiungi Linea",
    btnCancel: "Annulla",
    registeredLinesTitle: "Linee Registrate",
    tableHeaderNameId: "Nome (ID)",
    tableHeaderKmRange: "Tratta Km",
    tableHeaderTracks: "Binari",
    tableHeaderActions: "Azioni",
    noLinesMsg: "Nessuna linea presente.",
    btnEdit: "Modifica",
    btnDelete: "Elimina",
    confirmDeleteLine: "Sei sicuro di voler eliminare questa linea?",
    newOperatorTitle: "Nuovo Operatore",
    operatorNameLabel: "Nome Operatore",
    btnRegisterOperator: "Registra",
    registeredOperatorsTitle: "Operatori Registrati",
    operatorTableHeaderName: "Nome Operatore",
    noOperatorsMsg: "Nessun operatore configurato.",
    btnRemove: "Rimuovi",
    confirmDeleteOperator: 'Rimuovere l\'operatore "{name}"?',
    taskTypeTitle: "Gestione Tipologia di Intervento",
    taskTypeDesc: "Configura le tipologie di lavoro visualizzate nei menu.",
    taskNameLabel: "Nome Tipologia",
    taskColorLabel: "Colore Grafico (HEX)",
    btnSaveTaskType: "Salva Tipologia",
    taskTypeTableHeaderName: "Nome Tipologia",
    taskTypeTableHeaderColor: "Colore",
    noTaskTypesMsg: "Nessuna tipologia definita.",
    confirmDeleteTaskType: 'Rimuovere la tipologia di intervento "{name}"?',
    loadingMsg: "Caricamento in corso...",
    toastFillLineFields: "Si prega di compilare tutti i campi",
    toastLineSaveSuccess: "Linea creata con successo",
    toastLineUpdateSuccess: "Linea aggiornata con successo",
    toastLineDeleteSuccess: "Linea eliminata con successo",
    toastOperatorEmpty: "Il nome dell'operatore non può essere vuoto",
    toastOperatorSuccess: "Operatore aggiunto con successo",
    toastOperatorDeleteSuccess: "Operatore rimosso con successo",
    toastTaskTypeNameEmpty: "Il nome della tipologia è obbligatorio",
    toastTaskTypeSuccess: "Tipologia salvata con successo",
    toastTaskTypeDeleteSuccess: "Tipologia rimossa con successo",
    stationsTitle: "Registro Stazioni",
    stationsDesc: "Gestione centralizzata dell'anagrafica stazioni.",
    stationFormCode: "Codice",
    stationFormName: "Nome Stazione",
    stationFormKmStart: "Km Inizio",
    stationFormKmEnd: "Km Fine",
    stationFormTracks: "Numero Binari",
    btnSaveStation: "Salva Stazione",
    noStationsMsg: "Nessuna stazione presente.",
    toastStationEmpty: "Il codice stazione è obbligatorio",
    toastStationSuccess: "Stazione salvata con successo",
    toastStationDeleteSuccess: "Stazione eliminata con successo",
    confirmDeleteStation: 'Eliminare la stazione "{code}"?',
    tableHeaderStationCodeName: "Codice / Nome"
  },
  en: {
    headerTitle: "System Configuration",
    headerBadge: "V2.0",
    headerSubtitle: "Centralized and persistent configuration management",
    tabLanguage: "Language",
    tabLines: "Lines & Tracks",
    tabOperators: "Operators",
    tabTaskTypes: "Task Types",
    tabStations: "Stations",
    langCardTitle: "Default Language",
    langCardDesc: "Set the default platform language.",
    selectActiveLang: "Select Active Language",
    applyChanges: "Apply Changes",
    toastLangSuccess: "Language updated successfully.",
    toastLangError: "Error saving language.",
    addLineTitle: "Add Line",
    editLineTitle: "Edit Line",
    lineIdLabel: "Line ID Code",
    lineNameLabel: "Display Name",
    lineStartKm: "Start Km",
    lineEndKm: "End Km",
    lineTracksLabel: "Associated Tracks (comma separated)",
    lineTracksPlaceholder: "Track 1, Track 2",
    lineTracksHelp: "Example: Track 1, Track 2",
    btnSaveLine: "Save Line",
    btnAddTrack: "Add Line",
    btnCancel: "Cancel",
    registeredLinesTitle: "Registered Lines",
    tableHeaderNameId: "Name (ID)",
    tableHeaderKmRange: "Km Range",
    tableHeaderTracks: "Tracks",
    tableHeaderActions: "Actions",
    noLinesMsg: "No lines present.",
    btnEdit: "Edit",
    btnDelete: "Delete",
    confirmDeleteLine: "Are you sure you want to delete this line?",
    newOperatorTitle: "New Operator",
    operatorNameLabel: "Operator Name",
    btnRegisterOperator: "Register",
    registeredOperatorsTitle: "Registered Operators",
    operatorTableHeaderName: "Operator Name",
    noOperatorsMsg: "No operators configured.",
    btnRemove: "Remove",
    confirmDeleteOperator: 'Remove operator "{name}"?',
    taskTypeTitle: "Task Type Management",
    taskTypeDesc: "Configure work types displayed in menus.",
    taskNameLabel: "Type Name",
    taskColorLabel: "Chart Color (HEX)",
    btnSaveTaskType: "Save Type",
    taskTypeTableHeaderName: "Type Name",
    taskTypeTableHeaderColor: "Color",
    noTaskTypesMsg: "No types defined.",
    confirmDeleteTaskType: 'Remove task type "{name}"?',
    loadingMsg: "Loading...",
    toastFillLineFields: "Please fill all fields",
    toastLineSaveSuccess: "Line created successfully",
    toastLineUpdateSuccess: "Line updated successfully",
    toastLineDeleteSuccess: "Line deleted successfully",
    toastOperatorEmpty: "Operator name cannot be empty",
    toastOperatorSuccess: "Operator added successfully",
    toastOperatorDeleteSuccess: "Operator removed successfully",
    toastTaskTypeNameEmpty: "Task type name is required",
    toastTaskTypeSuccess: "Task type saved successfully",
    toastTaskTypeDeleteSuccess: "Task type removed successfully",
    stationsTitle: "Stations Registry",
    stationsDesc: "Centralized management of station data.",
    stationFormCode: "Code",
    stationFormName: "Station Name",
    stationFormKmStart: "Start Km",
    stationFormKmEnd: "End Km",
    stationFormTracks: "Number of Tracks",
    btnSaveStation: "Save Station",
    noStationsMsg: "No stations present.",
    toastStationEmpty: "Station code is required",
    toastStationSuccess: "Station saved successfully",
    toastStationDeleteSuccess: "Station deleted successfully",
    confirmDeleteStation: 'Delete station "{code}"?',
    tableHeaderStationCodeName: "Code / Name"
  }
};

export default function GeneralConfigurationPage() {
  const [activeTab, setActiveTab] = useState('language');
  const [config, setConfig] = useState(null);
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', isError: false });

  // Form states
  const [selectedLanguage, setSelectedLanguage] = useState('it');
  
  const [lineId, setLineId] = useState('');
  const [lineName, setLineName] = useState('');
  const [lineStartKm, setLineStartKm] = useState('0');
  const [lineEndKm, setLineEndKm] = useState('100');
  const [lineTracksInput, setLineTracksInput] = useState('');
  const [editingLineId, setEditingLineId] = useState(null);

  const [newOperator, setNewOperator] = useState('');

  const [taskTypeName, setTaskTypeName] = useState('');
  const [taskTypeColor, setTaskTypeColor] = useState('#3b82f6');

  const [stationForm, setStationForm] = useState({ code: '', name: '', kmStart: '', kmEnd: '', tracks: '' });
  const [editingStation, setEditingStation] = useState(null);

  useEffect(() => {
    fetchConfig();
    fetchStations();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}`);
      if (!res.ok) throw new Error('Errore di connessione API');
      const data = await res.json();
      setConfig(data);
      setSelectedLanguage(data.language?.active || 'it');
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  const fetchStations = async () => {
    try {
      const res = await fetch(`${API_BASE}/stations`);
      const data = await res.json();
      if (data.success) {
        setStations(data.stations || []);
      }
    } catch (err) {
      console.error('Failed to fetch stations', err);
    }
  };

  const currentLang = config?.language?.active || 'it';
  const t = (key) => translations[currentLang]?.[key] || translations['it']?.[key] || key;

  const showToast = (message, isError = false) => {
    setToast({ show: true, message, isError });
    setTimeout(() => setToast({ show: false, message: '', isError: false }), 4000);
  };

  // --- LINGUA ---
  const handleSaveLanguage = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/language`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: selectedLanguage })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(t('toastLangSuccess'));
      fetchConfig();
    } catch (err) {
      showToast(err.message, true);
    }
  };

  // --- LINEE E BINARI ---
  const handleSaveLine = async (e) => {
    e.preventDefault();
    if (!lineId || !lineName || lineStartKm === '' || lineEndKm === '') {
      showToast(t('toastFillLineFields'), true);
      return;
    }
    const tracksArray = lineTracksInput.split(',').map(tr => tr.trim()).filter(tr => tr !== '');
    const payload = {
      id: lineId.trim().toLowerCase().replace(/\s+/g, '_'),
      name: lineName.trim(),
      startKm: parseFloat(lineStartKm),
      endKm: parseFloat(lineEndKm),
      tracks: tracksArray.length > 0 ? tracksArray : ['Binario 1']
    };
    try {
      const url = editingLineId ? `${API_BASE}/lines/${editingLineId}` : `${API_BASE}/lines`;
      const method = editingLineId ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(editingLineId ? t('toastLineUpdateSuccess') : t('toastLineSaveSuccess'));
      resetLineForm();
      fetchConfig();
    } catch (err) {
      showToast(err.message, true);
    }
  };

  const handleEditLine = (line) => {
    setEditingLineId(line.id);
    setLineId(line.id);
    setLineName(line.name);
    setLineStartKm(line.startKm.toString());
    setLineEndKm(line.endKm.toString());
    setLineTracksInput(line.tracks.join(', '));
  };

  const handleDeleteLine = async (id) => {
    if (!window.confirm(t('confirmDeleteLine'))) return;
    try {
      const res = await fetch(`${API_BASE}/lines/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error');
      showToast(t('toastLineDeleteSuccess'));
      fetchConfig();
    } catch (err) {
      showToast(err.message, true);
    }
  };

  const resetLineForm = () => {
    setEditingLineId(null);
    setLineId('');
    setLineName('');
    setLineStartKm('0');
    setLineEndKm('100');
    setLineTracksInput('');
  };

  // --- OPERATORI ---
  const handleAddOperator = async (e) => {
    e.preventDefault();
    if (!newOperator.trim()) return showToast(t('toastOperatorEmpty'), true);
    try {
      const res = await fetch(`${API_BASE}/operators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newOperator.trim() })
      });
      if (!res.ok) throw new Error('Error');
      showToast(t('toastOperatorSuccess'));
      setNewOperator('');
      fetchConfig();
    } catch (err) {
      showToast(err.message, true);
    }
  };

  const handleDeleteOperator = async (name) => {
    if (!window.confirm(t('confirmDeleteOperator').replace('{name}', name))) return;
    try {
      const res = await fetch(`${API_BASE}/operators/${encodeURIComponent(name)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error');
      showToast(t('toastOperatorDeleteSuccess'));
      fetchConfig();
    } catch (err) {
      showToast(err.message, true);
    }
  };

  // --- TIPOLOGIE ---
  const handleSaveTaskType = async (e) => {
    e.preventDefault();
    if (!taskTypeName.trim()) return showToast(t('toastTaskTypeNameEmpty'), true);
    try {
      const res = await fetch(`${API_BASE}/task-types`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: taskTypeName.trim(), color: taskTypeColor, icon: 'X' }) // Fixed icon as 'X' or text since NO emojis are allowed per rule
      });
      if (!res.ok) throw new Error('Error');
      showToast(t('toastTaskTypeSuccess'));
      setTaskTypeName('');
      setTaskTypeColor('#3b82f6');
      fetchConfig();
    } catch (err) {
      showToast(err.message, true);
    }
  };

  const handleDeleteTaskType = async (name) => {
    if (!window.confirm(t('confirmDeleteTaskType').replace('{name}', name))) return;
    try {
      const res = await fetch(`${API_BASE}/task-types/${encodeURIComponent(name)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error');
      showToast(t('toastTaskTypeDeleteSuccess'));
      fetchConfig();
    } catch (err) {
      showToast(err.message, true);
    }
  };

  // --- STAZIONI ---
  const handleStationFormChange = (field, value) => {
    setStationForm(prev => ({ ...prev, [field]: value }));
  };

  const handleStationEdit = (station) => {
    setEditingStation(station.code);
    setStationForm({
      code: station.code,
      name: station.name || '',
      kmStart: station.kmStart !== undefined ? station.kmStart.toString() : '',
      kmEnd: station.kmEnd !== undefined ? station.kmEnd.toString() : '',
      tracks: station.tracks !== undefined ? station.tracks.toString() : ''
    });
  };

  const handleStationSave = async (e) => {
    e.preventDefault();
    if (!stationForm.code.trim()) return showToast(t('toastStationEmpty'), true);
    try {
      const res = await fetch(`${API_BASE}/stations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          station: {
            code: stationForm.code.trim().toUpperCase(),
            name: stationForm.name.trim(),
            kmStart: parseFloat(stationForm.kmStart) || 0,
            kmEnd: parseFloat(stationForm.kmEnd) || 0,
            tracks: parseInt(stationForm.tracks) || 0
          }
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Error');
      setStations(data.stations);
      setStationForm({ code: '', name: '', kmStart: '', kmEnd: '', tracks: '' });
      setEditingStation(null);
      showToast(t('toastStationSuccess'));
    } catch (err) {
      showToast(err.message, true);
    }
  };

  const handleStationDelete = async (code) => {
    if (!window.confirm(t('confirmDeleteStation').replace('{code}', code))) return;
    try {
      const res = await fetch(`${API_BASE}/stations/${encodeURIComponent(code)}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error('Error');
      setStations(data.stations);
      showToast(t('toastStationDeleteSuccess'));
      if (editingStation === code) {
        setEditingStation(null);
        setStationForm({ code: '', name: '', kmStart: '', kmEnd: '', tracks: '' });
      }
    } catch (err) {
      showToast(err.message, true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 font-mono tracking-widest uppercase text-sm animate-pulse">
          {t('loadingMsg')}
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'language', label: t('tabLanguage') },
    { id: 'lines', label: t('tabLines') },
    { id: 'operators', label: t('tabOperators') },
    { id: 'taskTypes', label: t('tabTaskTypes') },
    { id: 'stations', label: t('tabStations') }
  ];

  return (
    <div className="flex flex-col w-full h-full p-8 bg-slate-50 overflow-y-auto selection:bg-blue-100">
      
      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed top-6 right-6 px-6 py-3 rounded-lg shadow-2xl backdrop-blur-md border transition-all duration-300 z-50 animate-fade-in ${toast.isError ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
          <div className="text-sm font-medium tracking-wide">
            {toast.message}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col mb-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight font-sans">
                  {t('headerTitle')}
                </h1>
                <span className="bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded text-xs">
                  {t('headerBadge')}
                </span>
              </div>
              <p className="text-slate-400 mt-1 text-sm font-light">
                {t('headerSubtitle')}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex gap-8 mt-8 border-b border-slate-200">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 text-sm font-semibold tracking-wide uppercase transition-all duration-300 relative ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="animate-fade-in">
        
        {/* TAB LANGUAGE */}
        {activeTab === 'language' && (
          <div className="max-w-xl">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-2">{t('langCardTitle')}</h2>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                {t('langCardDesc')}
              </p>
              <form onSubmit={handleSaveLanguage} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-3">
                    {t('selectActiveLang')}
                  </label>
                  <select 
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-800 shadow-sm text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                  >
                    {config?.language?.available?.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.label} ({lang.code.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-all">
                  {t('applyChanges')}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB LINES */}
        {activeTab === 'lines' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sticky top-40">
                <h2 className="text-lg font-bold text-slate-800 mb-6">
                  {editingLineId ? t('editLineTitle') : t('addLineTitle')}
                </h2>
                <form onSubmit={handleSaveLine} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">{t('lineIdLabel')}</label>
                    <input type="text" value={lineId} onChange={e => setLineId(e.target.value)} disabled={!!editingLineId} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 shadow-sm text-sm focus:border-blue-500 transition-all outline-none disabled:opacity-50" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">{t('lineNameLabel')}</label>
                    <input type="text" value={lineName} onChange={e => setLineName(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 shadow-sm text-sm focus:border-blue-500 transition-all outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">{t('lineStartKm')}</label>
                      <input type="number" step="0.001" value={lineStartKm} onChange={e => setLineStartKm(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 shadow-sm text-sm focus:border-blue-500 transition-all outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">{t('lineEndKm')}</label>
                      <input type="number" step="0.001" value={lineEndKm} onChange={e => setLineEndKm(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 shadow-sm text-sm focus:border-blue-500 transition-all outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">{t('lineTracksLabel')}</label>
                    <input type="text" value={lineTracksInput} onChange={e => setLineTracksInput(e.target.value)} placeholder={t('lineTracksPlaceholder')} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 shadow-sm text-sm focus:border-blue-500 transition-all outline-none" />
                  </div>
                  <div className="pt-2 flex gap-3">
                    <button type="submit" className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-all flex-1">
                      {editingLineId ? t('btnSaveLine') : t('btnAddTrack')}
                    </button>
                    {editingLineId && (
                      <button type="button" onClick={resetLineForm} className="border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-md font-medium text-sm transition-all">
                        {t('btnCancel')}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
            <div className="lg:col-span-8">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs">
                      <th className="px-6 py-3 font-semibold text-slate-500">{t('tableHeaderNameId')}</th>
                      <th className="px-6 py-3 font-semibold text-slate-500">{t('tableHeaderKmRange')}</th>
                      <th className="px-6 py-3 font-semibold text-slate-500">{t('tableHeaderTracks')}</th>
                      <th className="px-6 py-3 font-semibold text-slate-500 text-right">{t('tableHeaderActions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {config?.lines?.length === 0 ? (
                      <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-500 font-medium">{t('noLinesMsg')}</td></tr>
                    ) : config?.lines?.map(line => (
                      <tr key={line.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">{line.name}</div>
                          <div className="text-xs text-slate-500 font-mono mt-1">{line.id}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                          {line.startKm} - {line.endKm}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {line.tracks.map((track, i) => (
                              <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md border border-slate-200">
                                {track}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleEditLine(line)} className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors">
                              {t('btnEdit')}
                            </button>
                            <button onClick={() => handleDeleteLine(line.id)} className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-700 bg-red-50 hover:bg-red-100 rounded transition-colors">
                              {t('btnDelete')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB OPERATORS */}
        {activeTab === 'operators' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-6">{t('newOperatorTitle')}</h2>
                <form onSubmit={handleAddOperator} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">{t('operatorNameLabel')}</label>
                    <input type="text" value={newOperator} onChange={e => setNewOperator(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 shadow-sm text-sm focus:border-blue-500 transition-all outline-none" />
                  </div>
                  <button type="submit" className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-all">
                    {t('btnRegisterOperator')}
                  </button>
                </form>
              </div>
            </div>
            <div>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs">
                      <th className="px-6 py-3 font-semibold text-slate-500">{t('operatorTableHeaderName')}</th>
                      <th className="px-6 py-3 font-semibold text-slate-500 text-right">{t('tableHeaderActions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {config?.operators?.length === 0 ? (
                      <tr><td colSpan="2" className="px-6 py-12 text-center text-slate-500 font-medium">{t('noOperatorsMsg')}</td></tr>
                    ) : config?.operators?.map((op, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-800">{op}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDeleteOperator(op)} className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-700 bg-red-50 hover:bg-red-100 rounded transition-colors">
                            {t('btnRemove')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB TASK TYPES */}
        {activeTab === 'taskTypes' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-bold text-slate-800 mb-2">{t('taskTypeTitle')}</h2>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">{t('taskTypeDesc')}</p>
                <form onSubmit={handleSaveTaskType} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">{t('taskNameLabel')}</label>
                    <input type="text" value={taskTypeName} onChange={e => setTaskTypeName(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 shadow-sm text-sm focus:border-blue-500 transition-all outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">{t('taskColorLabel')}</label>
                    <div className="flex gap-3">
                      <input type="color" value={taskTypeColor} onChange={e => setTaskTypeColor(e.target.value)} className="w-12 h-10 rounded bg-white border border-slate-200 cursor-pointer p-0.5" />
                      <input type="text" value={taskTypeColor} onChange={e => setTaskTypeColor(e.target.value)} className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 shadow-sm text-sm font-mono focus:border-blue-500 transition-all outline-none uppercase" maxLength={7} />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-all">
                    {t('btnSaveTaskType')}
                  </button>
                </form>
              </div>
            </div>
            <div className="lg:col-span-8">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs">
                      <th className="px-6 py-3 font-semibold text-slate-500 w-24">{t('taskTypeTableHeaderColor')}</th>
                      <th className="px-6 py-3 font-semibold text-slate-500">{t('taskTypeTableHeaderName')}</th>
                      <th className="px-6 py-3 font-semibold text-slate-500 text-right">{t('tableHeaderActions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {config?.taskTypes?.length === 0 ? (
                      <tr><td colSpan="3" className="px-6 py-12 text-center text-slate-500 font-medium">{t('noTaskTypesMsg')}</td></tr>
                    ) : config?.taskTypes?.map((task, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="w-8 h-8 rounded-full border-2 border-slate-800 shadow-inner" style={{ backgroundColor: task.color }}></div>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800">{task.name}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDeleteTaskType(task.name)} className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-700 bg-red-50 hover:bg-red-100 rounded transition-colors">
                            {t('btnRemove')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB STATIONS */}
        {activeTab === 'stations' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sticky top-40">
                <h2 className="text-lg font-bold text-slate-800 mb-2">{t('stationsTitle')}</h2>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">{t('stationsDesc')}</p>
                <form onSubmit={handleStationSave} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">{t('stationFormCode')}</label>
                    <input type="text" value={stationForm.code} onChange={e => handleStationFormChange('code', e.target.value.toUpperCase())} disabled={!!editingStation} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 shadow-sm text-sm focus:border-blue-500 transition-all outline-none uppercase disabled:opacity-50" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">{t('stationFormName')}</label>
                    <input type="text" value={stationForm.name} onChange={e => handleStationFormChange('name', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 shadow-sm text-sm focus:border-blue-500 transition-all outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">{t('stationFormKmStart')}</label>
                      <input type="number" step="0.001" value={stationForm.kmStart} onChange={e => handleStationFormChange('kmStart', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 shadow-sm text-sm focus:border-blue-500 transition-all outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">{t('stationFormKmEnd')}</label>
                      <input type="number" step="0.001" value={stationForm.kmEnd} onChange={e => handleStationFormChange('kmEnd', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 shadow-sm text-sm focus:border-blue-500 transition-all outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">{t('stationFormTracks')}</label>
                    <input type="number" value={stationForm.tracks} onChange={e => handleStationFormChange('tracks', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 shadow-sm text-sm focus:border-blue-500 transition-all outline-none" />
                  </div>
                  <div className="pt-2 flex gap-3">
                    <button type="submit" className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-all flex-1">
                      {t('btnSaveStation')}
                    </button>
                    {editingStation && (
                      <button type="button" onClick={() => { setEditingStation(null); setStationForm({ code: '', name: '', kmStart: '', kmEnd: '', tracks: '' }); }} className="border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-md font-medium text-sm transition-all">
                        {t('btnCancel')}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
            <div className="lg:col-span-8">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs">
                      <th className="px-6 py-3 font-semibold text-slate-500">{t('tableHeaderStationCodeName')}</th>
                      <th className="px-6 py-3 font-semibold text-slate-500">{t('tableHeaderKmRange')}</th>
                      <th className="px-6 py-3 font-semibold text-slate-500">{t('tableHeaderTracks')}</th>
                      <th className="px-6 py-3 font-semibold text-slate-500 text-right">{t('tableHeaderActions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stations.length === 0 ? (
                      <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-500 font-medium">{t('noStationsMsg')}</td></tr>
                    ) : stations.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">{s.code}</div>
                          <div className="text-xs text-slate-500 mt-1">{s.name || '-'}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                          {s.kmStart} - {s.kmEnd}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                          {s.tracks || '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleStationEdit(s)} className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors">
                              {t('btnEdit')}
                            </button>
                            <button onClick={() => handleStationDelete(s.code)} className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-red-700 bg-red-50 hover:bg-red-100 rounded transition-colors">
                              {t('btnDelete')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
