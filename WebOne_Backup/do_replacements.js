const fs = require('fs');
let code = fs.readFileSync('frontend_webbone/src/pages/DataVizualizer.jsx', 'utf-8');

// 1. Imports
if (!code.includes('useTranslation')) {
    code = code.replace(
        "import { useLocation } from 'react-router-dom';",
        "import { useLocation } from 'react-router-dom';\nimport { useTranslation } from 'react-i18next';"
    );
}

// 2. Hooks
if (!code.includes('const { t, i18n } = useTranslation();')) {
    code = code.replace(
        'export default function DataVisualizer() {',
        'export default function DataVisualizer() {\n  const { t, i18n } = useTranslation();\n  const [hoveredCoords, setHoveredCoords] = useState(null);\n  const [singularities, setSingularities] = useState([]);\n  const [contextMenu, setContextMenu] = useState(null);\n  const [defectStats, setDefectStats] = useState({});\n  const [tolerances, setTolerances] = useState({});'
    );
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

// 4. Update the layout
// We find the grid layout opening:
code = code.replace(
  '<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">',
  '<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">\n        <div className="flex flex-col gap-6">'
);

// Close the flex column before the Google Map block:
const map_div = `</div>\n        <div className="bg-white rounded-xl shadow-md overflow-hidden min-h-[300px] flex flex-col">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between">
             <h3 className="text-md font-medium text-slate-700 flex items-center gap-2">
               {t ? t('mapTitle') : 'Posizione Veicolo (Mappa)'}
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
                  {t ? t('noLocation') : 'Dati Lat/Lon non disponibili'}
                </div>
             )}
          </div>
        </div>`;

// Find where "Server files (upload/)" block ends and insert map
// It ends right before:
//       {/* Upload confirmation modal */}
// BUT actually we just want to insert the map_div before the end of the grid-cols-1 lg:grid-cols-2 div.
// That div is closed before "      {selectedX ? (".
code = code.replace(
  /        <\/div>\n      <\/div>\n\n\n      \{selectedX \? \(/,
  `        </div>\n${map_div}\n      </div>\n\n      {selectedX ? (`
);

// Language Selector header update
code = code.replace(
    '<h2 className="text-2xl font-bold text-slate-800 flex items-center">',
    `<div className="flex justify-between items-center w-full">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center">`
);
code = code.replace(
    '<p className="text-slate-500 mt-1">Visualize and explore your CSV data</p>',
    `<p className="text-slate-500 mt-1">Visualize and explore your CSV data</p>
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
        </div>`
);

// Singolarita Context menu injection
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
                  { type: 'Fabbricato viaggiatori', icon: '🚉' },
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

code = code.replace(
  '<div style={{ height: \'100%\' }}>',
  `${singolarita_menu}\n          <div style={{ height: '100%' }}>`
);


fs.writeFileSync('frontend_webbone/src/pages/DataVizualizer.jsx', code);
