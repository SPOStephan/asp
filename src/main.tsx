import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './App.css'
import App from './App.tsx'
import { HotelProvider } from './context/HotelContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <HotelProvider>
        <App />
      </HotelProvider>
    </BrowserRouter>
  </StrictMode>,
)
