const fs = require('fs');
let content = fs.readFileSync('D:/004_Software/WebOne/frontend_webbone/src/pages/DataVizualizer.jsx', 'utf-8');
const lines = content.split('\n');
console.log('Line 28:', lines[27]);
console.log('Line 40:', lines[39]);
