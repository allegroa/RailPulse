const fs = require('fs');
const path = 'C:/Users/user/.gemini/antigravity/brain/69661e3c-05f3-4f01-b4fb-a5a67c84c5ee/.system_generated/logs/transcript.jsonl';
const lines = fs.readFileSync(path, 'utf-8').split('\n');

for (let i = lines.length - 1; i >= 0; i--) {
  if (!lines[i]) continue;
  try {
    const obj = JSON.parse(lines[i]);
    if (obj.tool_calls) {
      for (const call of obj.tool_calls) {
        if (call.function && call.function.name === 'write_to_file') {
          const args = JSON.parse(call.function.arguments);
          if (args.TargetFile && args.TargetFile.includes('DataVizualizer.jsx') && !args.TargetFile.includes('broken')) {
            console.log('Found write_to_file for DataVizualizer.jsx at step', obj.step_index);
            fs.writeFileSync('D:/004_Software/WebOne/frontend_webbone/recovered_DataVizualizer.jsx', args.CodeContent);
            console.log('Recovered to recovered_DataVizualizer.jsx');
            process.exit(0);
          }
        }
      }
    }
  } catch(e) {}
}
console.log('Not found in write_to_file');
