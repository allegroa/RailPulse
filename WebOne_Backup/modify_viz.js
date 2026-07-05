const fs = require('fs');

const path = 'frontend_webbone/src/pages/DataVizualizer.jsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add showYMenu state
code = code.replace(
  'const [kmRange, setKmRange] = useState(null); // { min, max } applied',
  'const [kmRange, setKmRange] = useState(null); // { min, max } applied\n  const [showYMenu, setShowYMenu] = useState(false);'
);

// 2. Wrap Info and Config in grid and add Map
code = code.replace(
  '{/* Info card: parsed metadata key/value pairs */}',
  '<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">\n        <div className="flex flex-col gap-6">\n      {/* Info card: parsed metadata key/value pairs */}'
);

code = code.replace(
  '        </div>\n      </div>\n\n\n      {selectedX && selectedYs.length > 0 ? (',
  `        </div>\n      </div>\n        </div>\n        {/* Google Maps Column */}\n        <div className="bg-white rounded-xl shadow-md overflow-hidden min-h-[300px] flex flex-col">\n          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">\n            <h3 className="text-lg font-medium text-slate-700">Google Maps</h3>\n          </div>\n          <div className="flex-1 p-0 relative min-h-[300px]">\n            {hoveredCoords ? (\n              <iframe\n                title="Google Maps"\n                width="100%"\n                height="100%"\n                style={{ border: 0 }}\n                loading="lazy"\n                allowFullScreen\n                src={\`https://maps.google.com/maps?q=\${hoveredCoords.lat},\${hoveredCoords.lon}&hl=es;z=14&output=embed\`}\n              ></iframe>\n            ) : (\n              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-50">\n                <svg className="w-12 h-12 mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">\n                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />\n                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />\n                </svg>\n                <p>Mostra posizione su hover del grafico</p>\n              </div>\n            )}\n          </div>\n        </div>\n      </div>\n\n\n      {selectedX && selectedYs.length > 0 ? (\n        <>`
);

// 3. Hide X selector
code = code.replace(
  '<div>\n            <label className="block text-sm font-medium text-slate-700 mb-1">X-axis</label>',
  '<div className="hidden">\n            <label className="block text-sm font-medium text-slate-700 mb-1">X-axis</label>'
);

// 4. Hide Y selector from Config Card
code = code.replace(
  '<div>\n            <label className="block text-sm font-medium text-slate-700 mb-1">Y-series (toggle multiple)</label>',
  '<div className="hidden">\n            <label className="block text-sm font-medium text-slate-700 mb-1">Y-series (toggle multiple)</label>'
);

// 5. Add Y context menu to chart
code = code.replace(
  '{/* Context Menu for Singularities */}',
  `{/* Top-Right Menu per Y-Series e Altre Azioni */}
          <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
            <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded shadow text-sm flex items-center font-medium border border-slate-300" onClick={() => alert("Funzionalità in arrivo")}>
              Reset Zoom
            </button>
            <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded shadow text-sm flex items-center font-medium border border-slate-300" onClick={() => alert("Funzionalità in arrivo")}>
              Salva DB Linee
            </button>
            <div className="relative">
              <button 
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 w-8 h-8 flex items-center justify-center rounded shadow font-bold border border-slate-300"
                onClick={() => setShowYMenu(!showYMenu)}
              >
                ⋯
              </button>
              {showYMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-md shadow-lg z-50">
                  <div className="px-4 py-2 border-b font-medium text-sm text-slate-700 flex justify-between items-center">
                    Configura Grafici (Asse Y)
                    <button onClick={() => setShowYMenu(false)} className="text-slate-400 hover:text-slate-700">&times;</button>
                  </div>
                  <div className="max-h-60 overflow-auto p-2">
                    {headers.length === 0 ? <div className="text-sm text-slate-500">Nessuna serie disponibile</div> : headers.filter(h => h !== selectedX).map(h => (
                      <label key={h} className="flex items-center gap-2 text-sm py-1.5 px-2 hover:bg-slate-50 cursor-pointer rounded">
                        <input type="checkbox" checked={selectedYs.includes(h)} onChange={() => toggleY(h)} className="rounded border-slate-300" />
                        <span className="truncate">{h}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Context Menu for Singularities */}`
);

// 6. Add Tolerances section and close fragment
const beforeFragmentEnd = `            </div>
          )}
        </div>
        
        {/* EN 13231-3 Defects area */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-slate-700">Report Difetti e Tolleranze (EN 13231-3)</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {selectedYs.map(col => {
              const source = (sampledRows && sampledRows.length > 0 && useSampling) ? sampledRows : csvData;
              const toll = tolerances[col] || 0;
              let count = 0;
              let outOfToll = 0;
              source.forEach(row => {
                const v = parseNumberCell(row[col]);
                if (!isNaN(v)) {
                  count++;
                  if (toll > 0 && Math.abs(v) > toll) outOfToll++;
                }
              });
              const perc = count > 0 ? ((outOfToll / count) * 100).toFixed(1) : 0;
              
              return (
                <div key={col} className="border border-slate-200 rounded p-4 bg-slate-50">
                  <div className="font-semibold text-slate-700 truncate mb-2" title={col}>{col}</div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">Tolleranza (± mm)</span>
                    <input 
                      type="number" min="0" step="0.1" 
                      className="w-16 px-1 py-0.5 border rounded text-xs text-right"
                      value={tolerances[col] || ''}
                      onChange={e => setTolerances(prev => ({ ...prev, [col]: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500">Campioni Validi</span>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500">Fuori Tolleranza</span>
                    <span className={\`text-sm font-medium \${outOfToll > 0 ? 'text-red-600' : 'text-green-600'}\`}>{outOfToll}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">% Difettosità</span>
                    <span className={\`text-sm font-medium \${perc > 5 ? 'text-red-600' : 'text-slate-700'}\`}>{perc}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </>
      ) : (`;

code = code.replace(
  `            </div>\n          )}\n        </div>\n      ) : (`,
  beforeFragmentEnd
);

// Apply dynamic coloring to chart based on tolerances
code = code.replace(
  `      borderColor: ['#0EA5E9','#7C3AED','#F97316','#059669','#EF4444'][idx % 5],
      tension: 0.2,`,
  `      borderColor: ['#0EA5E9','#7C3AED','#F97316','#059669','#EF4444'][idx % 5],
      segment: {
        borderColor: ctx => {
          const toll = tolerances[col];
          if (toll > 0) {
            const p1 = ctx.p0.parsed.y;
            const p2 = ctx.p1.parsed.y;
            if (Math.abs(p1) > toll || Math.abs(p2) > toll) {
              return 'rgb(220, 38, 38)'; // Red for out of tolerance
            }
          }
          return undefined; // default color
        }
      },
      tension: 0.2,`
);

fs.writeFileSync(path, code, 'utf8');
console.log('Modifications applied successfully');
