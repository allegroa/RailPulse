import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DataVisualizerClient from './components/DataVisualizerClient.jsx';
import ConfigurationPage from './components/ConfigurationPage.jsx';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DataVisualizerClient />} />
        <Route path="/configuration" element={<ConfigurationPage />} />
      </Routes>
    </Router>
  );
}
