import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../lib/i18n';

export default function ConfigurationPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [allData, setAllData] = useState({ activeOperator: '', operators: {} });
  const [operators, setOperators] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState('');
  const [newOperatorName, setNewOperatorName] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [config, setConfig] = useState({
    language: 'en',
    sampleSize: 2000,
    sectionLength: 200,
    useSampling: true,
    selectedX: 'km',
    dataSourceType: 'local',
    dataSourcePath: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [isFileBrowserOpen, setIsFileBrowserOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [emailConfig, setEmailConfig] = useState({
    email: 'railpulse@adts.it',
    password: 'RaIlpul1!26',
    pollingInterval: 15,
    imapHost: 'imap.adts.it',
    imapPort: 993,
    imapSecure: true,
    smtpHost: 'smtp.adts.it',
    smtpPort: 465,
    smtpSecure: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/configuration');
      const data = await res.json();
      setAllData(data);
      if (data.emailConfig) {
        setEmailConfig(data.emailConfig);
      }
      const ops = data.operators ? Object.keys(data.operators) : [];
      setOperators(ops);
      
      let initialOp = data.activeOperator;
      if (!initialOp && ops.length > 0) {
        initialOp = ops[0];
      }
      
      if (initialOp) {
        setSelectedOperator(initialOp);
        applyConfigToForm(data.operators[initialOp]);
      } else {
        setIsCreatingNew(true);
      }
    } catch (e) {
      console.error('Errore caricamento configurazione globale', e);
    }
  };

  const applyConfigToForm = (opConfig) => {
    if (!opConfig) return;
    
    if (opConfig.language && i18n.language !== opConfig.language) {
      i18n.changeLanguage(opConfig.language);
    }

    setConfig({
      language: opConfig.language || 'en',
      sampleSize: opConfig.sampleSize !== undefined ? opConfig.sampleSize : 2000,
      sectionLength: opConfig.sectionLength !== undefined ? opConfig.sectionLength : 200,
      useSampling: opConfig.useSampling !== undefined ? opConfig.useSampling : true,
      selectedX: opConfig.selectedX || 'km',
      dataSourceType: opConfig.dataSourceType || 'local',
      dataSourcePath: opConfig.dataSourcePath || ''
    });
  };

  useEffect(() => {
    if (selectedOperator && !isCreatingNew && allData.operators) {
      applyConfigToForm(allData.operators[selectedOperator]);
    }
  }, [selectedOperator, isCreatingNew]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const opName = isCreatingNew ? newOperatorName.trim() : selectedOperator;
    
    if (activeTab === 'general' && !opName) {
      setMessage({ type: 'error', text: t('invalidOperatorName') || 'Enter a valid operator name before saving' });
      setLoading(false);
      return;
    }

    let cleanOpName = '';
    if (opName) {
      cleanOpName = opName.replace(/[^a-zA-Z0-9_-]/g, '');
      if (!cleanOpName) {
        setMessage({ type: 'error', text: t('invalidOperatorChars') || 'The operator name contains invalid characters' });
        setLoading(false);
        return;
      }
    }

    try {
      const payload = {
        emailConfig: emailConfig
      };
      if (cleanOpName) {
        payload.activeOperator = cleanOpName;
        payload.operators = {
          ...allData.operators,
          [cleanOpName]: config
        };
      } else {
        payload.activeOperator = allData.activeOperator || '';
        payload.operators = allData.operators || {};
      }

      const res = await fetch('/api/configuration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        if (cleanOpName) {
          setMessage({ type: 'success', text: t('configSavedSuccess', { operator: cleanOpName }) || `Configuration saved successfully for operator ${cleanOpName}!` });
        } else {
          setMessage({ type: 'success', text: t('configSavedSuccessGlobal') || `Configuration saved successfully!` });
        }
        if (isCreatingNew) {
          setIsCreatingNew(false);
          setNewOperatorName('');
        }
        await fetchConfig();
      } else {
        setMessage({ type: 'error', text: data.error || t('configSaveError') || 'Errore nel salvataggio' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: t('apiConnectionError') || 'Impossibile connettersi alle API' });
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    setTestingEmail(true);
    setMessage({ type: '', text: '' });
    
    try {
      const res = await fetch('/api/tgm/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailConfig)
      });
      const data = await res.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: data.message || 'Connessione test IMAP riuscita!' });
      } else {
        setMessage({ type: 'error', text: 'Test fallito: ' + data.error });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Errore di rete durante il test email.' });
    } finally {
      setTestingEmail(false);
    }
  };

  const handleClearDatabase = async () => {
    if (!config.dataSourcePath) return;
    const confirmDelete = window.confirm(t('clearDbConfirm') || "Sei sicuro di voler azzerare il database? Questa operazione cancellerà tutti i dati in modo permanente.");
    if (!confirmDelete) return;

    try {
      const response = await fetch('/api/tgm/sessions/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'clear-database',
          targetPath: config.dataSourcePath
        })
      });
      const data = await response.json();
      if (data.success) {
        alert(t('clearDbSuccess') || "Database azzerato con successo.");
      } else {
        alert((t('clearDbError') || "Errore durante l'azzeramento: ") + data.error);
      }
    } catch (error) {
      alert((t('networkError') || "Errore di rete: ") + error.message);
    }
  };

  const preventEnterSubmit = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const hasValidOperator = isCreatingNew ? newOperatorName.trim().length > 0 : selectedOperator.length > 0;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center p-6">
      
      {/* Header section mirroring the Maintenance box style */}
      <div className="w-full max-w-5xl flex justify-between items-center px-6 py-4 bg-white border border-slate-200 rounded-xl shadow-sm mb-6 mt-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight font-sans">
              {t('tgmConfigTitle') || 'Configurazione Modulo TGM'}
            </h1>
            <span className="bg-blue-50 text-blue-600 text-xs font-semibold px-2 py-0.5 rounded shadow-sm">
              v1.6
            </span>
          </div>
          <p className="text-slate-500 mt-1 text-sm">
            {t('tgmConfigDesc') || "Gestisci le preferenze di sistema e di visualizzazione per l'operatore attivo."}
          </p>
        </div>
      </div>

      <div className="w-full max-w-5xl bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-all duration-300">


        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/50">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'general'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {t('generalConfig') || 'Generale'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('email')}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'email'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {t('emailConfig') || 'Email (Auto Import)'}
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 md:p-8 space-y-6">
          
          {/* Notifiche */}
          {message.text && (
            <div className={`p-4 rounded-xl border transition-all duration-300 ${
              message.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              <div className="flex items-center space-x-2">
                {message.type === 'success' ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                )}
                <span className="text-sm font-medium">{message.text}</span>
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <>
          {/* Selezione Operatore */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 md:p-6 space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold tracking-wide uppercase text-slate-700">
                {t('operatorLabel') || 'Operatore'}
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingNew(!isCreatingNew);
                  setMessage({ type: '', text: '' });
                }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors focus:outline-none bg-blue-50 px-3 py-1.5 rounded-md border border-blue-100"
              >
                {isCreatingNew ? (t('selectExisting') || 'Seleziona esistente') : (t('newOperator') || '+ Nuovo Operatore')}
              </button>
            </div>

            {isCreatingNew ? (
              <div className="space-y-1">
                <input
                  type="text"
                  required
                  placeholder={t('operatorPlaceholder') || "Inserisci nome operatore (es. RFI)"}
                  value={newOperatorName}
                  onChange={(e) => setNewOperatorName(e.target.value)}
                  onKeyDown={preventEnterSubmit}
                  className="w-full md:w-1/2 bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-lg px-4 py-2.5 text-slate-800 placeholder-slate-400 transition-all focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                />
                <p className="text-xs text-slate-500">{t('operatorHint') || "Solo lettere, numeri, trattini e underscore."}</p>
              </div>
            ) : (
              <select
                value={selectedOperator}
                onChange={(e) => setSelectedOperator(e.target.value)}
                disabled={operators.length === 0}
                className="w-full md:w-1/2 bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-lg px-4 py-2.5 text-slate-800 transition-all focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {operators.length === 0 ? (
                  <option value="">{t('noOperators') || 'Nessun operatore configurato (Creane uno nuovo)'}</option>
                ) : (
                  operators.map((op) => (
                    <option key={op} value={op}>{op} {allData.activeOperator === op ? (t('active') || '(Attivo)') : ''}</option>
                  ))
                )}
              </select>
            )}
          </div>

          {/* Configurazione Parametri */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity ${hasValidOperator ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
            
            {/* Lingua Default */}
            <div className="flex flex-col space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('defaultLanguage') || 'Lingua Default'}</label>
              <select
                value={config.language}
                onChange={(e) => setConfig({ ...config, language: e.target.value })}
                className="bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-slate-800 transition-all focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="en">English (Default)</option>
                <option value="zh">Chinese (Simplified)</option>
                <option value="zh-TW">Taiwanese (Traditional)</option>
                <option value="de">Deutsch (German)</option>
                <option value="it">Italiano (Italian)</option>
              </select>
            </div>

            {/* Asse X di Default */}
            <div className="flex flex-col space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('defaultXAxis') || 'Asse X Default'}</label>
              <input
                type="text"
                value={config.selectedX}
                onChange={(e) => setConfig({ ...config, selectedX: e.target.value })}
                onKeyDown={preventEnterSubmit}
                className="bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-slate-800 transition-all focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="es. km"
              />
            </div>

            {/* Dimensione Campione */}
            <div className="flex flex-col space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('sampleSizePts') || 'Dimensione Campione (Punti)'}</label>
              <input
                type="number"
                min="100"
                max="50000"
                value={config.sampleSize}
                onChange={(e) => setConfig({ ...config, sampleSize: parseInt(e.target.value) || 2000 })}
                onKeyDown={preventEnterSubmit}
                className="bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-slate-800 transition-all focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Lunghezza Sezione */}
            <div className="flex flex-col space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('sectionLengthMeters') || 'Lunghezza Sezione (Metri)'}</label>
              <input
                type="number"
                min="10"
                max="10000"
                value={config.sectionLength}
                onChange={(e) => setConfig({ ...config, sectionLength: parseInt(e.target.value) || 200 })}
                onKeyDown={preventEnterSubmit}
                className="bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-slate-800 transition-all focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Abilita Campionamento */}
            <div className="md:col-span-2 flex items-center space-x-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
              <input
                type="checkbox"
                id="useSampling"
                checked={config.useSampling}
                onChange={(e) => setConfig({ ...config, useSampling: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded bg-white focus:ring-blue-500 focus:ring-offset-slate-50 focus:ring-1"
              />
              <label htmlFor="useSampling" className="text-sm text-slate-700 font-medium select-none cursor-pointer">
                {t('enableSampling') || 'Abilita il campionamento dei dati di default (consigliato per file grandi)'}
              </label>
            </div>

          </div>
          </>
          )}

          {activeTab === 'email' && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 md:p-6 space-y-6 shadow-sm">
              <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-700 border-b border-slate-200 pb-2 mb-4">
                {t('emailCredentials') || 'Credenziali Casella IMAP'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t('emailAddress') || 'Indirizzo Email'}
                  </label>
                  <input
                    type="email"
                    value={emailConfig.email}
                    onChange={(e) => setEmailConfig({ ...emailConfig, email: e.target.value })}
                    onKeyDown={preventEnterSubmit}
                    className="bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-slate-800 transition-all focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="railpulse@adts.it"
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t('emailPassword') || 'Password'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={emailConfig.password}
                      onChange={(e) => setEmailConfig({ ...emailConfig, password: e.target.value })}
                      onKeyDown={preventEnterSubmit}
                      className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-slate-800 transition-all focus:outline-none focus:ring-1 focus:ring-blue-500 pr-10"
                      placeholder="••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t('imapHost') || 'Host IMAP (Ricezione)'}
                  </label>
                  <input
                    type="text"
                    value={emailConfig.imapHost}
                    onChange={(e) => setEmailConfig({ ...emailConfig, imapHost: e.target.value })}
                    onKeyDown={preventEnterSubmit}
                    className="bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-slate-800 transition-all focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="es. imap.dominio.it"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t('imapPort') || 'Porta IMAP'}
                  </label>
                  <input
                    type="number"
                    value={emailConfig.imapPort}
                    onChange={(e) => setEmailConfig({ ...emailConfig, imapPort: parseInt(e.target.value) || 993 })}
                    onKeyDown={preventEnterSubmit}
                    className="bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-slate-800 transition-all focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t('smtpHost') || 'Host SMTP (Invio Notifiche)'}
                  </label>
                  <input
                    type="text"
                    value={emailConfig.smtpHost}
                    onChange={(e) => setEmailConfig({ ...emailConfig, smtpHost: e.target.value })}
                    onKeyDown={preventEnterSubmit}
                    className="bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-slate-800 transition-all focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="es. smtp.dominio.it"
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {t('smtpPort') || 'Porta SMTP'}
                  </label>
                  <input
                    type="number"
                    value={emailConfig.smtpPort}
                    onChange={(e) => setEmailConfig({ ...emailConfig, smtpPort: parseInt(e.target.value) || 465 })}
                    onKeyDown={preventEnterSubmit}
                    className="bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-slate-800 transition-all focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <input
                    type="checkbox"
                    id="imapSecure"
                    checked={emailConfig.imapSecure}
                    onChange={(e) => setEmailConfig({ ...emailConfig, imapSecure: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="imapSecure" className="text-sm text-slate-700 font-medium select-none cursor-pointer">
                    {t('imapSecure') || 'Usa SSL/TLS per IMAP (Ricezione)'}
                  </label>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <input
                    type="checkbox"
                    id="smtpSecure"
                    checked={emailConfig.smtpSecure}
                    onChange={(e) => setEmailConfig({ ...emailConfig, smtpSecure: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="smtpSecure" className="text-sm text-slate-700 font-medium select-none cursor-pointer">
                    {t('smtpSecure') || 'Usa SSL/TLS per SMTP (Invio)'}
                  </label>
                </div>
              </div>

              <div className="flex justify-start mt-6">
                <button
                  type="button"
                  onClick={handleTestEmail}
                  disabled={testingEmail || !emailConfig.email || !emailConfig.password}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {testingEmail ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-slate-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('testingConnection') || 'Test in corso...'}
                    </>
                  ) : (
                    <>
                      <span>🔌</span>
                      {t('testConnection') || 'Test Connessione Email'}
                    </>
                  )}
                </button>
              </div>

              <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-700 border-b border-slate-200 pb-2 mt-8 mb-4">
                {t('emailPolling') || 'Controllo Automatico'}
              </h3>

              <div className="flex flex-col space-y-2 w-full md:w-1/2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {t('pollingInterval') || 'Intervallo di Controllo (Minuti)'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={emailConfig.pollingInterval}
                  onChange={(e) => setEmailConfig({ ...emailConfig, pollingInterval: parseInt(e.target.value) || 15 })}
                  onKeyDown={preventEnterSubmit}
                  className="bg-white border border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-lg px-3 py-2 text-sm text-slate-800 transition-all focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {t('pollingDesc') || 'Ogni quanti minuti il sistema controllerà la posta per scaricare nuovi archivi ZIP/RAR in background.'}
                </p>
              </div>
            </div>
          )}


          {/* Azioni */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:justify-between items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/tgm')}
              className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg transition-all duration-200 text-center"
            >
              {t('cancelAndReturn') || 'Annulla e Torna alla Home'}
            </button>
            <button
              type="submit"
              disabled={loading || (activeTab === 'general' && !hasValidOperator)}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 text-center"
            >
              {loading ? (t('saving') || 'Salvataggio...') : (t('saveConfiguration') || 'Salva Configurazione')}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}
