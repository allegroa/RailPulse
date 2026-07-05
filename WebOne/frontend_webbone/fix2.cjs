const fs = require('fs');
let content = fs.readFileSync('D:/004_Software/WebOne/frontend_webbone/src/pages/DataVizualizer.jsx', 'utf-8');
content = content.replace(/<\/div>\s*<\/>/, '</div></div></div></div>\n</>');
fs.writeFileSync('D:/004_Software/WebOne/frontend_webbone/src/pages/DataVizualizer.jsx', content);
console.log('Added 3 closing divs');
