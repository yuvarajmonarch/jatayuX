// Environment configuration for Bunker
export const config = {
  // API Keys
  MAPBOX_ACCESS_TOKEN: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
  OPEN_METEO_API_KEY: import.meta.env.VITE_OPEN_METEO_API_KEY || '',
  RAINVIEWER_API_KEY: import.meta.env.VITE_RAINVIEWER_API_KEY || '',

  // API Endpoints
  OPEN_METEO_BASE_URL: 'https://api.open-meteo.com/v1',
  OPEN_METEO_MARINE_URL: 'https://marine-api.open-meteo.com/v1',
  RAINVIEWER_BASE_URL: 'https://api.rainviewer.com/public',
  MAPBOX_BASE_URL: 'https://api.mapbox.com',
  GEMINI_API_KEY: 'AIzaSyCALvq07wplddTil1qQQ3u96xGBY3p8zwA',

  // Application Settings
  APP_NAME: 'Bunker',
  APP_VERSION: '1.0.0',
  NODE_ENV: import.meta.env.MODE || 'development',

  // Cache Settings
  CACHE_TIMEOUT: 5 * 60 * 1000, // 5 minutes
  CACHE_ENABLED: true,

  // Demo Settings
  DEMO_MODE: import.meta.env.VITE_DEMO_MODE === 'true' || true,
  MOCK_DATA_ENABLED: import.meta.env.VITE_MOCK_DATA_ENABLED === 'true' || true,

  // Map Settings
  DEFAULT_ZOOM: 12,
  MAX_ZOOM: 18,
  MIN_ZOOM: 1,

  // Analysis Settings
  ANALYSIS_TIMEOUT: 10000, // 10 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
};

export default config;
