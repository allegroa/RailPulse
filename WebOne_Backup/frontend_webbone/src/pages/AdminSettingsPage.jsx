import React from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import { useState, useEffect } from 'react';
import api from '../utils/api';

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    api.get('/api/admin/settings/files')
      .then(r => { if (mounted) setSettings(r.data); })
      .catch(e => { if (mounted) setError(e.message); });
    return () => { mounted = false; };
  }, []);

  const onChange = (path, value) => {
    setSettings(s => ({ ...s, [path]: value }));
  };

  const onSmbChange = (k, v) => setSettings(s => ({ ...s, smb: { ...(s?.smb || {}), [k]: v } }));

  const save = async () => {
    setSaving(true);
    try {
      await api.post('/api/admin/settings/files', settings);
      setSaving(false);
      alert('Settings saved');
    } catch (err) {
      setSaving(false);
      setError(err.message || 'Save failed');
    }
  };

  if (!settings) return <div className="p-6">Loading settings...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">File storage settings</h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}

      <label className="flex items-center gap-2 mb-4">
        <input type="checkbox" checked={settings.useSmb} onChange={e => onChange('useSmb', e.target.checked)} />
        <span>Use SMB (Samba)</span>
      </label>

      <div className="mb-4">
        <label className="block text-sm text-slate-700">Base path</label>
        <input className="w-full mt-1 p-2 border rounded" value={settings.basePath} onChange={e => onChange('basePath', e.target.value)} />
      </div>

      <fieldset className="mb-4 p-4 border rounded">
        <legend className="px-2">SMB Credentials</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input className="p-2 border rounded" placeholder="Share (\\server\\share)" value={settings.smb?.share || ''} onChange={e => onSmbChange('share', e.target.value)} />
          <input className="p-2 border rounded" placeholder="Domain" value={settings.smb?.domain || ''} onChange={e => onSmbChange('domain', e.target.value)} />
          <input className="p-2 border rounded" placeholder="Username" value={settings.smb?.username || ''} onChange={e => onSmbChange('username', e.target.value)} />
          <input className="p-2 border rounded" placeholder="Password" type="password" value={settings.smb?.password || ''} onChange={e => onSmbChange('password', e.target.value)} />
        </div>
      </fieldset>

      <label className="flex items-center gap-2 mb-6">
        <input type="checkbox" checked={settings.allowPublicDownload} onChange={e => onChange('allowPublicDownload', e.target.checked)} />
        <span>Allow public downloads (be careful)</span>
      </label>

      <div className="flex gap-3">
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
