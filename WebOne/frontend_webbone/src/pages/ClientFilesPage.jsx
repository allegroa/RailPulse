import { useNavigate, useParams } from 'react-router-dom';
import useFolders from '../hooks/useFolders';
import { useState } from 'react';
import axios from 'axios';

function ClientFilesPage({ level = 'project' }) {
  const navigate = useNavigate();
  const { project } = useParams(); // available when level is 'system'
  const token = localStorage.getItem('token');
  
  // path passed to useFolders is the project name if we are viewing systems
  const pathParam = level === 'system' ? project : '';
  const { folders, loading, error } = useFolders(token, pathParam);
  
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name");

  const isProjectLevel = level === 'project';
  const title = isProjectLevel ? 'Projects' : 'Systems';
  const subtitle = isProjectLevel ? 'Access your projects' : `Systems in ${project}`;
  const searchPlaceholder = isProjectLevel ? 'Search projects...' : 'Search systems...';
  const newFolderLabel = isProjectLevel ? 'New Project' : 'New System';

  const handleClick = (folder) => {
    if (isProjectLevel) {
      if (folder === 'track_web-main') {
        navigate('/tgm'); // Modulo TGM integrato in WebOne
      } else if (folder === 'maintenance-web') {
        navigate('/maintenance');
      } else if (folder === 'general-configuration_web') {
        navigate('/general-configuration');
      } else if (folder === 'taipei-scaffold') {
        navigate('/taipei');
      } else if (folder === 'railprofile') {
        navigate('/railprofile');
      } else if (folder === 'database_view') {
        navigate('/files');
      } else {
        navigate(`/projects/${folder}`); // Go to systems
      }
    } else {
      navigate(`/projects/${project}/${folder}`); // Go to files
    }
  };

  const handleNewFolder = async () => {
    const folderName = prompt(`Enter new ${isProjectLevel ? 'project' : 'system'} name:`);
    if(!folderName) return;
    try {
      const targetPath = isProjectLevel ? folderName : `${project}/${folderName}`;
      await axios.post(`/api/files/${targetPath}/create`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // A quick reload to show the new folder
      window.location.reload();
    } catch (error) {
      console.error("Error creating folder:", error);
      alert("Error creating folder: " + (error.response?.data?.message || error.message));
    }
  };

  // Filter and sort folders
  let displayFolders = [...folders];
  if (isProjectLevel) {
    if (!displayFolders.includes('track_web-main')) displayFolders.push('track_web-main');
    if (!displayFolders.includes('maintenance-web')) displayFolders.push('maintenance-web');
    if (!displayFolders.includes('general-configuration_web')) displayFolders.push('general-configuration_web');
    if (!displayFolders.includes('taipei-scaffold')) displayFolders.push('taipei-scaffold');
    if (!displayFolders.includes('railprofile')) displayFolders.push('railprofile');
    if (!displayFolders.includes('database_view')) displayFolders.push('database_view');
  }

  let filteredFolders = displayFolders.filter(f => 
    f.toLowerCase().includes(search.toLowerCase()) && 
    !['config', 'manual', 'manuals', 'upload', 'maintenance'].includes(f.toLowerCase())
  );
  if (sort === "name") {
    filteredFolders = filteredFolders.sort();
  }

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 text-center relative">
        {!isProjectLevel && (
           <button
             onClick={() => navigate('/projects')}
             className="absolute left-0 top-0 mt-1 inline-flex items-center px-3 py-1.5 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
           >
             Back to Projects
           </button>
        )}
        <h2 className="text-2xl font-bold text-slate-800 flex items-center justify-center gap-2">
          {title}
        </h2>
        <p className="text-slate-500 mt-2">{subtitle}</p>
        <div className="mx-auto mt-4 border-t-4 border-blue-500 w-20" />
      </div>
      
      {/* Search, sort, and new folder bar */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="p-4 sm:p-6">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-grow max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder={searchPlaceholder}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            
            <select
              className="px-3 py-2 border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={sort}
              onChange={e => setSort(e.target.value)}
            >
              <option value="name">Sort by name</option>
            </select>
            
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm flex items-center"
              onClick={handleNewFolder}
            >
              {newFolderLabel}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <svg className="animate-spin mx-auto h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <div className="mt-3 text-slate-500 text-lg">Loading...</div>
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
              <p className="text-sm text-red-700">Error loading data.</p>
            </div>
          </div>
        </div>
      ) : filteredFolders.length === 0 ? (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md text-center">
          <p className="text-blue-700">No items available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFolders.map((folder, index) => {
            const isSpecialModule = folder === 'track_web-main' || folder === 'maintenance-web' || folder === 'general-configuration_web' || folder === 'taipei-scaffold' || folder === 'railprofile';
            return (
              <div key={index} 
                onClick={() => handleClick(folder)}
                className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:bg-slate-50 transition-colors cursor-pointer`}>
                <div className="px-4 py-5 sm:p-6 flex flex-col items-center text-center">
                  <h3 className="text-lg font-medium text-slate-800">
                    {folder === 'track_web-main' ? 'track-view (TGM)' : 
                     folder === 'maintenance-web' ? 'Maintenance' :
                     folder === 'general-configuration_web' ? 'General Configuration' : 
                     folder === 'taipei-scaffold' ? 'Taipei Scaffold' :
                     folder === 'railprofile' ? 'Rail Profile' :
                     folder === 'database_view' ? 'Database View' :
                     folder}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {folder === 'track_web-main' ? 'Geometric parameters and TQI visualization' : 
                     folder === 'maintenance-web' ? 'Maintenance management' :
                     folder === 'general-configuration_web' ? 'General configuration of lines, tracks, operators and language' : 
                     folder === 'taipei-scaffold' ? 'Interactive map and stations management (Taipei)' :
                     folder === 'railprofile' ? 'Cross-sectional rail profile analysis' :
                     folder === 'database_view' ? 'Visualizzatore centralizzato acquisizioni' :
                     `View ${folder}`}
                  </p>
                  <span className={`mt-4 inline-flex items-center px-3 py-1 rounded border border-slate-200 text-xs font-medium bg-white text-slate-700`}>
                    {isSpecialModule || folder === 'database_view' ? 'Open Module' : 'Open'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ClientFilesPage;
