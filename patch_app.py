with open('e:/Software/RailPulse/WebOne/backend_webbone/public/taipei/app.js', 'r', encoding='utf-8') as f:
    text = f.read()

old_updateId = """  STATIONS[newId] = STATIONS[oldId];
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
  
  
  saveLinesToLocalStorage();"""
new_updateId = """  STATIONS[newId] = STATIONS[oldId];
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
  saveLinesToServer();"""
text = text.replace(old_updateId, new_updateId)

old_type = """function updateStationType(id, type) {
  const s = getStn(id);
  if (!s) return;
  
  s.t = type;
  
  const grp = d3.select(`.sg-${id}`);
  const pc = stnColor(s);
  drawStationMarker(grp, id, s, pc);
  
  
}"""
new_type = """function updateStationType(id, type) {
  const s = getStn(id);
  if (!s) return;
  
  s.t = type;
  
  const grp = d3.select(`.sg-${id}`);
  const pc = stnColor(s);
  drawStationMarker(grp, id, s, pc);
  
  saveStationToServer(id);
}"""
text = text.replace(old_type, new_type)

old_meta = """function updateStationMeta(id, field, val) {
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
  
}"""
new_meta = """function updateStationMeta(id, field, val) {
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
}"""
text = text.replace(old_meta, new_meta)

old_km = """function updateStationKm(id, kmVal) {
  const s = getStn(id);
  if (!s) return;
  s.km = parseFloat(kmVal) || 0.0;
  
}"""
new_km = """function updateStationKm(id, kmVal) {
  const s = getStn(id);
  if (!s) return;
  s.km = parseFloat(kmVal) || 0.0;
  
  saveStationToServer(id);
}"""
text = text.replace(old_km, new_km)

old_storage = """function  {
  localStorage.setItem('taipei_mrt_stations_full', JSON.stringify(STATIONS));
}

function saveLinesToLocalStorage() {
  localStorage.setItem('taipei_mrt_lines', JSON.stringify(LINES));
}

function saveStationToServer(id) {"""
new_storage = """function deleteStationFromServer(id) {
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

function saveStationToServer(id) {"""
text = text.replace(old_storage, new_storage)

old_reset = """function resetCoordinates() {
  if (confirm('Ripristinare tutte le coordinate delle stazioni a quelle di default? La pagina verrà ricaricata.')) {
    localStorage.removeItem('taipei_mrt_coords');
    localStorage.removeItem('taipei_mrt_stations_full');
    localStorage.removeItem('taipei_mrt_lines');
    location.reload();
  }
}"""
new_reset = """function resetCoordinates() {
  alert('Reset coordinates is no longer supported via local storage. Please update the server database.');
}"""
text = text.replace(old_reset, new_reset)

with open('e:/Software/RailPulse/WebOne/backend_webbone/public/taipei/app.js', 'w', encoding='utf-8') as f:
    f.write(text)
print("Patch applied")
