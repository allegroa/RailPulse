import json
import re

# 1. Update stations.json
with open('data/stations.json', 'r', encoding='utf-8') as f:
    stns = json.load(f)

if 'BL12' in stns:
    r10_data = stns['BL12'].copy()
    r10_data['ln'] = ['R']
    if 'R' in stns['BL12']['ln']:
        stns['BL12']['ln'].remove('R')
    stns['R10'] = r10_data

with open('data/stations.json', 'w', encoding='utf-8') as f:
    json.dump(stns, f, indent=2, ensure_ascii=False)

# 2. Update lines.json
with open('data/lines.json', 'r', encoding='utf-8') as f:
    lines = json.load(f)

for ln in lines:
    if ln['id'] == 'R':
        # Replace BL12 with R10
        ln['stations'] = [s if s != 'BL12' else 'R10' for s in ln['stations']]

with open('data/lines.json', 'w', encoding='utf-8') as f:
    json.dump(lines, f, indent=2, ensure_ascii=False)

# 3. Update app.js
with open('frontend/app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

# Add R10 definition after R11
r10_def = "  R10  : {e:'Taipei Main Station', z:'台北車站', x:352, y:730, ln:[\"R\"], t:'main_station', km:0.0},"
app_js = re.sub(r"(R11\s*:\s*\{.*?\},)", r"\1\n" + r10_def, app_js)

# Remove "R" from BL12 ln array
app_js = re.sub(r'(BL12\s*:\s*\{.*?ln:\[.*?)"R",\s*(.*?\])', r'\1\2', app_js)
app_js = re.sub(r'(BL12\s*:\s*\{.*?ln:\[.*?),\s*"R"(.*?\])', r'\1\2', app_js)

# Update R line array
r_line_match = re.search(r"id:'R'.*?stations:\[(.*?)\]", app_js, re.DOTALL)
if r_line_match:
    old_stations = r_line_match.group(1)
    new_stations = old_stations.replace("'BL12'", "'R10'")
    app_js = app_js.replace(old_stations, new_stations)

# Also increment DB_VERSION
db_match = re.search(r"const DB_VERSION = (\d+);", app_js)
if db_match:
    new_ver = int(db_match.group(1)) + 1
    app_js = app_js.replace(db_match.group(0), f"const DB_VERSION = {new_ver};")

with open('frontend/app.js', 'w', encoding='utf-8') as f:
    f.write(app_js)

print("Added R10!")
