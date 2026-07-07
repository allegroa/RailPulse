import re

file_path = "d:/004_Software/RailPulse/general-configuration_web/server.js"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Trova l'inizio e la fine dell'endpoint import-railml
start_marker = "app.post('/api/config/gis/:lineId/import-railml', upload.single('file'), async (req, res) => {"
end_marker = "await writeGis(lineId, gis);"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker, start_idx) + len(end_marker)

if start_idx == -1 or end_idx == -1:
    print("Non riesco a trovare l'endpoint nel file!")
    exit(1)

new_endpoint = """app.post('/api/config/gis/:lineId/import-railml', upload.single('file'), async (req, res) => {
  try {
    const { lineId } = req.params;
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Nessun file fornito' });
    }

    const xmlData = req.file.buffer.toString('utf-8');
    const result = await parseStringPromise(xmlData, { 
      explicitArray: false, 
      mergeAttrs: true,
      tagNameProcessors: [processors.stripPrefix]
    });

    const gis = await readGis(lineId);

    const overwrite = req.body.overwrite === 'true';
    if (overwrite) {
      gis.gisLayers = { sleepers: [], slab: [], ballast: [], curvatures: [], tonnage: [], switches: [], topology: { nodes: [], edges: [] } };
    }
    if (!gis.gisLayers.topology) {
      gis.gisLayers.topology = { nodes: [], edges: [] };
    }

    // Se è un file codelist, importiamo gli operatori
    if (result?.infrastructureManagerCodes) {
      const managers = result.infrastructureManagerCodes.infrastructureManager || [];
      const managerList = Array.isArray(managers) ? managers : [managers];
      let db = { operators: [] };
      try {
        const data = await fs.readFile(DB_PATH, 'utf-8');
        db = JSON.parse(data);
      } catch (e) {}
      if (!db.operators) db.operators = [];
      let count = 0;
      for (const m of managerList) {
        let nameObj = m.name;
        let nameStr = m.code;
        if (nameObj) {
          if (Array.isArray(nameObj)) {
            const en = nameObj.find(n => n['xml:lang'] === 'en');
            if (en) nameStr = en._ || en;
            else nameStr = nameObj[0]._ || nameObj[0];
          } else {
            nameStr = nameObj._ || nameObj;
          }
        }
        const fullName = `${m.code} - ${nameStr}`;
        if (!db.operators.includes(fullName)) {
          db.operators.push(fullName);
          count++;
        }
      }
      await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
      return res.json({ success: true, message: `Importati ${count} operatori dalla codelist!`, gis: await readGis(lineId) });
    }

    const infrastructure = result?.railml?.infrastructure || result?.infrastructure || result?.railML?.infrastructure;
    if (!infrastructure) {
      const keys = Object.keys(result || {}).join(', ');
      return res.status(400).json({ success: false, error: `Formato RailML non valido o schema infrastructure mancante. Radici trovate nel file: [${keys}]` });
    }

    // Parsing RailML 2.5
    let tracks = infrastructure.tracks?.track;
    if (tracks) {
      if (!Array.isArray(tracks)) tracks = [tracks];
      
      tracks.forEach(track => {
        let trackElements = track.trackElements || track.trackTopology?.trackElements || {};

        // Extract Topology Node
        if (track.id) {
          if (!gis.gisLayers.topology.nodes.find(n => n.id === track.id)) {
            gis.gisLayers.topology.nodes.push({ id: track.id, name: track.name || track.id, type: track.type || 'track' });
          }
        }

        // Extract Topology Edges
        let conns = track.trackTopology?.connections;
        if (conns) {
          ['switch', 'crossing'].forEach(ctype => {
            if (conns[ctype]) {
              let arr = Array.isArray(conns[ctype]) ? conns[ctype] : [conns[ctype]];
              arr.forEach(c => {
                if (c.connection && c.connection.ref) {
                  gis.gisLayers.topology.edges.push({
                    id: c.id || uuidv4(),
                    source: track.id,
                    target: c.connection.ref,
                    type: ctype
                  });
                }
              });
            }
          });
        }

        // Curvatures (radiusChanges)
        let radiusChanges = trackElements.radiusChanges?.radiusChange;
        if (radiusChanges) {
          if (!Array.isArray(radiusChanges)) radiusChanges = [radiusChanges];
          radiusChanges.forEach(rc => {
            const km = parseFloat(rc.pos || 0) / 1000;
            gis.gisLayers.curvatures.push({
              id: uuidv4(),
              startKm: km,
              endKm: km + 0.1, // approssimativo se non fornito
              radius: parseFloat(rc.radius || 0),
              superElevation: 0,
              transitionType: 'None',
              transitionLength: 0,
              color: '#FFC107'
            });
          });
        }

        // Switches
        let switches = trackElements?.switches?.switch || track.trackTopology?.connections?.switch || track.trackTopology?.connections?.crossing;
        if (switches) {
          if (!Array.isArray(switches)) switches = [switches];
          switches.forEach(sw => {
            const km = parseFloat(sw.pos || 0) / 1000;
            gis.gisLayers.switches.push({
              id: uuidv4(),
              km: km,
              switchId: sw.id || '',
              switchType: sw.type || 'Simple',
              angle: '1:12',
              condition: 'Good',
              color: '#2196F3'
            });
          });
        }
        
        // Esempio per ballast/sleepers
        let trackConditions = track.trackElements?.trackConditions?.trackCondition;
        if (trackConditions) {
          if (!Array.isArray(trackConditions)) trackConditions = [trackConditions];
          trackConditions.forEach(tc => {
            if (tc.type === 'ballast') {
              const startKm = parseFloat(tc.pos || 0) / 1000;
              const length = parseFloat(tc.length || 100) / 1000;
              gis.gisLayers.ballast.push({
                id: uuidv4(),
                startKm: startKm,
                endKm: startKm + length,
                ballastType: 'Mixed',
                condition: 'Good',
                color: '#9E9E9E'
              });
            }
          });
        }
      });
    }

    await writeGis(lineId, gis);"""

new_content = content[:start_idx] + new_endpoint + content[end_idx:]

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Endpoint ripristinato e aggiornato!")
