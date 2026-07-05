const fs = require('fs');
const path = process.argv[2];
if (!path) { console.error('Usage: node paren_check.cjs <file>'); process.exit(2); }
const s = fs.readFileSync(path, 'utf8');
let line=1, col=0;
let openParens=0, openBraces=0, openBrackets=0;
let state='code';
for (let i=0;i<s.length;i++){
  const ch = s[i];
  if (ch==='\n'){ line++; col=0; continue; }
  col++;
  if (state==='code'){
    if (ch==='"'){ state='double'; continue; }
    if (ch==="'"){ state='single'; continue; }
    if (ch==='`'){ state='back'; continue; }
    if (ch==='/' && s[i+1]=='/') { state='line'; i++; continue; }
    if (ch==='/' && s[i+1]=='*') { state='block'; i++; continue; }
    if (ch==='(') openParens++;
    if (ch===')') openParens--;
    if (ch==='{') openBraces++;
    if (ch==='}') openBraces--;
    if (ch==='[') openBrackets++;
    if (ch===']') openBrackets--;
    if (openParens<0 || openBraces<0 || openBrackets<0) {
      console.log(`Negative at ${line}:${col} after '${ch}' — parens:${openParens}, braces:${openBraces}, brackets:${openBrackets}`);
      process.exit(0);
    }
  } else if (state==='double'){ if (ch==='\\'){ i++; continue; } if (ch==='"') state='code'; }
  else if (state==='single'){ if (ch==='\\'){ i++; continue; } if (ch==="'") state='code'; }
  else if (state==='back'){ if (ch==='\\'){ i++; continue; } if (ch==='`') state='code'; }
  else if (state==='line'){ if (ch==='\n') state='code'; }
  else if (state==='block'){ if (ch==='*' && s[i+1]==='/'){ i++; state='code'; } }
}
console.log('Finished scan — counts', {openParens, openBraces, openBrackets});
if (openParens===0 && openBraces===0 && openBrackets===0) console.log('All balanced');
else console.log('Unbalanced counts remain');
