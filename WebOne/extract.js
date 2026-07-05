const fs = require('fs');
const path = 'C:\\Users\\user\\.gemini\\antigravity\\brain\\2fad3d2c-ebab-4659-8fed-c84a6452b9c3\\.system_generated\\logs\\transcript.jsonl';
const lines = fs.readFileSync(path, 'utf-8').split('\n');
let foundContent = null;

for (const line of lines) {
    if (!line.trim()) continue;
    try {
        const obj = JSON.parse(line);
        if (obj.step_index === 28 && obj.type === 'VIEW_FILE') {
            foundContent = obj.content || obj.output;
            // if content is inside some other field, let's just stringify
            if (!foundContent && obj.result && obj.result.output) {
               foundContent = obj.result.output;
            }
            if (!foundContent && obj.payload) {
               foundContent = obj.payload;
            }
        }
    } catch(e) {}
}

if (!foundContent) {
   console.log("Could not find step 28 or content in it.");
   // Let's try to find ANY view_file of DataVizualizer
   for (const line of lines) {
      if (!line.trim()) continue;
      try {
          const obj = JSON.parse(line);
          const str = JSON.stringify(obj);
          if (str.includes("The following code has been modified to include a line number") && str.includes("DataVizualizer.jsx")) {
             foundContent = str;
          }
      } catch(e) {}
   }
}

if (foundContent) {
    // If it's a JSON stringified object, extract the actual string
    let text = typeof foundContent === 'string' ? foundContent : JSON.stringify(foundContent);
    // Find the marker
    const marker = "The following code has been modified to include a line number before every line";
    const idx = text.indexOf(marker);
    if (idx !== -1) {
        text = text.substring(idx + marker.length);
        const endMarker = "The above content shows the entire, complete file contents";
        const endIdx = text.indexOf(endMarker);
        if (endIdx !== -1) {
            text = text.substring(0, endIdx);
        }
        
        // Remove \r and \n escapes if it's still JSON escaped
        // Actually, if we parsed the JSON, text is a normal string with real newlines!
        const outLines = [];
        for (const l of text.split('\n')) {
            const match = l.match(/^\d+:\s(.*)/);
            if (match) {
                outLines.push(match[1]);
            } else if (l.match(/^\d+:$/)) {
                outLines.push("");
            }
        }
        fs.writeFileSync('frontend_webbone/src/pages/DataVizualizer.jsx', outLines.join('\n'));
        console.log("SUCCESS! Extracted DataVizualizer.jsx from log.");
    } else {
        console.log("Marker not found in text.");
    }
} else {
    console.log("No content found.");
}
