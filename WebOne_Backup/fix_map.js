const fs = require('fs');
let code = fs.readFileSync('frontend_webbone/src/pages/DataVizualizer.jsx', 'utf-8');

const map_div = `<div className="bg-white rounded-xl shadow-md overflow-hidden min-h-[300px] flex flex-col">
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

code = code.replace('<div className="p-6 grid grid-cols-1 gap-6">', '<div className="flex flex-col gap-6">\n          <div className="p-6 grid grid-cols-1 gap-6">');
code = code.replace(/\) : null\}\s*<\/div>\s*<\/div>/, ') : null}\n        </div></div>\n        ' + map_div + '\n      </div>\n');

fs.writeFileSync('frontend_webbone/src/pages/DataVizualizer.jsx', code);
