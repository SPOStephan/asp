import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { PortalApp } from './PortalApp';
import { PortalErrorBoundary } from './PortalErrorBoundary';
import { PortalProvider } from './PortalData';
import './portal.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <PortalErrorBoundary>
        <PortalProvider>
          <PortalApp />
        </PortalProvider>
      </PortalErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
);

// Installable and usable offline (shell and last data); the app stores use the same build.
if ('serviceWorker' in navigator && import.meta.env.PROD && !('Capacitor' in window)) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/portal-sw.js');
  });
}
