import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface SimpleMapSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (coordinates: { lat: number; lng: number }[], bounds: any) => void;
}

const SimpleMapSelector: React.FC<SimpleMapSelectorProps> = ({ 
  isOpen, 
  onClose, 
  onLocationSelect 
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedPoints, setSelectedPoints] = useState<{ lat: number; lng: number }[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setMapLoaded(false);
      setIsDrawing(false);
      setSelectedPoints([]);
    }
  }, [isOpen]);

  // Initialize map when modal opens
  useEffect(() => {
    if (!isOpen || !mapContainer.current || map.current) return;

    console.log('🗺️ Initializing simple map...');
    mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-v9',
      center: [77.2090, 28.6139], // Default to Delhi
      zoom: 10,
      attributionControl: false
    });

    map.current.on('load', () => {
      console.log('🗺️ Simple map loaded successfully');
      setMapLoaded(true);
    });

    map.current.on('error', (e) => {
      console.error('🗺️ Simple map error:', e);
    });

    // Add click handler for point selection
    map.current.on('click', (e) => {
      if (isDrawing) {
        const newPoint = {
          lat: e.lngLat.lat,
          lng: e.lngLat.lng
        };
        setSelectedPoints(prev => [...prev, newPoint]);
      }
    });

    return () => {
      if (map.current) {
        console.log('🗺️ Cleaning up simple map');
        map.current.remove();
        map.current = null;
      }
    };
  }, [isOpen, isDrawing]);

  // Add markers for selected points
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Remove existing markers
    const existingMarkers = document.querySelectorAll('.point-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Add new markers
    selectedPoints.forEach((point, index) => {
      const marker = document.createElement('div');
      marker.className = 'point-marker';
      marker.style.cssText = `
        width: 20px;
        height: 20px;
        background-color: #3b82f6;
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: bold;
        cursor: pointer;
        z-index: 1000;
      `;
      marker.textContent = (index + 1).toString();
      
      new mapboxgl.Marker(marker)
        .setLngLat([point.lng, point.lat])
        .addTo(map.current!);
    });
  }, [selectedPoints, mapLoaded]);

  const handleStartDrawing = () => {
    setIsDrawing(true);
    setSelectedPoints([]);
  };

  const handleClearSelection = () => {
    setSelectedPoints([]);
    setIsDrawing(false);
  };

  const handleConfirmSelection = () => {
    if (selectedPoints.length >= 3) {
      // Calculate bounds
      const bounds = {
        north: Math.max(...selectedPoints.map(p => p.lat)),
        south: Math.min(...selectedPoints.map(p => p.lat)),
        east: Math.max(...selectedPoints.map(p => p.lng)),
        west: Math.min(...selectedPoints.map(p => p.lng))
      };

      const center = {
        lat: selectedPoints.reduce((sum, p) => sum + p.lat, 0) / selectedPoints.length,
        lng: selectedPoints.reduce((sum, p) => sum + p.lng, 0) / selectedPoints.length
      };

      onLocationSelect(selectedPoints, { center, bounds });
      onClose();
    }
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
                <p className="text-sm text-gray-400">Click points to create a polygon area</p>
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
              <div 
                ref={mapContainer} 
                className="w-full h-full"
                style={{ minHeight: '400px' }}
              />
              
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
                <div className="text-white text-sm mb-2">Selection Tools</div>
                <div className="flex gap-2">
                  <button
                    onClick={handleStartDrawing}
                    disabled={isDrawing}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-xs rounded transition-colors"
                  >
                    📍 Start Drawing
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
              {selectedPoints.length > 0 && (
                <div className="absolute top-4 right-4 bg-black/70 backdrop-blur rounded-lg p-3">
                  <div className="text-white text-sm mb-2">Selected Points</div>
                  <div className="text-gray-300 text-xs">
                    <div>Points: {selectedPoints.length}</div>
                    <div>Status: {isDrawing ? 'Drawing...' : 'Complete'}</div>
                    {selectedPoints.length >= 3 && (
                      <div className="text-green-400 mt-1">✓ Ready to confirm</div>
                    )}
                  </div>
                </div>
              )}

              {/* Instructions */}
              {isDrawing && (
                <div className="absolute bottom-20 left-4 bg-black/70 backdrop-blur rounded-lg p-3">
                  <div className="text-white text-sm mb-1">Instructions:</div>
                  <div className="text-gray-300 text-xs">
                    <div>• Click points on the map to create a polygon</div>
                    <div>• Need at least 3 points</div>
                    <div>• Click "Clear" to start over</div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-700">
              <div className="text-sm text-gray-400">
                {selectedPoints.length >= 3 ? (
                  <>✓ Area ready ({selectedPoints.length} points)</>
                ) : selectedPoints.length > 0 ? (
                  <>Select {3 - selectedPoints.length} more points to complete area</>
                ) : (
                  <>Click "Start Drawing" then click points on the map</>
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
                  disabled={selectedPoints.length < 3}
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

export default SimpleMapSelector;
