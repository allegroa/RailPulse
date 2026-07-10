const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const readline = require('readline');
const Papa = require('papaparse');

/**
 * Parsing del nome cartella sessione TGM
 * Formato: YYYY.MM.DD HH.MM.SSK[Km]+[Meter]~K[Km]+[Meter]
 * Esempio: 2026.02.27 00.22.18K100+000~K100+500
 */
function parseSessionFolderName(folderName) {
  const regex = /^(\d{4}\.\d{2}\.\d{2})\s+(\d{2}\.\d{2}\.\d{2})K(\d+)\+(\d{3})~K(\d+)\+(\d{3})$/;
  const regexLoose = /^(\d{4}\.\d{2}\.\d{2})\s+(\d{2}\.\d{2}\.\d{2})$/;

  let match = folderName.match(regex);
  if (match) {
    const date = match[1].replace(/\./g, '-'); // YYYY-MM-DD
    const time = match[2].replace(/\./g, ':'); // HH:MM:SS
    const startKm = parseInt(match[3], 10) + parseInt(match[4], 10) / 1000;
    const endKm = parseInt(match[5], 10) + parseInt(match[6], 10) / 1000;

    return {
      id: folderName,
      folderName,
      date,
      time,
      startKm,
      endKm,
      label: `${date} ${time} (Km ${startKm.toFixed(3)} ~ Km ${endKm.toFixed(3)})`
    };
  }

  match = folderName.match(regexLoose);
  if (match) {
    const date = match[1].replace(/\./g, '-');
    const time = match[2].replace(/\./g, ':');
    return {
      id: folderName,
      folderName,
      date,
      time,
      startKm: 0,
      endKm: 0,
      label: `${date} ${time}`
    };
  }

  return null;
}

/**
 * Lettura e parsing di un file CSV tramite papaparse
 */
async function parseCSVFile(filePath) {
  try {
    let fileContent = await fs.readFile(filePath, 'utf-8');
    
    // I file come 超限報表.csv hanno 3 righe di metadati, 1 vuota, e l'intestazione vera è alla riga 5.
    if (filePath.includes('超限報表.csv') || filePath.includes('軌道TQI報表.csv') || filePath.includes('軌道參數報表.csv')) {
      const lines = fileContent.split(/\r?\n/);
      if (lines.length > 4) {
        fileContent = lines.slice(4).join('\n');
      }
    }

    return new Promise((resolve, reject) => {
      const seenHeaders = new Set();
      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        transformHeader: (header, index) => {
          if (filePath.includes('超限報表.csv')) {
            const exceedanceHeaders = [
              'Location (km)',
              'Location (m)',
              'Type of Over-limit',
              'Peak Value (mm)',
              'Length (m)',
              'Over-limit Class',
              'Linearity (Straight/Gradual/Curved)',
              'Speed (km/h)',
              'Detection Standard (mm)'
            ];
            if (index < exceedanceHeaders.length) {
              return exceedanceHeaders[index];
            }
          }
          let cleanHeader = header ? header.replace(/[\x00-\x1F\x7F-\x9F\uFEFF]/g, '').trim() : header;
          
          if (cleanHeader) {
            let original = cleanHeader;
            let counter = 1;
            while (seenHeaders.has(cleanHeader)) {
              cleanHeader = `${original}_${counter}`;
              counter++;
            }
            seenHeaders.add(cleanHeader);
          }
          
          return cleanHeader;
        },
        complete: (results) => {
          resolve(results.data);
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  } catch (err) {
    console.error(`Errore durante la lettura del file ${filePath}:`, err);
    throw err;
  }
}

/**
 * Trova i file all'interno di una cartella di sessione
 */
async function findSessionFiles(sessionFolderPath) {
  try {
    const files = await fs.readdir(sessionFolderPath);
    const result = {
      exceedances: null,
      tqi: null,
      parameters: null
    };

    for (const file of files) {
      if (file.includes('超限報表.csv')) {
        result.exceedances = path.join(sessionFolderPath, file);
      } else if (file.includes('軌道TQI報表.csv')) {
        result.tqi = path.join(sessionFolderPath, file);
      } else if (file.includes('軌道參數報表.csv')) {
        result.parameters = path.join(sessionFolderPath, file);
      }
    }
    return result;
  } catch (error) {
    console.error('Errore lettura file della sessione TGM:', error);
    return null;
  }
}

/**
 * Estrae e parsa la "Line Name" (es. 1150422XDLDN) leggendo la prima riga del CSV
 */
async function extractLineNameData(csvFilePath) {
  if (!csvFilePath) return null;
  try {
    const fd = await fs.open(csvFilePath, 'r');
    const buffer = Buffer.alloc(1024);
    await fd.read(buffer, 0, 1024, 0);
    await fd.close();
    
    const text = buffer.toString('utf-8');
    const firstLine = text.split('\n')[0];
    const columns = firstLine.split(/[,;]/);
    
    if (columns.length > 1) {
      const lineNameRaw = columns[1].trim();
      // Line Name format: [digits (unknown)][Station codes][UP|DN][optional track numbers]
      const match = lineNameRaw.match(/^(\d+)(.*?)(UP|DN)(\d*)$/i);
      if (match) {
        const center = match[2];
        const direction = match[3].toUpperCase();
        
        let startStation = center;
        let endStation = ''; // Come richiesto dall'utente, il Line Name contiene solo la stazione di partenza
        
        return {
          lineNameRaw,
          stazionePartenza: startStation,
          stazioneArrivo: endStation,
          direction
        };
      } else {
        // Fallback: se il Line Name è generico (es. "20260226") lo restituiamo direttamente come stazionePartenza
        return {
          lineNameRaw,
          stazionePartenza: lineNameRaw !== 'NoName' ? lineNameRaw : '',
          stazioneArrivo: '',
          direction: ''
        };
      }
    }
  } catch(e) {
    console.error('Errore estrazione Line Name:', e);
  }
  return null;
}

/**
 * Scansiona in stream il file CSV dei parametri ed estrae Stazioni, Scambi e altri Punti Noti.
 */
async function extractGisElementsFromParameters(csvFilePath) {
  if (!csvFilePath) return { stations: [], switches: [], points: [] };
  
  return new Promise((resolve, reject) => {
    const stations = [];
    const switches = [];
    const points = [];
    
    // Mappe per accoppiare Start ed End per elementi lineari (Stazioni e Scambi)
    const activeLinears = {
      STATION: null,
      SWITCH: null
    };

    const LINEAR_ELEMENTS = ['STATION', 'SWITCH'];

    const fileStream = fsSync.createReadStream(csvFilePath, { encoding: 'utf-8' });
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let lineIndex = 0;

    rl.on('line', (line) => {
      lineIndex++;
      // Salta le prime 5 righe (3 di metadati, 1 vuota, 1 di intestazione)
      if (lineIndex <= 5) return;

      const cols = line.split(',');
      if (cols.length >= 12) {
        const kmStr = cols[1];
        const label = cols[11] ? cols[11].trim() : '';

        if (label && kmStr) {
          const currentKm = parseFloat(kmStr);
          if (isNaN(currentKm)) return;

          const isLinear = LINEAR_ELEMENTS.includes(label.toUpperCase());

          if (isLinear) {
            const key = label.toUpperCase();
            if (activeLinears[key] === null) {
              // Apre l'elemento lineare
              activeLinears[key] = currentKm;
            } else {
              // Chiude l'elemento lineare
              const startKm = activeLinears[key];
              const endKm = currentKm;
              
              const id = `${key}_${startKm.toFixed(3)}`;
              
              if (key === 'STATION') {
                stations.push({
                  id,
                  type: 'Station',
                  stationCode: id, // Nome temporaneo, da raffinare se possibile
                  startKm: Math.min(startKm, endKm),
                  endKm: Math.max(startKm, endKm),
                  tracks: 1
                });
              } else if (key === 'SWITCH') {
                switches.push({
                  id,
                  switchId: id,
                  type: 'Turnout',
                  startKm: Math.min(startKm, endKm),
                  endKm: Math.max(startKm, endKm),
                  angle: '1:12', // default
                  direction: 'Left'
                });
              }
              // Reset per il prossimo
              activeLinears[key] = null;
            }
          } else {
            // Elemento puntuale generico
            points.push({
              id: `${label}_${currentKm.toFixed(3)}`,
              type: label,
              km: currentKm
            });
          }
        }
      }
    });

    rl.on('close', () => {
      resolve({ stations, switches, points });
    });

    rl.on('error', (err) => {
      console.error('Errore stream estrazione GIS:', err);
      reject(err);
    });
  });
}

module.exports = {
  parseSessionFolderName,
  parseCSVFile,
  findSessionFiles,
  extractLineNameData,
  extractGisElementsFromParameters
};
