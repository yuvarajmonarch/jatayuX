// Mapbox configuration
// Note: This is a public demo token. For production, use your own token.
export const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoibmlybWFsLTA3IiwiYSI6ImNtZnNqYW91NzBjN2EycXNoYTl6bWx6Ym8ifQ.pckER2f_OX6V10ttE5o3Pw';

// Disable Mapbox telemetry to avoid blocked requests
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.mapboxgl = window.mapboxgl || {};
  // @ts-ignore
  window.mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
  
  // Disable telemetry globally
  // @ts-ignore
  window.mapboxgl.config = {
    // @ts-ignore
    ...window.mapboxgl.config,
    REQUEST_TIMEOUT: 0,
    MAX_PARALLEL_IMAGE_REQUESTS: 0
  };
}

// Default map settings
export const DEFAULT_MAP_CENTER: [number, number] = [80.2707, 13.0827]; // Chennai
export const DEFAULT_MAP_ZOOM = 10;

// Map styles - Updated for Mapbox GL JS v3
export const MAP_STYLES = {
  // New Mapbox Standard style (default for v3)
  standard: 'mapbox://styles/mapbox/standard',
  
  // Classic styles (still supported)
  dark: 'mapbox://styles/mapbox/dark-v11',
  light: 'mapbox://styles/mapbox/light-v11',
  streets: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-v9',
  satellite_streets: 'mapbox://styles/mapbox/satellite-streets-v12',
  
  // Specialized styles for different use cases
  outdoor: 'mapbox://styles/mapbox/outdoors-v12',
  navigation: 'mapbox://styles/mapbox/navigation-day-v1',
  navigation_night: 'mapbox://styles/mapbox/navigation-night-v1',
  
  // Additional specialized styles
  traffic: 'mapbox://styles/mapbox/streets-v12', // Streets for traffic visibility
  marine: 'mapbox://styles/mapbox/satellite-v9', // Satellite for water visibility
  terrain: 'mapbox://styles/mapbox/outdoors-v12' // Outdoor for terrain features
};

// Lighting presets for Mapbox Standard style
export const LIGHT_PRESETS = {
  day: 'day',
  dusk: 'dusk',
  dawn: 'dawn',
  night: 'night'
} as const;

// Layer slots for Mapbox Standard style
export const LAYER_SLOTS = {
  bottom: 'bottom', // Above polygons (land, landuse, water, etc.)
  middle: 'middle', // Above lines (roads, etc.) and behind 3D buildings
  top: 'top'        // Above POI labels and behind Place and Transit labels
} as const;

// Map style selection based on analysis type - Updated for v3
export const getMapStyleForAnalysisType = (analysisType: string): string => {
  switch (analysisType.toLowerCase()) {
    case 'fishing':
    case 'marine':
      return MAP_STYLES.standard; // Use Standard with marine-focused lighting
    
    case 'weather':
    case 'rain':
    case 'storm':
      return MAP_STYLES.standard; // Use Standard with dusk/night lighting
    
    case 'hiking':
    case 'outdoor':
    case 'trekking':
    case 'trail':
      return MAP_STYLES.standard; // Use Standard with day lighting for terrain
    
    case 'driving':
    case 'navigation':
    case 'traffic':
    case 'road':
      return MAP_STYLES.standard; // Use Standard for navigation
    
    case 'urban':
    case 'city':
    case 'street':
      return MAP_STYLES.standard; // Use Standard for urban areas
    
    case 'satellite':
    case 'imagery':
      return MAP_STYLES.satellite; // Keep satellite for pure imagery
    
    default:
      return MAP_STYLES.standard; // Use new Standard style as default
  }
};

// Layer configurations for different analysis types - Updated for v3 slots
export const getLayersForAnalysisType = (analysisType: string) => {
  const baseLayers = [
    {
      id: "satellite-imagery",
      type: "raster",
      source: "satellite",
      url: "https://tiles.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.png",
      visible: true,
      slot: LAYER_SLOTS.bottom // Place at bottom for Standard style
    }
  ];

  switch (analysisType.toLowerCase()) {
    case 'fishing':
    case 'marine':
      return [
        ...baseLayers,
        {
          id: "marine-boundaries",
          type: "line",
          source: "marine",
          paint: {
            "line-color": "#00bfff",
            "line-width": 2
          },
          visible: true,
          slot: LAYER_SLOTS.middle // Above roads, behind 3D buildings
        }
      ];
    
    case 'traffic':
    case 'driving':
      return [
        ...baseLayers,
        {
          id: "traffic-flow",
          type: "line",
          source: "traffic",
          paint: {
            "line-color": ["case",
              ["==", ["get", "congestion"], "high"], "#ff0000",
              ["==", ["get", "congestion"], "medium"], "#ffa500", 
              "#00ff00"
            ],
            "line-width": 3
          },
          visible: true,
          slot: LAYER_SLOTS.top // Above POI labels for visibility
        }
      ];
    
    case 'hiking':
    case 'outdoor':
      return [
        ...baseLayers,
        {
          id: "elevation-contours",
          type: "line",
          source: "elevation",
          paint: {
            "line-color": "#8B4513",
            "line-width": 1
          },
          visible: true,
          slot: LAYER_SLOTS.middle // Above terrain, behind labels
        }
      ];
    
    default:
      return baseLayers;
  }
};

// Get lighting preset based on analysis type and time
export const getLightingPresetForAnalysisType = (analysisType: string, timeOfDay?: string): string => {
  // If time is provided, use it
  if (timeOfDay) {
    return timeOfDay.toLowerCase();
  }

  // Otherwise, choose based on analysis type
  switch (analysisType.toLowerCase()) {
    case 'fishing':
    case 'marine':
      return LIGHT_PRESETS.day; // Good visibility for water
    
    case 'weather':
    case 'rain':
    case 'storm':
      return LIGHT_PRESETS.dusk; // Dramatic lighting for weather
    
    case 'hiking':
    case 'outdoor':
    case 'trekking':
    case 'trail':
      return LIGHT_PRESETS.day; // Clear visibility for terrain
    
    case 'driving':
    case 'navigation':
    case 'traffic':
    case 'road':
      return LIGHT_PRESETS.day; // Clear visibility for navigation
    
    case 'urban':
    case 'city':
    case 'street':
      return LIGHT_PRESETS.dawn; // Soft lighting for urban areas
    
    default:
      return LIGHT_PRESETS.day; // Default to day lighting
  }
};

// Check if 3D features should be enabled for analysis type
export const shouldEnable3DForAnalysisType = (analysisType: string): boolean => {
  switch (analysisType.toLowerCase()) {
    case 'hiking':
    case 'outdoor':
    case 'trekking':
    case 'trail':
    case 'mountain':
    case 'elevation':
      return true; // 3D is great for terrain analysis
    
    case 'urban':
    case 'city':
    case 'building':
    case 'architecture':
      return true; // 3D buildings are perfect for urban analysis
    
    case 'fishing':
    case 'marine':
    case 'water':
      return false; // 2D is better for water analysis
    
    case 'weather':
    case 'rain':
    case 'storm':
      return false; // Weather overlays work better in 2D
    
    default:
      return true; // Default to 3D for general analysis
  }
};
