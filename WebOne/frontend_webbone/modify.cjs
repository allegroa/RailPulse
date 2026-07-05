const fs = require('fs');

let content = fs.readFileSync('D:/004_Software/WebOne/frontend_webbone/src/pages/DataVizualizer.jsx', 'utf-8');

const currentSourceCode = `
  const currentSource = useMemo(() => {
    let src = (sampledRows && sampledRows.length > 0 && useSampling) ? sampledRows : csvData;
    if (kmRange && selectedX) {
      src = src.filter(row => {
        const v = Number(String(row[selectedX] || '').replace(',', '.'));
        if (isNaN(v)) return false;
        return v >= kmRange.min && v <= kmRange.max;
      });
    }
    return src;
  }, [csvData, sampledRows, useSampling, kmRange, selectedX]);
`;
content = content.replace('const chartData = useMemo(() => {', currentSourceCode + '\n  const chartData = useMemo(() => {');

content = content.replace(
  /let source = [^;]+;\s*\/\/ Apply km range filter[\s\S]+?const labels = source\.map[^;]+;/m,
  ''
);

content = content.replace(
  /data: source\.map\(row => { const v = row\[col\]; const n = Number\(String\(v\)\.replace\(',', '\.'\)\); return isNaN\(n\) \? null : n; }\),/g,
  `data: currentSource.map(row => { 
          const vx = Number(String(row[selectedX] || '').replace(',', '.'));
          const vy = Number(String(row[col] || '').replace(',', '.'));
          if(isNaN(vx) || isNaN(vy)) return null;
          return { x: vx, y: vy };
        }).filter(Boolean),`
);

content = content.replace(
  /const source = \(sampledRows[\s\S]+?selectedYs\.forEach\(col => {/m,
  'selectedYs.forEach(col => {'
);
content = content.replace(/source\.forEach\(row => {/g, 'currentSource.forEach(row => {');

content = content.replace(
  /x: { \s*display: true,\s*title: {/m,
  "x: { type: 'linear', display: true, title: {"
);

content = content.replace(
  /xMin: s\.km,\s*xMax: s\.km,/g,
  "xMin: parseFloat(String(s.km).replace(',', '.')), xMax: parseFloat(String(s.km).replace(',', '.')),"
);

const hoverCode = `
        onHover: (e, elements, chart) => {
          if (elements && elements.length > 0) {
            const index = elements[0].index;
            const row = currentSource[index];
            if (row) {
              let latKey = Object.keys(row).find(k => k.toLowerCase().includes('lat'));
              let lonKey = Object.keys(row).find(k => k.toLowerCase().includes('lon'));
              if (latKey && lonKey) {
                const lat = parseFloat(String(row[latKey]).replace(',', '.'));
                const lon = parseFloat(String(row[lonKey]).replace(',', '.'));
                if (!isNaN(lat) && !isNaN(lon)) {
                  setHoveredCoords({ lat, lon });
                }
              }
            }
          }
        },
        onClick: (e, elements, chart) => {
`;
content = content.replace(/onClick: \(e, elements, chart\) => {/, hoverCode);

content = content.replace(
  /const kmLabel = chart\.data\.labels\[xIndex\];[\s\S]+?setContextMenu\({ x: e\.x, y: e\.y, kmLabel }\);/,
  `const kmValue = chart.scales.x.getValueForPixel(e.x);
             setContextMenu({ x: e.x, y: e.y, kmLabel: kmValue.toFixed(3) });`
);

content = content.replace(
  /const \[tolerances, setTolerances\] = useState/m,
  "const [hoveredCoords, setHoveredCoords] = useState(null);\n  const [tolerances, setTolerances] = useState"
);

content = content.replace(
  /\{\/\* Info card: parsed metadata key\/value pairs \*\/\}/g,
  ''
);

const layoutRegex = /\{infoPairs && infoPairs\.length > 0 && \([\s\S]+?<h3 className="text-lg font-medium text-slate-700">Data \/ Chart Configuration<\/h3>/m;
const newLayout = `
      {/* 2-Column Layout for Info, Config and Map */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Left Column: Info and Config (Stacked) */}
        <div className="flex flex-col gap-6">
          {infoPairs && infoPairs.length > 0 && (
            <div className="bg-white rounded-xl shadow-md overflow-y-auto max-h-64">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between sticky top-0">
                <h3 className="text-md font-medium text-slate-700">Info</h3>
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
              <h3 className="text-md font-medium text-slate-700">Data / Chart Configuration</h3>
`;
content = content.replace(layoutRegex, newLayout);

const mapInsertRegex = /<div className="bg-white rounded-xl shadow-md overflow-visible mb-6 p-6"/;
const mapCode = `
        </div> {/* End of Left Column */}

        {/* Right Column: Google Maps */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden min-h-[300px] flex flex-col">
          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between">
             <h3 className="text-md font-medium text-slate-700 flex items-center gap-2">
               <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
               Mappa (GPS)
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
                  Passa il mouse sul grafico per aggiornare la posizione.
                </div>
             )}
          </div>
        </div>

      </div> {/* End of 2-Column Layout */}

      <div className="bg-white rounded-xl shadow-md overflow-visible mb-6 p-6"
`;
content = content.replace(mapInsertRegex, mapCode);

content = content.replace(/useSampling, kmRange, tolerances\]\);/, 'useSampling, kmRange, tolerances, currentSource]);');
content = content.replace(/useSampling, kmRange, selectedX\]\);/g, 'useSampling, kmRange, selectedX, currentSource]);');

// Multilanguage injections
content = content.replace(/import \{ useLocation \} from 'react-router-dom';/, "import { useLocation } from 'react-router-dom';\nimport { useTranslation } from 'react-i18next';");
content = content.replace(/const location = useLocation\(\);/, "const { t, i18n } = useTranslation();\n  const location = useLocation();");

// Replace some strings with translations
content = content.replace(/>Data Visualizer</, ">{t('appTitle')}<");
content = content.replace(/>Importa file</, ">{t('importFile')}<"); // or Load local
content = content.replace(/>Load local</, ">{t('importFile')}<");
content = content.replace(/>Upload to server</, ">{t('loadServer')}<"); // fallback
content = content.replace(/>Info<\/h3>/, ">{t('infoTitle')}</h3 >");
content = content.replace(/>Data \/ Chart Configuration<\/h3>/, ">{t('configTitle')}</h3 >");
content = content.replace(/>Report Difetti e Tolleranze \(EN 13231-3\)<\/h3>/, ">{t('defectsTitle')}</h3 >");
content = content.replace(/>Tolleranza \(± mm\):<\/span>/, ">{t('tolerance')} (± mm):</span>");
content = content.replace(/>Campioni val.:<\/span>/, ">{t('samples')}:</span>");
content = content.replace(/>Fuori Limite:<\/span>/, ">{t('outOfBounds')}:</span>");
content = content.replace(/>Percentuale:<\/span>/, ">{t('percentage')}:</span>");
content = content.replace(/>Mappa \(GPS\)<\/h3>/, ">{t('mapTitle')}</h3 >");
content = content.replace(/>Passa il mouse sul grafico per aggiornare la posizione.<\/div>/, ">{t('noLocation')}</div>");

// Top-right language switcher
const langSwitcher = `
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
`;
content = content.replace(/<\/p>\s*<\/div>/, "</p>\n" + langSwitcher);

fs.writeFileSync('D:/004_Software/WebOne/frontend_webbone/src/pages/DataVizualizer.jsx', content);
console.log('Modifications completed.');
