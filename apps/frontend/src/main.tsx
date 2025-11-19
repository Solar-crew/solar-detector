import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { MapProvider } from '@/contexts/MapContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <MapProvider>
          <App />
        </MapProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
