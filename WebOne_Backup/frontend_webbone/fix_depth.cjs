const fs = require('fs');
let content = fs.readFileSync('D:/004_Software/WebOne/frontend_webbone/src/pages/DataVizualizer.jsx', 'utf-8');
content = content.replace(/    <\/div>\r?\n  <\/div>\r?\n  \);\r?\n\}/, '</div></div>\n    </div>\n  </div>\n  );\n}');
fs.writeFileSync('D:/004_Software/WebOne/frontend_webbone/src/pages/DataVizualizer.jsx', content);
console.log('Added 2 divs');
