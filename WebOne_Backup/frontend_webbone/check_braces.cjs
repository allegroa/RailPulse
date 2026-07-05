const fs = require('fs');
let content = fs.readFileSync('D:/004_Software/WebOne/frontend_webbone/src/pages/DataVizualizer.jsx', 'utf-8');

// A simple stack to find unbalanced braces
let stack = [];
for (let i = 0; i < content.length; i++) {
  if (content[i] === '{') stack.push({line: content.substring(0, i).split('\n').length, char: '{'});
  if (content[i] === '}') {
    if (stack.length === 0) { console.log('Unmatched } at line', content.substring(0, i).split('\n').length); break; }
    stack.pop();
  }
}
if (stack.length > 0) {
  console.log('Unclosed braces remaining:', stack.map(s => s.line).join(', '));
} else {
  console.log('Braces {} are balanced.');
}
