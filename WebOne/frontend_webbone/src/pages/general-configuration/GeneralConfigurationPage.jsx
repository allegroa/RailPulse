import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

// API always points to /api/config
const API_BASE = '/api/config';

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
    stationFormLineCode: "Codice Linea",
    stationFormNumber: "Numero Stazione",
    stationFormType: "Tipo Stazione",
    btnSaveStation: "Salva Stazione",
    noStationsMsg: "Nessuna stazione presente.",
    toastStationEmpty: "Il codice stazione è obbligatorio",
    toastStationSuccess: "Stazione salvata con successo",
    toastStationDeleteSuccess: "Stazione eliminata con successo",
    confirmDeleteStation: 'Eliminare la stazione "{code}"?',
    tableHeaderStationCodeName: "Codice / Nome",
    tableHeaderLineInfo: "REF",
    tableHeaderType: "Tipo",
    tabStatus: "Stato e Statistiche",
    statusTitle: "Stato del Sistema",
    statusDesc: "Monitoraggio dei servizi e statistiche generali.",
    statusBackend: "Backend WebOne",
    statusDatabase: "Database MySQL",
    statusGenConfig: "General Config Server",
    statusOnline: "Online",
    statusOffline: "Offline",
    statsTitle: "Statistiche Client/Utenti",
    statTotalUsers: "Utenti Totali",
    statUsersMonth: "Utenti questo mese",
    statUsersYear: "Utenti quest'anno",
    statTotalClients: "Client Totali",
    tabPrefs: "Preferenze di Sistema",
    prefsTitle: "Preferenze Globali",
    prefsDesc: "Impostazioni per data location e indirizzo IP.",
    prefsDataLocationType: "Tipo Storage",
    prefsLocal: "Locale",
    prefsNAS: "NAS / Rete",
    prefsDataPath: "Percorso Dati",
    prefsBrowse: "Sfoglia...",
    prefsServerIp: "IP Server",
    prefsSave: "Salva Preferenze",
    toastPrefsSuccess: "Preferenze di sistema salvate con successo."
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
    stationFormLineCode: "Line Code",
    stationFormNumber: "Station Number",
    stationFormType: "Station Type",
    btnSaveStation: "Save Station",
    noStationsMsg: "No stations present.",
    toastStationEmpty: "Station code is required",
    toastStationSuccess: "Station saved successfully",
    toastStationDeleteSuccess: "Station deleted successfully",
    confirmDeleteStation: 'Delete station "{code}"?',
    tableHeaderStationCodeName: "Code / Name",
    tableHeaderLineInfo: "REF",
    tableHeaderType: "Type",
    tabStatus: "Status & Stats",
    statusTitle: "System Status",
    statusDesc: "Service monitoring and general statistics.",
    statusBackend: "WebOne Backend",
    statusDatabase: "MySQL Database",
    statusGenConfig: "General Config Server",
    statusOnline: "Online",
    statusOffline: "Offline",
    statsTitle: "Client/User Statistics",
    statTotalUsers: "Total Users",
    statUsersMonth: "Users this month",
    statUsersYear: "Users this year",
    statTotalClients: "Total Clients",
    tabPrefs: "System Prefs",
    prefsTitle: "Global Preferences",
    prefsDesc: "Settings for data location and server IP.",
    prefsDataLocationType: "Storage Type",
    prefsLocal: "Local",
    prefsNAS: "NAS / Network",
    prefsDataPath: "Data Path",
    prefsBrowse: "Browse...",
    prefsServerIp: "Server IP",
    prefsSave: "Save Preferences",
    toastPrefsSuccess: "System preferences saved successfully."
  },
  'zh': {
    headerTitle: "系统设置",
    headerBadge: "V2.0",
    headerSubtitle: "集中式和持久的设置管理",
    tabLanguage: "语言",
    tabLines: "线路与轨道",
    tabOperators: "操作员",
    tabTaskTypes: "工作类型",
    tabStations: "车站",
    langCardTitle: "默认语言",
    langCardDesc: "设置平台默认语言。",
    selectActiveLang: "选择使用语言",
    applyChanges: "应用更改",
    toastLangSuccess: "语言更新成功。",
    toastLangError: "保存语言时出错。",
    addLineTitle: "新增线路",
    editLineTitle: "编辑线路",
    lineIdLabel: "线路 ID 代码",
    lineNameLabel: "显示名称",
    lineStartKm: "起点里程 (Km)",
    lineEndKm: "终点里程 (Km)",
    lineTracksLabel: "关联轨道 (以逗号分隔)",
    lineTracksPlaceholder: "轨道 1, 轨道 2",
    lineTracksHelp: "示例: 轨道 1, 轨道 2",
    btnSaveLine: "保存线路",
    btnAddTrack: "新增线路",
    btnCancel: "取消",
    registeredLinesTitle: "已注册线路",
    tableHeaderNameId: "名称 (ID)",
    tableHeaderKmRange: "里程范围",
    tableHeaderTracks: "轨道",
    tableHeaderActions: "操作",
    noLinesMsg: "没有线路。",
    btnEdit: "编辑",
    btnDelete: "删除",
    confirmDeleteLine: "确定要删除这条线路吗？",
    newOperatorTitle: "新增操作员",
    operatorNameLabel: "操作员名称",
    btnRegisterOperator: "注册",
    registeredOperatorsTitle: "已注册操作员",
    operatorTableHeaderName: "操作员名称",
    noOperatorsMsg: "未设置操作员。",
    btnRemove: "移除",
    confirmDeleteOperator: '移除操作员 "{name}"？',
    taskTypeTitle: "工作类型管理",
    taskTypeDesc: "设置菜单中显示的工作类型。",
    taskNameLabel: "类型名称",
    taskColorLabel: "图表颜色 (HEX)",
    btnSaveTaskType: "保存类型",
    taskTypeTableHeaderName: "类型名称",
    taskTypeTableHeaderColor: "颜色",
    noTaskTypesMsg: "未定义类型。",
    confirmDeleteTaskType: '移除工作类型 "{name}"？',
    loadingMsg: "加载中...",
    toastFillLineFields: "请填写所有字段",
    toastLineSaveSuccess: "线路创建成功",
    toastLineUpdateSuccess: "线路更新成功",
    toastLineDeleteSuccess: "线路删除成功",
    toastOperatorEmpty: "操作员名称不能为空",
    toastOperatorSuccess: "操作员新增成功",
    toastOperatorDeleteSuccess: "操作员移除成功",
    toastTaskTypeNameEmpty: "工作类型名称为必填",
    toastTaskTypeSuccess: "工作类型保存成功",
    toastTaskTypeDeleteSuccess: "工作类型移除成功",
    stationsTitle: "车站注册表",
    stationsDesc: "集中管理车站数据。",
    stationFormCode: "代码",
    stationFormName: "车站名称",
    stationFormKmStart: "起点里程 (Km)",
    stationFormKmEnd: "终点里程 (Km)",
    stationFormTracks: "轨道数量",
    stationFormLineCode: "线路代码",
    stationFormNumber: "车站编号",
    stationFormType: "车站类型",
    btnSaveStation: "保存车站",
    noStationsMsg: "没有车站。",
    toastStationEmpty: "车站代码为必填",
    toastStationSuccess: "车站保存成功",
    toastStationDeleteSuccess: "车站删除成功",
    confirmDeleteStation: '删除车站 "{code}"？',
    tableHeaderStationCodeName: "代码 / 名称",
    tableHeaderLineInfo: "参考",
    tableHeaderType: "类型",
    tabStatus: "状态与统计",
    statusTitle: "系统状态",
    statusDesc: "服务监控与一般统计。",
    statusBackend: "WebOne 后端",
    statusDatabase: "MySQL 数据库",
    statusGenConfig: "一般设置服务器",
    statusOnline: "在线",
    statusOffline: "离线",
    statsTitle: "客户端/用户统计",
    statTotalUsers: "总用户",
    statUsersMonth: "本月用户",
    statUsersYear: "今年用户",
    statTotalClients: "总客户端",
    tabPrefs: "系统偏好设置",
    prefsTitle: "全局偏好设置",
    prefsDesc: "数据位置与服务器 IP 设置。",
    prefsDataLocationType: "存储类型",
    prefsLocal: "本地",
    prefsNAS: "NAS / 网络",
    prefsDataPath: "数据路径",
    prefsBrowse: "浏览...",
    prefsServerIp: "服务器 IP",
    prefsSave: "保存偏好设置",
    toastPrefsSuccess: "系统偏好设置保存成功。"
  },
  'zh-TW': {
    headerTitle: "系統設定",
    headerBadge: "V2.0",
    headerSubtitle: "集中式和持久的設定管理",
    tabLanguage: "語言",
    tabLines: "路線與軌道",
    tabOperators: "操作員",
    tabTaskTypes: "工作類型",
    tabStations: "車站",
    langCardTitle: "預設語言",
    langCardDesc: "設定平台預設語言。",
    selectActiveLang: "選擇使用語言",
    applyChanges: "套用變更",
    toastLangSuccess: "語言更新成功。",
    toastLangError: "儲存語言時發生錯誤。",
    addLineTitle: "新增路線",
    editLineTitle: "編輯路線",
    lineIdLabel: "路線 ID 代碼",
    lineNameLabel: "顯示名稱",
    lineStartKm: "起點里程 (Km)",
    lineEndKm: "終點里程 (Km)",
    lineTracksLabel: "關聯軌道 (以逗號分隔)",
    lineTracksPlaceholder: "軌道 1, 軌道 2",
    lineTracksHelp: "範例: 軌道 1, 軌道 2",
    btnSaveLine: "儲存路線",
    btnAddTrack: "新增路線",
    btnCancel: "取消",
    registeredLinesTitle: "已註冊路線",
    tableHeaderNameId: "名稱 (ID)",
    tableHeaderKmRange: "里程範圍",
    tableHeaderTracks: "軌道",
    tableHeaderActions: "動作",
    noLinesMsg: "沒有路線。",
    btnEdit: "編輯",
    btnDelete: "刪除",
    confirmDeleteLine: "確定要刪除這條路線嗎？",
    newOperatorTitle: "新增操作員",
    operatorNameLabel: "操作員名稱",
    btnRegisterOperator: "註冊",
    registeredOperatorsTitle: "已註冊操作員",
    operatorTableHeaderName: "操作員名稱",
    noOperatorsMsg: "未設定操作員。",
    btnRemove: "移除",
    confirmDeleteOperator: '移除操作員 "{name}"？',
    taskTypeTitle: "工作類型管理",
    taskTypeDesc: "設定選單中顯示的工作類型。",
    taskNameLabel: "類型名稱",
    taskColorLabel: "圖表顏色 (HEX)",
    btnSaveTaskType: "儲存類型",
    taskTypeTableHeaderName: "類型名稱",
    taskTypeTableHeaderColor: "顏色",
    noTaskTypesMsg: "未定義類型。",
    confirmDeleteTaskType: '移除工作類型 "{name}"？',
    loadingMsg: "載入中...",
    toastFillLineFields: "請填寫所有欄位",
    toastLineSaveSuccess: "路線建立成功",
    toastLineUpdateSuccess: "路線更新成功",
    toastLineDeleteSuccess: "路線刪除成功",
    toastOperatorEmpty: "操作員名稱不能為空",
    toastOperatorSuccess: "操作員新增成功",
    toastOperatorDeleteSuccess: "操作員移除成功",
    toastTaskTypeNameEmpty: "工作類型名稱為必填",
    toastTaskTypeSuccess: "工作類型儲存成功",
    toastTaskTypeDeleteSuccess: "工作類型移除成功",
    stationsTitle: "車站註冊表",
    stationsDesc: "集中管理車站資料。",
    stationFormCode: "代碼",
    stationFormName: "車站名稱",
    stationFormKmStart: "起點里程 (Km)",
    stationFormKmEnd: "終點里程 (Km)",
    stationFormTracks: "軌道數量",
    stationFormLineCode: "路線代碼",
    stationFormNumber: "車站編號",
    stationFormType: "車站類型",
    btnSaveStation: "儲存車站",
    noStationsMsg: "沒有車站。",
    toastStationEmpty: "車站代碼為必填",
    toastStationSuccess: "車站儲存成功",
    toastStationDeleteSuccess: "車站刪除成功",
    confirmDeleteStation: '刪除車站 "{code}"？',
    tableHeaderStationCodeName: "代碼 / 名稱",
    tableHeaderLineInfo: "參考",
    tableHeaderType: "類型",
    tabStatus: "狀態與統計",
    statusTitle: "系統狀態",
    statusDesc: "服務監控與一般統計。",
    statusBackend: "WebOne 後端",
    statusDatabase: "MySQL 資料庫",
    statusGenConfig: "一般設定伺服器",
    statusOnline: "上線",
    statusOffline: "離線",
    statsTitle: "客戶端/使用者統計",
    statTotalUsers: "總使用者",
    statUsersMonth: "本月使用者",
    statUsersYear: "今年使用者",
    statTotalClients: "總客戶端",
    tabPrefs: "系統偏好設定",
    prefsTitle: "全域偏好設定",
    prefsDesc: "資料位置與伺服器 IP 設定。",
    prefsDataLocationType: "儲存類型",
    prefsLocal: "本機",
    prefsNAS: "NAS / 網路",
    prefsDataPath: "資料路徑",
    prefsBrowse: "瀏覽...",
    prefsServerIp: "伺服器 IP",
    prefsSave: "儲存偏好設定",
    toastPrefsSuccess: "系統偏好設定儲存成功。"
  }
};

export default function GeneralConfigurationPage() {
  const [activeTab, setActiveTab] = useState('language');
  const [config, setConfig] = useState(null);
  const [systemPrefs, setSystemPrefs] = useState({ dataLocationType: 'local', dataLocationPath: '', serverIp: '' });
  const [isFileBrowserOpen, setIsFileBrowserOpen] = useState(false);
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

  const [stationForm, setStationForm] = useState({ code: '', name: '', kmStart: '', kmEnd: '', tracks: '', lineCode: '', stationNumber: '', stationType: 'station' });
  const [editingStation, setEditingStation] = useState(null);
  const [stationSearch, setStationSearch] = useState('');

  const [systemStatus, setSystemStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    fetchConfig();
    fetchStations();
  }, []);

  useEffect(() => {
    if (activeTab === 'status') {
      fetchSystemStatus();
    }
  }, [activeTab]);

  const fetchSystemStatus = async () => {
    try {
      setStatusLoading(true);
      const res = await api.get('/api/status');
      setSystemStatus(res.data);
    } catch (err) {
      showToast("Errore nel recupero dello stato", true);
    } finally {
      setStatusLoading(false);
    }
  };

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}`);
      if (!res.ok) throw new Error('Errore di connessione API');
      const data = await res.json();
      setConfig(data);
      setSelectedLanguage(data.language?.active || 'it');
      if (data.systemPrefs) setSystemPrefs(data.systemPrefs);
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

  // --- PREFERENZE DI SISTEMA ---
  const handleSavePrefs = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/system-prefs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(systemPrefs)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showToast(t('toastPrefsSuccess'));
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
        body: JSON.stringify({ name: taskTypeName.trim(), color: taskTypeColor, icon: 'X' })
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
      kmStart: station.kmStart != null ? station.kmStart.toString() : '',
      kmEnd: station.kmEnd != null ? station.kmEnd.toString() : '',
      tracks: station.tracks != null ? station.tracks.toString() : '',
      lineCode: station.lineCode || '',
      stationNumber: station.stationNumber || '',
      stationType: station.stationType || 'station'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            tracks: parseInt(stationForm.tracks) || 0,
            lineCode: stationForm.lineCode.trim(),
            stationNumber: stationForm.stationNumber.trim(),
            stationType: stationForm.stationType
          }
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Error');
      setStations(data.stations);
      setStationForm({ code: '', name: '', kmStart: '', kmEnd: '', tracks: '', lineCode: '', stationNumber: '', stationType: 'station' });
      setEditingStation(null);
      showToast(t('toastStationSuccess'));
      fetchStations();
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
    { id: 'stations', label: t('tabStations') },
    { id: 'status', label: t('tabStatus') },
    { id: 'prefs', label: t('tabPrefs') }
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

      {/* Header section mirroring the Maintenance box style */}
      <div className="flex flex-col mb-6">
        <header className="flex justify-between items-center px-6 py-4 bg-white border border-slate-200 rounded-xl shadow-sm mb-6 mt-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-800 tracking-tight font-sans">
                {t('headerTitle')}
              </h1>
              <span className="bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded shadow-sm text-xs">
                {t('headerBadge')}
              </span>
            </div>
            <p className="text-slate-500 mt-1 text-sm">
              {t('headerSubtitle')}
            </p>
          </div>
        </header>

        {/* Navigation */}
        <nav className="flex gap-8 border-b border-slate-200">
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">{t('stationFormLineCode')}</label>
                      <input type="text" value={stationForm.lineCode} onChange={e => handleStationFormChange('lineCode', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 shadow-sm text-sm focus:border-blue-500 transition-all outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">{t('stationFormNumber')}</label>
                      <input type="text" value={stationForm.stationNumber} onChange={e => handleStationFormChange('stationNumber', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 shadow-sm text-sm focus:border-blue-500 transition-all outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">{t('stationFormType')}</label>
                      <select value={stationForm.stationType} onChange={e => handleStationFormChange('stationType', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 shadow-sm text-sm focus:border-blue-500 transition-all outline-none">
                        <option value="station">Station</option>
                        <option value="mainstation">Main Station</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">{t('stationFormTracks')}</label>
                      <input type="number" value={stationForm.tracks} onChange={e => handleStationFormChange('tracks', e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 shadow-sm text-sm focus:border-blue-500 transition-all outline-none" />
                    </div>
                  </div>
                  <div className="pt-2 flex gap-3">
                    <button type="submit" className="bg-slate-900 text-white hover:bg-slate-800 px-4 py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-all flex-1">
                      {t('btnSaveStation')}
                    </button>
                    {editingStation && (
                      <button type="button" onClick={() => { setEditingStation(null); setStationForm({ code: '', name: '', kmStart: '', kmEnd: '', tracks: '', lineCode: '', stationNumber: '', stationType: 'station' }); }} className="border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-md font-medium text-sm transition-all">
                        {t('btnCancel')}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
            <div className="lg:col-span-8">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                  <div className="relative w-full max-w-md">
                    <input
                      type="text"
                      placeholder="Search stations by code or name..."
                      value={stationSearch}
                      onChange={(e) => setStationSearch(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-4 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                    />
                    <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                  </div>
                </div>
                <div className="overflow-y-auto max-h-[700px]">
                <table className="w-full text-left border-collapse relative">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-xs">
                      <th className="px-6 py-3 font-semibold text-slate-500">{t('tableHeaderStationCodeName')}</th>
                      <th className="px-6 py-3 font-semibold text-slate-500">{t('tableHeaderLineInfo')}</th>
                      <th className="px-6 py-3 font-semibold text-slate-500">{t('tableHeaderKmRange')}</th>
                      <th className="px-6 py-3 font-semibold text-slate-500">{t('tableHeaderType')}</th>
                      <th className="px-6 py-3 font-semibold text-slate-500">{t('tableHeaderTracks')}</th>
                      <th className="px-6 py-3 font-semibold text-slate-500 text-right">{t('tableHeaderActions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(() => {
                      const filteredStations = stations.filter(s => (s.code || '').toLowerCase().includes(stationSearch.toLowerCase()) || (s.name || '').toLowerCase().includes(stationSearch.toLowerCase()));
                      if (filteredStations.length === 0) {
                        return <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-medium">{t('noStationsMsg')}</td></tr>;
                      }
                      return filteredStations.map((s, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800">{s.code}</div>
                          <div className="text-xs text-slate-500 mt-1">{s.name || '-'}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                          <div className="font-bold">{(s.lineCode || '') + (s.stationNumber || '') || '-'}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                          {s.kmStart} - {s.kmEnd}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${s.stationType === 'mainstation' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                            {s.stationType === 'mainstation' ? 'Main Station' : 'Station'}
                          </span>
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
                      ));
                    })()}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB STATUS */}
        {activeTab === 'status' && (
          <div className="space-y-8">
            {statusLoading ? (
              <div className="text-slate-400 font-mono text-sm animate-pulse">{t('loadingMsg')}</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Status Card 1 */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col items-center text-center">
                    <div className={`w-4 h-4 rounded-full mb-4 shadow-sm border ${systemStatus?.services?.backend?.status === 'online' ? 'bg-green-500 border-green-600' : 'bg-red-500 border-red-600'}`}></div>
                    <h3 className="font-bold text-slate-800">{t('statusBackend')}</h3>
                    <p className="text-sm text-slate-500 mt-1">{systemStatus?.services?.backend?.status === 'online' ? t('statusOnline') : t('statusOffline')}</p>
                  </div>

                  {/* Status Card 2 */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col items-center text-center">
                    <div className={`w-4 h-4 rounded-full mb-4 shadow-sm border ${systemStatus?.services?.database?.status === 'online' ? 'bg-green-500 border-green-600' : 'bg-red-500 border-red-600'}`}></div>
                    <h3 className="font-bold text-slate-800">{t('statusDatabase')}</h3>
                    <p className="text-sm text-slate-500 mt-1">{systemStatus?.services?.database?.status === 'online' ? t('statusOnline') : t('statusOffline')}</p>
                  </div>

                  {/* Status Card 3 */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col items-center text-center">
                    <div className={`w-4 h-4 rounded-full mb-4 shadow-sm border ${systemStatus?.services?.genConfig?.status === 'online' ? 'bg-green-500 border-green-600' : 'bg-red-500 border-red-600'}`}></div>
                    <h3 className="font-bold text-slate-800">{t('statusGenConfig')}</h3>
                    <p className="text-sm text-slate-500 mt-1">{systemStatus?.services?.genConfig?.status === 'online' ? t('statusOnline') : t('statusOffline')}</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                  <h2 className="text-lg font-bold text-slate-800 mb-6">{t('statsTitle')}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">{t('statTotalUsers')}</span>
                      <span className="text-3xl font-light text-slate-900">{systemStatus?.stats?.totalUsers || 0}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">{t('statUsersMonth')}</span>
                      <span className="text-3xl font-light text-slate-900">{systemStatus?.stats?.usersThisMonth || 0}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">{t('statUsersYear')}</span>
                      <span className="text-3xl font-light text-slate-900">{systemStatus?.stats?.usersThisYear || 0}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">{t('statTotalClients')}</span>
                      <span className="text-3xl font-light text-slate-900">{systemStatus?.stats?.totalClients || 0}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB PREFS */}
        {activeTab === 'prefs' && (
          <div className="max-w-3xl animate-fade-in">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-2">{t('prefsTitle')}</h2>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">{t('prefsDesc')}</p>
              <form onSubmit={handleSavePrefs} className="space-y-6">
                
                <div className="flex flex-col space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-1">
                    {t('prefsDataLocationType')}
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center space-x-2 text-sm text-slate-600 cursor-pointer">
                      <input 
                        type="radio" 
                        name="dataSourceType" 
                        value="local" 
                        checked={systemPrefs.dataLocationType === 'local'} 
                        onChange={(e) => setSystemPrefs({ ...systemPrefs, dataLocationType: e.target.value })}
                        className="text-blue-600 border-slate-300 focus:ring-blue-500"
                      />
                      <span>{t('prefsLocal')}</span>
                    </label>
                    <label className="flex items-center space-x-2 text-sm text-slate-600 cursor-pointer">
                      <input 
                        type="radio" 
                        name="dataSourceType" 
                        value="nas" 
                        checked={systemPrefs.dataLocationType === 'nas'} 
                        onChange={(e) => setSystemPrefs({ ...systemPrefs, dataLocationType: e.target.value })}
                        className="text-blue-600 border-slate-300 focus:ring-blue-500"
                      />
                      <span>{t('prefsNAS')}</span>
                    </label>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-1">
                    {t('prefsDataPath')}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={systemPrefs.dataLocationPath}
                      onChange={(e) => setSystemPrefs({ ...systemPrefs, dataLocationPath: e.target.value })}
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 shadow-sm text-sm focus:border-blue-500 transition-all outline-none"
                      placeholder={systemPrefs.dataLocationType === 'nas' ? '\\\\IndirizzoNAS\\Cartella\\Dati' : 'C:\\Dati\\RailPulse'}
                    />
                    <button
                      type="button"
                      onClick={() => setIsFileBrowserOpen(true)}
                      className="bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-700 transition-colors shadow-sm font-medium"
                    >
                      {t('prefsBrowse')}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 pt-4">
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-600 mb-1">
                    {t('prefsServerIp')}
                  </label>
                  <input
                    type="text"
                    value={systemPrefs.serverIp}
                    onChange={(e) => setSystemPrefs({ ...systemPrefs, serverIp: e.target.value })}
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-slate-800 shadow-sm text-sm focus:border-blue-500 transition-all outline-none"
                    placeholder="192.168.1.154"
                  />
                </div>

                <div className="pt-6">
                  <button type="submit" className="bg-slate-900 text-white hover:bg-slate-800 px-6 py-2.5 rounded-md font-medium text-sm transition-all shadow-sm">
                    {t('prefsSave')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* MODAL FILE BROWSER */}
      <FileBrowserModal 
        isOpen={isFileBrowserOpen}
        initialPath={systemPrefs.dataLocationPath || ''}
        onClose={() => setIsFileBrowserOpen(false)}
        onSelect={(path) => {
          setSystemPrefs({ ...systemPrefs, dataLocationPath: path });
          setIsFileBrowserOpen(false);
        }}
      />
    </div>
  );
}

// --- FILE BROWSER MODAL COMPONENT ---
const FileBrowserModal = ({ isOpen, initialPath, onClose, onSelect }) => {
  const [currentPath, setCurrentPath] = useState('');
  const [folders, setFolders] = useState([]);
  const [loadingDir, setLoadingDir] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDirectory(initialPath || '');
    }
  }, [isOpen, initialPath]);

  const loadDirectory = async (path) => {
    setLoadingDir(true);
    try {
      const res = await fetch('/api/list-dirs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPath: path })
      });
      const data = await res.json();
      if (data.error) {
        alert("Errore accesso cartella: " + data.error);
        if (path !== '') {
          loadDirectory('');
        }
      } else {
        setFolders(data.files || []);
        setCurrentPath(data.currentPath);
      }
    } catch (e) {
      console.error(e);
    }
    setLoadingDir(false);
  };

  const goUp = () => {
    if (!currentPath || currentPath.length <= 3) {
      loadDirectory(''); // dischi
      return;
    }
    const parts = currentPath.split(/[\\/]/).filter(Boolean);
    parts.pop();
    if (parts.length === 1 && currentPath.includes(':\\')) {
      loadDirectory(parts[0] + '\\');
    } else if (parts.length > 0) {
      loadDirectory(parts.join('\\'));
    } else {
      loadDirectory('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl flex flex-col h-[70vh]">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-200">Seleziona Cartella Dati</h2>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-200 text-xl font-bold">&times;</button>
        </div>
        <div className="p-3 bg-slate-900/50 flex gap-2 items-center border-b border-slate-700/50">
          <button type="button" onClick={goUp} disabled={!currentPath} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-slate-200 text-sm disabled:opacity-50 border border-slate-600 transition-colors">
            &#8593; Su
          </button>
          <div className="flex-1 truncate text-sm text-blue-300 font-mono bg-slate-900 p-1.5 rounded border border-slate-700/50">
            {currentPath || "Dischi Locali (Seleziona un'unità)"}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
          {loadingDir ? (
            <div className="flex justify-center p-8 text-slate-500 text-sm">Caricamento in corso...</div>
          ) : (
            <div className="space-y-1">
              {folders.map(f => (
                <div 
                  key={f.path}
                  onClick={() => loadDirectory(f.path)}
                  className="flex items-center gap-3 p-2.5 hover:bg-slate-700/60 cursor-pointer rounded-lg text-slate-200 text-sm transition-colors border border-transparent hover:border-slate-600"
                >
                  <span className="text-blue-400 text-xl">📁</span>
                  <span className="truncate">{f.name}</span>
                </div>
              ))}
              {folders.length === 0 && <div className="p-4 text-center text-slate-500 text-sm">Questa cartella è vuota o non contiene sottocartelle.</div>}
            </div>
          )}
        </div>
        <div className="p-4 border-t border-slate-700 flex justify-end gap-3 bg-slate-900/30">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 text-sm transition-colors font-medium">
            Annulla
          </button>
          <button 
            type="button"
            onClick={() => onSelect(currentPath)}
            disabled={!currentPath}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm disabled:opacity-50 transition-colors shadow-md"
          >
            Conferma
          </button>
        </div>
      </div>
    </div>
  );
}
