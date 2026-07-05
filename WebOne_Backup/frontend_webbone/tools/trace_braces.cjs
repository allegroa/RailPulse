const fs = require('fs');
const path = process.argv[2];
if (!path) { console.error('Usage: node trace_braces.cjs <file>'); process.exit(2); }
const s = fs.readFileSync(path, 'utf8');
let line=1, col=0, braceCount=0;
let state='code';
for (let i=0;i<s.length;i++){
  const ch=s[i];
  if (ch==='\n'){ line++; col=0; continue; }
  col++;
  if (state==='code'){
    if (ch==='"'){ state='double'; continue; }
    if (ch==="'"){ state='single'; continue; }
    if (ch==='`'){ state='back'; continue; }
    if (ch==='/' && s[i+1]=='/') { state='line'; i++; continue; }
    if (ch==='/' && s[i+1]=='*') { state='block'; i++; continue; }
    if (ch==='{') braceCount++;
    if (ch==='}') braceCount--;
    if (braceCount < 0){
      console.log(`Negative brace at ${line}:${col}`);
      // print context lines
      const lines = s.split(/\r?\n/);
      const start = Math.max(0, line-4);
      const end = Math.min(lines.length, line+2);
      console.log('Context:');
      for (let ln = start; ln < end; ln++){
        console.log(`${ln+1}: ${lines[ln]}`);
      }
      process.exit(0);
    }
  } else if (state==='double'){ if (ch==='\\'){ i++; continue; } if (ch==='"') state='code'; }
  else if (state==='single'){ if (ch==='\\'){ i++; continue; } if (ch==="'") state='code'; }
  else if (state==='back'){ if (ch==='\\'){ i++; continue; } if (ch==='`') state='code'; }
  else if (state==='line'){ if (ch==='\n') state='code'; }
  else if (state==='block'){ if (ch==='*' && s[i+1]==='/'){ i++; state='code'; } }
}
console.log('Done. final braceCount=', braceCount);
