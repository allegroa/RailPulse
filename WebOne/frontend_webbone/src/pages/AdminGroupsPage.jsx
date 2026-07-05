import { useEffect, useState } from "react";
import { listGroups, createGroup, addGroupMembers, removeGroupMember, listUsers } from "../utils/adminApi";
import useProfile from "../hooks/useProfile";


export default function AdminGroupsPage() {
  const { user } = useProfile();
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);

  async function load() {
    const params = user?.role === "admin" ? {} : { clientId: user?.clientId };
    const [g, u] = await Promise.all([listGroups(params), listUsers(params)]);
    setGroups(g); setUsers(u);
  }
  useEffect(() => { if (user) load(); }, [user]);

  async function onCreate(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = { name: f.get("name") };
    if (user?.role === "admin" && f.get("clientId")) body.clientId = Number(f.get("clientId"));
    await createGroup(body);
    e.currentTarget.reset();
    load();
  }

  return (
      <div className="bg-white rounded-lg shadow-md mb-4">
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Gruppi</h2>
          <form onSubmit={onCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {user?.role === "admin" && (
              <div>
                <input 
                  name="clientId" 
                  placeholder="clientId (solo admin)" 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                />
              </div>
            )}
            <div>
              <input 
                name="name" 
                placeholder="Nome gruppo" 
                required 
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            <div className="col-span-2">
              <button 
                type="submit" 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md"
              >
                Crea gruppo
              </button>
            </div>
          </form>
          {groups.map(g => (
            <div key={g.id} className="card mb-3">
              <div className="card-body">
                <b>{g.name}</b> <small>(client #{g.clientId})</small>
                <div className="mt-2">
                  <div>
                    Membri:&nbsp;
                    {g.members.map(m => (
                      <span key={m.id} className="badge bg-secondary me-2">
                        {m.name} ({m.email}){' '}
                        <button type="button" className="btn btn-sm btn-danger ms-1" onClick={async ()=>{ await removeGroupMember(g.id, m.id); load(); }}>x</button>
                      </span>
                    ))}
                  </div>
                  <div className="mt-3">
                    <select id={`sel-${g.id}`} multiple size={5} className="form-select w-auto d-inline-block" style={{minWidth:260}}>
                      {users.filter(u => u.clientId === g.clientId).map(u => (
                        <option key={u.id} value={u.id}>{u.name}  {u.email}</option>
                      ))}
                    </select>
                    <button type="button" className="btn btn-success ms-2" onClick={async ()=>{
                      const el = document.getElementById(`sel-${g.id}`);
                      const ids = Array.from(el.selectedOptions).map(o => Number(o.value));
                      if (ids.length) { await addGroupMembers(g.id, ids); load(); }
                    }}>Aggiungi</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    
  );
}
