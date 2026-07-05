import json
import re

stns_to_align = ['R08', 'R07', 'R06', 'R05', 'R04', 'R03', 'R02']
target_y = 858
start_x = 278
end_x = 680
spacing = (end_x - start_x) / (len(stns_to_align) - 1)

# 1. Update stations.json
with open('data/stations.json', 'r', encoding='utf-8') as f:
    stns = json.load(f)

for i, sid in enumerate(stns_to_align):
    if sid in stns:
        stns[sid]['y'] = target_y
        stns[sid]['x'] = int(start_x + i * spacing)

with open('data/stations.json', 'w', encoding='utf-8') as f:
    json.dump(stns, f, indent=2, ensure_ascii=False)

# 2. Update app.js
with open('frontend/app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

# Update hardcoded stations in app.js
for i, sid in enumerate(stns_to_align):
    new_x = int(start_x + i * spacing)
    # We must regex replace x:\d+, y:\d+ for this station
    # The station definition looks like R08  : {e:'Ximen', z:'西門', x:278, y:752, ...}
    pattern = rf"({sid}\s*:\s*{{.*?)x:\d+,\s*y:\d+(.*?}})"
    app_js = re.sub(pattern, rf"\g<1>x:{new_x}, y:{target_y}\g<2>", app_js)

# Increment DB_VERSION
db_match = re.search(r"const DB_VERSION = (\d+);", app_js)
if db_match:
    new_ver = int(db_match.group(1)) + 1
    app_js = app_js.replace(db_match.group(0), f"const DB_VERSION = {new_ver};")

with open('frontend/app.js', 'w', encoding='utf-8') as f:
    f.write(app_js)

print("Aligned R08 to R02 horizontally!")
