import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LocationButton from './LocationButton';
import SimpleMapSelector from './SimpleMapSelector';

interface AskViewProps {
  onAnalyze: (query: string, coordinates?: { lat: number; lng: number }, areaData?: { coordinates: { lat: number; lng: number }[], bounds: any }) => void;
}

const AskView: React.FC<AskViewProps> = ({ onAnalyze }) => {
  const [query, setQuery] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [areaData, setAreaData] = useState<{ coordinates: { lat: number; lng: number }[], bounds: any } | null>(null);
  const [showMapSelector, setShowMapSelector] = useState(false);

  const handleLocationSuccess = (coords: { lat: number; lng: number }) => {
    setCoordinates(coords);
    setLocationError(null);
  };

  const handleLocationError = (error: string) => {
    setLocationError(error);
    setCoordinates(null);
  };

  const toggleLocation = () => {
    setLocationEnabled(!locationEnabled);
    if (!locationEnabled) {
      // Clear previous location data when enabling
      setCoordinates(null);
      setLocationError(null);
    }
  };

  const handleMapLocationSelect = (coordinates: { lat: number; lng: number }[], bounds: any) => {
    setAreaData({ coordinates, bounds });
    setCoordinates({ lat: bounds.center.lat, lng: bounds.center.lng });
    setLocationError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onAnalyze(query.trim(), coordinates || undefined, areaData || undefined);
    }
  };

  return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="min-h-screen textured-grid relative flex flex-col items-center justify-center"
        >
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-5xl font-bold text-white tracking-tight">Bunker</h1>
        <p className="text-lg text-gray-400 mt-2">Spatial Intelligence for Earth's Data</p>
      </header>

      {/* Main Search Bar */}
      <main className="w-full max-w-4xl px-4">
        <div className="bg-black/60 backdrop-blur rounded-2xl border border-gray-700 overflow-hidden">
          <form onSubmit={handleSubmit} className="flex items-stretch">
             {/* Search Input */}
             <div className="flex-1 flex items-center px-6 py-4">
               <div className="flex items-center gap-3 flex-grow">
                 <input
                   type="text"
                   value={query}
                   onChange={(e) => setQuery(e.target.value)}
                   placeholder="Ask anything or mention a location..."
                   className="bg-transparent text-lg text-white flex-grow outline-none placeholder:text-gray-400 caret-blue-500"
                   autoFocus
                 />
               </div>
               {/* Location Toggle Button */}
               <button
                 type="button"
                 onClick={toggleLocation}
                 className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                   locationEnabled 
                     ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                     : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                 }`}
                 title={locationEnabled ? 'Disable location detection' : 'Enable location detection'}
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                 </svg>
                 <span className="text-sm">{locationEnabled ? 'ON' : 'OFF'}</span>
               </button>

               {/* Map Selector Button */}
               <button
                 type="button"
                 onClick={() => setShowMapSelector(true)}
                 className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 flex items-center gap-2"
                 title="Select area on map"
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                 </svg>
                 <span className="text-sm">MAP</span>
               </button>

               {/* Location Button - Only show when enabled */}
               {locationEnabled && (
                 <LocationButton
                   onLocationSuccess={handleLocationSuccess}
                   onLocationError={handleLocationError}
                 />
               )}
             </div>

            {/* Analyze Button */}
            <button
              type="submit"
              disabled={!query.trim()}
              className="bg-white hover:bg-gray-100 text-black font-semibold px-8 py-4 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white min-w-fit"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Analyze
            </button>
          </form>

          {/* Status Messages - Only show when location is enabled */}
          {locationEnabled && locationError && (
            <div className="px-6 pb-3">
              <p className="text-red-400 text-sm">{locationError}</p>
            </div>
          )}

          {locationEnabled && coordinates && (
            <div className="px-6 pb-3">
              <p className="text-blue-400 text-sm">
                ✓ Location detected: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
              </p>
            </div>
          )}

          {areaData && (
            <div className="px-6 pb-3">
              <p className="text-green-400 text-sm">
                ✓ Area selected on map: {areaData.coordinates.length} points, center at {coordinates?.lat.toFixed(4)}, {coordinates?.lng.toFixed(4)}
              </p>
            </div>
          )}
        </div>

        {/* Example Queries */}
        <div className="mt-12 text-center text-gray-400">
          <p className="mb-4">Try these examples:</p>
          <div className="flex flex-wrap justify-center gap-3">
            
            <button 
              type="button"
              onClick={() => setQuery("What's the weather like in Mumbai?")}
              className="px-4 py-2 bg-black/40 border border-gray-700 rounded-full text-sm hover:border-blue-500 transition"
            >
              What's the weather like in Mumbai?
            </button>
            <button 
              type="button"
              onClick={() => setQuery("Hiking trails near Bangalore")}
              className="px-4 py-2 bg-black/40 border border-gray-700 rounded-full text-sm hover:border-blue-500 transition"
            >
              Hiking trails near Bangalore
            </button>
            <button 
              type="button"
              onClick={() => setQuery("Driving conditions to Chennai")}
              className="px-4 py-2 bg-black/40 border border-gray-700 rounded-full text-sm hover:border-blue-500 transition"
            >
              Driving conditions to Chennai
            </button>
          </div>
        </div>
      </main>

      {/* Map Location Selector Modal */}
      <SimpleMapSelector
        isOpen={showMapSelector}
        onClose={() => setShowMapSelector(false)}
        onLocationSelect={handleMapLocationSelect}
      />
    </motion.div>
  );
};

export default AskView;
