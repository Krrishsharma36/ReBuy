import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { IndexedDBManager } from './database/db';

// Initialize offline database engine on application bootstrap
IndexedDBManager.getInstance()
  .initialize()
  .then(() => {
    console.log('[ReBuy DB] Offline IndexedDB engine initialized successfully.');
  })
  .catch((error) => {
    console.error('[ReBuy DB] Failed to initialize offline engine:', error);
  });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
