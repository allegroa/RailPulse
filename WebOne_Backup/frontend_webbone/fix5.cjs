const fs = require('fs');
let content = fs.readFileSync('D:/004_Software/WebOne/frontend_webbone/src/pages/DataVizualizer.jsx', 'utf-8');
content = content.replace(/return \(\s*<>\r?\n/, 'return (\n');
content = content.replace(/<\/div>\r?\n<\/>\r?\n\s*\);\}/, '</div></div>\n);}');
fs.writeFileSync('D:/004_Software/WebOne/frontend_webbone/src/pages/DataVizualizer.jsx', content);
console.log('Removed Fragments');
