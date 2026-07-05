
import { useEffect, useState, useCallback } from "react";
import { listUsers, createUser, changeUserRole, resetUserPassword, listClients, deleteUserProfile } from "../utils/adminApi";
import useProfile from "../hooks/useProfile";
// Animazione fade-in/fade-out e slide up per l'avviso di successo
const successAlertStyle = {
  position: "fixed",
  left: "50%",
  bottom: "40px",
  transform: "translateX(-50%)",
  zIndex: 9999,
  minWidth: "260px",
  transition: "opacity 0.5s, transform 0.5s",
  opacity: 1,
};

const successAlertHiddenStyle = {
  ...successAlertStyle,
  opacity: 0,
  pointerEvents: "none",
  transform: "translateX(-50%) translateY(40px)",
};


export default function AdminUsersPage() {

  const { profile: user } = useProfile();
  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profileReady, setProfileReady] = useState(false);
  const [success, setSuccess] = useState("");
  const [resetUserId, setResetUserId] = useState(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [showDeleteId, setShowDeleteId] = useState(null); // per animazione
  const [showResetId, setShowResetId] = useState(null); // per animazione
  const [showPassword, setShowPassword] = useState(false);

  // Animazione apertura/chiusura fisarmonica delete
  useEffect(() => {
    if (confirmDeleteId !== null) {
      setShowDeleteId(confirmDeleteId);
    } else if (showDeleteId !== null) {
      // Delay unmount per animazione chiusura
      const t = setTimeout(() => setShowDeleteId(null), 350);
      return () => clearTimeout(t);
    }
  }, [confirmDeleteId]);

  useEffect(() => {
    if (resetUserId !== null) {
      setShowResetId(resetUserId);
    } else if (showResetId !== null) {
      const t = setTimeout(() => setShowResetId(null), 350);
      return () => clearTimeout(t);
    }
  }, [resetUserId]);

  const handleDeleteUser = async (userId) => {
    try {
      setDeleteLoadingId(userId);
      setError("");
      await deleteUserProfile(userId)
      setSuccess("Utente eliminato con successo!");
      setTimeout(() => setSuccess(""), 2500);
      await loadUsers();
    } catch (e) {
      setError("Errore eliminazione utente");
    } finally {
      setDeleteLoadingId(null);
      setConfirmDeleteId(null);
    }
  };

  // Memoizziamo loadUsers per evitare ricreazioni inutili
  const loadUsers = useCallback(async () => {
    if (!user) {
      return;
    }
    try {
      setError("");
      const params = user.role !== "superadmin" ? { clientId: user.clientId } : {};
      const data = await listUsers(params);
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch (e) {
      setError(e?.response?.data?.error || "Errore caricamento utenti");
      setUsers([]);
    }
  }, [user]);

  // Memoizziamo anche loadClients
  const loadClients = useCallback(async () => {
    if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
      return;
    }
    try {
      const data = await listClients();
      setClients(data || []);
    } catch (e) {
      // Non mostriamo errore per i clienti, è meno critico
    }
  }, [user]);

  // Effetto per caricare i dati quando cambia l'utente
  useEffect(() => {
    // Segna che il profilo è "pronto" dopo un breve delay
    const timer = setTimeout(() => setProfileReady(true), 100);
    if (!user) {
      setUsers([]);
      setClients([]);
      setLoading(false);
      return () => clearTimeout(timer);
    }
    const fetchData = async () => {
      try {
        setLoading(true);
        if (user.role === "admin" || user.role === "superadmin") {
          await loadClients();
        }
        await loadUsers();
      } catch (error) {
        setError("Errore durante il caricamento dei dati");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    return () => clearTimeout(timer);
  }, [user, loadUsers, loadClients]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    // Determina clientId basandosi sul ruolo
    let clientId;
    if (user?.role === "admin" || user?.role === "superadmin") {
      const selectedClientId = formData.get("clientId");
      clientId = selectedClientId ? Number(selectedClientId) : undefined;
    } else {
      clientId = user?.clientId;
    }

    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role") || "cliente",
      ...(clientId ? { clientId } : {})
    };

    
    // Reset del form subito dopo la lettura dei dati
    if (e.currentTarget) e.currentTarget.reset();
    
    try {
      setError("");
      setSuccess("");
      setLoading(true);
      await createUser(payload);
      setSuccess("Utente creato con successo!");
      await loadUsers(); // Ricarica la lista
    } catch (e) {
      setError(e?.response?.data?.error || "Errore creazione utente");
    } finally {
      setLoading(false);
      // Nascondi il messaggio di successo dopo 2.5s
      if (!error) setTimeout(() => setSuccess(""), 2500);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (newRole === "admin" && user?.role !== "admin") return;
    
    try {
      setLoading(true);
      await changeUserRole(userId, newRole);
      await loadUsers();
    } catch (e) {
      setError(e?.response?.data?.error || "Errore modifica ruolo");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReset = (userId) => {
    setResetUserId(userId);
    setResetPassword("");
    setError("");
  };

  const handleCancelReset = () => {
    setResetUserId(null);
    setResetPassword("");
    setError("");
  };

  const handleSubmitReset = async (userId) => {
    if (!resetPassword || resetPassword.length < 6) {
      setError("La password deve avere almeno 6 caratteri.");
      return;
    }
    try {
      setResetLoading(true);
      setError("");
      await resetUserPassword(userId, resetPassword);
      setSuccess("Password aggiornata con successo!");
      setTimeout(() => setSuccess(""), 2500);
      setResetUserId(null);
      setResetPassword("");
    } catch (e) {
      setError(e?.response?.data?.error || "Errore reset password");
    } finally {
      setResetLoading(false);
    }
  };

  // Determina se può creare admin
  const canCreateAdmin = user?.role === "admin" || user?.role === "superadmin";
  const showClientSelect = canCreateAdmin && clients.length > 0;

  return (
      <div className="card mb-4">
        <div className="card-body">
          <h2 className="card-title mb-4">Gestione Utenti</h2>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <div
            style={success ? successAlertStyle : successAlertHiddenStyle}
            className="alert alert-success"
            role="alert"
            aria-live="polite"
          >
            {success}
          </div>
          {/* Form creazione utente */}
          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {showClientSelect && (
              <div>
                <label htmlFor="clientId" className="block text-sm font-medium text-slate-700 mb-1">Client</label>
                <select name="clientId" id="clientId" required className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="">Select client…</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name || `Client #${client.id}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
              <input 
                name="name" 
                id="name"
                placeholder="Nome completo" 
                required 
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input 
                name="email" 
                id="email"
                placeholder="email@esempio.com" 
                type="email" 
                required 
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input 
                  name="password" 
                  id="password"
                  placeholder="Password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1">Ruolo</label>
              <select name="role" id="role" defaultValue="cliente" className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="cliente">Cliente</option>
                <option value="admin" onClick={canCreateAdmin}>Admin</option>
              </select>
            </div>
            <div className="flex items-end">
              <button 
                type="submit" 
                className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md" 
                disabled={loading}
              >
                {loading ? "Creazione..." : "Crea Utente"}
              </button>
            </div>
          </form>
          {/* Tabella utenti */}
          {/* <div className="mb-3">
            <small className="text-muted">
              Debug: {users.length} utenti caricati | Loading: {loading.toString()} | Profile Ready: {profileReady.toString()} | User: {user ? `${user.email} (${user.role})` : 'null'}
            </small>
          </div> */}
          {/* Gestione stati di caricamento e errori */}
          {!profileReady ? (
            <div className="text-center py-4">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" role="status">
                <span className="sr-only">Inizializzazione...</span>
              </div>
              <p className="mt-2 text-slate-600">Inizializzazione...</p>
            </div>
          ) : !user ? (
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg">
              <h5 className="font-medium mb-1">Accesso non autorizzato</h5>
              <p>Non sei autenticato o la sessione è scaduta. Effettua il login per accedere a questa pagina.</p>
            </div>
          ) : loading && users.length === 0 ? (
            <div className="text-center py-4">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent" role="status">
                <span className="sr-only">Caricamento...</span>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg">
              Nessun utente trovato.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Client</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Role</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(currentUser => (
                    <tr key={currentUser.id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-700">{currentUser.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{currentUser.client?.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{currentUser.email}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        <select
                          value={currentUser.role}
                          className="w-full border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          onChange={(e) => handleRoleChange(currentUser.id, e.target.value)}
                          disabled={loading}
                        >
                          <option value="cliente">Cliente</option>
                          <option value="admin" disabled={!canCreateAdmin}>Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3" style={{ minWidth: 220 }}>
                        <div className="flex gap-2 items-start">
                          <button
                            className="px-2 py-1 text-xs bg-amber-500 hover:bg-amber-600 text-white rounded transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
                            onClick={() => handleOpenReset(currentUser.id)}
                            disabled={loading || resetUserId === currentUser.id}
                          >
                            Reset Password
                          </button>
                          <button
                            className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                            onClick={() => setConfirmDeleteId(currentUser.id)}
                            disabled={deleteLoadingId === currentUser.id}
                          >
                            {deleteLoadingId === currentUser.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                        {/* Conferma cancellazione utente */}
                        <div
                          style={{
                            maxHeight: showDeleteId === currentUser.id ? 100 : 0,
                            opacity: confirmDeleteId === currentUser.id ? 1 : 0,
                            overflow: 'hidden',
                            transition: 'max-height 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.3s',
                            marginTop: showDeleteId === currentUser.id ? 8 : 0,
                            pointerEvents: confirmDeleteId === currentUser.id ? 'auto' : 'none',
                          }}
                        >
                          {showDeleteId === currentUser.id && (
                            <div className="p-2 border border-slate-200 rounded-lg bg-slate-50" style={{ position: 'relative', zIndex: 2 }}>
                              <div className="mb-2 text-red-600 font-medium">Confermi l'eliminazione di questo utente?</div>
                              <div className="flex gap-2">
                                <button
                                  className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                                  onClick={() => handleDeleteUser(currentUser.id)}
                                  disabled={deleteLoadingId === currentUser.id}
                                >
                                  Conferma
                                </button>
                                <button
                                  className="px-2 py-1 text-xs bg-slate-500 hover:bg-slate-600 text-white rounded transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
                                  onClick={() => setConfirmDeleteId(null)}
                                  disabled={deleteLoadingId === currentUser.id}
                                >
                                  Annulla
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        {/* Reset password fisarmonica */}
                        <div
                          style={{
                            maxHeight: showResetId === currentUser.id ? 200 : 0,
                            opacity: resetUserId === currentUser.id ? 1 : 0,
                            overflow: 'hidden',
                            transition: 'max-height 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.3s',
                            marginTop: showResetId === currentUser.id ? 8 : 0,
                            pointerEvents: resetUserId === currentUser.id ? 'auto' : 'none',
                          }}
                        >
                          {showResetId === currentUser.id && (
                            <div className="p-2 border rounded bg-light" style={{ position: 'relative', zIndex: 2 }}>
                              <div className="mb-2">
                                <input
                                  type="password"
                                  className="form-control form-control-sm"
                                  placeholder="New password (min 6 chars)"
                                  value={resetPassword}
                                  onChange={e => setResetPassword(e.target.value)}
                                  disabled={resetLoading}
                                />
                              </div>
                              <div className="d-flex gap-2">
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => handleSubmitReset(currentUser.id)}
                                  disabled={resetLoading}
                                >
                                  {resetLoading ? "Saving..." : "Save"}
                                </button>
                                <button
                                  className="btn btn-secondary btn-sm"
                                  onClick={handleCancelReset}
                                  disabled={resetLoading}
                                >
                                  Cancel
                                </button>
                              </div>
                              {error && (
                                <div className="alert alert-danger mt-2 py-1 px-2" style={{ fontSize: 13 }}>{error}</div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    
  );
}