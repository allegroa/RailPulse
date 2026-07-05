import json
import re

# 1. Fix stations.json
with open('data/stations.json', 'r', encoding='utf-8') as f:
    stns = json.load(f)

new_stns = {}
for k, v in stns.items():
    if k == 'R08':
        new_stns['BL11'] = v
    elif k == 'R10':
        new_stns['BL12'] = v
    else:
        new_stns[k] = v

with open('data/stations.json', 'w', encoding='utf-8') as f:
    json.dump(new_stns, f, indent=2, ensure_ascii=False)

# 2. Fix lines.json
with open('data/lines.json', 'r', encoding='utf-8') as f:
    lines = json.load(f)

for ln in lines:
    new_stations = []
    for s in ln['stations']:
        if s == 'R08':
            new_stations.append('BL11')
        elif s == 'R10':
            new_stations.append('BL12')
        else:
            new_stations.append(s)
    ln['stations'] = new_stations

with open('data/lines.json', 'w', encoding='utf-8') as f:
    json.dump(lines, f, indent=2, ensure_ascii=False)

# 3. Fix app.js
with open('frontend/app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

app_js = re.sub(r"\bR08\b", "BL11", app_js)
app_js = re.sub(r"\bR10\b", "BL12", app_js)

# Also increment DB_VERSION
db_match = re.search(r"const DB_VERSION = (\d+);", app_js)
if db_match:
    new_ver = int(db_match.group(1)) + 1
    app_js = app_js.replace(db_match.group(0), f"const DB_VERSION = {new_ver};")

with open('frontend/app.js', 'w', encoding='utf-8') as f:
    f.write(app_js)

print("Fixed!")
