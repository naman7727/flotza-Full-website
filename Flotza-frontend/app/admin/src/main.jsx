import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux';
import './index.css'
import App from './routes/routes.jsx'
import store from './lib/store/store.js';
import {  ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
       <ToastContainer position="top-right" autoClose={3000} />
      <App />
    </Provider>
  </StrictMode>,
)