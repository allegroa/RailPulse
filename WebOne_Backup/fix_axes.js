const fs = require('fs');
let code = fs.readFileSync('frontend_webbone/src/pages/DataVizualizer.jsx', 'utf-8');

const targetState = '  const [lastServerFile, setLastServerFile] = useState(null);';
const useEffectCode = `
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
if (!code.includes('if (lowerHdrs.includes(\\\'km\\\')) setSelectedX')) {
  code = code.replace(targetState, targetState + '\n' + useEffectCode);
}

const xAxisTarget = '<label className="block text-sm font-medium text-slate-700 mb-1">X-axis</label>';
code = code.replace(
  '<div>\\n            ' + xAxisTarget,
  '<div className="hidden">\\n            ' + xAxisTarget
);

// Sometimes spaces are different, let's just use string replace on the exact substring or regex
code = code.replace(
  /<div>\s*<label className="block text-sm font-medium text-slate-700 mb-1">X-axis<\/label>/,
  '<div className="hidden">\n            <label className="block text-sm font-medium text-slate-700 mb-1">X-axis</label>'
);

code = code.replace(
  /<div>\s*<label className="block text-sm font-medium text-slate-700 mb-1">Y-series \(toggle multiple\)<\/label>/,
  '<div className="hidden">\n            <label className="block text-sm font-medium text-slate-700 mb-1">Y-series (toggle multiple)</label>'
);

// Allow .geo
code = code.replace(/accept="\.csv"/g, 'accept=".csv,.geo"');

fs.writeFileSync('frontend_webbone/src/pages/DataVizualizer.jsx', code);
console.log("Done modifying axes and useEffect.");
