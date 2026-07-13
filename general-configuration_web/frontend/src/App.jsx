import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.DEV ? 'http://localhost:5002' : '';

const translations = {
  it: {
    headerTitle: "RailPulse Configuration",
    headerBadge: "Modulo Config",
    headerSubtitle: "Gestione centralizzata e persistente delle configurazioni e dei database condivisi",
    tabLanguage: "Lingua di Sistema",
    tabLines: "Linee e Binari",
    tabOperators: "Anagrafica Operatori",
    tabTaskTypes: "Tipologie Intervento",
    langCardTitle: "Lingua Internazionale di Default",
    langCardDesc: "Imposta la lingua predefinita della piattaforma. Questa preferenza sarà ereditata da tutti gli altri moduli compatibili (es. manutenzione, GIS).",
    selectActiveLang: "Seleziona Lingua Attiva",
    applyChanges: "Applica Modifiche",
    toastLangSuccess: "Lingua di sistema aggiornata con successo",
    toastLangError: "Errore durante il salvataggio della lingua",
    addLineTitle: "Aggiungi Linea Ferroviaria",
    editLineTitle: "Modifica Linea Ferroviaria",
    lineIdLabel: "Codice ID Linea (Es. line_nord)",
    lineNameLabel: "Nome Visualizzato (Es. Linea Nord)",
    lineStartKm: "Km Inizio",
    lineEndKm: "Km Fine",
    lineTracksLabel: "Binari Associati (separati da virgola)",
    lineTracksPlaceholder: "Binario 1, Binario 2, Pari, Dispari",
    lineTracksHelp: "Esempio: Binario 1, Binario 2 (verranno salvati come lista)",
    btnSaveLine: "Salva Linea",
    btnAddTrack: "Aggiungi Tratta",
    btnCancel: "Annulla",
    registeredLinesTitle: "Linee Ferroviarie Registrate",
    tableHeaderNameId: "Nome (ID)",
    tableHeaderKmRange: "Tratta Km",
    tableHeaderTracks: "Binari",
    tableHeaderActions: "Azioni",
    noLinesMsg: "Nessuna linea presente a database.",
    btnEdit: "Modifica",
    btnDelete: "Elimina",
    confirmDeleteLine: "Sei sicuro di voler eliminare questa linea? Tutti i binari associati verranno rimossi.",
    newOperatorTitle: "Nuovo Operatore / Ditta Appaltatrice",
    operatorNameLabel: "Ragione Sociale o Nome",
    btnRegisterOperator: "Registra Operatore",
    registeredOperatorsTitle: "Anagrafica Operatori Abilitati",
    operatorTableHeaderName: "Nome Operatore",
    noOperatorsMsg: "Nessun operatore configurato.",
    btnRemove: "Rimuovi",
    confirmDeleteOperator: 'Rimuovere l\'operatore "{name}"?',
    taskTypeTitle: "Gestione Tipologia di Intervento",
    taskTypeDesc: "Configura le tipologie di lavoro visualizzate nei menu a tendina. Aggiungendo un colore e un simbolo, uniformerai la rappresentazione sui grafici GIS ed analitici.",
    taskNameLabel: "Nome Tipologia (Es. Molatura Rotaia)",
    taskColorLabel: "Colore Grafico (HEX)",
    taskIconLabel: "Simbolo / Emoji",
    btnSaveTaskType: "Salva Tipologia",
    taskTypeTableHeaderSymbol: "Simbolo",
    taskTypeTableHeaderName: "Nome Tipologia",
    taskTypeTableHeaderColor: "Colore",
    noTaskTypesMsg: "Nessuna tipologia definita.",
    confirmDeleteTaskType: 'Rimuovere la tipologia di intervento "{name}"?',
    loadingMsg: "Caricamento delle configurazioni in corso...",
    toastFillLineFields: "Si prega di compilare tutti i campi obbligatori della linea",
    toastLineSaveSuccess: "Nuova linea creata con successo",
    toastLineUpdateSuccess: "Linea aggiornata con successo",
    toastLineDeleteSuccess: "Linea eliminata con successo",
    toastOperatorEmpty: "Il nome dell'operatore non può essere vuoto",
    toastOperatorSuccess: "Operatore aggiunto con successo",
    toastOperatorDeleteSuccess: "Operatore rimosso con successo",
    toastTaskTypeNameEmpty: "Il nome della tipologia di intervento è obbligatorio",
    toastTaskTypeSuccess: "Tipologia di intervento salvata con successo",
    toastTaskTypeDeleteSuccess: "Tipologia rimossa con successo"
  },
  en: {
    headerTitle: "RailPulse Configuration",
    headerBadge: "Config Module",
    headerSubtitle: "Centralized and persistent management of configurations and shared databases",
    tabLanguage: "System Language",
    tabLines: "Lines and Tracks",
    tabOperators: "Operators Registry",
    tabTaskTypes: "Task Types",
    langCardTitle: "Default International Language",
    langCardDesc: "Set the default platform language. This preference will be inherited by all other compatible modules (e.g. maintenance, GIS).",
    selectActiveLang: "Select Active Language",
    applyChanges: "Apply Changes",
    toastLangSuccess: "System language updated successfully",
    toastLangError: "Error during language saving",
    addLineTitle: "Add Railway Line",
    editLineTitle: "Edit Railway Line",
    lineIdLabel: "Line ID Code (e.g. line_nord)",
    lineNameLabel: "Display Name (e.g. Linea Nord)",
    lineStartKm: "Start Km",
    lineEndKm: "End Km",
    lineTracksLabel: "Associated Tracks (comma-separated)",
    lineTracksPlaceholder: "Track 1, Track 2, Up, Down",
    lineTracksHelp: "Example: Track 1, Track 2 (will be saved as a list)",
    btnSaveLine: "Save Line",
    btnAddTrack: "Add Track Section",
    btnCancel: "Cancel",
    registeredLinesTitle: "Registered Railway Lines",
    tableHeaderNameId: "Name (ID)",
    tableHeaderKmRange: "Km Range",
    tableHeaderTracks: "Tracks",
    tableHeaderActions: "Actions",
    noLinesMsg: "No lines present in database.",
    btnEdit: "Edit",
    btnDelete: "Delete",
    confirmDeleteLine: "Are you sure you want to delete this line? All associated tracks will be removed.",
    newOperatorTitle: "New Operator / Contractor",
    operatorNameLabel: "Company Name or Name",
    btnRegisterOperator: "Register Operator",
    registeredOperatorsTitle: "Authorized Operators Registry",
    operatorTableHeaderName: "Operator Name",
    noOperatorsMsg: "No operators configured.",
    btnRemove: "Remove",
    confirmDeleteOperator: 'Remove operator "{name}"?',
    taskTypeTitle: "Task Type Management",
    taskTypeDesc: "Configure the work types displayed in the dropdowns. By adding a color and a symbol, you will standardize representation on GIS and analytical charts.",
    taskNameLabel: "Type Name (e.g. Rail Grinding)",
    taskColorLabel: "Chart Color (HEX)",
    taskIconLabel: "Symbol / Emoji",
    btnSaveTaskType: "Save Type",
    taskTypeTableHeaderSymbol: "Symbol",
    taskTypeTableHeaderName: "Type Name",
    taskTypeTableHeaderColor: "Color",
    noTaskTypesMsg: "No types defined.",
    confirmDeleteTaskType: 'Remove task type "{name}"?',
    loadingMsg: "Loading configurations in progress...",
    toastFillLineFields: "Please fill in all required line fields",
    toastLineSaveSuccess: "New line created successfully",
    toastLineUpdateSuccess: "Line updated successfully",
    toastLineDeleteSuccess: "Line deleted successfully",
    toastOperatorEmpty: "Operator name cannot be empty",
    toastOperatorSuccess: "Operator added successfully",
    toastOperatorDeleteSuccess: "Operator removed successfully",
    toastTaskTypeNameEmpty: "Task type name is required",
    toastTaskTypeSuccess: "Task type saved successfully",
    toastTaskTypeDeleteSuccess: "Task type removed successfully"
  },
  zh: {
    headerTitle: "RailPulse 轨道配置",
    headerBadge: "配置模块",
    headerSubtitle: "系统配置与共享数据库的集中化和持久化管理",
    tabLanguage: "系统语言",
    tabLines: "线路与轨道",
    tabOperators: "运营商名册",
    tabTaskTypes: "工务类型",
    langCardTitle: "默认国际语言",
    langCardDesc: "设置平台的默认语言。此首选项将被所有其他兼容模块（如维护、GIS）继承。",
    selectActiveLang: "选择活动语言",
    applyChanges: "应用更改",
    toastLangSuccess: "系统语言更新成功",
    toastLangError: "保存语言时出错",
    addLineTitle: "添加铁路线路",
    editLineTitle: "编辑铁路线路",
    lineIdLabel: "线路 ID 代码 (例如 line_nord)",
    lineNameLabel: "显示名称 (例如 北线)",
    lineStartKm: "起点里程",
    lineEndKm: "终点里程",
    lineTracksLabel: "关联股道 (逗号分隔)",
    lineTracksPlaceholder: "股道 1, 股道 2, 上行, 下行",
    lineTracksHelp: "示例：股道 1, 股道 2 (将保存为列表)",
    btnSaveLine: "保存线路",
    btnAddTrack: "添加线路",
    btnCancel: "取消",
    registeredLinesTitle: "已注册铁路线路",
    tableHeaderNameId: "名称 (ID)",
    tableHeaderKmRange: "里程范围",
    tableHeaderTracks: "股道",
    tableHeaderActions: "操作",
    noLinesMsg: "数据库中无已配置线路。",
    btnEdit: "编辑",
    btnDelete: "删除",
    confirmDeleteLine: "您确定要删除此线路吗？所有关联股道都将被移除。",
    newOperatorTitle: "新增运营商 / 承包商",
    operatorNameLabel: "企业名称",
    btnRegisterOperator: "注册运营商",
    registeredOperatorsTitle: "授权运营商名册",
    operatorTableHeaderName: "运营商名称",
    noOperatorsMsg: "未配置运营商。",
    btnRemove: "移除",
    confirmDeleteOperator: '确认移除运营商 "{name}" 吗？',
    taskTypeTitle: "工务维护类型管理",
    taskTypeDesc: "配置下拉菜单中显示的维护类型。通过配置颜色和符号，可在 GIS 和分析图表中实现统一的视觉展示。",
    taskNameLabel: "类型名称 (例如 钢轨打磨)",
    taskColorLabel: "图表颜色 (HEX)",
    taskIconLabel: "符号 / 表情",
    btnSaveTaskType: "保存类型",
    taskTypeTableHeaderSymbol: "符号",
    taskTypeTableHeaderName: "类型名称",
    taskTypeTableHeaderColor: "颜色",
    noTaskTypesMsg: "未定义任何类型。",
    confirmDeleteTaskType: '确认移除维护类型 "{name}" 吗？',
    loadingMsg: "正在加载配置信息...",
    toastFillLineFields: "请填写所有必填字段",
    toastLineSaveSuccess: "新线路创建成功",
    toastLineUpdateSuccess: "线路更新成功",
    toastLineDeleteSuccess: "线路删除成功",
    toastOperatorEmpty: "运营商名称不能为空",
    toastOperatorSuccess: "运营商添加成功",
    toastOperatorDeleteSuccess: "运营商移除成功",
    toastTaskTypeNameEmpty: "类型名称为必填项",
    toastTaskTypeSuccess: "维护类型保存成功",
    toastTaskTypeDeleteSuccess: "维护类型移除成功"
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('language');
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Form states
  const [selectedLanguage, setSelectedLanguage] = useState('');
  
  // Line form states
  const [lineId, setLineId] = useState('');
  const [lineColor, setLineColor] = useState('#2196f3');
  const [lineName, setLineName] = useState('');
  const [lineStationSymbol, setLineStationSymbol] = useState('');
  const [lineStationNumber, setLineStationNumber] = useState('');
  const [lineStartKm, setLineStartKm] = useState('0');
  const [lineEndKm, setLineEndKm] = useState('100');
  const [lineTracksInput, setLineTracksInput] = useState('');
  const [editingLineId, setEditingLineId] = useState(null);

  // Operator form states
  const [newOperator, setNewOperator] = useState('');

  // Task type form states
  const [taskTypeName, setTaskTypeName] = useState('');
  const [taskTypeColor, setTaskTypeColor] = useState('#2196f3');
  const [taskTypeIcon, setTaskTypeIcon] = useState('🛠️');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/config`);
      if (!res.ok) throw new Error('Errore nel caricamento delle configurazioni');
      const data = await res.json();
      setConfig(data);
      setSelectedLanguage(data.language?.active || 'it');
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const currentLang = config?.language?.active || 'it';
  const t = (key) => translations[currentLang]?.[key] || translations['it']?.[key] || key;

  const showToast = (message, isError = false) => {
    if (isError) {
      setError(message);
      setSuccessMessage(null);
    } else {
      setSuccessMessage(message);
      setError(null);
    }
    setTimeout(() => {
      setSuccessMessage(null);
      setError(null);
    }, 4000);
  };

  // --- LINGUA ---
  const handleSaveLanguage = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/config/language`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: selectedLanguage })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('toastLangError'));
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

    const tracksArray = lineTracksInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t !== '');

    const payload = {
      id: lineId.trim().toUpperCase().replace(/\s+/g, '_'),
      name: lineName.trim(),
      color: lineColor,
      stationSymbol: lineStationSymbol.trim(),
      stationNumber: lineStationNumber,
      startKm: parseFloat(lineStartKm),
      endKm: parseFloat(lineEndKm),
      tracks: tracksArray.length > 0 ? tracksArray : ['Binario 1']
    };

    try {
      const url = editingLineId 
        ? `${API_BASE}/api/config/lines/${editingLineId}` 
        : `${API_BASE}/api/config/lines`;
      const method = editingLineId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Errore durante il salvataggio della linea');

      showToast(editingLineId ? t('toastLineUpdateSuccess') : t('toastLineSaveSuccess'));
      
      // Reset form
      resetLineForm();
      fetchConfig();
    } catch (err) {
      showToast(err.message, true);
    }
  };

  const handleEditLine = (line) => {
    setEditingLineId(line.id);
    setLineId(line.id);
    setLineColor(line.color || '#2196f3');
    setLineName(line.name);
    setLineStationSymbol(line.stationSymbol || '');
    setLineStationNumber(line.stationNumber !== undefined ? line.stationNumber.toString() : '');
    setLineStartKm(line.startKm.toString());
    setLineEndKm(line.endKm.toString());
    setLineTracksInput(line.tracks.join(', '));
  };

  const handleDeleteLine = async (id) => {
    if (!window.confirm(t('confirmDeleteLine'))) return;
    try {
      const res = await fetch(`${API_BASE}/api/config/lines/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore durante la cancellazione');
      showToast(t('toastLineDeleteSuccess'));
      fetchConfig();
    } catch (err) {
      showToast(err.message, true);
    }
  };

  const resetLineForm = () => {
    setEditingLineId(null);
    setLineId('');
    setLineColor('#2196f3');
    setLineName('');
    setLineStationSymbol('');
    setLineStationNumber('');
    setLineStartKm('0');
    setLineEndKm('100');
    setLineTracksInput('');
  };

  // --- OPERATORI ---
  const handleAddOperator = async (e) => {
    e.preventDefault();
    if (!newOperator.trim()) {
      showToast(t('toastOperatorEmpty'), true);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/config/operators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newOperator.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore durante l\'aggiunta dell\'operatore');
      
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
      const res = await fetch(`${API_BASE}/api/config/operators/${encodeURIComponent(name)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore durante la rimozione');
      showToast(t('toastOperatorDeleteSuccess'));
      fetchConfig();
    } catch (err) {
      showToast(err.message, true);
    }
  };

  // --- TIPOLOGIE INTERVENTO ---
  const handleSaveTaskType = async (e) => {
    e.preventDefault();
    if (!taskTypeName.trim()) {
      showToast(t('toastTaskTypeNameEmpty'), true);
      return;
    }

    const payload = {
      name: taskTypeName.trim(),
      color: taskTypeColor,
      icon: taskTypeIcon
    };

    try {
      const res = await fetch(`${API_BASE}/api/config/task-types`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore durante il salvataggio della tipologia');

      showToast(t('toastTaskTypeSuccess'));
      setTaskTypeName('');
      setTaskTypeColor('#2196f3');
      setTaskTypeIcon('🛠️');
      fetchConfig();
    } catch (err) {
      showToast(err.message, true);
    }
  };

  const handleDeleteTaskType = async (name) => {
    if (!window.confirm(t('confirmDeleteTaskType').replace('{name}', name))) return;
    try {
      const res = await fetch(`${API_BASE}/api/config/task-types/${encodeURIComponent(name)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Errore durante la rimozione');
      showToast(t('toastTaskTypeDeleteSuccess'));
      fetchConfig();
    } catch (err) {
      showToast(err.message, true);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="title-container">
          <div className="title-row">
            <h1 className="app-title">{t('headerTitle')}</h1>
            <span className="app-badge">{t('headerBadge')}</span>
          </div>
          <p className="app-subtitle">{t('headerSubtitle')}</p>
        </div>
      </header>

      {/* Notifications */}
      {successMessage && (
        <div className="toast-msg toast-success animate-fade-in">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="toast-msg toast-error animate-fade-in">
          {error}
        </div>
      )}

      {/* Tabs navigation */}
      <nav className="tabs-nav">
        <button 
          className={`tab-btn ${activeTab === 'language' ? 'active' : ''}`}
          onClick={() => setActiveTab('language')}
        >
          {t('tabLanguage')}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'lines' ? 'active' : ''}`}
          onClick={() => setActiveTab('lines')}
        >
          {t('tabLines')}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'operators' ? 'active' : ''}`}
          onClick={() => setActiveTab('operators')}
        >
          {t('tabOperators')}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'taskTypes' ? 'active' : ''}`}
          onClick={() => setActiveTab('taskTypes')}
        >
          {t('tabTaskTypes')}
        </button>
      </nav>

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          {t('loadingMsg')}
        </div>
      ) : (
        <main className="animate-fade-in">
          {/* TAB 1: LINGUA */}
          {activeTab === 'language' && (
            <div className="card-panel">
              <h2 className="card-title">{t('langCardTitle')}</h2>
              <p className="section-desc">
                {t('langCardDesc')}
              </p>
              <form onSubmit={handleSaveLanguage} style={{ maxWidth: '400px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="lang-select">{t('selectActiveLang')}</label>
                  <select 
                    id="lang-select" 
                    className="form-select"
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                  >
                    {config?.language?.available?.map(lang => (
                      <option key={lang.code} value={lang.code}>
                        {lang.label} ({lang.code.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn-primary">{t('applyChanges')}</button>
              </form>
            </div>
          )}

          {/* TAB 2: LINEE E BINARI */}
          {activeTab === 'lines' && (
            <div className="grid-cols-2">
              <div className="card-panel">
                <h2 className="card-title">
                  {editingLineId ? t('editLineTitle') : t('addLineTitle')}
                </h2>
                <form onSubmit={handleSaveLine}>
                  <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor="line-color">{t('colorLineLabel', 'Color Line')}</label>
                      <input 
                        id="line-color"
                        type="color" 
                        className="form-input" 
                        style={{ height: '38px', padding: '0 4px', cursor: 'pointer' }}
                        value={lineColor}
                        onChange={(e) => setLineColor(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor="line-id">{t('lineIdLabel')}</label>
                      <input 
                        id="line-id"
                        type="text" 
                        className="form-input" 
                        placeholder="e.g. line_nord"
                        value={lineId}
                        onChange={(e) => setLineId(e.target.value)}
                        disabled={!!editingLineId}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="line-name">{t('lineNameLabel')}</label>
                    <input 
                      id="line-name"
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Linea Nord"
                      value={lineName}
                      onChange={(e) => setLineName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid-cols-2" style={{ gap: '1rem', marginBottom: '1.25rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor="line-station-symbol">Station Symbol (A-Z)</label>
                      <input 
                        id="line-station-symbol"
                        type="text" 
                        maxLength="1"
                        className="form-input" 
                        placeholder="e.g. A"
                        value={lineStationSymbol}
                        onChange={(e) => setLineStationSymbol(e.target.value)}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor="line-station-number">Total Stations</label>
                      <input 
                        id="line-station-number"
                        type="number" 
                        min="0"
                        className="form-input" 
                        placeholder="e.g. 15"
                        value={lineStationNumber}
                        onChange={(e) => setLineStationNumber(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid-cols-2" style={{ gap: '1rem', marginBottom: '1.25rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor="line-start">{t('lineStartKm')}</label>
                      <input 
                        id="line-start"
                        type="number" 
                        step="0.001"
                        className="form-input" 
                        value={lineStartKm}
                        onChange={(e) => setLineStartKm(e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor="line-end">{t('lineEndKm')}</label>
                      <input 
                        id="line-end"
                        type="number" 
                        step="0.001"
                        className="form-input" 
                        value={lineEndKm}
                        onChange={(e) => setLineEndKm(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="line-tracks">
                      {t('lineTracksLabel')}
                    </label>
                    <input 
                      id="line-tracks"
                      type="text" 
                      className="form-input" 
                      placeholder={t('lineTracksPlaceholder')}
                      value={lineTracksInput}
                      onChange={(e) => setLineTracksInput(e.target.value)}
                    />
                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                      {t('lineTracksHelp')}
                    </small>
                  </div>

                  <div className="flex-row-align">
                    <button type="submit" className="btn-primary">
                      {editingLineId ? t('btnSaveLine') : t('btnAddTrack')}
                    </button>
                    {editingLineId && (
                      <button type="button" className="btn-secondary" onClick={resetLineForm}>
                        {t('btnCancel')}
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="card-panel">
                <h2 className="card-title">{t('registeredLinesTitle')}</h2>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>{t('tableHeaderNameId')}</th>
                        <th>{t('tableHeaderKmRange')}</th>
                        <th style={{ textAlign: 'right' }}>{t('tableHeaderActions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {config?.lines?.length === 0 ? (
                        <tr>
                          <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                            {t('noLinesMsg')}
                          </td>
                        </tr>
                      ) : (
                        config?.lines?.map(line => (
                          <tr key={line.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="swatch" style={{ backgroundColor: line.color || '#2196f3', width: '16px', height: '16px', display: 'inline-block', borderRadius: '4px' }}></span>
                                <div>
                                  <strong>{line.name}</strong>
                                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} className="uppercase">{line.id}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              {Number(line.startKm).toFixed(3)} - {Number(line.endKm).toFixed(3)}
                            </td>
                            <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                              <button 
                                className="btn-secondary" 
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', marginRight: '0.5rem' }}
                                onClick={() => handleEditLine(line)}
                              >
                                {t('btnEdit')}
                              </button>
                              <button 
                                className="btn-danger" 
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                                onClick={() => handleDeleteLine(line.id)}
                              >
                                {t('btnDelete')}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: OPERATORI */}
          {activeTab === 'operators' && (
            <div className="grid-cols-2">
              <div className="card-panel">
                <h2 className="card-title">{t('newOperatorTitle')}</h2>
                <form onSubmit={handleAddOperator}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="operator-name">{t('operatorNameLabel')}</label>
                    <input 
                      id="operator-name"
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. RailPulse S.p.A."
                      value={newOperator}
                      onChange={(e) => setNewOperator(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary">{t('btnRegisterOperator')}</button>
                </form>
              </div>

              <div className="card-panel">
                <h2 className="card-title">{t('registeredOperatorsTitle')}</h2>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>{t('operatorTableHeaderName')}</th>
                        <th style={{ textAlign: 'right' }}>{t('tableHeaderActions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {config?.operators?.length === 0 ? (
                        <tr>
                          <td colSpan="2" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                            {t('noOperatorsMsg')}
                          </td>
                        </tr>
                      ) : (
                        config?.operators?.map((op, index) => (
                          <tr key={index}>
                            <td>{op}</td>
                            <td style={{ textAlign: 'right' }}>
                              <button 
                                className="btn-danger" 
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                                onClick={() => handleDeleteOperator(op)}
                              >
                                {t('btnRemove')}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TIPOLOGIE INTERVENTO */}
          {activeTab === 'taskTypes' && (
            <div className="grid-cols-2">
              <div className="card-panel">
                <h2 className="card-title">{t('taskTypeTitle')}</h2>
                <p className="section-desc">
                  {t('taskTypeDesc')}
                </p>
                <form onSubmit={handleSaveTaskType}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="task-name">{t('taskNameLabel')}</label>
                    <input 
                      id="task-name"
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Rincalzatura"
                      value={taskTypeName}
                      onChange={(e) => setTaskTypeName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid-cols-2" style={{ gap: '1rem', marginBottom: '1.25rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor="task-color">{t('taskColorLabel')}</label>
                      <div className="flex-row-align">
                        <input 
                          id="task-color"
                          type="color" 
                          className="form-input" 
                          style={{ padding: '0.2rem', width: '50px', height: '40px', cursor: 'pointer' }}
                          value={taskTypeColor}
                          onChange={(e) => setTaskTypeColor(e.target.value)}
                        />
                        <input 
                          type="text" 
                          className="form-input" 
                          style={{ flex: 1 }}
                          value={taskTypeColor}
                          onChange={(e) => setTaskTypeColor(e.target.value)}
                          maxLength="7"
                          required
                        />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label" htmlFor="task-icon">{t('taskIconLabel')}</label>
                      <input 
                        id="task-icon"
                        type="text" 
                        className="form-input" 
                        placeholder="🛠️"
                        value={taskTypeIcon}
                        onChange={(e) => setTaskTypeIcon(e.target.value)}
                        maxLength="4"
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-primary">{t('btnSaveTaskType')}</button>
                </form>
              </div>

              <div className="card-panel">
                <h2 className="card-title">{t('tabTaskTypes')}</h2>
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>{t('taskTypeTableHeaderSymbol')}</th>
                        <th>{t('taskTypeTableHeaderName')}</th>
                        <th>{t('taskTypeTableHeaderColor')}</th>
                        <th style={{ textAlign: 'right' }}>{t('tableHeaderActions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {config?.taskTypes?.length === 0 ? (
                        <tr>
                          <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                            {t('noTaskTypesMsg')}
                          </td>
                        </tr>
                      ) : (
                        config?.taskTypes?.map((task, index) => (
                          <tr key={index}>
                            <td>
                              <span className="icon-display">{task.icon}</span>
                            </td>
                            <td>
                              <strong>{task.name}</strong>
                            </td>
                            <td>
                              <div className="flex-row-align">
                                <span className="swatch" style={{ backgroundColor: task.color }}></span>
                                <code>{task.color}</code>
                              </div>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button 
                                className="btn-danger" 
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                                onClick={() => handleDeleteTaskType(task.name)}
                              >
                                {t('btnRemove')}
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      )}
    </div>
  );
}
