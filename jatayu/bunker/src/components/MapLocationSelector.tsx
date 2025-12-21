import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

interface MapLocationSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (coordinates: { lat: number; lng: number }[], bounds: any) => void;
}

const MapLocationSelector: React.FC<MapLocationSelectorProps> = ({ 
  isOpen, 
  onClose, 
  onLocationSelect 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<MapboxDraw | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnPolygon, setDrawnPolygon] = useState<any>(null);
  const [selectedArea, setSelectedArea] = useState<{ lat: number; lng: number }[]>([]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setMapLoaded(false);
      setIsDrawing(false);
      setDrawnPolygon(null);
      setSelectedArea([]);
    }
  }, [isOpen]);

  // Initialize map when modal opens
  useEffect(() => {
    if (!isOpen || !mapContainer.current || map.current) return;

    console.log('🗺️ Initializing map...');
    mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [77.2090, 28.6139], // Default to Delhi
      zoom: 10,
      attributionControl: false
    });

    map.current.on('load', () => {
      console.log('🗺️ Map loaded successfully');
      setMapLoaded(true);
      setupDrawingTools();
    });

    map.current.on('error', (e) => {
      console.error('🗺️ Map error:', e);
    });

    return () => {
      if (map.current) {
        console.log('🗺️ Cleaning up map');
        map.current.remove();
        map.current = null;
        draw.current = null;
      }
    };
  }, [isOpen]);

  const setupDrawingTools = () => {
    if (!map.current || draw.current) return;

    console.log('🛠️ Setting up drawing tools...');
    
    try {
      // Add drawing controls
      draw.current = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true
        },
        defaultMode: 'simple_select',
        styles: [
          {
            id: 'gl-draw-polygon-fill-inactive',
            type: 'fill',
            filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
            paint: {
              'fill-color': '#3fb1ce',
              'fill-outline-color': '#3fb1ce',
              'fill-opacity': 0.3
            }
          },
          {
            id: 'gl-draw-polygon-fill-active',
            type: 'fill',
            filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
            paint: {
              'fill-color': '#fbb03b',
              'fill-outline-color': '#fbb03b',
              'fill-opacity': 0.3
            }
          },
          {
            id: 'gl-draw-polygon-stroke-inactive',
            type: 'line',
            filter: ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
            layout: {
              'line-cap': 'round',
              'line-join': 'round'
            },
            paint: {
              'line-color': '#3fb1ce',
              'line-width': 2
            }
          },
          {
            id: 'gl-draw-polygon-stroke-active',
            type: 'line',
            filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
            layout: {
              'line-cap': 'round',
              'line-join': 'round'
            },
            paint: {
              'line-color': '#fbb03b',
              'line-width': 2
            }
          }
        ]
      });

        map.current.addControl(draw.current);
      console.log('✅ Drawing tools added successfully');

      // Listen for draw events
      map.current.on('draw.create', (e) => {
        console.log('🎨 Polygon created:', e.features.length, 'features');
        const features = e.features;
        if (features.length > 0) {
          const polygon = features[0];
          const coordinates = polygon.geometry.coordinates[0];
          const lngLatCoordinates = coordinates.map((coord: number[]) => ({
            lng: coord[0],
            lat: coord[1]
          }));
          
          setDrawnPolygon(polygon);
          setSelectedArea(lngLatCoordinates);
          
          // Calculate bounds
          const bounds = coordinates.reduce((bounds: any, coord: number[]) => {
            return bounds.extend(coord);
          }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
          
          map.current?.fitBounds(bounds, { padding: 50 });
        }
      });

      map.current.on('draw.update', (e) => {
        console.log('🎨 Polygon updated:', e.features.length, 'features');
        const features = e.features;
        if (features.length > 0) {
          const polygon = features[0];
          const coordinates = polygon.geometry.coordinates[0];
          const lngLatCoordinates = coordinates.map((coord: number[]) => ({
            lng: coord[0],
            lat: coord[1]
          }));
          
          setDrawnPolygon(polygon);
          setSelectedArea(lngLatCoordinates);
        }
      });

      map.current.on('draw.delete', () => {
        console.log('🗑️ Polygon deleted');
        setDrawnPolygon(null);
        setSelectedArea([]);
      });
      
    } catch (error) {
      console.error('❌ Error setting up drawing tools:', error);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedArea.length > 0) {
      // Calculate center point of polygon
      const centerLat = selectedArea.reduce((sum, coord) => sum + coord.lat, 0) / selectedArea.length;
      const centerLng = selectedArea.reduce((sum, coord) => sum + coord.lng, 0) / selectedArea.length;
      
      // Calculate bounds
      const bounds = {
        north: Math.max(...selectedArea.map(coord => coord.lat)),
        south: Math.min(...selectedArea.map(coord => coord.lat)),
        east: Math.max(...selectedArea.map(coord => coord.lng)),
        west: Math.min(...selectedArea.map(coord => coord.lng))
      };

      onLocationSelect(selectedArea, { center: { lat: centerLat, lng: centerLng }, bounds });
      onClose();
    }
  };

  const handleClearSelection = () => {
    if (draw.current) {
      draw.current.deleteAll();
    }
    setDrawnPolygon(null);
    setSelectedArea([]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-6xl h-[80vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div>
                <h2 className="text-xl font-semibold text-white">Select Area on Map</h2>
                <p className="text-sm text-gray-400">Draw a polygon to define your analysis area</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Map Container */}
            <div className="flex-1 relative">
              <div ref={mapContainer} className="w-full h-full" />
              
              {/* Loading State */}
              {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-white text-sm">Loading map...</p>
                  </div>
                </div>
              )}
              
              {/* Map Attribution */}
              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                © Mapbox
              </div>
              
              {/* Map Controls */}
              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur rounded-lg p-3">
                <div className="text-white text-sm mb-2">Drawing Tools</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (draw.current) {
                        draw.current.changeMode('draw_polygon');
                        setIsDrawing(true);
                      }
                    }}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                  >
                    📐 Draw Area
                  </button>
                  <button
                    onClick={handleClearSelection}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                  >
                    🗑️ Clear
                  </button>
                </div>
              </div>

              {/* Selection Info */}
              {selectedArea.length > 0 && (
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur rounded-lg p-3">
                  <div className="text-white text-sm mb-2">Selected Area</div>
                  <div className="text-gray-300 text-xs">
                    <div>Points: {selectedArea.length}</div>
                    <div>Center: {selectedArea.reduce((sum, coord) => sum + coord.lat, 0) / selectedArea.length}°N, {selectedArea.reduce((sum, coord) => sum + coord.lng, 0) / selectedArea.length}°E</div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-700">
              <div className="text-sm text-gray-400">
                {selectedArea.length > 0 ? (
                  <>✓ Area selected ({selectedArea.length} points)</>
                ) : (
                  <>Draw a polygon on the map to select your analysis area</>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSelection}
                  disabled={selectedArea.length === 0}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:opacity-50 text-white rounded-lg transition-colors"
                >
                  Use Selected Area
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MapLocationSelector;
