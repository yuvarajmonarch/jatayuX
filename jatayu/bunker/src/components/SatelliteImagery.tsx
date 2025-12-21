import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface SatelliteImageryProps {
  center: [number, number];
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  analysisType?: string;
  className?: string;
}

const SatelliteImagery: React.FC<SatelliteImageryProps> = ({ 
  center, 
  bounds, 
  analysisType = 'satellite',
  className = '' 
}) => {
  const [imageryData, setImageryData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate bounds if not provided
  const generateBounds = (center: [number, number], sizeKm: number = 0.01) => {
    const [lng, lat] = center;
    return {
      north: lat + sizeKm,
      south: lat - sizeKm,
      east: lng + sizeKm,
      west: lng - sizeKm
    };
  };

  const areaBounds = bounds || generateBounds(center);

  useEffect(() => {
    let isMounted = true;
    
    const fetchSatelliteImagery = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate API call for satellite imagery
        // In a real implementation, this would call a satellite imagery API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (!isMounted) return;
        
        // Generate mock satellite imagery data
        const mockImageryData = {
          imageUrl: generateSatelliteImageUrl(center),
          timestamp: new Date().toISOString(),
          resolution: '10m',
          cloudCover: Math.floor(Math.random() * 30),
          quality: 'high',
          source: 'Sentinel-2',
          bands: ['RGB', 'NIR', 'SWIR'],
          processingLevel: 'L2A'
        };
        
        setImageryData(mockImageryData);
      } catch (err) {
        if (!isMounted) return;
        setError('Failed to load satellite imagery');
        console.error('Satellite imagery error:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSatelliteImagery();
    
    return () => {
      isMounted = false;
    };
  }, [center[0], center[1]]); // Only depend on actual coordinate values

  const generateSatelliteImageUrl = (center: [number, number]) => {
    // Generate a mock satellite image URL based on coordinates
    // In a real implementation, this would be a proper satellite imagery service
    const [lng, lat] = center;
    const zoom = 12;
    
    // Try Mapbox first, but have a fallback
    try {
      const x = Math.floor((lng + 180) / 360 * Math.pow(2, zoom));
      const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom));
      
      return `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/${zoom}/${x}/${y}?access_token=pk.eyJ1IjoibmlybWFsLTA3IiwiYSI6ImNtZnNqYW91NzBjN2EycXNoYTl6bWx6Ym8ifQ.pckER2f_OX6V10ttE5o3Pw`;
    } catch (error) {
      // Fallback to a placeholder satellite image
      return `https://via.placeholder.com/512x512/1a1a1a/ffffff?text=Satellite+Imagery`;
    }
  };

  // Removed unused getImageOverlay function

  if (loading) {
    return (
      <div className={`bg-gray-900/40 backdrop-blur rounded-lg border border-gray-700/50 relative overflow-hidden ${className}`}>
        <div className="h-64 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <div className="text-gray-400 text-sm">Loading satellite imagery...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-gray-900/40 backdrop-blur rounded-lg border border-gray-700/50 relative overflow-hidden ${className}`}>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-400 text-sm mb-2">⚠️ Imagery Unavailable</div>
            <div className="text-gray-400 text-xs">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`bg-gray-900/40 backdrop-blur rounded-lg border border-gray-700/50 relative overflow-hidden ${className}`}
    >
      {/* Satellite Image */}
      <div className="relative h-64">
        <img
          src={imageryData?.imageUrl}
          alt="Satellite Imagery"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            setError('Failed to load image');
          }}
        />
        
        {/* Polygon Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full">
            <polygon
              points="10,10 90,10 90,90 10,90"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.8"
            />
            <circle
              cx="50"
              cy="50"
              r="3"
              fill="#3B82F6"
              opacity="0.9"
            />
          </svg>
        </div>

        {/* Imagery Info Overlay */}
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur rounded px-2 py-1">
          <div className="text-white text-xs font-medium">{imageryData?.source}</div>
          <div className="text-gray-300 text-xs">{imageryData?.resolution}</div>
        </div>

        {/* Cloud Cover Indicator */}
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur rounded px-2 py-1">
          <div className="text-white text-xs">
            ☁️ {imageryData?.cloudCover}%
          </div>
        </div>

        {/* Analysis Type Badge */}
        <div className="absolute bottom-2 left-2 bg-blue-600/80 backdrop-blur rounded px-2 py-1">
          <div className="text-white text-xs font-medium">
            {analysisType === 'satellite' ? '🛰️ Satellite' : 
             analysisType === 'analytics' ? '📊 Analytics' : '🌱 NDVI'}
          </div>
        </div>

        {/* Timestamp */}
        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur rounded px-2 py-1">
          <div className="text-gray-300 text-xs">
            {imageryData?.timestamp ? new Date(imageryData.timestamp).toLocaleDateString() : 'Recent'}
          </div>
        </div>
      </div>

      {/* Imagery Details */}
      <div className="p-3 border-t border-gray-700/50">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Quality:</span>
            <span className="text-green-400 font-medium">{imageryData?.quality}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Processing:</span>
            <span className="text-blue-400 font-medium">{imageryData?.processingLevel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Bands:</span>
            <span className="text-white font-medium">{imageryData?.bands?.join(', ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Area:</span>
            <span className="text-white font-medium">
              {((areaBounds.north - areaBounds.south) * 111).toFixed(1)}km²
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SatelliteImagery;
