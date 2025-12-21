import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'mapbox-gl/dist/mapbox-gl.css'
import './index.css'
import App from './App.tsx'

// Disable Mapbox telemetry to prevent blocked requests
import mapboxgl from 'mapbox-gl'
mapboxgl.accessToken = 'pk.eyJ1IjoibmlybWFsLTA3IiwiYSI6ImNtZnNqYW91NzBjN2EycXNoYTl6bWx6Ym8ifQ.pckER2f_OX6V10ttE5o3Pw'

// Completely disable Mapbox telemetry and analytics
mapboxgl.config = {
  ...mapboxgl.config,
  REQUEST_TIMEOUT: 0,
  MAX_PARALLEL_IMAGE_REQUESTS: 0,
  MAX_PARALLEL_IMAGE_REQUESTS_PER_FRAME: 0
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
