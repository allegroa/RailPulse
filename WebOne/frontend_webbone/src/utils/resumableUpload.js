import api from './api';

// Resumable upload helper
// Usage: const uploader = createResumableUploader(file, folder, {chunkSize, parallel});
// uploader.onProgress(percent) // overall
// uploader.onChunkProgress(index, percent)
// uploader.start()
// uploader.cancel()

export function createResumableUploader(file, folder, opts = {}){
  const chunkSize = opts.chunkSize || 8 * 1024 * 1024; // 8MB
  const parallel = opts.parallel || 3;
  let cancelled = false;
  let abortControllers = {};

  const listeners = { progress: [], chunk: [], status: [] };
  const emit = (ev, ...args) => { (listeners[ev]||[]).forEach(fn => fn(...args)); };

  async function init(){
    try {
    const res = await api.post(`/api/files/${encodeURIComponent(folder)}/upload/resumable/init`, { filename: file.name, totalSize: file.size });
      // axios responses put payload on res.data
      return res.data && res.data.id;
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to initialize upload';
      throw new Error(msg);
    }
  }

  async function status(id){
  const res = await api.get(`/api/files/${encodeURIComponent(folder)}/upload/resumable/status`, { params: { id } });
    return (res.data && res.data.uploaded) || [];
  }

  async function uploadChunk(id, index, blob){
    if (cancelled) throw new Error('cancelled');
    const form = new FormData();
    form.append('id', id);
    form.append('index', String(index));
    form.append('chunkSize', String(blob.size));
    form.append('chunk', blob, file.name);

    // Use fetch to get fine-grained progress via xhr? We'll use axios to keep auth header handling.
    const source = api; // api is axios instance
    // create a custom CancelToken via axios if available
    let onProgress = (ev) => {
      if (ev.lengthComputable) {
        const pct = Math.round((ev.loaded * 100) / ev.total);
        emit('chunk', index, pct);
      } else {
        // best effort: show loaded in MB
        const mb = Math.round(ev.loaded / 1024 / 1024);
        emit('chunk', index, mb);
      }
    };

    // axios does not expose AbortController in older versions, but supports CancelToken
    const CancelToken = source.CancelToken;
    const cSrc = CancelToken ? CancelToken.source() : null;
    if (cSrc) abortControllers[index] = cSrc;

    try {
  await source.post(`/api/files/${encodeURIComponent(folder)}/upload/resumable/upload-chunk`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: onProgress,
        cancelToken: cSrc ? cSrc.token : undefined,
      });
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to upload chunk';
      throw new Error(msg);
    }

    if (cSrc) delete abortControllers[index];
  }

  async function complete(id){
    try {
  await api.post(`/api/files/${encodeURIComponent(folder)}/upload/resumable/complete`, { id });
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Failed to complete upload';
      throw new Error(msg);
    }
  }

  async function start(){
    cancelled = false;
    const id = await init();
    emit('status', 'init', id);
    const uploaded = await status(id);
    emit('status', 'status', uploaded);

    const totalChunks = Math.ceil(file.size / chunkSize);
    const chunks = Array.from({ length: totalChunks }).map((_, i) => i);
    const toUpload = chunks.filter(i => !uploaded.includes(i));

    let completed = uploaded.length;

    // Worker pool
    const queue = toUpload.slice();
    const running = [];

    function overallProgress(){
      const pct = Math.round((completed / totalChunks) * 100);
      emit('progress', pct);
    }

    async function worker(){
      while (queue.length && !cancelled){
        const idx = queue.shift();
        const startByte = idx * chunkSize;
        const endByte = Math.min(file.size, startByte + chunkSize);
        const blob = file.slice(startByte, endByte);
        try {
          await uploadChunk(id, idx, blob);
          completed++;
          overallProgress();
        } catch (err) {
          if (err.message && err.message === 'cancelled') return;
          // on error push back for retry after short delay
          queue.push(idx);
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    }

    const workers = Array.from({ length: Math.min(parallel, queue.length) }).map(() => worker());
    await Promise.all(workers);

    if (cancelled) throw new Error('cancelled');

    await complete(id);
    emit('progress', 100);
    return { id };
  }

  function cancel(){
    cancelled = true;
    Object.values(abortControllers).forEach(s => { try { s.cancel('User canceled'); } catch (e) {} });
  }

  return {
    start,
    cancel,
    onProgress: (fn) => { listeners.progress.push(fn); },
    onChunk: (fn) => { listeners.chunk.push(fn); },
    onStatus: (fn) => { listeners.status.push(fn); }
  };
}
