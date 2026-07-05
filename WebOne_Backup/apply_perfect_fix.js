const fs = require('fs');
let code = fs.readFileSync('frontend_webbone/src/pages/DataVizualizer.jsx', 'utf-8');

// 1. Imports
if (!code.includes('useTranslation')) {
    code = code.replace(
        "import { useLocation } from 'react-router-dom';",
        "import { useLocation } from 'react-router-dom';\nimport { useTranslation } from 'react-i18next';"
    );
}

// 2. Hooks and Auto-select useEffect
const hookReplaceTarget = '  const [lastServerFile, setLastServerFile] = useState(null);';
const newHooks = `  const { t, i18n } = useTranslation();
  const [hoveredCoords, setHoveredCoords] = useState(null);
  const [singularities, setSingularities] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    if (headers && headers.length > 0) {
      const lowerHdrs = headers.map(h => (h || '').toLowerCase());
      if (lowerHdrs.includes('km')) setSelectedX(headers[lowerHdrs.indexOf('km')]);
      else setSelectedX(headers[0]);
      
      const ys = headers.filter(h => {
        const lh = (h || '').toLowerCase();
        return !['km', 'id', 'lat', 'lon', 'latitudine', 'longitudine'].includes(lh) && !lh.startsWith('date');
      });
      setSelectedYs(ys);
    }
  }, [headers]);
`;
if (!code.includes('const { t, i18n } = useTranslation();')) {
    code = code.replace(hookReplaceTarget, hookReplaceTarget + '\n\n' + newHooks);
}

// 3. chartOptions
const old_opts = /const chartOptions = useMemo\(\(\) => \(\{[\s\S]*?\}\), \[\]\);/;
const new_opts = `const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    onHover: (event, activeElements) => {
      if (activeElements && activeElements.length > 0) {
        const idx = activeElements[0].index;
        const source = (sampledRows && sampledRows.length > 0 && useSampling) ? sampledRows : csvData;
        if (source && source[idx]) {
          const row = source[idx];
          const lat = row['Latitudine'] || row['Lat'] || row['lat'];
          const lon = row['Longitudine'] || row['Lon'] || row['lon'];
          if (lat && lon) {
            setHoveredCoords({ lat, lon });
          }
        }
      }
    },
    plugins: {
      legend: { position: 'top' },
      title: { display: false },
    },
    scales: {
      x: { display: true },
      y: { display: true, ticks: { maxTicksLimit: 6 } }
    }
  }), [csvData, sampledRows, useSampling]);`;
code = code.replace(old_opts, new_opts);


// 4. Update Header for i18n
code = code.replace(
    /<h2 className="text-2xl font-bold text-slate-800 flex items-center">/,
    `<div className="flex justify-between items-center w-full">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center">`
);
code = code.replace(
    /<p className="text-slate-500 mt-1">Visualize and explore your CSV data<\/p>/,
    `<p className="text-slate-500 mt-1">Visualize and explore your CSV data</p>
          </div>
          <div className="flex gap-4 items-center">
            <select 
              value={i18n ? i18n.language : 'it'} 
              onChange={e => i18n && i18n.changeLanguage(e.target.value)}
              className="border-slate-300 rounded text-sm px-2 py-1"
            >
              <option value="it">Italiano</option>
              <option value="en">English</option>
              <option value="zh">中文</option>
            </select>
          </div>
        </div>`
);


// 5. Hide X-axis and Y-series UI blocks
code = code.replace(
  /<div>\s*<label className="block text-sm font-medium text-slate-700 mb-1">X-axis<\/label>/g,
  '<div className="hidden">\n            <label className="block text-sm font-medium text-slate-700 mb-1">X-axis</label>'
);
code = code.replace(
  /<div>\s*<label className="block text-sm font-medium text-slate-700 mb-1">Y-series \(toggle multiple\)<\/label>/g,
  '<div className="hidden">\n            <label className="block text-sm font-medium text-slate-700 mb-1">Y-series (toggle multiple)</label>'
);


// 6. Add Map next to charts
// We change the grid for the main layout to include the map
// Let's find: <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
// Wait, the grid for the chart is actually lower down!
// Find the block rendering the charts:
const chartGridStart = '{selectedX && selectedYs.length > 0 ? (';
const map_div = `
        <div className="bg-white rounded-xl shadow-md overflow-hidden min-h-[300px] flex flex-col">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between">
             <h3 className="text-md font-medium text-slate-700 flex items-center gap-2">
               Posizione Veicolo (Mappa)
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
                  Dati Lat/Lon non disponibili per questo punto.
                </div>
             )}
          </div>
        </div>
`;

// Original was:
//      {selectedX && selectedYs.length > 0 ? (
//        <div className="relative bg-white rounded-xl shadow-md overflow-hidden mb-6 p-6" style={{ height: 420 }}>
//          <Line options={chartOptions} data={chartData} />
//        </div>
//      ) : (
//
// We want to put the chart and the map side-by-side in a grid!
code = code.replace(
  /      \{selectedX && selectedYs\.length > 0 \? \(\s*<div className="relative bg-white rounded-xl shadow-md overflow-hidden mb-6 p-6" style=\{\{ height: 420 \}\}>\s*<Line options=\{chartOptions\} data=\{chartData\} \/>\s*<\/div>\s*\) : \(/,
  `      {selectedX && selectedYs.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="relative bg-white rounded-xl shadow-md overflow-hidden p-6" style={{ height: 420 }}>
            <Line options={chartOptions} data={chartData} />
          </div>
          ${map_div}
        </div>
      ) : (`
);


// 7. Context Menu for singularities (inject near the top of the main container)
const singolarita_menu = `
          {/* Context Menu for Singularities */}
          {contextMenu && (
            <div 
              className="absolute bg-white rounded-lg shadow-xl border border-slate-200 z-50 overflow-hidden"
              style={{ left: contextMenu.x + 20, top: Math.max(contextMenu.y - 50, 10) }}
            >
              <div className="bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 border-b border-slate-200 flex justify-between items-center">
                <span>Km: {contextMenu.kmLabel}</span>
                <button onClick={() => setContextMenu(null)} className="ml-4 text-slate-400 hover:text-slate-700">&times;</button>
              </div>
              <ul className="py-1">
                {[
                  { type: 'Semaforo', icon: '🚦' },
                  { type: 'Passaggio a livello', icon: '🚧' },
                  { type: 'Fabbricato viaggiatori', icon: '🏢' },
                  { type: 'Scambio', icon: '🛤️' },
                  { type: 'Cippo', icon: '📍' },
                ].map(item => (
                  <li key={item.type}>
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 flex items-center gap-2"
                      onClick={() => {
                        setSingularities(prev => [...prev, { km: contextMenu.kmLabel, type: item.type, icon: item.icon }]);
                        setContextMenu(null);
                      }}
                    >
                      <span>{item.icon}</span> {item.type}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
`;

if (!code.includes('Context Menu for Singularities')) {
    code = code.replace(
      '<div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">',
      '<div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 relative">' + singolarita_menu
    );
}

// Ensure .geo is supported
code = code.replace(/accept="\.csv"/g, 'accept=".csv,.geo"');

fs.writeFileSync('frontend_webbone/src/pages/DataVizualizer.jsx', code);
console.log("Successfully rebuilt DataVizualizer.jsx with all features!");
