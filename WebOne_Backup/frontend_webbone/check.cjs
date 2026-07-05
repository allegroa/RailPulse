const fs = require('fs');
let content = fs.readFileSync('D:/004_Software/WebOne/frontend_webbone/src/pages/DataVizualizer.jsx', 'utf-8');

// The file is currently broken. Let's count the number of <div> and </div>
const opens = (content.match(/<div/g) || []).length;
const closes = (content.match(/<\/div>/g) || []).length;
console.log('opens:', opens, 'closes:', closes);
