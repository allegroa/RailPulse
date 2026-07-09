import json
import re

transcript_path = r"C:\Users\alleg\.gemini\antigravity-ide\brain\1098ac11-4673-4637-8058-627e77e19b2d\.system_generated\logs\transcript_full.jsonl"
out_path = r"e:\Software\RailPulse\WebOne\backend_webbone\public\taipei\app.js"

lines_dict = {}
with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
        except:
            continue
        if data.get('type') == 'VIEW_FILE' and 'app.js' in data.get('content', ''):
            content = data.get('content', '')
            if 'The following code has been modified' in content:
                for cl in content.split('\n'):
                    m = re.match(r'^(\d+): (.*)$', cl)
                    if m:
                        linenum = int(m.group(1))
                        # Only keep the latest seen line
                        lines_dict[linenum] = m.group(2)

# Sort by line number
sorted_lines = [lines_dict[k] for k in sorted(lines_dict.keys())]

print(f"Extracted {len(sorted_lines)} lines")
if len(sorted_lines) > 0:
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sorted_lines) + '\n')
