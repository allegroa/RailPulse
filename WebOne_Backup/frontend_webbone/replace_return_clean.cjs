const fs = require('fs');
let content = fs.readFileSync('D:/004_Software/WebOne/frontend_webbone/src/pages/DataVizualizer.jsx', 'utf-8');

const returnStart = content.indexOf('return (');
if (returnStart === -1) {
  console.log("Could not find return start!");
  process.exit(1);
}

let beforeReturn = content.substring(0, returnStart);

let newReturn = `return (
  <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
    {parseError && (
      <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-3 rounded">
        <div className="text-sm text-red-700">{parseError}</div>
      </div>
    )}
    {uploadStatus && (
      <div className={\`mb-4 \${uploadStatus.type === 'success' ? 'bg-green-50 border-l-4 border-green-400 text-green-700' : 'bg-red-50 border-l-4 border-red-400 text-red-700'} p-3 rounded\`}>
        <div className="text-sm">{uploadStatus.msg}</div>
      </div>
    )}

    <div className="mb-8 flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 flex items-center">
          <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {t('appTitle')}
        </h2>
        <p className="text-slate-500 mt-1">Visualize and explore your CSV data</p>
      </div>
      <div className="flex gap-4 items-center">
        <select 
          value={i18n.language} 
          onChange={e => i18n.changeLanguage(e.target.value)}
          className="border-slate-300 rounded text-sm px-2 py-1"
        >
          <option value="it">Italiano</option>
          <option value="en">English</option>
          <option value="zh">中文</option>
        </select>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div className="flex flex-col gap-6">
        {infoPairs && infoPairs.length > 0 && (
          <div className="bg-white rounded-xl shadow-md overflow-y-auto max-h-64">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between sticky top-0">
              <h3 className="text-md font-medium text-slate-700">{t('infoTitle')}</h3>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
              {infoPairs.map((p, idx) => (
                <div key={idx} className="flex gap-2 items-start">
                  <div className="text-xs font-medium text-slate-500 w-28">{p.key}</div>
                  <div className="text-sm text-slate-700">{p.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-y-auto max-h-80">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between sticky top-0">
            <h3 className="text-md font-medium text-slate-700">{t('configTitle')}</h3>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center px-3 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 cursor-pointer">
                {t('importFile')}
                <input type="file" accept=".csv,.geo" className="hidden" onChange={e => { if (e.target.files[0]) handleLocalFile(e.target.files[0]); }} />
              </label>
            </div>
          </div>
          <div className="p-4">
            <div className="text-sm text-slate-600">Sostituire la configurazione qui</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden min-h-[300px] flex flex-col">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between">
           <h3 className="text-md font-medium text-slate-700 flex items-center gap-2">
             {t('mapTitle')}
           </h3>
        </div>
        <div className="flex-1 bg-slate-100 relative">
           {hoveredCoords ? (
              <iframe
                title="Google Map"
                width="100%"
                height="100%"
                style={{ border: 0, position: 'absolute', top:0, left:0, bottom:0, right:0 }}
                loading="lazy"
                allowFullScreen
                src={\`https://maps.google.com/maps?q=\${hoveredCoords.lat},\${hoveredCoords.lon}&z=16&output=embed\`}
              ></iframe>
           ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                {t('noLocation')}
              </div>
           )}
        </div>
      </div>
    </div>
  </div>
  );
}`;

fs.writeFileSync('D:/004_Software/WebOne/frontend_webbone/src/pages/DataVizualizer.jsx', beforeReturn + newReturn);
console.log('Replaced return block successfully!');
