import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { MapProvider } from '@/contexts/MapContext'
import { AnalysisProvider } from '@/contexts/AnalysisContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <MapProvider>
          <AnalysisProvider>
            <App />
          </AnalysisProvider>
        </MapProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
