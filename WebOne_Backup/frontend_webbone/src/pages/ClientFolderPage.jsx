import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRef } from 'react';
import { createResumableUploader } from '../utils/resumableUpload';


function getFileIcon(name) {
  const ext = name.split('.').pop().toLowerCase();
  if (["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"].includes(ext)) return "🖼️";
  if (["pdf"].includes(ext)) return "📄";
  if (["doc", "docx"].includes(ext)) return "📝";
  if (["xls", "xlsx"].includes(ext)) return "📊";
  if (["ppt", "pptx"].includes(ext)) return "📈";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "🗜️";
  if (["mp3", "wav", "ogg"].includes(ext)) return "🎵";
  if (["mp4", "avi", "mov", "wmv", "webm", "mkv"].includes(ext)) return "🎬";
  return "📁";
}

function formatSize(bytes) {
  if (!bytes || isNaN(bytes)) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
}

function ClientFolderPage() {
  // Inline rename state
  const [renamingFile, setRenamingFile] = useState(null); // filename being renamed
  const [renameValue, setRenameValue] = useState("");

  // Start inline rename
  const startRename = (fileName) => {
    setRenamingFile(fileName);
    setRenameValue(fileName);
  };

  // Cancel inline rename
  const cancelRename = () => {
    setRenamingFile(null);
    setRenameValue("");
  };

  // Confirm inline rename
  const confirmRename = async (oldName) => {
    const newName = renameValue.trim();
    if (!newName || newName === oldName) {
      cancelRename();
      return;
    }
    try {
      await axios.patch(`/api/files/${encodedFolder}/rename`, { oldName, newName }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchFiles();
      cancelRename();
    } catch (err) {
      setUploadError(err?.response?.data?.message || 'Error renaming file');
    }
  };

  // Delete file handler
  const handleDelete = async (fileName) => {
    if (!window.confirm(`Delete file "${fileName}"?`)) return;
    try {
      await axios.delete(`/api/files/${encodedFolder}/${encodeURIComponent(fileName)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchFiles();
    } catch (err) {
      setUploadError(err?.response?.data?.message || 'Error deleting file');
    }
  };

  const { project, system } = useParams();
  const folderName = `${project}/${system}`;
  const encodedFolder = folderName.split('/').map(encodeURIComponent).join('/');
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name");
  const token = localStorage.getItem('token');
  // Upload / download progress tracking
  const [activeUploads, setActiveUploads] = useState([]); // { id, name, size, progress }
  const [downloadProgress, setDownloadProgress] = useState({}); // name -> percent
  const uploadCancelRef = useRef({});
  const downloadCancelRef = useRef({});

  // Fetch files utility for reuse
  const fetchFiles = async () => {
    setLoading(true);
    setError("");
    try {
      const cacheBuster = Date.now();
      const res = await axios.get(`/api/files/${encodedFolder}?_cb=${cacheBuster}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFiles(res.data?.files || []);
    } catch (err) {
      setError('Error loading files.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [folderName, token]);

  // Download che include l'Authorization header
  const handleDownload = async (fileName) => {
    const url = `/api/files/raw?folder=${encodeURIComponent(folderName)}&file=${encodeURIComponent(fileName)}&download=1`;
    const source = axios.CancelToken ? axios.CancelToken.source() : null;
    if (source) downloadCancelRef.current[fileName] = source;
    setDownloadProgress(p => ({ ...p, [fileName]: 0 }));
    try {
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
        onDownloadProgress: (ev) => {
          if (!ev.lengthComputable && ev.total === 0) return; // some browsers/servers don't provide total
          const pct = ev.total ? Math.round((ev.loaded * 100) / ev.total) : Math.round((ev.loaded / 1024 / 1024));
          setDownloadProgress(p => ({ ...p, [fileName]: Math.min(100, pct) }));
        },
        cancelToken: source ? source.token : undefined,
      });
      const blobUrl = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      if (axios.isCancel && axios.isCancel(err)) {
        // canceled by user
      } else {
        setError('Unable to download file.');
      }
    } finally {
      setDownloadProgress(p => {
        const copy = { ...p };
        delete copy[fileName];
        return copy;
      });
      if (source) delete downloadCancelRef.current[fileName];
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // helper to start resumable upload for a file and tempId
    const startResumableUpload = async (file, tempId) => {
      try {
        setActiveUploads(a => [{ id: tempId, name: file.name, size: file.size, progress: 0 }, ...a]);
        const uploader = createResumableUploader(file, folderName, { chunkSize: 8 * 1024 * 1024, parallel: 3 });
        uploader.onProgress(pct => setActiveUploads(prev => prev.map(it => it.id === tempId ? { ...it, progress: pct } : it)));
        let completedRef = false;
        uploader.onProgress(pct => {
          setActiveUploads(prev => prev.map(it => it.id === tempId ? { ...it, progress: pct } : it));
          if (pct === 100 && !completedRef) {
            completedRef = true;
            // ensure list refresh after upload completes
            fetchFiles().catch(() => {});
          }
        });
        uploader.onChunk((index, pct) => { /* optional per-chunk UI */ });
        await uploader.start();
        await fetchFiles();
      } catch (err) {
        if (err.message !== 'cancelled') setUploadError(err?.message || 'Error uploading file');
      } finally {
        setActiveUploads(prev => prev.filter(it => it.id !== tempId));
      }
    };
    // For large files use resumable upload
    const RESUMABLE_THRESHOLD = 5 * 1024 * 1024; // 5MB
    if (file.size > RESUMABLE_THRESHOLD) {
      const tempId = `upload-${Date.now()}`;
      setActiveUploads(a => [{ id: tempId, name: file.name, size: file.size, progress: 0 }, ...a]);
      const uploader = createResumableUploader(file, folderName, { chunkSize: 8 * 1024 * 1024, parallel: 3 });
      uploader.onProgress(pct => setActiveUploads(prev => prev.map(it => it.id === tempId ? { ...it, progress: pct } : it)));
        let completedRef2 = false;
        uploader.onProgress(pct => {
          setActiveUploads(prev => prev.map(it => it.id === tempId ? { ...it, progress: pct } : it));
          if (pct === 100 && !completedRef2) {
            completedRef2 = true;
            fetchFiles().catch(() => {});
          }
        });
      uploader.onChunk((index, pct) => { /* optional per-chunk UI */ });
      uploader.onStatus((ev, data) => { /* status events */ });
      try {
        await uploader.start();
        await fetchFiles();
      } catch (err) {
        if (err.message !== 'cancelled') setUploadError(err?.message || 'Error uploading file');
      } finally {
        setActiveUploads(prev => prev.filter(it => it.id !== tempId));
      }
      return;
    }
    // fallback to simple upload for small files
    const formData = new FormData();
    formData.append('file', file);
    const tempId = `upload-${Date.now()}`;
    // show temporary upload item
    setActiveUploads(a => [{ id: tempId, name: file.name, size: file.size, progress: 0 }, ...a]);
    const source = axios.CancelToken ? axios.CancelToken.source() : null;
    if (source) uploadCancelRef.current[tempId] = source;
    try {
      await axios.post(`/api/files/${encodedFolder}/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (ev) => {
          const pct = ev.total ? Math.round((ev.loaded * 100) / ev.total) : Math.round((ev.loaded / 1024 / 1024));
          setActiveUploads(prev => prev.map(it => it.id === tempId ? { ...it, progress: Math.min(100, pct) } : it));
        },
        cancelToken: source ? source.token : undefined,
      });
      // upload finished - refresh list
      await fetchFiles(); // Refresh file list after upload
    } catch (err) {
      // If the server rejected large single-request uploads (413), auto-fallback to resumable
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message;
      if (status === 413) {
        // start resumable flow automatically
        await startResumableUpload(file, tempId);
      } else if (!(axios.isCancel && axios.isCancel(err))) {
        setUploadError(serverMsg || 'Error uploading file');
      }
    } finally {
      // remove temp (resumable helper also removes on finish)
      setActiveUploads(prev => prev.filter(it => it.id !== tempId));
      if (source) delete uploadCancelRef.current[tempId];
    }
  };

  const cancelUpload = (tempId) => {
    const src = uploadCancelRef.current[tempId];
    if (src) src.cancel('User canceled upload');
    setActiveUploads(prev => prev.filter(it => it.id !== tempId));
    delete uploadCancelRef.current[tempId];
  };

  const cancelDownload = (fileName) => {
    const src = downloadCancelRef.current[fileName];
    if (src) src.cancel('User canceled download');
    setDownloadProgress(p => {
      const copy = { ...p };
      delete copy[fileName];
      return copy;
    });
    delete downloadCancelRef.current[fileName];
  };
function isVisualizableFile(name) {
  return name && (name.toLowerCase().endsWith('.csv') || name.toLowerCase().endsWith('.geo'));
}
  // Ricava info file: name, size, date (se disponibili)
  let fileList = (files || []).map(f => {
    if (typeof f === 'string') return { name: f };
    return f;
  });
  // Search
  fileList = fileList.filter(f => f.name?.toLowerCase().includes(search.toLowerCase()));
  // Sort
  if (sort === 'name') fileList = fileList.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === 'date') fileList = fileList.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  if (sort === 'size') fileList = fileList.sort((a, b) => (b.size || 0) - (a.size || 0));

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            {project} <span className="text-slate-400 mx-2">/</span> {system}
          </h2>
          <p className="text-slate-500 mt-2">Files and documents in this system</p>
          <div className="mx-auto mt-4 border-t-4 border-blue-500 w-20" />
        </div>
      </div>
      {/* Upload error banner */}
      {uploadError && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-sm text-red-700 font-medium">Upload error</div>
                <div className="mt-1 text-sm text-red-600">{uploadError}</div>
              </div>
            </div>
            <div>
              <button onClick={() => setUploadError('')} className="text-sm text-red-500 underline">Dismiss</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Back, search, sort, and upload bar */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-3 justify-between">
            <button
              className="inline-flex items-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              onClick={() => navigate(`/files/${project}`)}
            >
              <svg className="mr-2 -ml-1 h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to folders
            </button>
            
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all sm:text-sm"
                  placeholder="Search files..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              
              <select
                className="pl-3 pr-10 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all sm:text-sm"
                value={sort}
                onChange={e => setSort(e.target.value)}
              >
                <option value="name">Sort by name</option>
                <option value="date">Sort by date</option>
                <option value="size">Sort by size</option>
              </select>
              
              <label className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors cursor-pointer">
                <svg className="mr-2 -ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload File
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <svg className="animate-spin mx-auto h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <div className="mt-3 text-slate-500 text-lg">Loading files...</div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : fileList.length === 0 && (activeUploads.length === 0) ? (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md text-center">
          <p className="text-blue-700">No files in this folder.</p>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-xl overflow-hidden">
          <ul className="divide-y divide-slate-200">
            <div className="flex font-medium text-sm text-slate-600 py-2 px-6 border-b border-slate-200 bg-slate-50">
              <span className="flex-1">Name</span>
              <span className="w-32 hidden md:block">Date</span>
              <span className="w-24 hidden md:block">Size</span>
              <span className="w-20 hidden md:block text-center">Version</span>
              <span className="w-64 text-right">Actions</span>
            </div>
            {/* Active uploads shown at top */}
            {activeUploads.map((u) => (
              <li key={u.id} className="px-4 py-3 sm:px-6 bg-yellow-50 hover:bg-yellow-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    <span className="flex-shrink-0 text-2xl mr-3">📤</span>
                    <span className="truncate text-slate-800 font-medium">{u.name}</span>
                  </div>
                  <div className="flex items-center space-x-3 w-64 justify-end">
                    <div className="w-32">
                      <div className="h-2 bg-slate-200 rounded overflow-hidden">
                        <div className="h-2 bg-yellow-500" style={{ width: `${u.progress}%` }} />
                      </div>
                      <div className="text-xs text-slate-500 mt-1 text-right">{u.progress}%</div>
                    </div>
                    <button onClick={() => cancelUpload(u.id)} className="px-2 py-1 text-xs border rounded bg-white hover:bg-slate-50 transition-colors">Cancel</button>
                  </div>
                </div>
              </li>
            ))}
            {fileList.map((f, idx) => (
              <li key={idx} className="px-4 py-3 sm:px-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    <span className="flex-shrink-0 text-2xl mr-3">{getFileIcon(f.name)}</span>
                    {renamingFile === f.name ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          className="block w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all sm:text-sm"
                          value={renameValue}
                          autoFocus
                          onChange={e => setRenameValue(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') confirmRename(f.name);
                            if (e.key === 'Escape') cancelRename();
                          }}
                        />
                        <button 
                          onClick={() => confirmRename(f.name)} 
                          title="Save rename"
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Save
                        </button>
                        <button 
                          onClick={cancelRename} 
                          title="Cancel rename"
                          className="inline-flex items-center px-3 py-2 border border-slate-300 text-sm leading-4 font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span className="truncate text-slate-800 font-medium">{f.name}</span>
                    )}
                  </div>
                  
                  <div className="w-32 hidden md:block text-sm text-slate-500 whitespace-nowrap">
                    {formatDate(f.createdAt)}
                  </div>
                  
                  <div className="w-24 hidden md:block text-sm text-slate-500 whitespace-nowrap">
                    {f.size ? formatSize(f.size) : "-"}
                  </div>
                  
                  <div className="w-20 hidden md:block text-sm text-slate-500 whitespace-nowrap text-center">
                    <span className="bg-slate-100 px-2 py-1 rounded">0</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 w-64 justify-end">
                    <div className="flex items-center">
                      {downloadProgress[f.name] ? (
                        <div className="flex items-center gap-3">
                          <div className="w-36">
                            <div className="h-2 bg-slate-200 rounded overflow-hidden">
                              <div className="h-2 bg-blue-500" style={{ width: `${downloadProgress[f.name]}%` }} />
                            </div>
                            <div className="text-xs text-slate-500 mt-1">{downloadProgress[f.name]}%</div>
                          </div>
                          <button onClick={() => cancelDownload(f.name)} className="px-2 py-1 text-xs border rounded bg-white">Cancel</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDownload(f.name)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-slate-300 text-xs font-medium rounded text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download
                        </button>
                      )}
                    </div>
                    
                    <button
                      onClick={() => startRename(f.name)}
                      title="Rename file"
                      disabled={!!renamingFile}
                      className={`inline-flex items-center px-2.5 py-1.5 border text-xs font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${renamingFile ? 'border-slate-200 text-slate-400 bg-slate-100 cursor-not-allowed' : 'border-yellow-300 text-yellow-800 bg-yellow-50 hover:bg-yellow-100'}`}
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Rename
                    </button>
                    
                    <button
                      onClick={() => handleDelete(f.name)}
                      title="Delete file"
                      className="inline-flex items-center px-2.5 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                    
                    <div className="flex space-x-2">
                      {isVisualizableFile(f.name) && (
                        <button
                          onClick={() => navigate(`/visualizer?folder=${encodeURIComponent(folderName)}&file=${encodeURIComponent(f.name)}`)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-blue-300 text-xs font-medium rounded text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          Visualize
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ClientFolderPage;
