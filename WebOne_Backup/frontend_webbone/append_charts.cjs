const fs = require('fs');
let scratch = fs.readFileSync('D:/004_Software/WebOne/frontend_webbone/scratch_return.txt', 'utf-8');

const chartsStart = scratch.indexOf('{selectedX ? (');

if (chartsStart !== -1) {
  let chartsBlock = scratch.substring(chartsStart);
  
  // Clean up the trailing garbage from scratch
  chartsBlock = chartsBlock.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\r?\n\s*\);\}/, '');
  chartsBlock = chartsBlock.replace(/<\/div>\r?\n<\/>\r?\n\s*\);\}/, '');
  chartsBlock = chartsBlock.replace(/<\/div>\s*\);\s*\}/g, '');
  chartsBlock = chartsBlock.replace(/<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*\);\s*\}/g, '');
  
  // Remove ALL forms of trailing layout closures from scratch so we just get the inner JSX.
  let cleanBlock = chartsBlock;
  let idx = cleanBlock.lastIndexOf(')}');
  if (idx !== -1) {
     cleanBlock = cleanBlock.substring(0, idx + 2); // keep the )}
  }
  
  // Now read the current DataVizualizer
  let content = fs.readFileSync('D:/004_Software/WebOne/frontend_webbone/src/pages/DataVizualizer.jsx', 'utf-8');
  
  // We want to insert the chartsBlock right before the closing     </div>\n  </div>\n  );\n}
  // Let's replace the placeholder "Sostituire la configurazione qui" first
  content = content.replace(/<div className="text-sm text-slate-600">Sostituire la configurazione qui<\/div>/, '{/* Configura */}\n          <div className="grid grid-cols-2 gap-4 mt-4">\n            <div>\n              <div className="text-sm text-slate-500 mb-1">Parametro Base (X)</div>\n              <select className="w-full border-slate-300 rounded-md shadow-sm" value={selectedX} onChange={e => setSelectedX(e.target.value)}>\n                <option value="">{t(\'selectX\')}</option>\n                {headers.map(h => <option key={h} value={h}>{h}</option>)}\n              </select>\n            </div>\n            <div>\n              <div className="text-sm text-slate-500 mb-1">Cartella corrente:</div>\n              <div className="text-sm text-slate-700 font-medium truncate">{currentFolder}</div>\n            </div>\n          </div>');
  
  let newContent = content.replace(/    <\/div>\r?\n  <\/div>\r?\n  \);\r?\n\}/, '\n      ' + cleanBlock + '\n    </div>\n  </div>\n  );\n}');
  
  fs.writeFileSync('D:/004_Software/WebOne/frontend_webbone/src/pages/DataVizualizer.jsx', newContent);
  console.log('Appended charts block');
} else {
  console.log('Could not find charts start');
}
