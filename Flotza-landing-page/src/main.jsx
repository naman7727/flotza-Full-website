import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
// Import WebSocket reconnection handler to fix WebSocket errors
// import './websocket-reconnect.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);