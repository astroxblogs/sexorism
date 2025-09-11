import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import './i18n';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import { ThemeProvider } from "./components/ThemeContext"; 
import { ShareProvider } from "./context/ShareContext"; // <-- Import ShareProvider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <ShareProvider> {/* <-- Wrap your app with ShareProvider */}
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ShareProvider>
    </ThemeProvider>
  </React.StrictMode>
);

serviceWorkerRegistration.unregister();
