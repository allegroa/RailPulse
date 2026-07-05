const fs = require('fs');
const code = fs.readFileSync('frontend_webbone/src/pages/DataVizualizer.jsx', 'utf8');
console.log('divs:', (code.match(/<div/g) || []).length);
console.log('/divs:', (code.match(/<\/div>/g) || []).length);
