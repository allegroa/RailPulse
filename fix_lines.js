import fs from 'fs';
import path from 'path';

const linesPath = 'E:/Software/RailPulse/DATABASE/lines.json';

try {
  const data = JSON.parse(fs.readFileSync(linesPath, 'utf8'));
  
  // se è già nel formato corretto non fare nulla
  if (data.length > 0 && data[0].name !== undefined) {
    console.log('Già nel formato corretto.');
    process.exit(0);
  }

  const mappedData = data.map(line => {
    return {
      id: line.id,
      name: line.e || line.id,
      color: line.color || '#2196f3',
      stationSymbol: line.id,
      stationNumber: line.stations ? line.stations.length : 0,
      startKm: 0,
      endKm: 100, // placeholder
      tracks: ["Binario 1", "Binario 2"]
    };
  });

  fs.writeFileSync(linesPath, JSON.stringify(mappedData, null, 2));
  console.log('Conversione completata!');
} catch (e) {
  console.error('Errore:', e.message);
}
