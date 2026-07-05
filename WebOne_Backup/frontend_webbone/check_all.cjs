const fs = require('fs');
let content = fs.readFileSync('D:/004_Software/WebOne/frontend_webbone/src/pages/DataVizualizer.jsx', 'utf-8');

let pStack = [];
let bStack = [];
let stringChar = null;

for (let i = 0; i < content.length; i++) {
  const c = content[i];
  
  if (stringChar) {
    if (c === '\\') i++; // skip escaped
    else if (c === stringChar) stringChar = null;
    continue;
  }
  
  if (c === '"' || c === "'" || c === '\') {
    stringChar = c;
    continue;
  }
  
  if (c === '(') pStack.push(i);
  if (c === ')') {
    if (pStack.length === 0) { console.log('Unmatched ) at', i); }
    else pStack.pop();
  }
  
  if (c === '{') bStack.push(i);
  if (c === '}') {
    if (bStack.length === 0) { console.log('Unmatched } at', i); }
    else bStack.pop();
  }
}

console.log('Unclosed (: ' + pStack.length);
console.log('Unclosed {: ' + bStack.length);
