import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { 
  MAPBOX_ACCESS_TOKEN, 
  MAP_STYLES, 
  getMapStyleForAnalysisType, 
  getLayersForAnalysisType,
  getLightingPresetForAnalysisType,
  shouldEnable3DForAnalysisType,
  LIGHT_PRESETS,
  LAYER_SLOTS
} from '../config/mapbox';
import FallbackMap from './FallbackMap';

interface MapViewProps {
  center: [number, number];
  zoom: number;
  layers?: Array<{
    id: string;
    type: string;
    source: string;
    url: string;
    visible: boolean;
  }>;
  analysisType?: string; // New prop to determine map style
  showLightingControl?: boolean; // New prop to show lighting controls
  enable3D?: boolean; // New prop to enable 3D features
  show3DControls?: boolean; // New prop to show 3D navigation controls
  enableGeotagging?: boolean; // New prop to enable location selection
  onLocationSelect?: (coordinates: { lat: number; lng: number }) => void; // Callback for location selection
}

const MapView: React.FC<MapViewProps> = ({ 
  center, 
  zoom, 
  layers = [], 
  analysisType = 'default', 
  showLightingControl = false,
  enable3D = false,
  show3DControls = false,
  enableGeotagging = false,
  onLocationSelect
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  const [currentLightingPreset, setCurrentLightingPreset] = useState<string>('day');
  // Intelligent 3D detection based on analysis type
  const shouldEnable3D = enable3D || shouldEnable3DForAnalysisType(analysisType);
  const [is3DEnabled, setIs3DEnabled] = useState<boolean>(shouldEnable3D);
  const [pitch, setPitch] = useState<number>(shouldEnable3D ? 45 : 0);
  const [bearing, setBearing] = useState<number>(0);
  // Geotagging state
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationMarker, setLocationMarker] = useState<mapboxgl.Marker | null>(null);

  // Setup 3D features function
  const setup3DFeatures = () => {
    if (!map.current) return;

    try {
      // Add terrain source
      map.current.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14
      });

      // Set terrain
      map.current.setTerrain({
        source: 'mapbox-dem',
        exaggeration: 1.5
      });

      // Add sky layer for realistic atmosphere
      map.current.addLayer({
        id: 'sky',
        type: 'sky',
        paint: {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 0.0],
          'sky-atmosphere-sun-intensity': 15
        }
      });

      // Add 3D buildings layer
      map.current.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 15,
        paint: {
          'fill-extrusion-color': '#aaa',
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'height']
          ],
          'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'min_height']
          ],
          'fill-extrusion-opacity': 0.6
        },
        slot: LAYER_SLOTS.middle
      });

      console.log('✅ 3D features enabled: terrain, buildings, and sky');
    } catch (error) {
      console.warn('Failed to setup 3D features:', error);
    }
  };

  useEffect(() => {
    if (map.current) return; // Initialize map only once

    // Suppress external script errors (like speed.js) that try to control non-existent videos
    const originalConsoleError = console.error;
    console.error = (...args) => {
      const message = args[0]?.toString() || '';
      // Suppress speed.js and playback-related errors
      if (message.includes('speed.js') || 
          message.includes('playbackRate') || 
          message.includes('Cannot read properties of null') ||
          message.includes('Cannot set properties of null') ||
          message.includes('Cannot read properties of undefined') ||
          message.includes('Cannot set properties of undefined')) {
        return; // Silently ignore these errors
      }
      // Log other errors normally
      originalConsoleError.apply(console, args);
    };

    try {
      // Set Mapbox access token
      mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

      // Select map style based on analysis type
      const mapStyle = getMapStyleForAnalysisType(analysisType);
      const lightingPreset = getLightingPresetForAnalysisType(analysisType);

      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: mapStyle,
        center: center,
        zoom: zoom,
        pitch: pitch, // 3D tilt angle
        bearing: bearing, // 3D rotation
        attributionControl: false,
        // 3D settings
        antialias: true, // Enable antialiasing for better 3D rendering
        // Disable telemetry to avoid blocked requests
        transformRequest: (url, resourceType) => {
          // Skip all analytics and telemetry requests
          if (url.includes('events.mapbox.com') || 
              url.includes('api.mapbox.com/events') ||
              url.includes('metrics') ||
              url.includes('telemetry')) {
            return null;
          }
          return { url };
        }
      });

      // Configure Standard style lighting when style loads
      map.current.on('style.load', () => {
        if (mapStyle === MAP_STYLES.standard) {
          try {
            // Set lighting preset for Standard style
            map.current?.setConfigProperty('basemap', 'lightPreset', lightingPreset);
            
            // Configure Standard style properties based on analysis type
            switch (analysisType.toLowerCase()) {
              case 'fishing':
              case 'marine':
                // Show water-related labels prominently
                map.current?.setConfigProperty('basemap', 'showPlaceLabels', true);
                map.current?.setConfigProperty('basemap', 'showPointOfInterestLabels', true);
                break;
              
              case 'traffic':
              case 'driving':
              case 'navigation':
                // Show road labels prominently
                map.current?.setConfigProperty('basemap', 'showRoadLabels', true);
                map.current?.setConfigProperty('basemap', 'showTransitLabels', true);
                break;
              
              case 'hiking':
              case 'outdoor':
              case 'trekking':
                // Show terrain and POI labels
                map.current?.setConfigProperty('basemap', 'showPlaceLabels', true);
                map.current?.setConfigProperty('basemap', 'showPointOfInterestLabels', true);
                break;
              
              default:
                // Default configuration
                map.current?.setConfigProperty('basemap', 'showPlaceLabels', true);
                map.current?.setConfigProperty('basemap', 'showRoadLabels', true);
                map.current?.setConfigProperty('basemap', 'showPointOfInterestLabels', true);
            }
          } catch (error) {
            console.warn('Failed to configure Standard style properties:', error);
          }
        }

        // Enable 3D features if requested
        if (is3DEnabled) {
          setup3DFeatures();
        }
      });

      // Handle missing images gracefully
      map.current.on('styleimagemissing', (e) => {
        // Only log non-critical missing images (avoid noise from speed.js)
        if (!e.id.includes('speed') && !e.id.includes('playback')) {
          console.warn('Missing image:', e.id);
        }
        // Don't fail the map for missing images
      });

      // Wait for the map to load before adding elements
      map.current.on('load', () => {
        try {
          // Add navigation controls
          map.current!.addControl(new mapboxgl.NavigationControl(), 'top-right');
          
          // Add 3D controls if enabled
          if (show3DControls) {
            map.current!.addControl(new mapboxgl.NavigationControl({
              showCompass: true,
              showZoom: true,
              visualizePitch: true
            }), 'top-right');
          }

          // Add a marker for the center point
          new mapboxgl.Marker({ color: '#3B82F6' })
            .setLngLat(center)
            .addTo(map.current!);

          // Add analysis-specific layers using v3 slot system
          const analysisLayers = getLayersForAnalysisType(analysisType);
          console.log(`🗺️ Adding ${analysisLayers.length} layers for ${analysisType} analysis`);
          
          analysisLayers.forEach(layer => {
            if (layer.visible) {
              try {
                // Add layer with slot positioning for Standard style
                const layerConfig: any = {
                  id: layer.id,
                  type: layer.type,
                  source: layer.source || layer.id,
                  paint: layer.paint || {},
                  layout: layer.layout || {}
                };

                // Add slot property if using Standard style and slot is defined
                if (mapStyle === MAP_STYLES.standard && layer.slot) {
                  layerConfig.slot = layer.slot;
                }

                // Add the layer
                if (layer.type === 'raster') {
                  // For raster layers, add source first
                  map.current!.addSource(layer.source || layer.id, {
                    type: 'raster',
                    url: layer.url || `https://tiles.mapbox.com/v4/mapbox.satellite/{z}/{x}/{y}.png`,
                    tileSize: 256
                  });
                }

                map.current!.addLayer(layerConfig);
                console.log(`✅ Added layer: ${layer.id}${layer.slot ? ` (slot: ${layer.slot})` : ''}`);
              } catch (error) {
                console.warn(`Failed to add layer ${layer.id}:`, error);
              }
            }
          });
          
          // Add provided layers (from backend)
          layers.forEach(layer => {
            if (layer.visible && layer.id !== 'satellite-imagery') {
              // Add custom layers from backend data
              try {
                const layerConfig: any = {
                  id: layer.id,
                  type: layer.type,
                  source: layer.source,
                  paint: {},
                  layout: {}
                };

                // Add slot for Standard style
                if (mapStyle === MAP_STYLES.standard) {
                  layerConfig.slot = LAYER_SLOTS.middle; // Default to middle slot
                }

                map.current!.addLayer(layerConfig);
                console.log(`✅ Added backend layer: ${layer.id}`);
              } catch (error) {
                console.warn(`Failed to add backend layer ${layer.id}:`, error);
              }
            }
          });
        } catch (error) {
          console.warn('Error adding map elements:', error);
          // Continue even if some elements fail
        }
      });

      // Add geotagging functionality if enabled
      if (enableGeotagging) {
        map.current.on('click', (e) => {
          const coordinates = {
            lat: e.lngLat.lat,
            lng: e.lngLat.lng
          };
          
          console.log('📍 Location selected:', coordinates);
          setSelectedLocation(coordinates);
          
          // Remove existing marker
          if (locationMarker) {
            locationMarker.remove();
          }
          
          // Create new marker
          const marker = new mapboxgl.Marker({ 
            color: '#EF4444',
            scale: 1.2
          })
            .setLngLat([coordinates.lng, coordinates.lat])
            .addTo(map.current!);
          
          setLocationMarker(marker);
          
          // Call callback if provided
          if (onLocationSelect) {
            onLocationSelect(coordinates);
          }
        });
        
        // Change cursor to indicate clickable
        map.current.getCanvas().style.cursor = 'crosshair';
      }

      // Handle map errors gracefully
      map.current.on('error', (e) => {
        // Suppress telemetry/analytics errors - they're expected since we disabled them
        if (e.error && e.error.message) {
          const errorMessage = e.error.message.toLowerCase();
          if (errorMessage.includes('events.mapbox.com') || 
              errorMessage.includes('analytics') || 
              errorMessage.includes('telemetry')) {
            // Silently ignore telemetry errors
            return;
          }
        }
        
        console.warn('Map error (non-critical):', e);
        // Only fall back for critical errors, not analytics/telemetry issues
        if (e.error && e.error.message && e.error.message.includes('style')) {
          setMapError('Map style failed to load.');
          setUseFallback(true);
        }
      });

      // Handle style load errors
      map.current.on('style.load', () => {
        console.log('Map style loaded successfully');
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to initialize map. Please refresh the page.');
      setUseFallback(true);
    }

    return () => {
      // Restore original console.error
      console.error = originalConsoleError;
      
      // Clean up location marker
      if (locationMarker) {
        locationMarker.remove();
      }
      
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [center, zoom, layers, analysisType]);

  if (useFallback || mapError) {
    return <FallbackMap center={center} zoom={zoom} />;
  }

  // Function to change lighting preset
  const changeLightingPreset = (preset: string) => {
    if (map.current && map.current.getStyle().name === 'Mapbox Standard') {
      try {
        map.current.setConfigProperty('basemap', 'lightPreset', preset);
        setCurrentLightingPreset(preset);
        console.log(`🌅 Lighting changed to: ${preset}`);
      } catch (error) {
        console.warn('Failed to change lighting preset:', error);
      }
    }
  };

  // 3D control functions
  const toggle3D = () => {
    if (!map.current) return;
    
    const new3DState = !is3DEnabled;
    setIs3DEnabled(new3DState);
    
    if (new3DState) {
      // Enable 3D
      setPitch(45);
      setBearing(0);
      map.current.easeTo({
        pitch: 45,
        bearing: 0,
        duration: 1000
      });
      setup3DFeatures();
      console.log('🏔️ 3D mode enabled');
    } else {
      // Disable 3D
      setPitch(0);
      setBearing(0);
      map.current.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 1000
      });
      // Remove 3D layers
      try {
        if (map.current.getLayer('3d-buildings')) {
          map.current.removeLayer('3d-buildings');
        }
        if (map.current.getLayer('sky')) {
          map.current.removeLayer('sky');
        }
        if (map.current.getSource('mapbox-dem')) {
          map.current.removeSource('mapbox-dem');
        }
        map.current.setTerrain(null);
      } catch (error) {
        console.warn('Error removing 3D features:', error);
      }
      console.log('🏔️ 3D mode disabled');
    }
  };

  const adjustPitch = (newPitch: number) => {
    if (!map.current || !is3DEnabled) return;
    
    setPitch(newPitch);
    map.current.easeTo({
      pitch: newPitch,
      duration: 500
    });
  };

  const adjustBearing = (newBearing: number) => {
    if (!map.current || !is3DEnabled) return;
    
    setBearing(newBearing);
    map.current.easeTo({
      bearing: newBearing,
      duration: 500
    });
  };

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden relative">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Lighting Control for Standard style */}
      {showLightingControl && map.current && map.current.getStyle()?.name === 'Mapbox Standard' && (
        <div className="absolute top-4 right-16 bg-black/70 backdrop-blur rounded-lg p-2 z-10">
          <div className="text-white text-xs mb-2 font-medium">Lighting</div>
          <div className="flex gap-1">
            {Object.entries(LIGHT_PRESETS).map(([key, value]) => (
              <button
                key={key}
                onClick={() => changeLightingPreset(value)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  currentLightingPreset === value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
                }`}
                title={`Switch to ${key} lighting`}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3D Controls */}
      {show3DControls && (
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur rounded-lg p-3 z-10">
          <div className="text-white text-xs mb-2 font-medium">3D View</div>
          
          {/* 3D Toggle */}
          <button
            onClick={toggle3D}
            className={`w-full px-3 py-1 text-xs rounded transition-colors mb-2 ${
              is3DEnabled
                ? 'bg-green-500 text-white'
                : 'bg-gray-600 text-gray-200 hover:bg-gray-500'
            }`}
            title="Toggle 3D mode"
          >
            {is3DEnabled ? '🏔️ 3D On' : '📐 2D On'}
          </button>

          {/* 3D Controls (only show when 3D is enabled) */}
          {is3DEnabled && (
            <div className="space-y-2">
              {/* Pitch Control */}
              <div>
                <div className="text-white text-xs mb-1">Pitch: {pitch}°</div>
                <input
                  type="range"
                  min="0"
                  max="85"
                  value={pitch}
                  onChange={(e) => adjustPitch(parseInt(e.target.value))}
                  className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Bearing Control */}
              <div>
                <div className="text-white text-xs mb-1">Bearing: {bearing}°</div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={bearing}
                  onChange={(e) => adjustBearing(parseInt(e.target.value))}
                  className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Quick 3D Presets */}
              <div className="flex gap-1">
                <button
                  onClick={() => { adjustPitch(30); adjustBearing(0); }}
                  className="px-2 py-1 text-xs bg-gray-600 text-gray-200 rounded hover:bg-gray-500"
                  title="Gentle 3D view"
                >
                  30°
                </button>
                <button
                  onClick={() => { adjustPitch(60); adjustBearing(0); }}
                  className="px-2 py-1 text-xs bg-gray-600 text-gray-200 rounded hover:bg-gray-500"
                  title="Steep 3D view"
                >
                  60°
                </button>
                <button
                  onClick={() => { adjustPitch(45); adjustBearing(45); }}
                  className="px-2 py-1 text-xs bg-gray-600 text-gray-200 rounded hover:bg-gray-500"
                  title="Angled 3D view"
                >
                  Angled
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MapView;
