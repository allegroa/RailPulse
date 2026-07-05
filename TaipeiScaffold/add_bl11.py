import json
import re

# We will add BL11 back to stations.json just in case it was deleted/renamed
with open('data/stations.json', 'r', encoding='utf-8') as f:
    stns = json.load(f)

# If BL11 is not there or we want to ensure it's purely BL:
stns['BL11'] = {
  "e": "Ximen",
  "z": "西門",
  "x": 278,
  "y": 752,
  "ln": ["BL"],
  "t": "main_station",
  "km": 0.0
}

with open('data/stations.json', 'w', encoding='utf-8') as f:
    json.dump(stns, f, indent=2, ensure_ascii=False)

# Update lines.json to ensure BL line uses BL11 between BL12 and BL10
with open('data/lines.json', 'r', encoding='utf-8') as f:
    lines = json.load(f)

for ln in lines:
    if ln['id'] == 'BL':
        # Ensure sequence is ... BL12, BL11, BL10 ...
        # If BL11 is missing, or G12 is there instead, we can just rebuild that segment or replace.
        # But wait, it's safer to just forcefully ensure the array contains BL11.
        pass

# Let's just modify app.js directly to ensure BL11 exists and is on the BL line
with open('frontend/app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

# Add BL11 if it was completely removed from the hardcoded block?
# In app.js, BL11 is currently there. But if we want to ensure it's a separate node, we just update it.
bl11_def = "  BL11  : {e:'Ximen', z:'西門', x:278, y:752, ln:[\"BL\"], t:'main_station', km:0.0},"
# Replace whatever BL11 is currently defined as
if re.search(r"BL11\s*:\s*\{.*?\},", app_js):
    app_js = re.sub(r"BL11\s*:\s*\{.*?\},", bl11_def, app_js)
else:
    # insert it after BL12
    app_js = re.sub(r"(BL12\s*:\s*\{.*?\},)", r"\1\n" + bl11_def, app_js)

# Also ensure DB_VERSION is incremented
db_match = re.search(r"const DB_VERSION = (\d+);", app_js)
if db_match:
    new_ver = int(db_match.group(1)) + 1
    app_js = app_js.replace(db_match.group(0), f"const DB_VERSION = {new_ver};")

with open('frontend/app.js', 'w', encoding='utf-8') as f:
    f.write(app_js)

print("Ensured BL11 is present!")
