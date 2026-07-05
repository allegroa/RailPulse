import { useEffect, useState } from "react";
import { listClients, createClient, deleteClient, createClientFolder } from "../utils/adminApi";


export default function AdminClientsPage() {
  const [clients, setClients] = useState([]);

  async function load(){ setClients(await listClients()); }
  useEffect(()=>{ load(); }, []);

  async function onCreate(e){
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    try{
      const clientBody = {
        name: f.get("name"),
        folderName: f.get("folderName"),
        contact: f.get("contact") || undefined,
      };
      const created = await createClient(clientBody);
    } catch (error) {
      console.error("Error creating client:", error);
    }
    try{
      const folderResp = await createClientFolder({
        folderName: f.get("folderName"),
      });
    } catch (error) {
      console.error("Error creating client folder:", error);
    }
    if (e && e.currentTarget) e.currentTarget.reset();
    load();
  }
  async function onDelete(id){
    if(!window.confirm("Are you sure to delete this client?")) return;
    await deleteClient(id);
    load();
  }

  return (
      <div className="bg-white rounded-lg shadow-md mb-4">
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Company</h2>
          <form onSubmit={onCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <input 
                name="name" 
                placeholder="Company name" 
                required 
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            <div>
              <input 
                name="folderName" 
                placeholder="Folder name" 
                required 
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            <div>
              <input 
                name="contact" 
                placeholder="Contact" 
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            <div>
              <button 
                type="submit" 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md"
              >
                Create Company
              </button>
            </div>
          </form>
           <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">ID</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Company name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Folder Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Contact</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map(c => (
                    <tr key={c.id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-700">{c.id}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{c.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{c.folderName}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{c.contact || "n/a"}</td>
                      <td className="px-4 py-3">
                        <button 
                          onClick={() => onDelete(c.id)} 
                          className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          Delete
                        </button> 
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </div>
      </div>
    
  );
}
