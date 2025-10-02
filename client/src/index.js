import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// --- Global Imports ---
import './i18n';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

// --- Context Providers ---
import { ThemeProvider } from './components/Public-components/ThemeContext';
import { ShareProvider } from "./context/ShareContext";
import { HelmetProvider } from 'react-helmet-async';

// --- App Components & Styles ---
// Import both App components with unique names from the correct folder paths
import PublicApp from './Public-App/App';
import AdminApp from './Admin-App/App';

// Import both CSS files from their correct folder paths.
import './Public-App/index.css';
import './Admin-App/index.css';


// This new component is our "Master Router".
// It decides which app to show based on the URL.
function MainRouter() {
  return (
    <Routes>
      {/* If the URL path starts with /cms, render the Admin App. */}
      {/* The "/*" is a wildcard that allows for nested routes inside the Admin App. */}
      <Route path="/cms/*" element={<AdminApp />} />

      {/* For all other paths, render the Public App. */}
      {/* This acts as a "catch-all" for the public-facing site. */}
      {/* Note: The ShareProvider only wraps the PublicApp, as the admin panel doesn't need it. */}
      <Route path="/*" element={
        <ShareProvider>
          <PublicApp />
        </ShareProvider>
      } />
    </Routes>
  );
}


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Global providers that both apps will use */}
    <HelmetProvider>
      <ThemeProvider>
          {/* BrowserRouter now wraps our new Master Router */}
          <BrowserRouter>
            <MainRouter />
          </BrowserRouter>
      </ThemeProvider>
    </HelmetProvider>
  </React.StrictMode>
);

serviceWorkerRegistration.unregister();

