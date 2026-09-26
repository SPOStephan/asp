import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './App.css'
import App from './App.tsx'
import { HotelProvider } from './context/HotelContext'
import { IconLibraryProvider } from './context/IconLibraryContext'
import { MobileChromeProvider } from './context/MobileChromeContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <HotelProvider>
        <IconLibraryProvider>
        <MobileChromeProvider>
          <App />
        </MobileChromeProvider>
        </IconLibraryProvider>
      </HotelProvider>
    </BrowserRouter>
  </StrictMode>,
)
