'use strict';
// ================================================================
//  TAIPEI METRO — Interactive Map  |  app.js
//  D3.js v7 · Standalone · © 2026 RailPulse / TaipeiScaffold
// ================================================================
// ════════════════════════════════════════════════════════════════
//  STATION DATA
//  Coordinate system: SVG 960 × 1280  (matches map image ratio)
//  type: 'regular' | 'terminal' | 'transfer'
// ════════════════════════════════════════════════════════════════
let STATIONS = {};
// ════════════════════════════════════════════════════════════════
//  LINE DEFINITIONS
//  stations: ordered ID list for path rendering
//  branches: [{from, stations}]  – rendered as separate path segments
// ════════════════════════════════════════════════════════════════
let LINES = [];
// ════════════════════════════════════════════════════════════════
//  D3.js SETUP
// ════════════════════════════════════════════════════════════════
const SVG_W = 960, SVG_H = 1280;
let curZoom = d3.zoomIdentity;
let routeActive = false;
let routeFrom = null, routeTo = null, routeSelectMode = null;
const graph = {};  // adjacency list for Dijkstra
// Create SVG
const svg = d3.select('#map-container')
  .append('svg')
  .attr('id','map-svg')
  .attr('viewBox',`0 0 ${SVG_W} ${SVG_H}`)
  .attr('preserveAspectRatio','xMidYMid meet');
// Add inline stylesheet inside SVG for standalone rendering compatibility
svg.append('style').text(`
  #map-svg { background: var(--bg-deep, #f8fafc); }
  .line-path { stroke-linecap: round; stroke-linejoin: round; transition: stroke-width .18s ease, opacity .18s ease; cursor: pointer; }
  .station-group { cursor: pointer; }
  .station-label { font-family: 'Inter', 'Noto Sans TC', sans-serif; pointer-events: none; user-select: none; }
  .lbl-en { font-size: 7px; font-weight: 500; fill: #0f172a; }
  .lbl-zh { font-size: 6.5px; fill: #475569; }
  .tt-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
`);
// ── Defs: Glow Filters ───────────────────────────────────────────
const defs = svg.append('defs');
function addGlow(id, blur) {
  const f = defs.append('filter').attr('id',id)
    .attr('x','-60%').attr('y','-60%').attr('width','220%').attr('height','220%');
  f.append('feGaussianBlur').attr('in','SourceGraphic').attr('stdDeviation',blur).attr('result','blur');
  const m = f.append('feMerge');
  m.append('feMergeNode').attr('in','blur');
  m.append('feMergeNode').attr('in','SourceGraphic');
}
addGlow('glow-soft', 3);
addGlow('glow-strong', 6);
// ── Layer Groups ─────────────────────────────────────────────────
const svgEl = d3.select('#map-svg');
const mapG = svgEl.append('g').attr('id', 'map-g');
const bgMap = mapG.append('g').attr('id', 'bg-map');
const linesG = mapG.append('g').attr('id', 'lines-g');
const stnsG = mapG.append('g').attr('id', 'stations-g');
const labelsG = mapG.append('g').attr('id', 'labels-g');
const hiddenLines = new Set();
// Render original background image (initially hidden)
bgMap.append('image')
  .attr('id', 'bg-map-image')
  .attr('href', 'Taipei_Metro_official_map_optimised.png')
  .attr('x', 0)
  .attr('y', 0)
  .attr('width', SVG_W)
  .attr('height', SVG_H)
  .attr('opacity', 0.5)
  .attr('display', 'none');
// ── Zoom ─────────────────────────────────────────────────────────
const zoom = d3.zoom()
  .scaleExtent([0.2, 14])
  .on('zoom', ev => {
    curZoom = ev.transform;
    mapG.attr('transform', ev.transform);
    updateLabelVis(ev.transform.k);
  });
let clusterOffsets = {};
function computeClusterOffsets() {
  clusterOffsets = {};
  const coordsMap = {};
  allStnIds().forEach(id => {
    const s = getStn(id);
    if (!s || s.t !== 'main_station') return;
    const key = `${s.x},${s.y}`;
    if (!coordsMap[key]) coordsMap[key] = [];
    coordsMap[key].push(id);
  });
  
  for (const key in coordsMap) {
    const cluster = coordsMap[key];
    if (cluster.length > 1) {
      cluster.sort();
      const spacing = 19; // width is 18, so slightly spaced
      cluster.forEach((id, idx) => {
        clusterOffsets[id] = (idx - (cluster.length - 1) / 2) * spacing;
      });
    }
  }
}
svg.call(zoom).on('dblclick.zoom', resetView);
// ════════════════════════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════════════════════════
function getStn(id)  { return STATIONS[id]; }
function getLine(id) { return LINES.find(l => l.id === id); }
function lineColor(id) { const l = getLine(id); return l ? l.color : '#888'; }
function stnColor(s)   { return lineColor(s.ln[0]); }
function parseStationId(id) {
  const match = id.match(/^([a-zA-Z]+)(\d+.*)$/);
  return match ? { prefix: match[1], suffix: match[2] } : { prefix: id, suffix: '' };
}
function allStnIds() {
  const set = new Set();
  LINES.forEach(ln => {
    ln.stations.forEach(id => set.add(id));
    (ln.branches||[]).forEach(b => b.stations.forEach(id => set.add(id)));
  });
  return set;
}
// ════════════════════════════════════════════════════════════════
//  RENDER LINES
// ════════════════════════════════════════════════════════════════
function renderLines() {
  const lineGen = d3.line()
    .x(id => getStn(id).x)
    .y(id => getStn(id).y)
    .curve(d3.curveLinear);
  LINES.forEach(ln => {
    const grp = linesG.append('g')
      .attr('class',`lg lg-${ln.id}`)
      .attr('data-lid', ln.id);
    function drawPath(ids) {
      if (ids.length < 2) return;
      grp.append('path')
        .datum(ids)
        .attr('class',`line-path lp-${ln.id}`)
        .attr('d', lineGen)
        .attr('stroke', ln.color)
        .attr('stroke-width', 5.5)
        .attr('stroke-dasharray', ln.dashed ? '9,6' : null)
        .attr('fill','none')
        .attr('stroke-linecap','round')
        .attr('stroke-linejoin','round')
        .on('mouseenter', () => highlightLine(ln.id))
        .on('mouseleave', clearHighlights);
    }
    drawPath(ln.stations);
    (ln.branches||[]).forEach(b => drawPath([b.from, ...b.stations]));
  });
}
function updatePaths() {
  const lineGen = d3.line()
    .x(id => getStn(id).x)
    .y(id => getStn(id).y)
    .curve(d3.curveLinear);
  linesG.selectAll('.line-path').attr('d', lineGen);
}
// ════════════════════════════════════════════════════════════════
//  RENDER STATIONS
// ════════════════════════════════════════════════════════════════
function drawStationMarker(grp, id, s, pc) {
  grp.selectAll('*').remove();
  
  const { prefix, suffix } = parseStationId(id);
  const isMain = s.t === 'main_station';
  const cx = clusterOffsets[id] || 0;
  
  const w = isMain ? 18 : 14;
  const h = isMain ? 22 : 19;
  const rx = isMain ? 3.0 : 2.0;
  const strokeWidth = isMain ? 2.5 : 1.6;
  
  grp.append('rect')
    .attr('x', cx - w / 2)
    .attr('y', -h / 2)
    .attr('width', w)
    .attr('height', h)
    .attr('rx', rx)
    .attr('ry', rx)
    .attr('fill', isMain ? pc : 'white')
    .attr('stroke', pc)
    .attr('stroke-width', strokeWidth);
    
  grp.append('text')
    .attr('class', 'stn-code-prefix')
    .attr('x', cx)
    .attr('y', isMain ? -4.0 : -3.5)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'central')
    .attr('fill', isMain ? 'white' : '#111827')
    .attr('font-size', isMain ? '7.0px' : '6.0px')
    .attr('font-weight', 'bold')
    .attr('font-family', "'Inter', sans-serif")
    .text(prefix);
  grp.append('text')
    .attr('class', 'stn-code-suffix')
    .attr('x', cx)
    .attr('y', isMain ? 4.0 : 3.5)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'central')
    .attr('fill', isMain ? 'white' : '#111827')
    .attr('font-size', isMain ? '7.0px' : '6.0px')
    .attr('font-weight', 'bold')
    .attr('font-family', "'Inter', sans-serif")
    .text(suffix);
}
function renderStations() {
  const dragBehavior = d3.drag()
    .on('start', function(ev) {
      d3.select(this).raise();
      this.__moved = false;
    })
    .on('drag', function(ev, id) {
      this.__moved = true;
      const s = getStn(id);
      if (!s) return;
      s.x = Math.round(ev.x);
      s.y = Math.round(ev.y);
      
      clusterOffsets[id] = 0;
      drawStationMarker(d3.select(this), id, s, stnColor(s));
      
      // Update station group position (keep scale 1.25 while dragging)
      d3.select(this).attr('transform', `translate(${s.x},${s.y}) scale(1.25)`);
      
      // Update label group position
      d3.select(`.lbl-grp.lg-${id}`).attr('transform', `translate(${s.x},${s.y})`);
      
      // Update line paths
      updatePaths();
    })
    .on('end', function(ev, id) {
      if (!this.__moved) return;
      const s = getStn(id);
      console.log(`"${id}": {e:'${s.e}', z:'${s.z}', x:${s.x}, y:${s.y}, ln:${JSON.stringify(s.ln)}, t:'${s.t}', km:${s.km}},`);
      
      saveStationToServer(id);
      computeClusterOffsets();
      stnsG.selectAll('*').remove();
      labelsG.selectAll('*').remove();
      renderStations();
      renderLabels();
    });
  allStnIds().forEach(id => {
    const s = getStn(id);
    if (!s || s.t === 'waypoint') return;
    const pc        = stnColor(s);
    const grp = stnsG.append('g')
      .datum(id)
      .attr('class', `station-group sg-${id}`)
      .attr('transform', `translate(${s.x},${s.y})`)
      .attr('data-sid', id)
      .on('mouseenter', ev => onStnEnter(ev, id))
      .on('mouseleave', onStnLeave)
      .on('click',      ev => onStnClick(ev, id))
      .call(dragBehavior);
    drawStationMarker(grp, id, s, pc);
  });
}
// ════════════════════════════════════════════════════════════════
//  RENDER LABELS
// ════════════════════════════════════════════════════════════════
function renderLabels() {
  allStnIds().forEach(id => {
    const s = getStn(id);
    if (!s || !s.e) return;
    const leftSide = s.x < 500;
    const dx = leftSide ? -15 : 15;
    const anchor = leftSide ? 'end' : 'start';
    const cx = clusterOffsets[id] || 0;
    const grp = labelsG.append('g')
      .attr('class',`lbl-grp lg-${id}`)
      .attr('transform',`translate(${s.x + cx},${s.y})`);
    grp.append('text').attr('class','station-label lbl-en')
      .attr('x',dx).attr('y',-2)
      .attr('text-anchor',anchor)
      .attr('fill','#cdd5e2').attr('font-size','7px').attr('font-weight','500')
      .text(s.e);
    grp.append('text').attr('class','station-label lbl-zh')
      .attr('x',dx).attr('y',7)
      .attr('text-anchor',anchor)
      .attr('fill','#6b7590').attr('font-size','6.5px')
      .attr('font-family','Noto Sans TC, sans-serif')
      .text(s.z);
  });
  updateLabelVis(1);
}
function updateLabelVis(scale) {
  labelsG.selectAll('.lbl-en').attr('display', scale >= 1.5 ? null : 'none');
  labelsG.selectAll('.lbl-zh').attr('display', scale >= 2.5 ? null : 'none');
}
// ════════════════════════════════════════════════════════════════
//  INTERACTIONS — Line hover
// ════════════════════════════════════════════════════════════════
function highlightLine(lid) {
  if (routeActive || hiddenLines.has(lid)) return;
  linesG.selectAll('.line-path')
    .transition().duration(160)
    .attr('opacity', function() { return this.classList.contains(`lp-${lid}`) ? 1 : 0.08; })
    .attr('stroke-width', function() { return this.classList.contains(`lp-${lid}`) ? 9 : 5.5; });
  linesG.selectAll(`.lp-${lid}`).attr('filter','url(#glow-soft)');
  stnsG.selectAll('.station-group').each(function() {
    const sid = this.getAttribute('data-sid');
    const s = getStn(sid);
    const on = s && s.ln.includes(lid);
    d3.select(this).selectAll('rect,text')
      .transition().duration(160)
      .attr('opacity', on ? 1 : 0.15);
  });
  labelsG.selectAll('.lbl-grp')
    .attr('opacity', function() {
      const cls = this.getAttribute('class') || '';
      const sid = (cls.match(/lg-(\S+)/) || [])[1];
      const s = sid && getStn(sid);
      return s && s.ln.includes(lid) ? 1 : 0.1;
    });
}
function clearHighlights() {
  if (routeActive) return;
  linesG.selectAll('.line-path')
    .transition().duration(200)
    .attr('opacity',1).attr('stroke-width',5.5).attr('filter',null);
  stnsG.selectAll('.station-group').selectAll('rect,text').transition().duration(200).attr('opacity',1);
  labelsG.selectAll('.lbl-grp').attr('opacity',1);
}
// ════════════════════════════════════════════════════════════════
//  INTERACTIONS — Station hover / click
// ════════════════════════════════════════════════════════════════
function onStnEnter(ev, id) {
  const s = getStn(id);
  if (!s) return;
  showTooltip(ev, id, s);
  d3.select(`.sg-${id}`)
    .transition().duration(120)
    .attr('transform', `translate(${s.x},${s.y}) scale(1.25)`);
}
function onStnLeave() {
  hideTooltip();
  stnsG.selectAll('.station-group')
    .transition().duration(120)
    .attr('transform', function(id) {
      const s = getStn(id);
      return s ? `translate(${s.x},${s.y}) scale(1)` : null;
    });
}
function onStnClick(ev, id) {
  if (ev.defaultPrevented) return;
  ev.stopPropagation();
  if (routeSelectMode) {
    setRouteStation(id);
  } else {
    showInfoPanel(id);
  }
}
// ════════════════════════════════════════════════════════════════
//  TOOLTIP
// ════════════════════════════════════════════════════════════════
const tip = document.getElementById('tooltip');
function showTooltip(ev, id, s) {
  const dots = (s.ln||[]).map(lid =>
    `<span class="tt-dot" style="background:${lineColor(lid)}"></span>`
  ).join('');
  const kmText = s.km !== undefined ? `<div class="tt-km">Km ${(s.km || 0).toFixed(3)}</div>` : '';
  tip.innerHTML = `<div class="tt-en">${s.e}</div><div class="tt-zh">${s.z}</div><div class="tt-id">${id}</div>${kmText}<div class="tt-lines">${dots}</div>`;
  tip.classList.add('show');
  moveTip(ev);
}
function moveTip(ev) {
  const mx = ev.clientX, my = ev.clientY;
  const vw = window.innerWidth, vh = window.innerHeight;
  const tw = 180, th = 90;
  tip.style.left = (mx + 15 + tw > vw ? mx - tw - 10 : mx + 15) + 'px';
  tip.style.top  = (my - 10 + th > vh ? my - th - 5  : my - 10) + 'px';
}
function hideTooltip() { tip.classList.remove('show'); }
// ════════════════════════════════════════════════════════════════
//  INFO PANEL
// ════════════════════════════════════════════════════════════════
function showInfoPanel(id) {
  const s = getStn(id);
  if (!s) return;
  const badges = (s.ln||[]).map(lid => {
    const l = getLine(lid);
    return l ? `<span class="ip-badge" style="background:${l.color}">${l.e}</span>` : '';
  }).join('');
  
  document.getElementById('info-content').innerHTML = `
    <div class="ip-edit-row">
      <span class="ip-edit-label">Station ID</span>
      <input type="text" id="ip-id-input" value="${id}" onchange="updateStationId('${id}', this.value)" style="font-weight:bold; color:var(--accent);">
    </div>
    <div class="ip-name-en" style="margin-top:8px">${s.e}</div>
    <div class="ip-name-zh">${s.z}</div>
    <div class="ip-lines">${badges}</div>
    
    <div class="ip-edit-row">
      <span class="ip-edit-label">Name (EN)</span>
      <input type="text" id="ip-name-en-input" value="${s.e}" oninput="updateStationMeta('${id}', 'e', this.value)">
    </div>
    <div class="ip-edit-row">
      <span class="ip-edit-label">Name (ZH)</span>
      <input type="text" id="ip-name-zh-input" value="${s.z}" oninput="updateStationMeta('${id}', 'z', this.value)">
    </div>
    <div class="ip-edit-row">
      <span class="ip-edit-label">Lines</span>
      <input type="text" id="ip-lines-input" value="${(s.ln||[]).join(',')}" onchange="updateStationMeta('${id}', 'ln', this.value)">
    </div>
    
    <div class="ip-edit-row">
      <span class="ip-edit-label">Type</span>
      <select id="ip-type-select" onchange="updateStationType('${id}', this.value)">
        <option value="station" ${s.t === 'station' ? 'selected' : ''}>Station</option>
        <option value="main_station" ${s.t === 'main_station' ? 'selected' : ''}>Main Station</option>
      </select>
    </div>
    
    <div class="ip-edit-row">
      <span class="ip-edit-label">Km Position</span>
      <input type="number" step="0.001" id="ip-km-input" value="${(s.km || 0).toFixed(3)}" oninput="updateStationKm('${id}', this.value)">
    </div>
    
    <button class="ip-route-btn" onclick="setRouteFromPanel('${id}')">Use in Route ↗</button>
  `;
  document.getElementById('info-panel').classList.add('visible');
}
function updateStationId(oldId, newIdStr) {
  const newId = newIdStr.trim();
  if (!newId || newId === oldId) return;
  if (STATIONS[newId]) {
    alert('Station ID ' + newId + ' already exists!');
    document.getElementById('ip-id-input').value = oldId;
    return;
  }
  
  STATIONS[newId] = STATIONS[oldId];
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
  saveLinesToServer();
  
  linesG.selectAll('*').remove();
  stnsG.selectAll('*').remove();
  labelsG.selectAll('*').remove();
  
  Object.keys(graph).forEach(k => delete graph[k]);
  buildGraph();
  
  renderLines();
  renderStations();
  renderLabels();
  
  showInfoPanel(newId);
}
function updateStationType(id, type) {
  const s = getStn(id);
  if (!s) return;
  
  s.t = type;
  
  const grp = d3.select(`.sg-${id}`);
  const pc = stnColor(s);
  drawStationMarker(grp, id, s, pc);
  
  saveStationToServer(id);
}
function updateStationMeta(id, field, val) {
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
}
function updateStationKm(id, kmVal) {
  const s = getStn(id);
  if (!s) return;
  s.km = parseFloat(kmVal) || 0.0;
  
  saveStationToServer(id);
}
function deleteStationFromServer(id) {
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

function saveStationToServer(id) {
  const s = STATIONS[id];
  if (!s) return;
  fetch('/api/taipei/save-station', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, x: s.x, y: s.y, e: s.e, z: s.z, ln: s.ln, t: s.t, km: s.km })
  })
  .then(res => res.json())
  .then(data => console.log('Saved station:', data))
  .catch(err => console.warn('Failed to save station:', err));
}
function closeInfo() {
  document.getElementById('info-panel').classList.remove('visible');
}
function setRouteFromPanel(id) {
  closeInfo();
  if (!routeFrom) { setRouteStation(id); activateRouteSelect('to'); }
  else            { setRouteStation(id); }
}
//  SEARCH
// ════════════════════════════════════════════════════════════════
(function initSearch() {
  const input = document.getElementById('search-input');
  input.addEventListener('input', function() {
    const q = this.value.trim().toLowerCase();
    renderSR(q ? search(q) : []);
  });
})();
function search(q) {
  return Object.entries(STATIONS)
    .filter(([id,s]) => s.e && (s.e.toLowerCase().includes(q) || s.z.includes(q) || id.toLowerCase().includes(q)))
    .slice(0, 12)
    .map(([id,s]) => ({id, ...s}));
}
function renderSR(results) {
  const c = document.getElementById('search-results');
  if (!results.length) { c.innerHTML = ''; return; }
  c.innerHTML = results.map(r =>
    `<div class="sr-item" onclick="flyTo('${r.id}')">
      <span class="sr-code" style="background:${lineColor(r.ln[0])}">${r.id}</span>
      <div class="sr-names"><div class="sr-en">${r.e}</div><div class="sr-zh">${r.z}</div></div>
    </div>`
  ).join('');
}
function flyTo(id) {
  const s = getStn(id);
  if (!s) return;
  document.getElementById('search-input').value = '';
  document.getElementById('search-results').innerHTML = '';
  const cw = document.getElementById('map-container').clientWidth;
  const ch = document.getElementById('map-container').clientHeight;
  const sc = 3.5;
  svg.transition().duration(650).ease(d3.easeCubicInOut)
    .call(zoom.transform, d3.zoomIdentity
      .translate(cw/2 - sc*s.x, ch/2 - sc*s.y).scale(sc));
  setTimeout(() => showInfoPanel(id), 500);
}
// ════════════════════════════════════════════════════════════════
//  ROUTING UI
// ════════════════════════════════════════════════════════════════
function activateRouteSelect(role) {
  routeSelectMode = role;
  document.getElementById('route-from').style.borderColor = role==='from' ? 'var(--accent)' : '';
  document.getElementById('route-to').style.borderColor   = role==='to'   ? 'var(--accent)' : '';
}
function setRouteStation(id) {
  const s = getStn(id);
  if (!s || !routeSelectMode) return;
  const label = `${s.e} (${s.z})`;
  if (routeSelectMode === 'from') {
    routeFrom = id;
    document.getElementById('route-from').textContent = '✓ ' + label;
    document.getElementById('route-from').classList.add('set');
    routeSelectMode = 'to';
    activateRouteSelect('to');
  } else {
    routeTo = id;
    document.getElementById('route-to').textContent = '✓ ' + label;
    document.getElementById('route-to').classList.add('set');
    routeSelectMode = null;
    document.getElementById('route-btn').disabled = false;
    document.getElementById('route-clear').style.display = 'block';
    activateRouteSelect(null);
  }
}
function clearRoute() {
  routeFrom = routeTo = routeSelectMode = null;
  routeActive = false;
  document.getElementById('route-from').textContent = '— Select start · 出發站 —';
  document.getElementById('route-from').classList.remove('set');
  document.getElementById('route-to').textContent   = '— Select end · 目的站 —';
  document.getElementById('route-to').classList.remove('set');
  document.getElementById('route-btn').disabled = true;
  document.getElementById('route-clear').style.display = 'none';
  document.getElementById('route-result').classList.remove('visible');
  document.getElementById('route-from').style.borderColor = '';
  document.getElementById('route-to').style.borderColor   = '';
  clearHighlights();
}
// ════════════════════════════════════════════════════════════════
//  ROUTING — Dijkstra
// ════════════════════════════════════════════════════════════════
function buildGraph() {
  function addEdge(a, b, lid) {
    if (!a || !b) return;
    if (!graph[a]) graph[a] = [];
    if (!graph[b]) graph[b] = [];
    if (!graph[a].some(e => e.to===b)) graph[a].push({to:b, line:lid, w:1});
    if (!graph[b].some(e => e.to===a)) graph[b].push({to:a, line:lid, w:1});
  }
  LINES.forEach(ln => {
    const main = ln.stations;
    for (let i=0; i<main.length-1; i++) addEdge(main[i], main[i+1], ln.id);
    (ln.branches||[]).forEach(b => {
      const arr = [b.from, ...b.stations];
      for (let i=0; i<arr.length-1; i++) addEdge(arr[i], arr[i+1], ln.id);
    });
  });
}
function dijkstra(start, end) {
  const dist = {}, prev = {}, vis = new Set();
  Object.keys(STATIONS).forEach(id => dist[id] = Infinity);
  dist[start] = 0;
  const pq = [{id:start, d:0}];
  while (pq.length) {
    pq.sort((a,b) => a.d - b.d);
    const {id:u} = pq.shift();
    if (vis.has(u)) continue;
    vis.add(u);
    if (u === end) break;
    for (const {to:v, w} of (graph[u]||[])) {
      if (vis.has(v)) continue;
      const nd = dist[u] + w;
      if (nd < dist[v]) { dist[v]=nd; prev[v]=u; pq.push({id:v,d:nd}); }
    }
  }
  if (dist[end] === Infinity) return null;
  const path=[]; let cur=end;
  while(cur) { path.unshift(cur); cur=prev[cur]; }
  return path;
}
function calculateRoute() {
  if (!routeFrom || !routeTo) return;
  const path = dijkstra(routeFrom, routeTo);
  const res = document.getElementById('route-result');
  if (!path) {
    res.innerHTML = '<div style="color:#f87171">No route found.</div>';
    res.classList.add('visible'); return;
  }
  const stops = path.length - 1;
  res.innerHTML = `<div style="font-weight:600;color:#60a5fa;margin-bottom:7px">${stops} stop${stops!==1?'s':''}</div>`
    + path.map((id,i) => {
        const s = getStn(id); if (!s) return '';
        const c = lineColor(s.ln[0]);
        const w = (i===0||i===path.length-1)?'#e2e8f4':'#7a8499';
        return `<div class="rs-stop"><span class="rs-dot" style="background:${c}"></span><span class="rs-name" style="color:${w}">${s.e}</span></div>`;
      }).join('');
  res.classList.add('visible');
  highlightRoute(path);
}
function highlightRoute(path) {
  routeActive = true;
  const ps = new Set(path);
  linesG.selectAll('.line-path').transition().duration(200).attr('opacity',0.07).attr('stroke-width',5.5);
  stnsG.selectAll('.station-group').each(function() {
    const id = this.getAttribute('data-sid');
    d3.select(this).selectAll('rect,text').transition().duration(200)
      .attr('opacity', ps.has(id) ? 1 : 0.15);
  });
  // Highlight path edges
  for (let i=0; i<path.length-1; i++) {
    const a=path[i], b=path[i+1];
    LINES.forEach(ln => {
      const m=ln.stations, ia=m.indexOf(a), ib=m.indexOf(b);
      if (ia!==-1 && ib!==-1 && Math.abs(ia-ib)===1) {
        linesG.selectAll(`.lp-${ln.id}`)
          .transition().duration(200)
          .attr('opacity',1).attr('stroke-width',9)
          .attr('filter','url(#glow-soft)');
      }
      // check branches
      (ln.branches||[]).forEach(br => {
        const arr=[br.from,...br.stations];
        const ja=arr.indexOf(a), jb=arr.indexOf(b);
        if (ja!==-1 && jb!==-1 && Math.abs(ja-jb)===1) {
          linesG.selectAll(`.lp-${ln.id}`)
            .transition().duration(200).attr('opacity',1).attr('stroke-width',9);
        }
      });
    });
  }
  // Fit view
  const xs = path.map(id=>getStn(id)?.x).filter(Boolean);
  const ys = path.map(id=>getStn(id)?.y).filter(Boolean);
  if (xs.length) fitExtent(Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys));
}
function fitExtent(x1,y1,x2,y2) {
  const pad=80;
  const c = document.getElementById('map-container');
  const cw=c.clientWidth, ch=c.clientHeight;
  const sc = Math.min(cw/(x2-x1+2*pad), ch/(y2-y1+2*pad)) * 0.85;
  const tx = cw/2 - sc*(x1+x2)/2, ty = ch/2 - sc*(y1+y2)/2;
  svg.transition().duration(650)
    .call(zoom.transform, d3.zoomIdentity.translate(tx,ty).scale(sc));
}
// ════════════════════════════════════════════════════════════════
//  MAP CONTROLS
// ════════════════════════════════════════════════════════════════
function zoomIn()  { svg.transition().duration(280).call(zoom.scaleBy, 1.5); }
function zoomOut() { svg.transition().duration(280).call(zoom.scaleBy, 0.7); }
function resetView() {
  const c = document.getElementById('map-container');
  const cw=c.clientWidth, ch=c.clientHeight;
  const sc = Math.min(cw/SVG_W, ch/SVG_H) * 0.9;
  svg.transition().duration(500)
    .call(zoom.transform, d3.zoomIdentity
      .translate((cw-SVG_W*sc)/2, (ch-SVG_H*sc)/2).scale(sc));
  routeActive = false;
  clearHighlights();
}
// ════════════════════════════════════════════════════════════════
//  LEGEND
// ════════════════════════════════════════════════════════════════
function buildLegend() {
  const c = document.getElementById('legend-items');
  LINES.forEach(ln => {
    const div = document.createElement('div');
    div.className = 'legend-item';
    div.dataset.lid = ln.id;
    
    const eyeSpan = document.createElement('span');
    eyeSpan.className = 'legend-eye';
    eyeSpan.innerHTML = '👁️';
    eyeSpan.title = 'Toggle Line Visibility';
    
    eyeSpan.addEventListener('click', (ev) => {
      ev.stopPropagation();
      if (hiddenLines.has(ln.id)) {
        hiddenLines.delete(ln.id);
        div.classList.remove('hidden-line');
        eyeSpan.innerHTML = '👁️';
        eyeSpan.style.opacity = '1';
      } else {
        hiddenLines.add(ln.id);
        div.classList.add('hidden-line');
        eyeSpan.innerHTML = '👁️‍🗨️';
        eyeSpan.style.opacity = '0.4';
      }
      applyLineVisibility();
    });
    const swatch = document.createElement('div');
    swatch.className = 'legend-swatch';
    swatch.style.background = ln.color;
    const textWrap = document.createElement('div');
    textWrap.className = 'legend-text';
    textWrap.innerHTML = `<div class="l-en">${ln.e}</div><div class="l-zh">${ln.z}</div>`;
    div.appendChild(swatch);
    div.appendChild(textWrap);
    div.appendChild(eyeSpan);
    div.addEventListener('mouseenter', () => highlightLine(ln.id));
    div.addEventListener('mouseleave', clearHighlights);
    div.addEventListener('click', () => {
      document.querySelectorAll('.legend-item').forEach(el => el.classList.remove('active'));
      div.classList.toggle('active');
    });
    c.appendChild(div);
  });
}
function applyLineVisibility() {
  LINES.forEach(ln => {
    d3.selectAll(`.lp-${ln.id}`).attr('display', hiddenLines.has(ln.id) ? 'none' : null);
  });
  
  d3.selectAll('.station-group').attr('display', function() {
    const match = d3.select(this).attr('class').match(/sg-([A-Z0-9]+)/);
    if (!match) return null;
    const id = match[1];
    const s = STATIONS[id];
    if (!s || !s.ln) return null;
    const allHidden = s.ln.every(l => hiddenLines.has(l));
    return allHidden ? 'none' : null;
  });
  
  d3.selectAll('.label-group').attr('display', function() {
    const match = d3.select(this).attr('class').match(/lg-([A-Z0-9]+)/);
    if (!match) return null;
    const id = match[1];
    const s = STATIONS[id];
    if (!s || !s.ln) return null;
    const allHidden = s.ln.every(l => hiddenLines.has(l));
    return allHidden ? 'none' : null;
  });
}
// ════════════════════════════════════════════════════════════════
//  CLICK-AWAY CLOSE
// ════════════════════════════════════════════════════════════════
svg.on('click', () => {
  closeInfo();
  if (!routeSelectMode && routeActive) { routeActive=false; clearHighlights(); }
});
// ════════════════════════════════════════════════════════════════
//  EXPORT SVG
// ════════════════════════════════════════════════════════════════
function downloadSVG() {
  const svgEl = document.getElementById('map-svg').cloneNode(true);
  
  // Remove interactive control overlays if cloned or just export cleanly
  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svgEl);
  
  if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (!source.match(/^<svg[^>]+xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/)) {
    source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
  }
  
  source = '<?xml version="1.0" encoding="utf-8"?>\n' + source;
  
  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'taipei_metro_map.svg';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
function exportStationsJSON() {
  const jsonStr = JSON.stringify(STATIONS, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'stations.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
function resetCoordinates() {
  alert('Reset coordinates is no longer supported via local storage. Please update the server database.');
}
// ════════════════════════════════════════════════════════════════
//  BACKGROUND IMAGE CONTROLS
// ════════════════════════════════════════════════════════════════
let bgImageVisible = false;
function toggleBgImage() {
  bgImageVisible = !bgImageVisible;
  const btn = document.getElementById('toggle-bg-btn');
  const sliderWrap = document.getElementById('bg-opacity-wrap');
  const img = d3.select('#bg-map-image');
  
  if (bgImageVisible) {
    btn.textContent = 'Hide';
    btn.classList.add('active');
    sliderWrap.style.display = 'flex';
    img.attr('display', null);
  } else {
    btn.textContent = 'Show';
    btn.classList.remove('active');
    sliderWrap.style.display = 'none';
    img.attr('display', 'none');
  }
}
function adjustBgOpacity(val) {
  const opacity = val / 100;
  d3.select('#bg-map-image').attr('opacity', opacity);
  document.getElementById('bg-opacity-val').textContent = val + '%';
}
// ════════════════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════════════════
fetch('/api/taipei/lines')
  .then(res => res.json())
  .then(data => {
    LINES = data;
    return fetch('/api/taipei/stations');
  })
  .then(res => res.json())
  .then(data => {
    STATIONS = data;
    computeClusterOffsets();
    renderLines();
    renderStations();
    renderLabels();
    buildLegend();
    buildGraph();
    setTimeout(resetView, 80);
  })
  .catch(err => console.error('Failed to load map data:', err));
