import React from 'react';
import { MapPin } from 'lucide-react';

interface FallbackMapProps {
  center: [number, number];
  zoom: number;
}

const FallbackMap: React.FC<FallbackMapProps> = ({ center }) => {
  const [lat, lng] = center;

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden bg-bunker-card relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-bunker-card to-bunker-border opacity-50" />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Center Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          {/* Map Pin */}
          <div className="relative mb-4">
            <MapPin className="w-12 h-12 text-blue-500 mx-auto" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
          </div>
          
          {/* Location Info */}
              <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
                <h3 className="text-white font-semibold mb-2">Location Detected</h3>
                <p className="text-gray-300 text-sm">
                  Latitude: {lat.toFixed(4)}
                </p>
                <p className="text-gray-300 text-sm">
                  Longitude: {lng.toFixed(4)}
                </p>
                <p className="text-blue-400 text-xs mt-2">
                  Interactive Map - Enhanced View
                </p>
              </div>
        </div>
      </div>
      
      {/* Corner Elements */}
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm rounded px-2 py-1">
        <span className="text-xs text-gray-300">SPATIAL VIEW</span>
      </div>

      <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm rounded px-2 py-1">
        <span className="text-xs text-gray-300">ZOOM: 12</span>
      </div>
    </div>
  );
};

export default FallbackMap;
