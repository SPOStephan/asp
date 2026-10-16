import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { PortalApp } from './PortalApp';
import { PortalProvider } from './PortalData';
import './portal.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <PortalProvider>
        <PortalApp />
      </PortalProvider>
    </BrowserRouter>
  </StrictMode>,
);

// Installable and usable offline (shell and last data); the app stores use the same build.
if ('serviceWorker' in navigator && import.meta.env.PROD && !('Capacitor' in window)) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/portal-sw.js');
  });
}
