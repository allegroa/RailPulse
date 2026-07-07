const fs = require('fs');

const file = 'd:/004_Software/RailPulse/general-configuration_web/server.js';
let content = fs.readFileSync(file, 'utf8');

const searchRegex = /    const infrastructure = result\?\.railml\?\.infrastructure \|\| result\?\.infrastructure \|\| result\?\.railML\?\.infrastructure;\s*if \(\!infrastructure\) \{\s*const keys = Object\.keys\(result \|\| \{\}\)\.join\(\', \'\);\s*return res\.status\(400\)\.json\(\{ success: false, error: `Formato RailML non valido o schema infrastructure mancante\. Radici trovate nel file: \[\$\{keys\}\]` \}\);\s*\}/m;

const replacement = `    // Se è un file codelist, importiamo gli operatori
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
        const fullName = \`\${m.code} - \${nameStr}\`;
        if (!db.operators.includes(fullName)) {
          db.operators.push(fullName);
          count++;
        }
      }
      await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
      return res.json({ success: true, message: \`Importati \${count} operatori dalla codelist!\`, gis: await readGis(lineId) });
    }

    const infrastructure = result?.railml?.infrastructure || result?.infrastructure || result?.railML?.infrastructure;
    if (!infrastructure) {
      const keys = Object.keys(result || {}).join(', ');
      return res.status(400).json({ success: false, error: \`Formato RailML non valido o schema infrastructure mancante. Radici trovate nel file: [\${keys}]\` });
    }`;

if (searchRegex.test(content)) {
  content = content.replace(searchRegex, replacement);
  fs.writeFileSync(file, content);
  console.log('Successfully updated server.js to handle codelists');
} else {
  console.log('Regex did not match');
}
