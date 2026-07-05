const fs = require('fs');
let text = fs.readFileSync('D:/004_Software/WebOne/frontend_webbone/scratch_return.txt', 'utf-8');

// remove all { ... } blocks to ignore JSX expressions (simplified)
let simplified = text;
while (true) {
  let next = simplified.replace(/\{[^{}]*\}/g, '');
  if (next === simplified) break;
  simplified = next;
}

// now extract all <div...> and </div>
const tags = [...simplified.matchAll(/<\/?div[^>]*>/g)].map(m => m[0]);
let depth = 0;
for (let i = 0; i < tags.length; i++) {
  if (tags[i].startsWith('<div')) depth++;
  else if (tags[i].startsWith('</div')) depth--;
  if (depth < 0) { console.log('Too many closing divs at index ' + i); break; }
}
console.log('Final depth:', depth);
