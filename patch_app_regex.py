import re

with open('e:/Software/RailPulse/WebOne/backend_webbone/public/taipei/app.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace updateStationId
text = re.sub(
    r'  STATIONS\[newId\] = STATIONS\[oldId\];\n  delete STATIONS\[oldId\];\n  \n  LINES\.forEach\(ln => \{\n    const idx = ln\.stations\.indexOf\(oldId\);\n    if \(idx !== -1\) ln\.stations\[idx\] = newId;\n    \(ln\.branches\|\|\[\]\)\.forEach\(b => \{\n      if \(b\.from === oldId\) b\.from = newId;\n      const bIdx = b\.stations\.indexOf\(oldId\);\n      if \(bIdx !== -1\) b\.stations\[bIdx\] = newId;\n    \}\);\n  \}\);\n  \n  \n  saveLinesToLocalStorage\(\);',
    r'''  STATIONS[newId] = STATIONS[oldId];
  delete STATIONS[oldId];
  
  LINES.forEach(ln => {
    const idx = ln.stations.indexOf(oldId);
    if (idx !== -1) ln.stations[idx] = newId;
    (ln.branches||[]).forEach(b => {
      if (b.from === oldId) b.from = newId;
      const bIdx = b.stations.indexOf(oldId);
      if (bIdx !== -1) b.stations[bIdx] = newId;
    });
  });
  
  deleteStationFromServer(oldId);
  saveStationToServer(newId);
  saveLinesToServer();''',
    text, flags=re.MULTILINE
)

# Replace updateStationType
text = re.sub(
    r'function updateStationType\(id, type\) \{\n  const s = getStn\(id\);\n  if \(!s\) return;\n  \n  s\.t = type;\n  \n  const grp = d3\.select\(`\.sg-\$\{id\}`\);\n  const pc = stnColor\(s\);\n  drawStationMarker\(grp, id, s, pc\);\n  \n  \n\}',
    r'''function updateStationType(id, type) {
  const s = getStn(id);
  if (!s) return;
  
  s.t = type;
  
  const grp = d3.select(`.sg-${id}`);
  const pc = stnColor(s);
  drawStationMarker(grp, id, s, pc);
  
  saveStationToServer(id);
}''',
    text, flags=re.MULTILINE
)

# Replace updateStationMeta
text = re.sub(
    r'function updateStationMeta\(id, field, val\) \{\n  const s = getStn\(id\);\n  if \(!s\) return;\n  if \(field === \'ln\'\) \{\n    s\.ln = val\.split\(\',\'\)\.map\(l => l\.trim\(\)\)\.filter\(l => l\);\n    const grp = d3\.select\(`\.sg-\$\{id\}`\);\n    const pc = stnColor\(s\);\n    drawStationMarker\(grp, id, s, pc\);\n  \} else \{\n    s\[field\] = val;\n    if \(field === \'e\'\) d3\.select\(`\.lbl-grp\.lg-\$\{id\} \.lbl-en`\)\.text\(s\.e\);\n    if \(field === \'z\'\) d3\.select\(`\.lbl-grp\.lg-\$\{id\} \.lbl-zh`\)\.text\(s\.z\);\n  \}\n  \n\}',
    r'''function updateStationMeta(id, field, val) {
  const s = getStn(id);
  if (!s) return;
  if (field === 'ln') {
    s.ln = val.split(',').map(l => l.trim()).filter(l => l);
    const grp = d3.select(`.sg-${id}`);
    const pc = stnColor(s);
    drawStationMarker(grp, id, s, pc);
  } else {
    s[field] = val;
    if (field === 'e') d3.select(`.lbl-grp.lg-${id} .lbl-en`).text(s.e);
    if (field === 'z') d3.select(`.lbl-grp.lg-${id} .lbl-zh`).text(s.z);
  }
  
  saveStationToServer(id);
}''',
    text, flags=re.MULTILINE
)

# Replace updateStationKm
text = re.sub(
    r'function updateStationKm\(id, kmVal\) \{\n  const s = getStn\(id\);\n  if \(!s\) return;\n  s\.km = parseFloat\(kmVal\) \|\| 0\.0;\n  \n\}',
    r'''function updateStationKm(id, kmVal) {
  const s = getStn(id);
  if (!s) return;
  s.km = parseFloat(kmVal) || 0.0;
  
  saveStationToServer(id);
}''',
    text, flags=re.MULTILINE
)

# Replace storage funcs
text = re.sub(
    r'function  \{\n  localStorage\.setItem\(\'taipei_mrt_stations_full\', JSON\.stringify\(STATIONS\)\);\n\}\nfunction saveLinesToLocalStorage\(\) \{\n  localStorage\.setItem\(\'taipei_mrt_lines\', JSON\.stringify\(LINES\)\);\n\}\nfunction saveStationToServer\(id\) \{',
    r'''function deleteStationFromServer(id) {
  fetch('/api/taipei/delete-station', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  })
  .then(res => res.json())
  .then(data => console.log('Deleted station:', data))
  .catch(err => console.warn('Failed to delete station:', err));
}

function saveLinesToServer() {
  fetch('/api/taipei/save-lines', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(LINES)
  })
  .then(res => res.json())
  .then(data => console.log('Saved lines:', data))
  .catch(err => console.warn('Failed to save lines:', err));
}

function saveStationToServer(id) {''',
    text, flags=re.MULTILINE
)

# Replace reset coords
text = re.sub(
    r'function resetCoordinates\(\) \{\n  if \(confirm\(\'Ripristinare tutte le coordinate delle stazioni a quelle di default\? La pagina verrà ricaricata\.\'\)\) \{\n    localStorage\.removeItem\(\'taipei_mrt_coords\'\);\n    localStorage\.removeItem\(\'taipei_mrt_stations_full\'\);\n    localStorage\.removeItem\(\'taipei_mrt_lines\'\);\n    location\.reload\(\);\n  \}\n\}',
    r'''function resetCoordinates() {
  alert('Reset coordinates is no longer supported via local storage. Please update the server database.');
}''',
    text, flags=re.MULTILINE
)

with open('e:/Software/RailPulse/WebOne/backend_webbone/public/taipei/app.js', 'w', encoding='utf-8') as f:
    f.write(text)

print("Patch applied with regex")
