import React, { useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface LocationButtonProps {
  onLocationSuccess: (coords: { lat: number; lng: number }) => void;
  onLocationError: (error: string) => void;
}

const LocationButton: React.FC<LocationButtonProps> = ({ onLocationSuccess, onLocationError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [hasLocation, setHasLocation] = useState(false);

  const handleLocationClick = () => {
    if (!navigator.geolocation) {
      onLocationError('Geolocation is not supported by this browser');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setHasLocation(true);
        setIsLoading(false);
        onLocationSuccess(coords);
      },
      (error) => {
        setIsLoading(false);
        onLocationError(error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  return (
    <button
      onClick={handleLocationClick}
      disabled={isLoading}
      className={`p-2 rounded-lg transition-colors duration-200 ${
        hasLocation 
          ? 'text-blue-400 bg-blue-400/10' 
          : 'text-gray-400 hover:text-blue-400 hover:bg-gray-700/50'
      }`}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <MapPin className={`w-5 h-5 ${hasLocation ? 'fill-current' : ''}`} />
      )}
    </button>
  );
};

export default LocationButton;
