const fs = require('fs');

const path = 'frontend_webbone/src/pages/DataVizualizer.jsx';
let lines = fs.readFileSync(path, 'utf8').split('\n');

// Find the line that has "}}>rename</button>" inside headers.map
let renameIndex = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('}}>rename</button>')) {
    renameIndex = i;
    // We want the last one, just in case there are multiple
  }
}

// The bad block starts right after the LAST renameIndex.
// The bad block ends at the line before `{/* Top-Right Menu per Y-Series e Altre Azioni */}`
let topMenuIndex = -1;
for (let i = renameIndex; i < lines.length; i++) {
  if (lines[i].includes('{/* Top-Right Menu per Y-Series e Altre Azioni */}')) {
    topMenuIndex = i;
    break;
  }
}

// We will replace everything between renameIndex (exclusive) and topMenuIndex (exclusive) with the correct layout closing tags and Map Column.

const correctCode = `                </label>
              ))}
            </div>
          </div>
          
        </div>
      </div>
        </div>
        {/* Google Maps Column */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden min-h-[300px] flex flex-col">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-slate-700">Google Maps</h3>
          </div>
          <div className="flex-1 p-0 relative min-h-[300px]">
            {hoveredCoords ? (
              <iframe
                title="Google Maps"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={\`https://maps.google.com/maps?q=\${hoveredCoords.lat},\${hoveredCoords.lon}&hl=es;z=14&output=embed\`}
              ></iframe>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                <svg className="w-12 h-12 mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p>Mostra posizione su hover del grafico</p>
              </div>
            )}
          </div>
        </div>
      </div>


      {selectedX && selectedYs.length > 0 ? (
        <>
        <div className="relative bg-white rounded-xl shadow-md overflow-hidden mb-6 p-6" style={{ height: 420 }}>`;

// Construct new lines
const newLines = [
  ...lines.slice(0, renameIndex + 1),
  correctCode,
  ...lines.slice(topMenuIndex)
];

// Wait, I also need to make sure the end of the file is correct.
// In the current file, after Context Menu for Singularities, it goes:
// `</svg>\n</div>\n<div className="ml-3">\n<p className="text-sm text-blue-700">`
// Wait, NO! Look at lines 1134: `</svg>` - This is the "Select both X and Y axis columns" message!
// What happened to the ChartErrorBoundary and the Chart Area???
// IT GOT DELETED!!!
fs.writeFileSync(path, newLines.join('\n'), 'utf8');
console.log('Fixed syntax, but checking if chart area is missing.');
