import React, { useState, useEffect } from 'react';
import './App.css';

const TRANSLATIONS = {
  it: {
    appTitle: "Maintenance",
    appSubtitle: "Archivio Interventi di Manutenzione",
    apiActive: "API Attive",
    apiConnecting: "Connessione...",
    apiOffline: "Offline",
    database: "Database",
    simulator: "Simulatore",
    totalTasks: "Interventi Totali",
    dbRecordsDesc: "Record presenti nel DB JSON",
    completed: "Completati",
    completedDesc: "Operazioni chiuse con successo",
    inProgress: "In Corso",
    inProgressDesc: "Lavori attualmente attivi sul binario",
    planned: "Pianificati",
    plannedDesc: "Interventi programmati futuri",
    searchCriteria: "Criteri di Ricerca e Sovrapposizione Tratte",
    line: "Linea",
    track: "Binario",
    taskType: "Tipo Intervento",
    all: "Tutti",
    fromKm: "Dal Km",
    toKm: "Al Km",
    startDate: "Data Inizio",
    endDate: "Data Fine",
    reset: "Resetta",
    filterData: "Filtra Dati",
    maintArchive: "Archivio Record Manutenzione",
    newMaint: "Nuovo Intervento",
    loading: "Caricamento in corso...",
    noMaintFound: "Nessun intervento corrisponde ai criteri impostati.",
    tableDate: "Data",
    tableType: "Tipo Intervento",
    tableTrack: "Tratta (Linea / Binario)",
    tableExt: "Estensione Chilometrica",
    tableOperator: "Operatore",
    tableStatus: "Stato",
    tableRefs: "Riferimenti",
    simTitle: "Simulatore Integrazione Grafica",
    simDesc: "Questa schermata simula come il visualizzatore grafico delle misure geometriche (track-view) interroga le API di maintenance-web per sovrapporre gli interventi di manutenzione all'asse chilometrico del plot.",
    selectLine: "Seleziona Linea",
    selectTrack: "Seleziona Binario",
    simApiReq: "API Request Simulata:",
    chartTitle: "Grafico Geometrico e Manutenzioni Sovrapposte",
    chartRange: "Tratta Km 100.000 - 102.000",
    simLegend: "Simbologia Interventi:",
    insertNew: "Inserisci Nuovo Intervento",
    editMaint: "Modifica Intervento",
    detailsMaint: "Dettagli Intervento",
    close: "Chiudi",
    cancel: "Annulla",
    saveMaint: "Salva Intervento",
    saveChanges: "Salva Modifiche",
    deleteRecord: "Elimina Record",
    maintDate: "Data Intervento",
    startKm: "Km Inizio",
    endKm: "Km Fine",
    operatorCompany: "Operatore / Ditta",
    maintStatus: "Stato Intervento",
    maintNotes: "Note dell'intervento",
    refIntegrationOpt: "Riferimenti e Integrazione (Opzionali)",
    refIntegration: "Riferimenti Integrazione",
    erpId: "ID Ordine ERP (SAP)",
    tgmId: "File Acquisizione TGM",
    rpId: "File Profilo Rotaia RP",
    detailCompany: "Ditta / Operatore",
    detailCoord: "Coordinata Chilometrica",
    detailLineTrack: "Linea / Binario",
    detailJob: "Tipo Lavoro",
    notesTech: "Note tecniche",
    confirmDelete: "Sei sicuro di voler eliminare definitivamente questo intervento?",
    kmValidationErr: "Il Km di Inizio deve essere minore o uguale al Km di Fine.",
    statusAnnullato: "Annullato",
    statusInCorso: "In Corso",
    statusCompletato: "Completato",
    statusPianificato: "Pianificato",
    taskRincalzatura: "Rincalzatura",
    taskRettifica: "Rettifica Rotaia",
    taskMolatura: "Molatura",
    taskCambio: "Cambio Rotaia",
    taskSaldatura: "Saldatura",
    taskRegolazione: "Regolazione Tensione",
    taskAltro: "Altro",
    notSpecified: "Non specificato",
    noAssociation: "Nessuna associazione"
  },
  en: {
    appTitle: "Maintenance",
    appSubtitle: "Maintenance Records Archive",
    apiActive: "API Active",
    apiConnecting: "Connecting...",
    apiOffline: "Offline",
    database: "Database",
    simulator: "Simulator",
    totalTasks: "Total Maintenance",
    dbRecordsDesc: "Records in JSON database",
    completed: "Completed",
    completedDesc: "Operations closed successfully",
    inProgress: "In Progress",
    inProgressDesc: "Active operations on track",
    planned: "Planned",
    plannedDesc: "Scheduled future maintenance",
    searchCriteria: "Search Criteria & Overlay Ranges",
    line: "Line",
    track: "Track",
    taskType: "Task Type",
    all: "All",
    fromKm: "From Km",
    toKm: "To Km",
    startDate: "Start Date",
    endDate: "End Date",
    reset: "Reset",
    filterData: "Filter Data",
    maintArchive: "Maintenance Records Archive",
    newMaint: "New Maintenance",
    loading: "Loading...",
    noMaintFound: "No maintenance record matches the criteria.",
    tableDate: "Date",
    tableType: "Task Type",
    tableTrack: "Track (Line / Track)",
    tableExt: "Kilometric Extension",
    tableOperator: "Operator",
    tableStatus: "Status",
    tableRefs: "References",
    simTitle: "Integration Graphical Simulator",
    simDesc: "This screen simulates how the geometric measurements viewer (track-view) queries maintenance-web APIs to overlay maintenance interventions on the kilometric axis of the plot.",
    selectLine: "Select Line",
    selectTrack: "Select Track",
    simApiReq: "Simulated API Request:",
    chartTitle: "Geometric Chart & Overlaid Maintenance",
    chartRange: "Section Km 100.000 - 102.000",
    simLegend: "Intervention Symbols:",
    insertNew: "Insert New Intervention",
    editMaint: "Edit Intervention",
    detailsMaint: "Intervention Details",
    close: "Close",
    cancel: "Cancel",
    saveMaint: "Save Intervention",
    saveChanges: "Save Changes",
    deleteRecord: "Delete Record",
    maintDate: "Intervention Date",
    startKm: "Start Km",
    endKm: "End Km",
    operatorCompany: "Operator / Company",
    maintStatus: "Intervention Status",
    maintNotes: "Intervention Notes",
    refIntegrationOpt: "References and Integration (Optional)",
    refIntegration: "Integration References",
    erpId: "ERP Order ID (SAP)",
    tgmId: "TGM Acquisition File",
    rpId: "RailProfile File RP",
    detailCompany: "Company / Operator",
    detailCoord: "Kilometric Coordinate",
    detailLineTrack: "Line / Track",
    detailJob: "Job Type",
    notesTech: "Technical notes",
    confirmDelete: "Are you sure you want to permanently delete this intervention?",
    kmValidationErr: "Start Km must be less than or equal to End Km.",
    statusAnnullato: "Cancelled",
    statusInCorso: "In Progress",
    statusCompletato: "Completed",
    statusPianificato: "Planned",
    taskRincalzatura: "Tamping",
    taskRettifica: "Rail Alignment",
    taskMolatura: "Grinding",
    taskCambio: "Rail Replacement",
    taskSaldatura: "Welding",
    taskRegolazione: "Tension Adjustment",
    taskAltro: "Other",
    notSpecified: "Not specified",
    noAssociation: "No association"
  },
  zh: {
    appTitle: "RailPulse 维护",
    appSubtitle: "维护记录档案",
    apiActive: "API 已激活",
    apiConnecting: "连接中...",
    apiOffline: "离线",
    database: "数据库",
    simulator: "模拟器",
    totalTasks: "总维护数",
    dbRecordsDesc: "JSON数据库中的记录",
    completed: "已完成",
    completedDesc: "成功结束的操作",
    inProgress: "进行中",
    inProgressDesc: "轨道上的活动操作",
    planned: "已计划",
    plannedDesc: "计划的未来维护",
    searchCriteria: "搜索条件与覆盖范围",
    line: "线路",
    track: "股道",
    taskType: "维护类型",
    all: "全部",
    fromKm: "起始公里",
    toKm: "结束公里",
    startDate: "开始日期",
    endDate: "结束日期",
    reset: "重置",
    filterData: "过滤数据",
    maintArchive: "维护记录档案",
    newMaint: "新建维护",
    loading: "加载中...",
    noMaintFound: "没有符合条件的维护记录。",
    tableDate: "日期",
    tableType: "维护类型",
    tableTrack: "区段 (线路 / 股道)",
    tableExt: "公里范围",
    tableOperator: "操作员",
    tableStatus: "状态",
    tableRefs: "引用",
    simTitle: "图形集成模拟器",
    simDesc: "此屏幕模拟几何测量查看器 (track-view) 如何查询 maintenance-web API 以在图表的公里轴上覆盖维护干预措施。",
    selectLine: "选择线路",
    selectTrack: "选择股道",
    simApiReq: "模拟 API 请求:",
    chartTitle: "几何图表和覆盖维护",
    chartRange: "公里 100.000 - 102.000 范围",
    simLegend: "干预符号:",
    insertNew: "插入新干预措施",
    editMaint: "编辑干预措施",
    detailsMaint: "干预详情",
    close: "关闭",
    cancel: "取消",
    saveMaint: "保存干预措施",
    saveChanges: "保存修改",
    deleteRecord: "删除记录",
    maintDate: "干预日期",
    startKm: "起始公里",
    endKm: "结束公里",
    operatorCompany: "操作员 / 公司",
    maintStatus: "干预状态",
    maintNotes: "干预说明",
    refIntegrationOpt: "引用和集成 (可选)",
    refIntegration: "集成引用",
    erpId: "ERP 订单 ID (SAP)",
    tgmId: "TGM 采集文件",
    rpId: "RailProfile 文件 RP",
    detailCompany: "公司 / 操作员",
    detailCoord: "公里坐标",
    detailLineTrack: "线路 / 股道",
    detailJob: "工作类型",
    notesTech: "技术说明",
    confirmDelete: "您确定要永久删除此干预措施吗？",
    kmValidationErr: "起始公里必须小于或等于结束公里。",
    statusAnnullato: "已取消",
    statusInCorso: "进行中",
    statusCompletato: "已完成",
    statusPianificato: "已计划",
    taskRincalzatura: "捣固",
    taskRettifica: "钢轨调整",
    taskMolatura: "打磨",
    taskCambio: "钢轨更换",
    taskSaldatura: "焊接",
    taskRegolazione: "张力调节",
    taskAltro: "其他",
    notSpecified: "未指定",
    noAssociation: "无关联"
  }
};

export default function App() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('database'); // 'database' | 'simulator'
  
  // Connessione backend
  const [backendStatus, setBackendStatus] = useState('checking'); // 'checking' | 'connected' | 'disconnected'

  // Stato Lingua
  const [lang, setLang] = useState('it');

  // Stato Filtri
  const [filters, setFilters] = useState({
    line: '',
    track: '',
    taskType: '',
    dateStart: '',
    dateEnd: '',
    startKm: '',
    endKm: ''
  });

  // Modali
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null); // per visualizzazione/modifica dettagli
  const [isEditing, setIsEditing] = useState(false);

  // Form Dati (Nuovo/Modifica)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    taskType: 'Rincalzatura',
    line: 'Linea Nord',
    track: 'Binario 1',
    startKm: '',
    endKm: '',
    operator: '',
    status: 'Pianificato',
    notes: '',
    attachments: [],
    erpId: '',
    tgmId: '',
    rpId: ''
  });

  // Simulator States
  const [simulatorLine, setSimulatorLine] = useState('Linea Nord');
  const [simulatorTrack, setSimulatorTrack] = useState('Binario 1');
  const [hoveredPin, setHoveredPin] = useState(null);

  // Helper Traduzioni
  const t = (key) => (TRANSLATIONS[lang] || TRANSLATIONS['it'])[key] || key;

  const getStatusLabel = (status) => {
    if (status === 'Pianificato') return t('statusPianificato');
    if (status === 'In Corso') return t('statusInCorso');
    if (status === 'Completato') return t('statusCompletato');
    if (status === 'Annullato') return t('statusAnnullato');
    return status;
  };

  const getTaskTypeLabel = (taskType) => {
    if (taskType === 'Rincalzatura') return t('taskRincalzatura');
    if (taskType === 'Rettifica Rotaia') return t('taskRettifica');
    if (taskType === 'Molatura') return t('taskMolatura');
    if (taskType === 'Cambio Rotaia') return t('taskCambio');
    if (taskType === 'Saldatura') return t('taskSaldatura');
    if (taskType === 'Regolazione Tensione') return t('taskRegolazione');
    if (taskType === 'Altro') return t('taskAltro');
    return taskType;
  };

  // Caricamento Lingua dal modulo general-configuration
  useEffect(() => {
    const fetchGeneralConfig = async () => {
      try {
        const res = await fetch('http://localhost:5002/api/config');
        if (res.ok) {
          const config = await res.json();
          if (config.language && config.language.active) {
            setLang(config.language.active);
          }
        }
      } catch (err) {
        console.warn('Impossibile recuperare la lingua dal modulo general configuration:', err);
      }
    };
    fetchGeneralConfig();
  }, []);

  // Caricamento Dati
  const fetchRecords = async (currentFilters = filters) => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      Object.entries(currentFilters).forEach(([key, val]) => {
        if (val !== '') params.append(key, val);
      });

      const res = await fetch(`/api/maintenance?${params.toString()}`);
      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Errore durante il recupero dei record.');
      }
      const data = await res.json();
      setRecords(data);
      setBackendStatus('connected');
    } catch (err) {
      console.error(err);
      setError(err.message);
      setBackendStatus('disconnected');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Gestione Filtri
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchRecords();
  };

  const handleResetFilters = () => {
    const reset = {
      line: '',
      track: '',
      taskType: '',
      dateStart: '',
      dateEnd: '',
      startKm: '',
      endKm: ''
    };
    setFilters(reset);
    fetchRecords(reset);
  };

  // Apertura modale di creazione
  const openCreateModal = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      taskType: 'Rincalzatura',
      line: 'Linea Nord',
      track: 'Binario 1',
      startKm: '',
      endKm: '',
      operator: '',
      status: 'Pianificato',
      notes: '',
      attachments: [],
      erpId: '',
      tgmId: '',
      rpId: ''
    });
    setShowCreateModal(true);
  };

  // Invio Form di Creazione
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const startNum = parseFloat(formData.startKm);
    const endNum = parseFloat(formData.endKm);
    if (startNum > endNum) {
      alert(t('kmValidationErr'));
      return;
    }

    try {
      const bodyData = {
        ...formData,
        startKm: startNum,
        endKm: endNum,
        externalRef: {
          erpId: formData.erpId,
          tgmId: formData.tgmId,
          rpId: formData.rpId
        }
      };

      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Errore nel salvataggio.');
      }

      setShowCreateModal(false);
      fetchRecords();
    } catch (err) {
      alert(err.message);
    }
  };

  // Salvataggio Modifica esistente
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const startNum = parseFloat(formData.startKm);
    const endNum = parseFloat(formData.endKm);
    if (startNum > endNum) {
      alert(t('kmValidationErr'));
      return;
    }

    try {
      const bodyData = {
        ...formData,
        startKm: startNum,
        endKm: endNum,
        externalRef: {
          erpId: formData.erpId,
          tgmId: formData.tgmId,
          rpId: formData.rpId
        }
      };

      const res = await fetch(`/api/maintenance/${selectedRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Errore nell\'aggiornamento.');
      }

      const updated = await res.json();
      setSelectedRecord(updated);
      setIsEditing(false);
      fetchRecords();
    } catch (err) {
      alert(err.message);
    }
  };

  // Eliminazione Record
  const handleDeleteRecord = async (id) => {
    if (!confirm(t('confirmDelete'))) return;

    try {
      const res = await fetch(`/api/maintenance/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Impossibile eliminare l\'intervento.');

      setSelectedRecord(null);
      fetchRecords();
    } catch (err) {
      alert(err.message);
    }
  };

  // Carica i dati del record selezionato nel form di modifica
  const startEditMode = () => {
    setFormData({
      date: selectedRecord.date,
      taskType: selectedRecord.taskType,
      line: selectedRecord.line,
      track: selectedRecord.track,
      startKm: selectedRecord.startKm.toString(),
      endKm: selectedRecord.endKm.toString(),
      operator: selectedRecord.operator,
      status: selectedRecord.status,
      notes: selectedRecord.notes,
      attachments: selectedRecord.attachments,
      erpId: selectedRecord.externalRef?.erpId || '',
      tgmId: selectedRecord.externalRef?.tgmId || '',
      rpId: selectedRecord.externalRef?.rpId || ''
    });
    setIsEditing(true);
  };

  // Statistiche Calcolate
  const stats = {
    total: records.length,
    completed: records.filter(r => r.status === 'Completato').length,
    inProgress: records.filter(r => r.status === 'In Corso').length,
    planned: records.filter(r => r.status === 'Pianificato').length
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header glass-panel">
        <div className="brand-section">
          <div className="brand-text">
            <h1>{t('appTitle')}</h1>
            <p>{t('appSubtitle')}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="system-status">
            <span className="status-dot" style={{ backgroundColor: backendStatus === 'connected' ? '#16803d' : backendStatus === 'checking' ? '#a16207' : '#b91c1c' }}></span>
            <span>API {backendStatus === 'connected' ? t('apiActive') : backendStatus === 'checking' ? t('apiConnecting') : t('apiOffline')}</span>
          </div>
          <div className="tab-buttons" style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '3px' }}>
            <button 
              className={`btn ${activeTab === 'database' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => setActiveTab('database')}
              style={{ padding: '4px 12px', borderRadius: '6px', fontSize: '0.8rem', border: 'none' }}
            >
              {t('database')}
            </button>
            <button 
              className={`btn ${activeTab === 'simulator' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => setActiveTab('simulator')}
              style={{ padding: '4px 12px', borderRadius: '6px', fontSize: '0.8rem', border: 'none' }}
            >
              {t('simulator')}
            </button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card glass-panel animate-fade-in">
          <span className="stat-label">{t('totalTasks')}</span>
          <span className="stat-value">{stats.total}</span>
          <span className="stat-desc">{t('dbRecordsDesc')}</span>
        </div>
        <div className="stat-card glass-panel animate-fade-in" style={{ borderLeft: '4px solid #16803d' }}>
          <span className="stat-label">{t('completed')}</span>
          <span className="stat-value" style={{ color: '#15803d' }}>{stats.completed}</span>
          <span className="stat-desc">{t('completedDesc')}</span>
        </div>
        <div className="stat-card glass-panel animate-fade-in" style={{ borderLeft: '4px solid #c2410c' }}>
          <span className="stat-label">{t('inProgress')}</span>
          <span className="stat-value" style={{ color: '#c2410c' }}>{stats.inProgress}</span>
          <span className="stat-desc">{t('inProgressDesc')}</span>
        </div>
        <div className="stat-card glass-panel animate-fade-in" style={{ borderLeft: '4px solid #0369a1' }}>
          <span className="stat-label">{t('planned')}</span>
          <span className="stat-value" style={{ color: '#0369a1' }}>{stats.planned}</span>
          <span className="stat-desc">{t('plannedDesc')}</span>
        </div>
      </div>

      {activeTab === 'database' ? (
        <>
          {/* Filters Panel */}
          <section className="filter-panel glass-panel animate-fade-in">
            <h2 className="panel-title">{t('searchCriteria')}</h2>
            <form onSubmit={handleApplyFilters} className="filter-form">
              <div className="filter-grid">
                <div className="form-group">
                  <label>{t('line')}</label>
                  <input type="text" name="line" className="input-field" placeholder="Es: Linea Nord" value={filters.line} onChange={handleFilterChange} />
                </div>
                <div className="form-group">
                  <label>{t('track')}</label>
                  <input type="text" name="track" className="input-field" placeholder="Es: Binario 1" value={filters.track} onChange={handleFilterChange} />
                </div>
                <div className="form-group">
                  <label>{t('taskType')}</label>
                  <select name="taskType" className="input-field" value={filters.taskType} onChange={handleFilterChange}>
                    <option value="">{t('all')}</option>
                    <option value="Rincalzatura">{getTaskTypeLabel("Rincalzatura")}</option>
                    <option value="Rettifica Rotaia">{getTaskTypeLabel("Rettifica Rotaia")}</option>
                    <option value="Molatura">{getTaskTypeLabel("Molatura")}</option>
                    <option value="Cambio Rotaia">{getTaskTypeLabel("Cambio Rotaia")}</option>
                    <option value="Saldatura">{getTaskTypeLabel("Saldatura")}</option>
                    <option value="Regolazione Tensione">{getTaskTypeLabel("Regolazione Tensione")}</option>
                    <option value="Altro">{getTaskTypeLabel("Altro")}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('fromKm')}</label>
                  <input type="number" step="0.001" name="startKm" className="input-field" placeholder="Es: 100.000" value={filters.startKm} onChange={handleFilterChange} />
                </div>
                <div className="form-group">
                  <label>{t('toKm')}</label>
                  <input type="number" step="0.001" name="endKm" className="input-field" placeholder="Es: 102.000" value={filters.endKm} onChange={handleFilterChange} />
                </div>
                <div className="form-group">
                  <label>{t('startDate')}</label>
                  <input type="date" name="dateStart" className="input-field" value={filters.dateStart} onChange={handleFilterChange} />
                </div>
                <div className="form-group">
                  <label>{t('endDate')}</label>
                  <input type="date" name="dateEnd" className="input-field" value={filters.dateEnd} onChange={handleFilterChange} />
                </div>
              </div>
              <div className="filter-actions">
                <button type="button" className="btn btn-secondary" onClick={handleResetFilters}>{t('reset')}</button>
                <button type="submit" className="btn btn-primary">{t('filterData')}</button>
              </div>
            </form>
          </section>

          {/* Database Table Section */}
          <section className="db-panel glass-panel animate-fade-in">
            <div className="panel-header">
              <h2 className="panel-title" style={{ margin: 0 }}>{t('maintArchive')}</h2>
              <button className="btn btn-primary" onClick={openCreateModal}>{t('newMaint')}</button>
            </div>

            {loading && records.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>{t('loading')}</div>
            ) : error ? (
              <div style={{ padding: '20px', background: 'var(--badge-crit-bg)', color: 'var(--badge-crit-text)', borderRadius: '6px', border: '1px solid var(--badge-crit-border)' }}>
                {error}
              </div>
            ) : records.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>{t('noMaintFound')}</div>
            ) : (
              <div className="table-container">
                <table className="m-table">
                  <thead>
                    <tr>
                      <th>{t('tableDate')}</th>
                      <th>{t('tableType')}</th>
                      <th>{t('tableTrack')}</th>
                      <th>{t('tableExt')}</th>
                      <th>{t('tableOperator')}</th>
                      <th>{t('tableStatus')}</th>
                      <th>{t('tableRefs')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map(record => (
                      <tr key={record.id} onClick={() => setSelectedRecord(record)}>
                        <td style={{ fontWeight: '500' }}>{record.date}</td>
                        <td style={{ fontWeight: '600' }}>{getTaskTypeLabel(record.taskType)}</td>
                        <td>{record.line} — <span style={{ color: 'var(--text-secondary)' }}>{record.track}</span></td>
                        <td>Km {record.startKm.toFixed(3)} - {record.endKm.toFixed(3)}</td>
                        <td>{record.operator || '—'}</td>
                        <td>
                          <span className={`badge badge-${record.status.toLowerCase().replace(' ', '')}`}>
                            {getStatusLabel(record.status)}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem' }}>
                            {record.externalRef?.erpId && <span title={`ERP ID: ${record.externalRef.erpId}`} style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>ERP</span>}
                            {record.externalRef?.tgmId && <span title={`TGM Id: ${record.externalRef.tgmId}`} style={{ background: 'var(--badge-info-bg)', color: 'var(--badge-info-text)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--badge-info-border)' }}>TGM</span>}
                            {record.externalRef?.rpId && <span title={`RailProfile: ${record.externalRef.rpId}`} style={{ background: 'var(--badge-ecc-bg)', color: 'var(--badge-ecc-text)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--badge-ecc-border)' }}>RP</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : (
        /* Simulator/Integration Preview Panel */
        <section className="sim-panel glass-panel animate-fade-in">
          <div className="sim-grid">
            <div className="sim-sidebar">
              <h2 className="panel-title">{t('simTitle')}</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                {t('simDesc')}
              </p>

              <div className="form-group">
                <label>{t('selectLine')}</label>
                <select className="input-field" value={simulatorLine} onChange={e => setSimulatorLine(e.target.value)}>
                  <option value="Linea Nord">Linea Nord</option>
                  <option value="Linea Sud">Linea Sud</option>
                </select>
              </div>

              <div className="form-group">
                <label>{t('selectTrack')}</label>
                <select className="input-field" value={simulatorTrack} onChange={e => setSimulatorTrack(e.target.value)}>
                  <option value="Binario 1">Binario 1</option>
                  <option value="Binario 2">Binario 2</option>
                  <option value="Binario Unico">Binario Unico</option>
                </select>
              </div>

              <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                <strong>{t('simApiReq')}</strong>
                <pre style={{ overflowX: 'auto', background: '#0f172a', padding: '8px', borderRadius: '6px', marginTop: '8px', fontSize: '0.75rem', color: '#38bdf8' }}>
                  GET /api/maintenance?line={encodeURIComponent(simulatorLine)}&track={encodeURIComponent(simulatorTrack)}&startKm=100.000&endKm=102.000
                </pre>
              </div>
            </div>

            <div className="sim-display glass-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase' }}>{t('chartTitle')}</h3>
                <span className="badge badge-pianificato" style={{ fontSize: '0.75rem' }}>{t('chartRange')}</span>
              </div>

              <div className="mock-chart-container">
                {/* Asse Y labels */}
                <div style={{ position: 'absolute', left: '8px', top: '24px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>+4 mm (T2)</div>
                <div style={{ position: 'absolute', left: '8px', top: '90px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>0 mm</div>
                <div style={{ position: 'absolute', left: '8px', top: '156px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>-4 mm (T2)</div>

                {/* Soglie Lines */}
                <div className="mock-grid-line" style={{ top: '30px', borderTop: '1px dashed #cbd5e1' }}></div>
                <div className="mock-grid-line" style={{ top: '96px', borderTop: '1px solid #e2e8f0' }}></div>
                <div className="mock-grid-line" style={{ top: '162px', borderTop: '1px dashed #cbd5e1' }}></div>

                {/* Mock Curve (svg) */}
                <svg className="mock-curve" viewBox="0 0 1000 150" fill="none" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
                  <path 
                    d="M 0,66 C 50,66 80,10 120,40 C 160,70 190,130 230,120 C 270,110 300,50 350,66 C 400,82 450,140 500,130 C 550,120 600,10 650,40 C 700,70 750,75 800,66 C 850,57 900,105 1000,66" 
                    stroke="url(#lineGrad)" 
                    strokeWidth="2" 
                  />
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#0ea5e9" />
                      <stop offset="20%" stopColor="#d97706" />
                      <stop offset="50%" stopColor="#ef4444" />
                      <stop offset="70%" stopColor="#0ea5e9" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* X Axis & Y Axis */}
                <div className="mock-axis"></div>
                <div className="mock-axis-y"></div>

                {/* Km Labels */}
                <div style={{ position: 'absolute', bottom: '10px', left: '40px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Km 100.000</div>
                <div style={{ position: 'absolute', bottom: '10px', left: '500px', transform: 'translateX(-50%)', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Km 101.000</div>
                <div style={{ position: 'absolute', bottom: '10px', right: '20px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Km 102.000</div>

                {/* INTERVENTI SOVRAPPOSTI (PINS - NO ICONS) */}
                {records
                  .filter(r => r.line === simulatorLine && r.track === simulatorTrack)
                  .map(r => {
                    const kmVal = (r.startKm + r.endKm) / 2;
                    const percentX = ((kmVal - 100.000) / 2.000) * 100;
                    
                    if (percentX < 0 || percentX > 100) return null;

                    const pinColor = r.taskType === 'Rincalzatura' ? '#0ea5e9' : r.taskType === 'Rettifica Rotaia' ? '#8b5cf6' : r.taskType === 'Cambio Rotaia' ? '#b91c1c' : '#15803d';

                    return (
                      <div 
                        key={r.id} 
                        className="mock-overlay-pin" 
                        style={{ left: `calc(40px + ${percentX}% * 0.9)` }}
                        onMouseEnter={() => setHoveredPin(r)}
                        onMouseLeave={() => setHoveredPin(null)}
                        onClick={() => setSelectedRecord(r)}
                      >
                        <div className="mock-pin-icon" style={{ backgroundColor: pinColor }}></div>
                        <div className="mock-pin-line" style={{ borderLeft: `1px dashed ${pinColor}` }}></div>
                      </div>
                    );
                  })
                }

                {/* Tooltip sul Pin in hover */}
                {hoveredPin && (
                  <div 
                    className="mock-tooltip" 
                    style={{ 
                      left: `calc(40px + ${(((hoveredPin.startKm + hoveredPin.endKm)/2 - 100.000)/2.000)*100}% * 0.9)`,
                      transform: 'translateX(-50%)'
                    }}
                  >
                    <strong>{getTaskTypeLabel(hoveredPin.taskType)}</strong> ({getStatusLabel(hoveredPin.status)})
                    <br />
                    <span>Km {hoveredPin.startKm.toFixed(3)} - {hoveredPin.endKm.toFixed(3)}</span>
                  </div>
                )}
              </div>

              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)', marginTop: '10px' }}>
                <h4 style={{ fontSize: '0.85rem', marginBottom: '8px', color: 'var(--text-primary)', fontWeight: 700 }}>{t('simLegend')}</h4>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#0ea5e9', display: 'inline-block' }}></span>
                    {getTaskTypeLabel('Rincalzatura')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#8b5cf6', display: 'inline-block' }}></span>
                    {getTaskTypeLabel('Rettifica Rotaia')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#b91c1c', display: 'inline-block' }}></span>
                    {getTaskTypeLabel('Cambio Rotaia')}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#15803d', display: 'inline-block' }}></span>
                    {getTaskTypeLabel('Molatura')} / {getTaskTypeLabel('Saldatura')} / {getTaskTypeLabel('Altro')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* MODALE NUOVO INTERVENTO */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h3>{t('insertNew')}</h3>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>{t('close')}</button>
            </div>
            <form onSubmit={handleCreateSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>{t('maintDate')}</label>
                  <input required type="date" className="input-field" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>{t('taskType')}</label>
                  <select className="input-field" value={formData.taskType} onChange={e => setFormData({ ...formData, taskType: e.target.value })}>
                    <option value="Rincalzatura">{getTaskTypeLabel("Rincalzatura")}</option>
                    <option value="Rettifica Rotaia">{getTaskTypeLabel("Rettifica Rotaia")}</option>
                    <option value="Molatura">{getTaskTypeLabel("Molatura")}</option>
                    <option value="Cambio Rotaia">{getTaskTypeLabel("Cambio Rotaia")}</option>
                    <option value="Saldatura">{getTaskTypeLabel("Saldatura")}</option>
                    <option value="Regolazione Tensione">{getTaskTypeLabel("Regolazione Tensione")}</option>
                    <option value="Altro">{getTaskTypeLabel("Altro")}</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t('line')}</label>
                  <input required type="text" className="input-field" placeholder="Es: Linea Nord" value={formData.line} onChange={e => setFormData({ ...formData, line: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>{t('track')}</label>
                  <input required type="text" className="input-field" placeholder="Es: Binario 1" value={formData.track} onChange={e => setFormData({ ...formData, track: e.target.value })} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t('startKm')}</label>
                  <input required type="number" step="0.001" className="input-field" placeholder="Es: 100.450" value={formData.startKm} onChange={e => setFormData({ ...formData, startKm: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>{t('endKm')}</label>
                  <input required type="number" step="0.001" className="input-field" placeholder="Es: 100.800" value={formData.endKm} onChange={e => setFormData({ ...formData, endKm: e.target.value })} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>{t('operatorCompany')}</label>
                  <input type="text" className="input-field" placeholder="Es: Rail Service SpA" value={formData.operator} onChange={e => setFormData({ ...formData, operator: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>{t('maintStatus')}</label>
                  <select className="input-field" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                    <option value="Pianificato">{getStatusLabel("Pianificato")}</option>
                    <option value="In Corso">{getStatusLabel("In Corso")}</option>
                    <option value="Completato">{getStatusLabel("Completato")}</option>
                    <option value="Annullato">{getStatusLabel("Annullato")}</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>{t('maintNotes')}</label>
                <textarea className="input-field" placeholder="Inserisci note tecniche..." style={{ height: '80px', resize: 'vertical' }} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })}></textarea>
              </div>

              <h4 style={{ fontSize: '0.85rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', color: 'var(--text-secondary)', fontWeight: 700 }}>{t('refIntegrationOpt')}</h4>
              
              <div className="form-row">
                <div className="form-group">
                  <label>{t('erpId')}</label>
                  <input type="text" className="input-field" placeholder="WO-2026-XXXX" value={formData.erpId} onChange={e => setFormData({ ...formData, erpId: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>{t('tgmId')}</label>
                  <input type="text" className="input-field" placeholder="Nome folder DB TGM" value={formData.tgmId} onChange={e => setFormData({ ...formData, tgmId: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label>{t('rpId')}</label>
                <input type="text" className="input-field" placeholder="Nome file .csv di RailProfile" value={formData.rpId} onChange={e => setFormData({ ...formData, rpId: e.target.value })} />
              </div>

              <div className="filter-actions" style={{ marginTop: '10px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>{t('cancel')}</button>
                <button type="submit" className="btn btn-primary">{t('saveMaint')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE DETTAGLI E MODIFICA */}
      {selectedRecord && (
        <div className="modal-overlay" onClick={() => { if (!isEditing) setSelectedRecord(null); }}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{isEditing ? t('editMaint') : t('detailsMaint')}</h3>
              <button className="close-btn" onClick={() => { setSelectedRecord(null); setIsEditing(false); }}>{t('close')}</button>
            </div>

            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="modal-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('maintDate')}</label>
                    <input required type="date" className="input-field" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>{t('taskType')}</label>
                    <select className="input-field" value={formData.taskType} onChange={e => setFormData({ ...formData, taskType: e.target.value })}>
                      <option value="Rincalzatura">{getTaskTypeLabel("Rincalzatura")}</option>
                      <option value="Rettifica Rotaia">{getTaskTypeLabel("Rettifica Rotaia")}</option>
                      <option value="Molatura">{getTaskTypeLabel("Molatura")}</option>
                      <option value="Cambio Rotaia">{getTaskTypeLabel("Cambio Rotaia")}</option>
                      <option value="Saldatura">{getTaskTypeLabel("Saldatura")}</option>
                      <option value="Regolazione Tensione">{getTaskTypeLabel("Regolazione Tensione")}</option>
                      <option value="Altro">{getTaskTypeLabel("Altro")}</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t('line')}</label>
                    <input required type="text" className="input-field" value={formData.line} onChange={e => setFormData({ ...formData, line: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>{t('track')}</label>
                    <input required type="text" className="input-field" value={formData.track} onChange={e => setFormData({ ...formData, track: e.target.value })} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t('startKm')}</label>
                    <input required type="number" step="0.001" className="input-field" value={formData.startKm} onChange={e => setFormData({ ...formData, startKm: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>{t('endKm')}</label>
                    <input required type="number" step="0.001" className="input-field" value={formData.endKm} onChange={e => setFormData({ ...formData, endKm: e.target.value })} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>{t('operatorCompany')}</label>
                    <input type="text" className="input-field" value={formData.operator} onChange={e => setFormData({ ...formData, operator: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>{t('maintStatus')}</label>
                    <select className="input-field" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                      <option value="Pianificato">{getStatusLabel("Pianificato")}</option>
                      <option value="In Corso">{getStatusLabel("In Corso")}</option>
                      <option value="Completato">{getStatusLabel("Completato")}</option>
                      <option value="Annullato">{getStatusLabel("Annullato")}</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>{t('maintNotes')}</label>
                  <textarea className="input-field" style={{ height: '80px', resize: 'vertical' }} value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })}></textarea>
                </div>

                <h4 style={{ fontSize: '0.85rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', color: 'var(--text-secondary)', fontWeight: 700 }}>{t('refIntegration')}</h4>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('erpId')}</label>
                    <input type="text" className="input-field" value={formData.erpId} onChange={e => setFormData({ ...formData, erpId: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>{t('tgmId')}</label>
                    <input type="text" className="input-field" value={formData.tgmId} onChange={e => setFormData({ ...formData, tgmId: e.target.value })} />
                  </div>
                </div>

                <div className="form-group">
                  <label>{t('rpId')}</label>
                  <input type="text" className="input-field" value={formData.rpId} onChange={e => setFormData({ ...formData, rpId: e.target.value })} />
                </div>

                <div className="filter-actions" style={{ marginTop: '10px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>{t('cancel')}</button>
                  <button type="submit" className="btn btn-primary">{t('saveChanges')}</button>
                </div>
              </form>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="details-grid">
                  <div className="details-block">
                    <span className="details-label">{t('maintDate')}</span>
                    <span className="details-value">{selectedRecord.date}</span>
                  </div>
                  <div className="details-block">
                    <span className="details-label">{t('tableStatus')}</span>
                    <span className="details-value">
                      <span className={`badge badge-${selectedRecord.status.toLowerCase().replace(' ', '')}`}>
                        {getStatusLabel(selectedRecord.status)}
                      </span>
                    </span>
                  </div>
                  <div className="details-block">
                    <span className="details-label">{t('detailJob')}</span>
                    <span className="details-value" style={{ fontWeight: 600 }}>{getTaskTypeLabel(selectedRecord.taskType)}</span>
                  </div>
                  <div className="details-block">
                    <span className="details-label">{t('detailLineTrack')}</span>
                    <span className="details-value">{selectedRecord.line} — {selectedRecord.track}</span>
                  </div>
                  <div className="details-block">
                    <span className="details-label">{t('detailCoord')}</span>
                    <span className="details-value">Km {selectedRecord.startKm.toFixed(3)} - {selectedRecord.endKm.toFixed(3)}</span>
                  </div>
                  <div className="details-block">
                    <span className="details-label">{t('detailCompany')}</span>
                    <span className="details-value">{selectedRecord.operator || t('notSpecified')}</span>
                  </div>
                </div>

                {selectedRecord.notes && (
                  <div className="notes-block">
                    <span className="details-label" style={{ marginBottom: '4px', display: 'block' }}>{t('notesTech')}</span>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{selectedRecord.notes}</p>
                  </div>
                )}

                <h4 style={{ fontSize: '0.85rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', color: 'var(--text-secondary)', fontWeight: 700 }}>{t('refIntegration')}</h4>
                
                <div className="details-grid">
                  <div className="details-block">
                    <span className="details-label">{t('erpId')}</span>
                    <span className="details-value">{selectedRecord.externalRef?.erpId || '—'}</span>
                  </div>
                  <div className="details-block">
                    <span className="details-label">{t('tgmId')}</span>
                    <span className="details-value" style={{ color: selectedRecord.externalRef?.tgmId ? 'var(--badge-info-text)' : 'var(--text-muted)' }}>
                      {selectedRecord.externalRef?.tgmId || t('noAssociation')}
                    </span>
                  </div>
                  <div className="details-block" style={{ gridColumn: 'span 2' }}>
                    <span className="details-label">{t('rpId')}</span>
                    <span className="details-value" style={{ color: selectedRecord.externalRef?.rpId ? 'var(--badge-ecc-text)' : 'var(--text-muted)' }}>
                      {selectedRecord.externalRef?.rpId || t('noAssociation')}
                    </span>
                  </div>
                </div>

                <div className="filter-actions" style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px', justifyContent: 'space-between' }}>
                  <button type="button" className="btn btn-danger-outline" onClick={() => handleDeleteRecord(selectedRecord.id)}>{t('deleteRecord')}</button>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setSelectedRecord(null)}>{t('close')}</button>
                    <button type="button" className="btn btn-primary" onClick={startEditMode}>{t('editMaint')}</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
