const fs = require('fs');
const path = 'C:\\Users\\user\\.gemini\\antigravity\\brain\\2fad3d2c-ebab-4659-8fed-c84a6452b9c3\\.system_generated\\logs\\transcript.jsonl';
if (!fs.existsSync(path)) {
    console.log("Transcript not found at " + path);
    process.exit(1);
}
const lines = fs.readFileSync(path, 'utf-8').split('\n');
for (const line of lines) {
    if (!line.trim()) continue;
    try {
        const obj = JSON.parse(line);
        // Sometimes it's inside `action`, or `tool_calls`
        let calls = [];
        if (obj.tool_calls) calls = obj.tool_calls;
        else if (obj.action && obj.action.tool_calls) calls = obj.action.tool_calls;
        else if (obj.payload && obj.payload.tool_calls) calls = obj.payload.tool_calls;
        
        for (const call of calls) {
            const func = call.function || call;
            if (func.name === 'default_api:write_to_file' || func.name === 'default_api:replace_file_content' || func.name === 'default_api:multi_replace_file_content' || func.name === 'write_to_file' || func.name === 'replace_file_content') {
                const args = func.arguments ? (typeof func.arguments === 'string' ? JSON.parse(func.arguments) : func.arguments) : {};
                if (args.TargetFile && args.TargetFile.includes('DataVizualizer')) {
                    fs.appendFileSync('recovered_tool_calls.log', "====================================\n" + JSON.stringify(args, null, 2) + '\n\n');
                }
            }
        }
    } catch(e) {}
}
console.log("Done");
