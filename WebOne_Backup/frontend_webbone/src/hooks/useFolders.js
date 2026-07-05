import { useEffect, useState } from 'react';
import axios from 'axios';

export default function useFolders(token, path = '') {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchFolders = async () => {
      try {
        const url = path ? `/api/files/available?path=${encodeURIComponent(path)}` : '/api/files/available';
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cancelled) setFolders(res.data.folders || []);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchFolders();
    return () => { cancelled = true; };
  }, [token, path]);

  return { folders, loading, error };
}
