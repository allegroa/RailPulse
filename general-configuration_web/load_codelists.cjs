const fs = require('fs');
const path = require('path');
const { parseStringPromise } = require('xml2js');

const dbPath = path.join(__dirname, 'database', 'config_db.json');
const codelistPath = path.join(__dirname, 'railml_schemas', 'codelists', 'InfrastructureManagers.xml');

async function main() {
  try {
    const xmlData = fs.readFileSync(codelistPath, 'utf8');
    const result = await parseStringPromise(xmlData, { explicitArray: false, mergeAttrs: true });

    let db = { operators: [] };
    if (fs.existsSync(dbPath)) {
      db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    }

    if (!db.operators) db.operators = [];

    const managers = result.infrastructureManagerCodes?.infrastructureManager || [];
    const managerList = Array.isArray(managers) ? managers : [managers];

    let count = 0;
    for (const m of managerList) {
      // Find english name or fallback
      let nameObj = m.name;
      let nameStr = m.code; // fallback to code
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

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    console.log(`Caricati con successo ${count} nuovi operatori ferroviari.`);

  } catch (err) {
    console.error('Errore:', err);
  }
}

main();
