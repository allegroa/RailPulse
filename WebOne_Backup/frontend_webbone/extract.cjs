const fs = require('fs');
let content = fs.readFileSync('D:/004_Software/WebOne/frontend_webbone/src/pages/DataVizualizer.jsx', 'utf-8');
const retStart = content.indexOf('return (<>');
const retBlock = content.slice(retStart);
fs.writeFileSync('D:/004_Software/WebOne/frontend_webbone/scratch_return.txt', retBlock);
console.log('Done');
