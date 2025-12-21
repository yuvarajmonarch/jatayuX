const axios = require('axios');
const locationDatabase = require('../data/locationsDatabase');

class EnhancedGeocodeService {
  constructor() {
    this.mapboxApiKey = process.env.MAPBOX_ACCESS_TOKEN;
    this.nominatimBaseUrl = 'https://nominatim.openstreetmap.org/search';
    this.locationDatabase = locationDatabase;
    
    // POI databases for specific locations
    this.poiDatabases = {
      companies: new Map([
        ['microsoft', { lat: 12.9716, lng: 77.5946, name: 'Microsoft India Development Center, Bangalore' }],
        ['google', { lat: 12.9716, lng: 77.5946, name: 'Google India, Bangalore' }],
        ['amazon', { lat: 12.9716, lng: 77.5946, name: 'Amazon Development Center, Bangalore' }],
        ['infosys', { lat: 12.9716, lng: 77.5946, name: 'Infosys Campus, Bangalore' }],
        ['tcs', { lat: 12.9716, lng: 77.5946, name: 'Tata Consultancy Services, Bangalore' }],
        ['wipro', { lat: 12.9716, lng: 77.5946, name: 'Wipro Campus, Bangalore' }]
      ]),
      landmarks: new Map([
        ['gateway of india', { lat: 18.9220, lng: 72.8347, name: 'Gateway of India, Mumbai' }],
        ['taj mahal', { lat: 27.1751, lng: 78.0421, name: 'Taj Mahal, Agra' }],
        ['red fort', { lat: 28.6562, lng: 77.2410, name: 'Red Fort, Delhi' }],
        ['golden temple', { lat: 31.6200, lng: 74.8765, name: 'Golden Temple, Amritsar' }]
      ]),
      universities: new Map([
        ['iit bombay', { lat: 19.1334, lng: 72.9133, name: 'Indian Institute of Technology Bombay' }],
        ['iit delhi', { lat: 28.5444, lng: 77.1929, name: 'Indian Institute of Technology Delhi' }],
        ['iit madras', { lat: 12.9915, lng: 80.2337, name: 'Indian Institute of Technology Madras' }],
        ['iisc bangalore', { lat: 12.9868, lng: 77.5838, name: 'Indian Institute of Science, Bangalore' }]
      ])
    };
  }

  /**
   * Enhanced geocoding with precise structured queries and confidence scoring
   * @param {string} locationString - Location name to geocode
   * @param {Object} options - Additional options for geocoding
   * @returns {Promise<Object>} Enhanced geocoded result with confidence and validation
   */
  async geocodeLocation(locationString, options = {}) {
    try {
      console.log(`🔍 Enhanced geocoding for: ${locationString}`);
      
      // Step 1: Parse and structure the location query
      const structuredQuery = this.parseLocationQuery(locationString);
      console.log(`📝 Structured query:`, structuredQuery);
      
      // Step 2: Try POI databases first for specific entities
      const poiResult = this.searchPOIDatabases(structuredQuery);
      if (poiResult && poiResult.confidence > 0.8) {
        console.log(`✅ Found in POI database: ${poiResult.name}`);
        return poiResult;
      }
      
      // Step 3: Try local database
      const dbResult = this.locationDatabase.findLocation(locationString);
      if (dbResult) {
        console.log(`✅ Found in local database: ${locationString} → ${dbResult.lat}, ${dbResult.lng}`);
        return {
          lat: dbResult.lat,
          lng: dbResult.lng,
          name: dbResult.name,
          confidence: 0.95,
          address: `${dbResult.name}, ${dbResult.state}, India`,
          place_id: `db_${dbResult.name}`,
          source: 'database',
          type: dbResult.type,
          state: dbResult.state,
          importance: dbResult.importance,
          structured_query: structuredQuery
        };
      }
      
      // Step 4: Use Mapbox Geocoding API for precise results
      const mapboxResult = await this.geocodeWithMapbox(structuredQuery);
      if (mapboxResult && mapboxResult.confidence > 0.7) {
        console.log(`✅ Geocoded via Mapbox: ${mapboxResult.name}`);
        return mapboxResult;
      }
      
      // Step 5: Fallback to Nominatim with enhanced query
      const nominatimResult = await this.geocodeWithNominatim(structuredQuery);
      if (nominatimResult && nominatimResult.confidence > 0.6) {
        console.log(`✅ Geocoded via Nominatim: ${nominatimResult.name}`);
        return nominatimResult;
      }
      
      // Step 6: If all else fails, try fuzzy matching
      const fuzzyResult = await this.fuzzyGeocode(locationString);
      if (fuzzyResult) {
        console.log(`✅ Fuzzy geocoded: ${fuzzyResult.name}`);
        return fuzzyResult;
      }
      
      throw new Error(`Unable to geocode location: ${locationString}`);
      
    } catch (error) {
      console.error(`❌ Enhanced geocoding error for ${locationString}:`, error.message);
      throw new Error(`Failed to geocode location: ${locationString}`);
    }
  }

  /**
   * Parse location query into structured components
   * @param {string} locationString - Raw location string
   * @returns {Object} Structured query components
   */
  parseLocationQuery(locationString) {
    const query = locationString.toLowerCase().trim();
    
    // Extract potential components
    const components = {
      original: locationString,
      normalized: query,
      building: null,
      locality: null,
      city: null,
      state: null,
      postal_code: null,
      country: 'India',
      type: 'general'
    };
    
    // Extract building/company names
    const buildingPatterns = [
      /(\w+)\s+(campus|office|building|center|centre|tower|plaza|mall|hospital|university|college|school)/i,
      /(microsoft|google|amazon|infosys|tcs|wipro|hcl|tech\s+mahindra)\s*/i,
      /(iit|iim|iisc|nit)\s+(\w+)/i
    ];
    
    for (const pattern of buildingPatterns) {
      const match = query.match(pattern);
      if (match) {
        components.building = match[0];
        components.type = 'building';
        break;
      }
    }
    
    // Extract city names (common Indian cities)
    const cities = [
      'bangalore', 'mumbai', 'delhi', 'chennai', 'hyderabad', 'pune', 'kolkata',
      'ahmedabad', 'jaipur', 'surat', 'lucknow', 'kanpur', 'nagpur', 'indore',
      'thane', 'bhopal', 'visakhapatnam', 'pimpri', 'patna', 'vadodara'
    ];
    
    for (const city of cities) {
      if (query.includes(city)) {
        components.city = city;
        break;
      }
    }
    
    // Extract state names
    const states = [
      'karnataka', 'maharashtra', 'tamil nadu', 'telangana', 'west bengal',
      'gujarat', 'rajasthan', 'uttar pradesh', 'madhya pradesh', 'andhra pradesh',
      'bihar', 'punjab', 'haryana', 'kerala', 'odisha'
    ];
    
    for (const state of states) {
      if (query.includes(state)) {
        components.state = state;
        break;
      }
    }
    
    // Extract postal codes
    const postalMatch = query.match(/\b\d{6}\b/);
    if (postalMatch) {
      components.postal_code = postalMatch[0];
    }
    
    // Determine locality/area
    if (components.city) {
      components.locality = components.city;
    } else if (components.building) {
      components.locality = 'unknown';
    }
    
    return components;
  }

  /**
   * Search POI databases for specific entities
   * @param {Object} structuredQuery - Structured query components
   * @returns {Object|null} POI result if found
   */
  searchPOIDatabases(structuredQuery) {
    const query = structuredQuery.normalized;
    
    // Search companies
    for (const [key, poi] of this.poiDatabases.companies) {
      if (query.includes(key)) {
        return {
          ...poi,
          confidence: 0.9,
          source: 'poi_companies',
          type: 'company',
          structured_query: structuredQuery,
          address: poi.name
        };
      }
    }
    
    // Search landmarks
    for (const [key, poi] of this.poiDatabases.landmarks) {
      if (query.includes(key)) {
        return {
          ...poi,
          confidence: 0.9,
          source: 'poi_landmarks',
          type: 'landmark',
          structured_query: structuredQuery,
          address: poi.name
        };
      }
    }
    
    // Search universities
    for (const [key, poi] of this.poiDatabases.universities) {
      if (query.includes(key)) {
        return {
          ...poi,
          confidence: 0.9,
          source: 'poi_universities',
          type: 'university',
          structured_query: structuredQuery,
          address: poi.name
        };
      }
    }
    
    return null;
  }

  /**
   * Geocode using Mapbox API with structured query
   * @param {Object} structuredQuery - Structured query components
   * @returns {Promise<Object|null>} Mapbox geocoding result
   */
  async geocodeWithMapbox(structuredQuery) {
    if (!this.mapboxApiKey) {
      console.log('⚠️ Mapbox API key not available, skipping Mapbox geocoding');
      return null;
    }
    
    try {
      // Build structured query for Mapbox
      let query = structuredQuery.original;
      
      // Add structured components
      const queryParts = [];
      if (structuredQuery.building) queryParts.push(structuredQuery.building);
      if (structuredQuery.locality) queryParts.push(structuredQuery.locality);
      if (structuredQuery.city) queryParts.push(structuredQuery.city);
      if (structuredQuery.state) queryParts.push(structuredQuery.state);
      if (structuredQuery.postal_code) queryParts.push(structuredQuery.postal_code);
      
      if (queryParts.length > 0) {
        query = queryParts.join(', ');
      }
      
      // Add country for better results
      query += ', India';
      
      const response = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`, {
        params: {
          access_token: this.mapboxApiKey,
          country: 'IN',
          limit: 5,
          types: 'poi,place,locality,neighborhood,address',
          language: 'en'
        },
        timeout: 10000
      });
      
      if (!response.data.features || response.data.features.length === 0) {
        return null;
      }
      
      // Find best result with confidence scoring
      const results = response.data.features.map(feature => ({
        lat: feature.center[1],
        lng: feature.center[0],
        name: feature.place_name,
        confidence: this.calculateMapboxConfidence(feature, structuredQuery),
        address: feature.place_name,
        place_id: feature.id,
        source: 'mapbox',
        type: feature.place_type[0],
        relevance: feature.relevance,
        structured_query: structuredQuery,
        context: feature.context
      }));
      
      // Sort by confidence and return best result
      const bestResult = results.sort((a, b) => b.confidence - a.confidence)[0];
      
      return bestResult;
      
    } catch (error) {
      console.error('Mapbox geocoding error:', error.message);
      return null;
    }
  }

  /**
   * Calculate confidence score for Mapbox results
   * @param {Object} feature - Mapbox feature
   * @param {Object} structuredQuery - Original structured query
   * @returns {number} Confidence score (0-1)
   */
  calculateMapboxConfidence(feature, structuredQuery) {
    let confidence = 0.5;
    
    // Base confidence from Mapbox relevance
    confidence += feature.relevance * 0.3;
    
    // Bonus for exact matches
    const placeName = feature.place_name.toLowerCase();
    const originalQuery = structuredQuery.normalized;
    
    if (placeName.includes(originalQuery)) {
      confidence += 0.3;
    }
    
    // Bonus for building/company matches
    if (structuredQuery.building && placeName.includes(structuredQuery.building.toLowerCase())) {
      confidence += 0.2;
    }
    
    // Bonus for city matches
    if (structuredQuery.city && placeName.includes(structuredQuery.city)) {
      confidence += 0.1;
    }
    
    // Bonus for POI types
    if (feature.place_type.includes('poi')) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Enhanced Nominatim geocoding with structured query
   * @param {Object} structuredQuery - Structured query components
   * @returns {Promise<Object|null>} Nominatim geocoding result
   */
  async geocodeWithNominatim(structuredQuery) {
    try {
      // Build enhanced query for Nominatim
      let searchQuery = structuredQuery.original;
      
      // Add structured components if not already present
      if (!searchQuery.includes(',')) {
        const queryParts = [];
        if (structuredQuery.building) queryParts.push(structuredQuery.building);
        if (structuredQuery.locality) queryParts.push(structuredQuery.locality);
        if (structuredQuery.city) queryParts.push(structuredQuery.city);
        if (structuredQuery.state) queryParts.push(structuredQuery.state);
        
        if (queryParts.length > 0) {
          searchQuery = queryParts.join(', ');
        }
        
        searchQuery += ', India';
      }
      
      const response = await axios.get(this.nominatimBaseUrl, {
        params: {
          q: searchQuery,
          format: 'json',
          limit: 10,
          addressdetails: 1,
          countrycodes: 'in',
          accept_language: 'en',
          dedupe: 1,
          extratags: 1
        },
        headers: {
          'User-Agent': 'Bunker-Enhanced-Geocoding/1.0'
        },
        timeout: 15000
      });
      
      if (!response.data || response.data.length === 0) {
        return null;
      }
      
      // Enhanced result processing with confidence scoring
      const results = response.data.map(result => ({
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        name: result.display_name,
        confidence: this.calculateEnhancedConfidence(result, structuredQuery),
        address: result.address,
        place_id: result.place_id,
        source: 'nominatim',
        type: result.type,
        importance: result.importance,
        structured_query: structuredQuery,
        osm_type: result.osm_type,
        extratags: result.extratags
      }));
      
      // Sort by confidence and return best result
      const bestResult = results.sort((a, b) => b.confidence - a.confidence)[0];
      
      return bestResult;
      
    } catch (error) {
      console.error('Enhanced Nominatim geocoding error:', error.message);
      return null;
    }
  }

  /**
   * Enhanced confidence calculation for Nominatim results
   * @param {Object} result - Nominatim result
   * @param {Object} structuredQuery - Original structured query
   * @returns {number} Confidence score (0-1)
   */
  calculateEnhancedConfidence(result, structuredQuery) {
    let confidence = 0.4; // Base confidence
    
    // Importance-based scoring
    if (result.importance > 0.8) confidence += 0.3;
    else if (result.importance > 0.6) confidence += 0.2;
    else if (result.importance > 0.4) confidence += 0.1;
    
    // Exact match bonus
    const displayName = result.display_name.toLowerCase();
    const originalQuery = structuredQuery.normalized;
    
    if (displayName.includes(originalQuery)) {
      confidence += 0.2;
    }
    
    // Building/company match bonus
    if (structuredQuery.building && displayName.includes(structuredQuery.building.toLowerCase())) {
      confidence += 0.15;
    }
    
    // Address completeness bonus
    if (result.address) {
      if (result.address.city || result.address.town) confidence += 0.05;
      if (result.address.state) confidence += 0.05;
      if (result.address.country) confidence += 0.05;
      if (result.address.postcode) confidence += 0.05;
    }
    
    // POI type bonus
    if (result.type === 'building' || result.type === 'office') {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Fuzzy geocoding for partial matches
   * @param {string} locationString - Location string to geocode
   * @returns {Promise<Object|null>} Fuzzy geocoding result
   */
  async fuzzyGeocode(locationString) {
    try {
      // Try with common variations
      const variations = [
        `${locationString}, India`,
        locationString.replace(/\s+/g, ' ').trim(),
        locationString.split(' ')[0], // First word only
        locationString.split(',')[0] // Before comma
      ];
      
      for (const variation of variations) {
        try {
          const result = await this.geocodeWithNominatim({ 
            original: variation, 
            normalized: variation.toLowerCase() 
          });
          if (result && result.confidence > 0.5) {
            result.confidence = Math.max(0.4, result.confidence - 0.2); // Reduce confidence for fuzzy match
            result.source = 'fuzzy';
            return result;
          }
        } catch (error) {
          continue;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Fuzzy geocoding error:', error.message);
      return null;
    }
  }

  /**
   * Validate geocoding result with additional checks
   * @param {Object} result - Geocoding result
   * @returns {Object} Validated result with additional metadata
   */
  validateGeocodingResult(result) {
    const validated = { ...result };
    
    // Add validation flags
    validated.is_validated = true;
    validated.validation_timestamp = new Date().toISOString();
    
    // Check if coordinates are within India bounds
    const isInIndia = result.lat >= 6.0 && result.lat <= 37.0 && 
                     result.lng >= 68.0 && result.lng <= 97.0;
    validated.is_in_india = isInIndia;
    
    // Confidence level categorization
    if (result.confidence >= 0.9) {
      validated.confidence_level = 'high';
    } else if (result.confidence >= 0.7) {
      validated.confidence_level = 'medium';
    } else {
      validated.confidence_level = 'low';
    }
    
    // Add recommendations for improvement
    if (result.confidence < 0.7) {
      validated.recommendations = [
        'Consider adding more specific location details',
        'Include building name or landmark for better accuracy',
        'Specify city and state if not already included'
      ];
    }
    
    return validated;
  }
}

module.exports = EnhancedGeocodeService;
