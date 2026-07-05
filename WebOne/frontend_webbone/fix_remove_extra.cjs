const fs = require('fs');
let content = fs.readFileSync('D:/004_Software/WebOne/frontend_webbone/src/pages/DataVizualizer.jsx', 'utf-8');
content = content.replace(/<\/div><\/div>\r?\n    <\/div>\r?\n  <\/div>\r?\n  \);\r?\n\}/, '    </div>\n  </div>\n  );\n}');
fs.writeFileSync('D:/004_Software/WebOne/frontend_webbone/src/pages/DataVizualizer.jsx', content);
console.log('Removed 2 extra divs');
