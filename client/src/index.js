import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import './i18n';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { ThemeProvider } from "./components/ThemeContext"; 
import { ShareProvider } from "./context/ShareContext";
import { HelmetProvider } from 'react-helmet-async'; // <-- 1. IMPORT HELMETPROVIDER

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider> {/* <-- 2. WRAP EVERYTHING WITH HELMETPROVIDER */}
      <ThemeProvider>
        <ShareProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ShareProvider>
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>
);

serviceWorkerRegistration.unregister();