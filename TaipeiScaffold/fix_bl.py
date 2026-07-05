import json
import re

# 1. Fix stations.json
with open('data/stations.json', 'r', encoding='utf-8') as f:
    stns = json.load(f)

new_stns = {}
for k, v in stns.items():
    if k.startswith('BL'):
        num = int(k[2:])
        if num >= 12:
            new_k = f"BL{num+1:02d}"
            new_stns[new_k] = v
        else:
            new_stns[k] = v
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
        if s.startswith('BL'):
            num = int(s[2:])
            if num >= 12:
                new_stations.append(f"BL{num+1:02d}")
            else:
                new_stations.append(s)
        else:
            new_stations.append(s)
    
    # Reverse BL line if it's the BL line
    if ln['id'] == 'BL':
        new_stations.reverse()
        
    ln['stations'] = new_stations

with open('data/lines.json', 'w', encoding='utf-8') as f:
    json.dump(lines, f, indent=2, ensure_ascii=False)

# 3. Fix app.js
with open('frontend/app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

# Replace station definitions backwards to avoid overlapping
for i in range(22, 11, -1):
    app_js = app_js.replace(f"BL{i:02d}", f"BL{i+1:02d}")

# But wait, the lines array in app.js for BL needs to be reversed!
# Let's find the BL stations array line
bl_line_match = re.search(r"stations:\['BL23','BL22'.*?'BL01'\]", app_js)
if not bl_line_match:
    # it might still be in old order but with new IDs
    old_order_match = re.search(r"stations:\['BL01','BL02'.*?'BL23'\]", app_js)
    if old_order_match:
        # construct reversed
        stations_list = [f"'BL{i:02d}'" for i in range(1, 11)] + ["'R08'", "'R10'"] + [f"'BL{i:02d}'" for i in range(13, 24)]
        stations_list.reverse()
        rev_str = "stations:[" + ",".join(stations_list) + "]"
        app_js = app_js.replace(old_order_match.group(0), rev_str)

# Also increment DB_VERSION to clear cache
db_match = re.search(r"const DB_VERSION = (\d+);", app_js)
if db_match:
    new_ver = int(db_match.group(1)) + 1
    app_js = app_js.replace(db_match.group(0), f"const DB_VERSION = {new_ver};")

with open('frontend/app.js', 'w', encoding='utf-8') as f:
    f.write(app_js)

print("Fixed!")
