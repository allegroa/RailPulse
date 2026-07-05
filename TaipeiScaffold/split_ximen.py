import json
import re

# 1. Update stations.json
with open('data/stations.json', 'r', encoding='utf-8') as f:
    stns = json.load(f)

# BL11 was originally at Ximen (x:278, y:752) with ln: ["R", "BL"]
# We split it into R08 and BL11
if 'BL11' in stns:
    ximen_data = stns['BL11'].copy()
    
    # Create R08
    r08_data = ximen_data.copy()
    r08_data['ln'] = ['R']
    stns['R08'] = r08_data
    
    # Create BL11
    bl11_data = ximen_data.copy()
    bl11_data['ln'] = ['BL']
    stns['BL11'] = bl11_data

with open('data/stations.json', 'w', encoding='utf-8') as f:
    json.dump(stns, f, indent=2, ensure_ascii=False)

# 2. Update lines.json
with open('data/lines.json', 'r', encoding='utf-8') as f:
    lines = json.load(f)

for ln in lines:
    if ln['id'] == 'R':
        ln['stations'] = [s if s != 'BL11' else 'R08' for s in ln['stations']]
    if ln['id'] == 'BL':
        # BL line should still use BL11, which it already does
        pass

with open('data/lines.json', 'w', encoding='utf-8') as f:
    json.dump(lines, f, indent=2, ensure_ascii=False)

# 3. Update app.js
with open('frontend/app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

# Replace BL11 definition with both R08 and BL11
r08_def = "  R08  : {e:'Ximen', z:'西門', x:278, y:752, ln:[\"R\"], t:'main_station', km:0.0},"
bl11_def = "  BL11  : {e:'Ximen', z:'西門', x:278, y:752, ln:[\"BL\"], t:'main_station', km:0.0},"

if re.search(r"BL11\s*:\s*\{.*?\},", app_js):
    app_js = re.sub(r"BL11\s*:\s*\{.*?\},", r08_def + "\n" + bl11_def, app_js)

# Update R line array in app.js
r_line_match = re.search(r"id:'R'.*?stations:\[(.*?)\]", app_js, re.DOTALL)
if r_line_match:
    old_stations = r_line_match.group(1)
    new_stations = old_stations.replace("'BL11'", "'R08'")
    app_js = app_js.replace(old_stations, new_stations)

# Increment DB_VERSION
db_match = re.search(r"const DB_VERSION = (\d+);", app_js)
if db_match:
    new_ver = int(db_match.group(1)) + 1
    app_js = app_js.replace(db_match.group(0), f"const DB_VERSION = {new_ver};")

with open('frontend/app.js', 'w', encoding='utf-8') as f:
    f.write(app_js)

print("Split BL11 into R08 and BL11!")
