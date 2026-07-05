const fs = require('fs');
const parser = require('@babel/parser');
let content = fs.readFileSync('D:/004_Software/WebOne/frontend_webbone/src/pages/DataVizualizer.jsx', 'utf-8');

try {
  parser.parse(content, {
    sourceType: 'module',
    plugins: ['jsx']
  });
  console.log('Parsed successfully!');
} catch (e) {
  console.error('Syntax Error at line', e.loc.line, 'column', e.loc.column);
  console.error(e.message);
  const lines = content.split('\n');
  console.error('Line:', lines[e.loc.line - 1]);
}
