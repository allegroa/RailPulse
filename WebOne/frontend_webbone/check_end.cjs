const fs = require('fs');
let content = fs.readFileSync('D:/004_Software/WebOne/frontend_webbone/src/pages/DataVizualizer.jsx', 'utf-8');
const lines = content.split('\n');
for (let i = lines.length - 15; i < lines.length; i++) {
  console.log((i + 1) + ': ' + lines[i]);
}
