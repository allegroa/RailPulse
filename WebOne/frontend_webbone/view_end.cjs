const fs = require('fs');
let content = fs.readFileSync('D:/004_Software/WebOne/frontend_webbone/src/pages/DataVizualizer.jsx', 'utf-8');
const lines = content.split('\n');
console.log(lines.slice(-30).join('\n'));
