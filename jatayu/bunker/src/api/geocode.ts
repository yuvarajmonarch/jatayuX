// Geocoding utility with backend integration
import BunkerAPIClient from './client';

export interface GeocodeResponse {
  lat: number;
  lng: number;
  name: string;
}

export interface GeocodeError {
  error: string;
  message: string;
  code: number;
}

// Mock geocoding data for common locations (fallback)
const mockLocations: Record<string, GeocodeResponse> = {
  'marina beach': { lat: 13.0827, lng: 80.2707, name: 'Marina Beach' },
  'chennai': { lat: 13.0827, lng: 80.2707, name: 'Chennai' },
  'mumbai': { lat: 19.0760, lng: 72.8777, name: 'Mumbai' },
  'delhi': { lat: 28.7041, lng: 77.1025, name: 'Delhi' },
  'bangalore': { lat: 12.9716, lng: 77.5946, name: 'Bangalore' },
  'kolkata': { lat: 22.5726, lng: 88.3639, name: 'Kolkata' },
  'hyderabad': { lat: 17.3850, lng: 78.4867, name: 'Hyderabad' },
  'pune': { lat: 18.5204, lng: 73.8567, name: 'Pune' },
  'goa': { lat: 15.2993, lng: 74.1240, name: 'Goa' },
  'kerala': { lat: 10.8505, lng: 76.2711, name: 'Kerala' },
  'rajasthan': { lat: 27.0238, lng: 74.2179, name: 'Rajasthan' },
  'tamil nadu': { lat: 11.1271, lng: 78.6569, name: 'Tamil Nadu' },
  'karnataka': { lat: 15.3173, lng: 75.7139, name: 'Karnataka' },
  'maharashtra': { lat: 19.7515, lng: 75.7139, name: 'Maharashtra' },
  'west bengal': { lat: 22.9868, lng: 87.8550, name: 'West Bengal' }
};

export const geocodeLocation = async (locationString: string): Promise<GeocodeResponse | GeocodeError> => {
  try {
    // Use backend API
    const response = await fetch('http://localhost:3001/api/geocode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ location: locationString }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Geocoding failed');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Backend geocoding error, falling back to client:', error);
    
    // Fallback to client-side geocoding
    const result = await BunkerAPIClient.geocodeLocation(locationString);
    return result;
  }
};

// Extract location from query string
export const extractLocationFromQuery = (query: string): string | null => {
  const locationKeywords = [
    'at', 'in', 'near', 'around', 'close to', 'by'
  ];

  const lowerQuery = query.toLowerCase();
  
  // Check if any known location is mentioned in the query first
  for (const location of Object.keys(mockLocations)) {
    if (lowerQuery.includes(location)) {
      return location;
    }
  }

  const words = lowerQuery.split(' ');
  
  for (let i = 0; i < words.length; i++) {
    if (locationKeywords.includes(words[i]) && i + 1 < words.length) {
      // Extract location phrase (next 2-3 words)
      const locationWords = words.slice(i + 1, i + 4);
      return locationWords.join(' ');
    }
  }

  // If no specific location found, try to extract common place names
  const commonPlaceWords = ['beach', 'park', 'city', 'town', 'village', 'station', 'airport'];
  for (let i = 0; i < words.length; i++) {
    if (commonPlaceWords.includes(words[i]) && i > 0) {
      // Take the word before the place type
      return words[i - 1] + ' ' + words[i];
    }
  }

  return null;
};
