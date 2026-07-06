import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

axios.defaults.baseURL = import.meta.env.VITE_API_URL || '';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/webone">
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
