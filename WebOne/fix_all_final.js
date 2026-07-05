const fs = require('fs');
let code = fs.readFileSync('frontend_webbone/src/pages/DataVizualizer.jsx', 'utf-8');

const hookReplaceTarget = '  const [lastServerFile, setLastServerFile] = useState(null);';
const newHooks = `  const [hoveredCoords, setHoveredCoords] = useState(null);

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
if (!code.includes('setHoveredCoords')) {
    code = code.replace(hookReplaceTarget, hookReplaceTarget + '\n\n' + newHooks);
}

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

code = code.replace(
  /<div>\s*<label className="block text-sm font-medium text-slate-700 mb-1">X-axis<\/label>/g,
  '<div className="hidden">\n            <label className="block text-sm font-medium text-slate-700 mb-1">X-axis</label>'
);
code = code.replace(
  /<div>\s*<label className="block text-sm font-medium text-slate-700 mb-1">Y-series \(toggle multiple\)<\/label>/g,
  '<div className="hidden">\n            <label className="block text-sm font-medium text-slate-700 mb-1">Y-series (toggle multiple)</label>'
);

const mapRegex = /\{\s*selectedX && selectedYs\.length > 0 \? \(\s*<div className="relative bg-white rounded-xl shadow-md overflow-hidden mb-6 p-6" style=\{\{\s*height:\s*420\s*\}\}>/;
const mapStartReplacement = `{selectedX && selectedYs.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="relative bg-white rounded-xl shadow-md overflow-hidden p-6" style={{ height: 420 }}>`;
code = code.replace(mapRegex, mapStartReplacement);

const endChartRegex = /        <\/div>\s*\)\s*:\s*\(/;
const mapEndReplacement = `        </div>
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
      </div>
      ) : (`
code = code.replace(endChartRegex, mapEndReplacement);

code = code.replace(/accept="\.csv"/g, 'accept=".csv,.geo"');

fs.writeFileSync('frontend_webbone/src/pages/DataVizualizer.jsx', code);
console.log("SUCCESS");
