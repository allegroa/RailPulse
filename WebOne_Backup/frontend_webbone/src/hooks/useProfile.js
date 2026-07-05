import { useEffect, useState } from 'react';
import axios from 'axios';

export default function useProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async () => {
      try {
        if (!token) {
          // niente token: non chiamare l’API ma sblocca il loading
          if (!cancelled) setLoading(false);
          return;
        }

        const res = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cancelled) setProfile(res.data);
      } catch (err) {
        console.error('Errore caricamento profilo:', err);
        // Se il token non è valido → opzionale: logout/redirect
        // if (err?.response?.status === 401 || err?.response?.status === 403) logout();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProfile();
    return () => { cancelled = true; };
  }, [token]);

  return { profile, loading };
}
