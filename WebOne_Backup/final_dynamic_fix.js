const fs = require('fs');
let code = fs.readFileSync('frontend_webbone/src/pages/DataVizualizer.jsx', 'utf-8');

if (!code.includes("import { useLocation } from 'react-router-dom';")) {
  code = code.replace(
    "import { useTranslation } from 'react-i18next';",
    "import { useTranslation } from 'react-i18next';\nimport { useLocation } from 'react-router-dom';"
  );
}

if (!code.includes("const urlFolder = searchParams.get('folder');")) {
  const hooksBlock = `  const { t, i18n } = useTranslation();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const urlFolder = searchParams.get('folder');
  const urlFile = searchParams.get('file');

  useEffect(() => {
    if (urlFile) {
      loadServerCsv(urlFile, urlFolder || 'upload');
    }
  }, [urlFile, urlFolder]);
`;
  code = code.replace("  const { t, i18n } = useTranslation();", hooksBlock);
}

const fetchFilesOld = `  const fetchFiles = async () => {
    try {
      const res = await axios.get(\`/api/files/\${encodeURIComponent('upload')}\`, { headers: { Authorization: \`Bearer \${token}\` } });
      setAvailableFiles(res.data?.files || []);
    } catch (err) {
      // silently ignore
      setAvailableFiles([]);
    }
  };`;
const fetchFilesNew = `  const fetchFiles = async () => {
    try {
      const fldr = urlFolder || 'upload';
      const res = await axios.get(\`/api/files/\${encodeURIComponent(fldr)}\`, { headers: { Authorization: \`Bearer \${token}\` } });
      setAvailableFiles(res.data?.files || []);
    } catch (err) {
      // silently ignore
      setAvailableFiles([]);
    }
  };`;
if (code.includes(fetchFilesOld)) {
    code = code.replace(fetchFilesOld, fetchFilesNew);
} else {
    // maybe it has formatted differently
    code = code.replace(
      "const res = await axios.get(`/api/files/${encodeURIComponent('upload')}`",
      "const res = await axios.get(`/api/files/${encodeURIComponent(urlFolder || 'upload')}`"
    );
}

code = code.replace(
  "useEffect(() => { fetchFiles(); }, []);",
  "useEffect(() => { fetchFiles(); }, [urlFolder]);"
);

const loadCsvOld = "const loadServerCsv = async (fileName, requestedSampleSize = sampleSize, storeFull = false) => {";
const loadCsvNew = "const loadServerCsv = async (fileName, folderName = urlFolder || 'upload', requestedSampleSize = sampleSize, storeFull = false) => {";
code = code.replace(loadCsvOld, loadCsvNew);

const urlOld = "const url = `/api/files/raw?folder=${encodeURIComponent('upload')}&file=${encodeURIComponent(fileName)}&download=1`;";
const urlNew = "const url = `/api/files/raw?folder=${encodeURIComponent(folderName)}&file=${encodeURIComponent(fileName)}&download=1`;";
code = code.replace(urlOld, urlNew);

const uploadOld = "await axios.post(`/api/files/${encodeURIComponent('upload')}/upload`, formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });";
const uploadNew = "await axios.post(`/api/files/${encodeURIComponent(urlFolder || 'upload')}/upload`, formData, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } });";
code = code.replace(uploadOld, uploadNew);

const serverFilesText = '<label className="block text-sm font-medium text-slate-700 mb-1">Server files (upload/)</label>';
const newServerFilesText = '<label className="block text-sm font-medium text-slate-700 mb-1">Server files ({urlFolder || \'upload/\'})</label>';
code = code.replace(serverFilesText, newServerFilesText);

fs.writeFileSync('frontend_webbone/src/pages/DataVizualizer.jsx', code);
console.log('SUCCESS');
