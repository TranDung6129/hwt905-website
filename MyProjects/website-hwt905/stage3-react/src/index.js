/**
 * GIAI ĐOẠN 3: REACT ENTRY POINT
 * Chương 6: React render, StrictMode
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
