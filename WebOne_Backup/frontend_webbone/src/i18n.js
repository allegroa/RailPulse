import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  it: {
    translation: {
      "appTitle": "TGM Visualizer",
      "importFile": "Importa file",
      "loadServer": "Server File",
      "noFileSelected": "Nessun file caricato",
      "saveDatabase": "Salva Database Linee",
      "resetZoom": "Reset Zoom",
      "configureGraphs": "Configura Grafici",
      "infoTitle": "Info Rilievo",
      "configTitle": "Data / Config",
      "defectsTitle": "Report Difetti e Tolleranze",
      "tolerance": "Tolleranza",
      "samples": "Campioni val.",
      "outOfBounds": "Fuori Limite",
      "percentage": "Percentuale",
      "insertTolerance": "Inserisci una tolleranza.",
      "resample": "Resample",
      "apply": "Applica",
      "reset": "Reset",
      "xRange": "Range X:",
      "mapTitle": "Posizione Veicolo (Mappa)",
      "noLocation": "Dati Lat/Lon non disponibili per questo punto.",
      "savingSuccess": "Database Linee salvato con successo!",
      "savingError": "Errore durante il salvataggio",
      "language": "Lingua"
    }
  },
  en: {
    translation: {
      "appTitle": "TGM Visualizer",
      "importFile": "Import File",
      "loadServer": "Server File",
      "noFileSelected": "No file loaded",
      "saveDatabase": "Save Line Database",
      "resetZoom": "Reset Zoom",
      "configureGraphs": "Configure Graphs",
      "infoTitle": "Survey Info",
      "configTitle": "Data / Config",
      "defectsTitle": "Defects & Tolerances Report",
      "tolerance": "Tolerance",
      "samples": "Samples",
      "outOfBounds": "Out of Bounds",
      "percentage": "Percentage",
      "insertTolerance": "Insert a tolerance.",
      "resample": "Resample",
      "apply": "Apply",
      "reset": "Reset",
      "xRange": "X Range:",
      "mapTitle": "Vehicle Position (Map)",
      "noLocation": "Lat/Lon data not available for this point.",
      "savingSuccess": "Line Database saved successfully!",
      "savingError": "Error saving",
      "language": "Language"
    }
  },
  zh: {
    translation: {
      "appTitle": "TGM Visualizer",
      "importFile": "导入文件",
      "loadServer": "服务器文件",
      "noFileSelected": "未加载文件",
      "saveDatabase": "保存线路数据库",
      "resetZoom": "重置缩放",
      "configureGraphs": "配置图表",
      "infoTitle": "测量信息",
      "configTitle": "数据/配置",
      "defectsTitle": "缺陷与公差报告",
      "tolerance": "公差",
      "samples": "样本",
      "outOfBounds": "越界",
      "percentage": "百分比",
      "insertTolerance": "插入公差。",
      "resample": "重新采样",
      "apply": "应用",
      "reset": "重置",
      "xRange": "X 范围:",
      "mapTitle": "车辆位置 (地图)",
      "noLocation": "该点没有可用的经纬度数据。",
      "savingSuccess": "线路数据库保存成功！",
      "savingError": "保存时出错",
      "language": "语言"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'it',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
