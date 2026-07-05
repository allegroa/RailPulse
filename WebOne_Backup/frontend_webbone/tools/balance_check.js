const fs = require('fs');
const path = process.argv[2];
if (!path) { console.error('Usage: node balance_check.js <file>'); process.exit(2); }
const s = fs.readFileSync(path, 'utf8');
let line = 1, col = 0;
let stack = [];
let i = 0;
let state = 'code';
let prev = '';
for (; i < s.length; i++) {
  const ch = s[i];
  col++;
  if (ch === '\n') { line++; col = 0; }
  // handle comments and strings
  if (state === 'code') {
    if (ch === '"') { state = 'double'; continue; }
    if (ch === "'") { state = 'single'; continue; }
    if (ch === '`') { state = 'back'; continue; }
    if (ch === '/' && s[i+1] === '/') { state = 'linecomment'; i++; continue; }
    if (ch === '/' && s[i+1] === '*') { state = 'blockcomment'; i++; continue; }
    if (ch === '{' || ch === '(' || ch === '[') stack.push({ch, line, col});
    if (ch === '}' || ch === ')' || ch === ']') {
      const last = stack.pop();
      if (!last) { console.log(`Unmatched closing ${ch} at ${line}:${col}`); process.exit(0); }
      const opens = { '}':'{', ')':'(', ']':'[' };
      if (last.ch !== opens[ch]) { console.log(`Mismatched ${last.ch} (opened at ${last.line}:${last.col}) vs closing ${ch} at ${line}:${col}`); process.exit(0); }
    }
  } else if (state === 'double') {
    if (ch === '\\' ) { i++; col++; continue; }
    if (ch === '"') state = 'code';
  } else if (state === 'single') {
    if (ch === '\\' ) { i++; col++; continue; }
    if (ch === "'") state = 'code';
  } else if (state === 'back') {
    if (ch === '\\') { i++; col++; continue; }
    if (ch === '`') state = 'code';
  } else if (state === 'linecomment') {
    if (ch === '\n') state = 'code';
  } else if (state === 'blockcomment') {
    if (ch === '*' && s[i+1] === '/') { i++; col++; state = 'code'; }
  }
}
if (stack.length === 0) console.log('All balanced');
else {
  console.log('Unclosed openings:');
  stack.forEach(x => console.log(`${x.ch} opened at ${x.line}:${x.col}`));
}
