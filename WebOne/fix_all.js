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
        'export default function DataVizualizer() {',
        'export default function DataVizualizer() {\n  const { t, i18n } = useTranslation();\n  const [hoveredCoords, setHoveredCoords] = useState(null);'
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

fs.writeFileSync('frontend_webbone/src/pages/DataVizualizer.jsx', code);
