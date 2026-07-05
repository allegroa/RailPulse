import re

with open('frontend/app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

db_match = re.search(r"const DB_VERSION = (\d+);", app_js)
if db_match:
    new_ver = int(db_match.group(1)) + 1
    app_js = app_js.replace(db_match.group(0), f"const DB_VERSION = {new_ver};")

with open('frontend/app.js', 'w', encoding='utf-8') as f:
    f.write(app_js)

print("Bumped DB_VERSION to force alignment!")
