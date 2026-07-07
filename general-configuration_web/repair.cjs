const fs = require('fs');

const file = 'd:/004_Software/RailPulse/general-configuration_web/server.js';
let content = fs.readFileSync(file, 'utf8');

const searchRegex = /\} catch \(err\) \{\s*res\.status\(500\)\.json\(\{ success: false, error: err\.message \}\);\s*\/\/\s*Parsing RailML 2\.5/m;

const fix = `} catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST – importa un file RailML per precompilare il GIS
app.post('/api/config/gis/:lineId/import-railml', upload.single('file'), async (req, res) => {
  try {
    const { lineId } = req.params;
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Nessun file fornito' });
    }

    const xmlData = req.file.buffer.toString('utf-8');
    const xml2js = require('xml2js');
    const result = await xml2js.parseStringPromise(xmlData, { 
      explicitArray: false, 
      mergeAttrs: true,
      tagNameProcessors: [xml2js.processors.stripPrefix]
    });

    const gis = await readGis(lineId);

    const overwrite = req.body.overwrite === 'true';
    if (overwrite) {
      gis.gisLayers = { sleepers: [], slab: [], ballast: [], curvatures: [], tonnage: [], switches: [] };
    }

    const infrastructure = result?.railml?.infrastructure || result?.infrastructure;
    if (!infrastructure) {
      return res.status(400).json({ success: false, error: 'Formato RailML non valido o schema infrastructure mancante' });
    }

    // Parsing RailML 2.5`;

if (searchRegex.test(content)) {
  content = content.replace(searchRegex, fix);
  fs.writeFileSync(file, content);
  console.log('Successfully repaired server.js');
} else {
  console.log('Regex did not match');
}
